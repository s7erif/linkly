"use strict";

const pg = require("pg");

const originalQuery = pg.Client.prototype.query;
const clientStates = new WeakMap();
let sequence = 0;

function timestamp() {
  return new Date().toISOString();
}

function queryText(args) {
  const first = args[0];
  if (typeof first === "string") return first;
  if (first && typeof first.text === "string") return first.text;
  return "";
}

function safeValue(value) {
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return value;
  }
  if (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    return value;
  }
  if (typeof value === "string") return `[string:${value.length}]`;
  if (Buffer.isBuffer(value)) return `[buffer:${value.length}]`;
  if (Array.isArray(value)) return value.map(safeValue);
  return `[${typeof value}]`;
}

function queryValues(args) {
  const first = args[0];
  if (first && Array.isArray(first.values)) return first.values.map(safeValue);
  if (Array.isArray(args[1])) return args[1].map(safeValue);
  return [];
}

function emit(event) {
  process.stderr.write(`PG_TRACE ${JSON.stringify(event)}\n`);
}

function stateFor(client) {
  let state = clientStates.get(client);
  if (!state) {
    state = { attached: false, pending: [], socket: new Map() };
    clientStates.set(client, state);
  }
  if (!state.attached && client.connection?.stream) {
    state.attached = true;
    client.connection.stream.on("data", (chunk) => {
      const id = state.pending[0];
      if (id === undefined) return;
      const current = state.socket.get(id);
      if (!current) return;
      current.bytes += chunk.length;
      current.chunks += 1;
      current.firstAt ??= timestamp();
      current.lastAt = timestamp();
      current.lastAtPerformance = performance.now();
    });
  }
  return state;
}

function finishSocket(state, id) {
  const current = state.socket.get(id);
  state.socket.delete(id);
  const pendingIndex = state.pending.indexOf(id);
  if (pendingIndex >= 0) state.pending.splice(pendingIndex, 1);
  if (!current) return {};
  return {
    socketBytes: current.bytes,
    socketChunks: current.chunks,
    firstSocketDataAt: current.firstAt,
    lastSocketDataAt: current.lastAt,
    lastSocketDataToFinishMs:
      current.lastAtPerformance === null
        ? null
        : Number((performance.now() - current.lastAtPerformance).toFixed(3)),
  };
}

pg.Client.prototype.query = function tracedQuery(...args) {
  const id = ++sequence;
  const startedAt = performance.now();
  const text = queryText(args);
  const state = stateFor(this);
  state.pending.push(id);
  state.socket.set(id, {
    bytes: 0,
    chunks: 0,
    firstAt: null,
    lastAt: null,
    lastAtPerformance: null,
  });
  const event = {
    at: timestamp(),
    event: "submit",
    id,
    pid: this.processID ?? null,
    activeBefore: Boolean(this.activeQuery),
    queuedBefore: this._queryQueue?.length ?? null,
    sql: text,
    values: queryValues(args),
  };
  emit(event);

  const callbackIndex = args.findIndex((value) => typeof value === "function");
  if (callbackIndex >= 0) {
    const originalCallback = args[callbackIndex];
    args[callbackIndex] = function tracedCallback(error, result) {
      emit({
        at: timestamp(),
        event: error ? "reject" : "resolve",
        id,
        pid: this.processID ?? event.pid,
        durationMs: Number((performance.now() - startedAt).toFixed(3)),
        code: error?.code,
        ...finishSocket(state, id),
      });
      return originalCallback(error, result);
    }.bind(this);
  }

  let result;
  try {
    result = originalQuery.apply(this, args);
  } catch (error) {
    emit({
      at: timestamp(),
      event: "throw",
      id,
      pid: this.processID ?? event.pid,
      durationMs: Number((performance.now() - startedAt).toFixed(3)),
      code: error?.code,
      ...finishSocket(state, id),
    });
    throw error;
  }

  if (callbackIndex < 0 && result && typeof result.then === "function") {
    return result.then(
      (value) => {
        emit({
          at: timestamp(),
          event: "resolve",
          id,
          pid: this.processID ?? event.pid,
          durationMs: Number((performance.now() - startedAt).toFixed(3)),
          rowCount: value?.rowCount ?? null,
          ...finishSocket(state, id),
        });
        return value;
      },
      (error) => {
        emit({
          at: timestamp(),
          event: "reject",
          id,
          pid: this.processID ?? event.pid,
          durationMs: Number((performance.now() - startedAt).toFixed(3)),
          code: error?.code,
          ...finishSocket(state, id),
        });
        throw error;
      },
    );
  }

  return result;
};

emit({
  at: timestamp(),
  event: "hook-installed",
  processId: process.pid,
});
