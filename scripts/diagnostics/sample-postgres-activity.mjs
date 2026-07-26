import "dotenv/config";
import pg from "pg";

const applicationName = process.argv[2] ?? "oi_p2028_probe";
const durationMs = Number.parseInt(process.argv[3] ?? "30000", 10);
const intervalMs = Number.parseInt(process.argv[4] ?? "2", 10);

if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL is required");
if (!Number.isFinite(durationMs) || durationMs < 1) {
  throw new Error("durationMs must be a positive integer");
}
if (!Number.isFinite(intervalMs) || intervalMs < 1) {
  throw new Error("intervalMs must be a positive integer");
}

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL,
  application_name: "oi_root_cause_observer",
});

await client.connect();

try {
  await client.query(`
    create temporary table activity_samples (
      sampled_at timestamptz not null,
      pid integer not null,
      state text,
      wait_event text,
      wait_event_type text,
      query_start timestamptz,
      backend_start timestamptz,
      xact_start timestamptz,
      application_name text,
      query text,
      blocking_pids integer[]
    ) on commit preserve rows;

    create temporary table lock_samples (
      sampled_at timestamptz not null,
      pid integer not null,
      locktype text not null,
      mode text not null,
      granted boolean not null,
      relation text,
      page integer,
      tuple smallint,
      transactionid xid,
      virtualxid text,
      virtualtransaction text,
      classid oid,
      objid oid,
      objsubid smallint,
      blocking_pids integer[]
    ) on commit preserve rows;
  `);

  await client.query(
    `select set_config('oi.probe_application_name', $1, false),
            set_config('oi.probe_duration_ms', $2, false),
            set_config('oi.probe_interval_ms', $3, false)`,
    [applicationName, String(durationMs), String(intervalMs)],
  );

  process.stdout.write(
    `${JSON.stringify({
      event: "sampling-started",
      at: new Date().toISOString(),
      applicationName,
      durationMs,
      intervalMs,
    })}\n`,
  );

  await client.query(`
    do $probe$
    declare
      deadline timestamptz :=
        clock_timestamp() +
        (current_setting('oi.probe_duration_ms') || ' milliseconds')::interval;
      sampled timestamptz;
    begin
      while clock_timestamp() < deadline loop
        perform pg_stat_clear_snapshot();
        sampled := clock_timestamp();

        insert into activity_samples
        select
          sampled,
          activity.pid,
          activity.state,
          activity.wait_event,
          activity.wait_event_type,
          activity.query_start,
          activity.backend_start,
          activity.xact_start,
          activity.application_name,
          activity.query,
          pg_blocking_pids(activity.pid)
        from pg_stat_activity activity
        where activity.datname = current_database()
          and activity.pid <> pg_backend_pid()
          and activity.application_name =
            current_setting('oi.probe_application_name');

        insert into lock_samples
        select
          sampled,
          locks.pid,
          locks.locktype,
          locks.mode,
          locks.granted,
          case
            when locks.relation is null then null
            else locks.relation::regclass::text
          end,
          locks.page,
          locks.tuple,
          locks.transactionid,
          locks.virtualxid,
          locks.virtualtransaction,
          locks.classid,
          locks.objid,
          locks.objsubid,
          pg_blocking_pids(locks.pid)
        from pg_locks locks
        join pg_stat_activity activity on activity.pid = locks.pid
        where activity.datname = current_database()
          and activity.pid <> pg_backend_pid()
          and activity.application_name =
            current_setting('oi.probe_application_name');

        perform pg_sleep(
          current_setting('oi.probe_interval_ms')::double precision / 1000
        );
      end loop;
    end
    $probe$;
  `);

  const transitions = await client.query(`
    with ordered as (
      select
        samples.*,
        lag(state) over backend as previous_state,
        lag(wait_event) over backend as previous_wait_event,
        lag(wait_event_type) over backend as previous_wait_event_type,
        lag(query_start) over backend as previous_query_start,
        lag(xact_start) over backend as previous_xact_start,
        lag(query) over backend as previous_query
      from activity_samples samples
      window backend as (partition by pid order by sampled_at)
    )
    select
      sampled_at,
      pid,
      state,
      wait_event,
      wait_event_type,
      query_start,
      backend_start,
      xact_start,
      application_name,
      query,
      blocking_pids
    from ordered
    where previous_state is distinct from state
       or previous_wait_event is distinct from wait_event
       or previous_wait_event_type is distinct from wait_event_type
       or previous_query_start is distinct from query_start
       or previous_xact_start is distinct from xact_start
       or previous_query is distinct from query
    order by sampled_at, pid
  `);

  const activitySummary = await client.query(`
    select
      pid,
      state,
      wait_event_type,
      wait_event,
      query_start,
      query,
      count(*)::integer as sample_count,
      min(sampled_at) as first_sample,
      max(sampled_at) as last_sample,
      extract(
        epoch from max(sampled_at) - min(sampled_at)
      ) * 1000 as observed_span_ms
    from activity_samples
    group by
      pid,
      state,
      wait_event_type,
      wait_event,
      query_start,
      query
    order by first_sample, pid
  `);

  const lockSummary = await client.query(`
    select
      pid,
      locktype,
      mode,
      granted,
      relation,
      page,
      tuple,
      transactionid::text,
      virtualxid,
      virtualtransaction,
      classid,
      objid,
      objsubid,
      blocking_pids,
      count(*)::integer as sample_count,
      min(sampled_at) as first_sample,
      max(sampled_at) as last_sample
    from lock_samples
    group by
      pid,
      locktype,
      mode,
      granted,
      relation,
      page,
      tuple,
      transactionid,
      virtualxid,
      virtualtransaction,
      classid,
      objid,
      objsubid,
      blocking_pids
    order by first_sample, pid, granted, locktype, relation, mode
  `);

  const sampleCounts = await client.query(`
    select
      (select count(*)::integer from activity_samples) as activity_samples,
      (select count(*)::integer from lock_samples) as lock_samples,
      (select count(*)::integer
       from activity_samples
       where cardinality(blocking_pids) > 0) as blocked_activity_samples,
      (select count(*)::integer
       from lock_samples
       where not granted) as ungranted_lock_samples
  `);

  process.stdout.write(
    `${JSON.stringify(
      {
        event: "sampling-complete",
        at: new Date().toISOString(),
        applicationName,
        durationMs,
        intervalMs,
        sampleCounts: sampleCounts.rows[0],
        transitions: transitions.rows,
        activitySummary: activitySummary.rows,
        lockSummary: lockSummary.rows,
      },
      null,
      2,
    )}\n`,
  );
} finally {
  await client.end();
}
