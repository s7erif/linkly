const RUNTIME_PUBLIC_PATH = "server/chunks/ssr/[turbopack]_runtime.js";
const RELATIVE_ROOT_PATH = "..";
const ASSET_PREFIX = "/_next/";
const WORKER_FORWARDED_GLOBALS = ["NEXT_DEPLOYMENT_ID","NEXT_CLIENT_ASSET_SUFFIX"];
// Apply forwarded globals from workerData if running in a worker thread
if (typeof require !== 'undefined') {
    try {
        const { workerData } = require('worker_threads');
        if (workerData?.__turbopack_globals__) {
            Object.assign(globalThis, workerData.__turbopack_globals__);
            // Remove internal data so it's not visible to user code
            delete workerData.__turbopack_globals__;
        }
    } catch (_) {
        // Not in a worker thread context, ignore
    }
}
/**
 * This file contains runtime types and functions that are shared between all
 * TurboPack ECMAScript runtimes.
 *
 * It will be prepended to the runtime code of each runtime.
 */ /* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="./runtime-types.d.ts" />
/**
 * Describes why a module was instantiated.
 * Shared between browser and Node.js runtimes.
 */ var SourceType = /*#__PURE__*/ function(SourceType) {
    /**
   * The module was instantiated because it was included in an evaluated chunk's
   * runtime.
   * SourceData is a ChunkPath.
   */ SourceType[SourceType["Runtime"] = 0] = "Runtime";
    /**
   * The module was instantiated because a parent module imported it.
   * SourceData is a ModuleId.
   */ SourceType[SourceType["Parent"] = 1] = "Parent";
    /**
   * The module was instantiated because it was included in a chunk's hot module
   * update.
   * SourceData is an array of ModuleIds or undefined.
   */ SourceType[SourceType["Update"] = 2] = "Update";
    return SourceType;
}(SourceType || {});
/**
 * Flag indicating which module object type to create when a module is merged. Set to `true`
 * by each runtime that uses ModuleWithDirection (browser dev-base.ts, nodejs dev-base.ts,
 * nodejs build-base.ts). Browser production (build-base.ts) leaves it as `false` since it
 * uses plain Module objects.
 */ let createModuleWithDirectionFlag = false;
const REEXPORTED_OBJECTS = new WeakMap();
/**
 * Constructs the `__turbopack_context__` object for a module.
 */ function Context(module, exports) {
    this.m = module;
    // We need to store this here instead of accessing it from the module object to:
    // 1. Make it available to factories directly, since we rewrite `this` to
    //    `__turbopack_context__.e` in CJS modules.
    // 2. Support async modules which rewrite `module.exports` to a promise, so we
    //    can still access the original exports object from functions like
    //    `esmExport`
    // Ideally we could find a new approach for async modules and drop this property altogether.
    this.e = exports;
}
const contextPrototype = Context.prototype;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const toStringTag = typeof Symbol !== 'undefined' && Symbol.toStringTag;
function defineProp(obj, name, options) {
    if (!hasOwnProperty.call(obj, name)) Object.defineProperty(obj, name, options);
}
function getOverwrittenModule(moduleCache, id) {
    let module = moduleCache[id];
    if (!module) {
        if (createModuleWithDirectionFlag) {
            // set in development modes for hmr support
            module = createModuleWithDirection(id);
        } else {
            module = createModuleObject(id);
        }
        moduleCache[id] = module;
    }
    return module;
}
/**
 * Creates the module object. Only done here to ensure all module objects have the same shape.
 */ function createModuleObject(id) {
    return {
        exports: {},
        error: undefined,
        id,
        namespaceObject: undefined
    };
}
function createModuleWithDirection(id) {
    return {
        exports: {},
        error: undefined,
        id,
        namespaceObject: undefined,
        parents: [],
        children: []
    };
}
const BindingTag_Value = 0;
/**
 * Adds the getters to the exports object.
 */ function esm(exports, bindings) {
    defineProp(exports, '__esModule', {
        value: true
    });
    if (toStringTag) defineProp(exports, toStringTag, {
        value: 'Module'
    });
    let i = 0;
    while(i < bindings.length){
        const propName = bindings[i++];
        const tagOrFunction = bindings[i++];
        if (typeof tagOrFunction === 'number') {
            if (tagOrFunction === BindingTag_Value) {
                defineProp(exports, propName, {
                    value: bindings[i++],
                    enumerable: true,
                    writable: false
                });
            } else {
                throw new Error(`unexpected tag: ${tagOrFunction}`);
            }
        } else {
            const getterFn = tagOrFunction;
            if (typeof bindings[i] === 'function') {
                const setterFn = bindings[i++];
                defineProp(exports, propName, {
                    get: getterFn,
                    set: setterFn,
                    enumerable: true
                });
            } else {
                defineProp(exports, propName, {
                    get: getterFn,
                    enumerable: true
                });
            }
        }
    }
    Object.seal(exports);
}
/**
 * Makes the module an ESM with exports
 */ function esmExport(bindings, id) {
    let module;
    let exports;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
        exports = module.exports;
    } else {
        module = this.m;
        exports = this.e;
    }
    module.namespaceObject = exports;
    esm(exports, bindings);
}
contextPrototype.s = esmExport;
function ensureDynamicExports(module, exports) {
    let reexportedObjects = REEXPORTED_OBJECTS.get(module);
    if (!reexportedObjects) {
        REEXPORTED_OBJECTS.set(module, reexportedObjects = []);
        module.exports = module.namespaceObject = new Proxy(exports, {
            get (target, prop) {
                if (hasOwnProperty.call(target, prop) || prop === 'default' || prop === '__esModule') {
                    return Reflect.get(target, prop);
                }
                for (const obj of reexportedObjects){
                    const value = Reflect.get(obj, prop);
                    if (value !== undefined) return value;
                }
                return undefined;
            },
            ownKeys (target) {
                const keys = Reflect.ownKeys(target);
                for (const obj of reexportedObjects){
                    for (const key of Reflect.ownKeys(obj)){
                        if (key !== 'default' && !keys.includes(key)) keys.push(key);
                    }
                }
                return keys;
            }
        });
    }
    return reexportedObjects;
}
/**
 * Dynamically exports properties from an object
 */ function dynamicExport(object, id) {
    let module;
    let exports;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
        exports = module.exports;
    } else {
        module = this.m;
        exports = this.e;
    }
    const reexportedObjects = ensureDynamicExports(module, exports);
    if (typeof object === 'object' && object !== null) {
        reexportedObjects.push(object);
    }
}
contextPrototype.j = dynamicExport;
function exportValue(value, id) {
    let module;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
    } else {
        module = this.m;
    }
    module.exports = value;
}
contextPrototype.v = exportValue;
function exportNamespace(namespace, id) {
    let module;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
    } else {
        module = this.m;
    }
    module.exports = module.namespaceObject = namespace;
}
contextPrototype.n = exportNamespace;
function createGetter(obj, key) {
    return ()=>obj[key];
}
/**
 * @returns prototype of the object
 */ const getProto = Object.getPrototypeOf ? (obj)=>Object.getPrototypeOf(obj) : (obj)=>obj.__proto__;
/** Prototypes that are not expanded for exports */ const LEAF_PROTOTYPES = [
    null,
    getProto({}),
    getProto([]),
    getProto(getProto)
];
/**
 * @param raw
 * @param ns
 * @param allowExportDefault
 *   * `false`: will have the raw module as default export
 *   * `true`: will have the default property as default export
 */ function interopEsm(raw, ns, allowExportDefault) {
    const bindings = [];
    let defaultLocation = -1;
    for(let current = raw; (typeof current === 'object' || typeof current === 'function') && !LEAF_PROTOTYPES.includes(current); current = getProto(current)){
        for (const key of Object.getOwnPropertyNames(current)){
            bindings.push(key, createGetter(raw, key));
            if (defaultLocation === -1 && key === 'default') {
                defaultLocation = bindings.length - 1;
            }
        }
    }
    // this is not really correct
    // we should set the `default` getter if the imported module is a `.cjs file`
    if (!(allowExportDefault && defaultLocation >= 0)) {
        // Replace the binding with one for the namespace itself in order to preserve iteration order.
        if (defaultLocation >= 0) {
            // Replace the getter with the value
            bindings.splice(defaultLocation, 1, BindingTag_Value, raw);
        } else {
            bindings.push('default', BindingTag_Value, raw);
        }
    }
    esm(ns, bindings);
    return ns;
}
function createNS(raw) {
    if (typeof raw === 'function') {
        return function(...args) {
            return raw.apply(this, args);
        };
    } else {
        return Object.create(null);
    }
}
function esmImport(id) {
    const module = getOrInstantiateModuleFromParent(id, this.m);
    // any ES module has to have `module.namespaceObject` defined.
    if (module.namespaceObject) return module.namespaceObject;
    // only ESM can be an async module, so we don't need to worry about exports being a promise here.
    const raw = module.exports;
    return module.namespaceObject = interopEsm(raw, createNS(raw), raw && raw.__esModule);
}
contextPrototype.i = esmImport;
function asyncLoader(moduleId) {
    const loader = this.r(moduleId);
    return loader(esmImport.bind(this));
}
contextPrototype.A = asyncLoader;
// Add a simple runtime require so that environments without one can still pass
// `typeof require` CommonJS checks so that exports are correctly registered.
const runtimeRequire = // @ts-ignore
typeof require === 'function' ? require : function require1() {
    throw new Error('Unexpected use of runtime require');
};
contextPrototype.t = runtimeRequire;
function commonJsRequire(id) {
    return getOrInstantiateModuleFromParent(id, this.m).exports;
}
contextPrototype.r = commonJsRequire;
/**
 * Remove fragments and query parameters since they are never part of the context map keys
 *
 * This matches how we parse patterns at resolving time.  Arguably we should only do this for
 * strings passed to `import` but the resolve does it for `import` and `require` and so we do
 * here as well.
 */ function parseRequest(request) {
    // Per the URI spec fragments can contain `?` characters, so we should trim it off first
    // https://datatracker.ietf.org/doc/html/rfc3986#section-3.5
    const hashIndex = request.indexOf('#');
    if (hashIndex !== -1) {
        request = request.substring(0, hashIndex);
    }
    const queryIndex = request.indexOf('?');
    if (queryIndex !== -1) {
        request = request.substring(0, queryIndex);
    }
    return request;
}
/**
 * `require.context` and require/import expression runtime.
 */ function moduleContext(map) {
    function moduleContext(id) {
        id = parseRequest(id);
        if (hasOwnProperty.call(map, id)) {
            return map[id].module();
        }
        const e = new Error(`Cannot find module '${id}'`);
        e.code = 'MODULE_NOT_FOUND';
        throw e;
    }
    moduleContext.keys = ()=>{
        return Object.keys(map);
    };
    moduleContext.resolve = (id)=>{
        id = parseRequest(id);
        if (hasOwnProperty.call(map, id)) {
            return map[id].id();
        }
        const e = new Error(`Cannot find module '${id}'`);
        e.code = 'MODULE_NOT_FOUND';
        throw e;
    };
    moduleContext.import = async (id)=>{
        return await moduleContext(id);
    };
    return moduleContext;
}
contextPrototype.f = moduleContext;
/**
 * Returns the path of a chunk defined by its data.
 */ function getChunkPath(chunkData) {
    return typeof chunkData === 'string' ? chunkData : chunkData.path;
}
function isPromise(maybePromise) {
    return maybePromise != null && typeof maybePromise === 'object' && 'then' in maybePromise && typeof maybePromise.then === 'function';
}
function isAsyncModuleExt(obj) {
    return turbopackQueues in obj;
}
function createPromise() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej)=>{
        reject = rej;
        resolve = res;
    });
    return {
        promise,
        resolve: resolve,
        reject: reject
    };
}
// Load the CompressedmoduleFactories of a chunk into the `moduleFactories` Map.
// The CompressedModuleFactories format is
// - 1 or more module ids
// - a module factory function
// So walking this is a little complex but the flat structure is also fast to
// traverse, we can use `typeof` operators to distinguish the two cases.
function installCompressedModuleFactories(chunkModules, offset, moduleFactories, newModuleId) {
    let i = offset;
    while(i < chunkModules.length){
        let end = i + 1;
        // Find our factory function
        while(end < chunkModules.length && typeof chunkModules[end] !== 'function'){
            end++;
        }
        if (end === chunkModules.length) {
            throw new Error('malformed chunk format, expected a factory function');
        }
        // Install the factory for each module ID that doesn't already have one.
        // When some IDs in this group already have a factory, reuse that existing
        // group factory for the missing IDs to keep all IDs in the group consistent.
        // Otherwise, install the factory from this chunk.
        const moduleFactoryFn = chunkModules[end];
        let existingGroupFactory = undefined;
        for(let j = i; j < end; j++){
            const id = chunkModules[j];
            const existingFactory = moduleFactories.get(id);
            if (existingFactory) {
                existingGroupFactory = existingFactory;
                break;
            }
        }
        const factoryToInstall = existingGroupFactory ?? moduleFactoryFn;
        let didInstallFactory = false;
        for(let j = i; j < end; j++){
            const id = chunkModules[j];
            if (!moduleFactories.has(id)) {
                if (!didInstallFactory) {
                    if (factoryToInstall === moduleFactoryFn) {
                        applyModuleFactoryName(moduleFactoryFn);
                    }
                    didInstallFactory = true;
                }
                moduleFactories.set(id, factoryToInstall);
                newModuleId?.(id);
            }
        }
        i = end + 1; // end is pointing at the last factory advance to the next id or the end of the array.
    }
}
// everything below is adapted from webpack
// https://github.com/webpack/webpack/blob/6be4065ade1e252c1d8dcba4af0f43e32af1bdc1/lib/runtime/AsyncModuleRuntimeModule.js#L13
const turbopackQueues = Symbol('turbopack queues');
const turbopackExports = Symbol('turbopack exports');
const turbopackError = Symbol('turbopack error');
function resolveQueue(queue) {
    if (queue && queue.status !== 1) {
        queue.status = 1;
        queue.forEach((fn)=>fn.queueCount--);
        queue.forEach((fn)=>fn.queueCount-- ? fn.queueCount++ : fn());
    }
}
function wrapDeps(deps) {
    return deps.map((dep)=>{
        if (dep !== null && typeof dep === 'object') {
            if (isAsyncModuleExt(dep)) return dep;
            if (isPromise(dep)) {
                const queue = Object.assign([], {
                    status: 0
                });
                const obj = {
                    [turbopackExports]: {},
                    [turbopackQueues]: (fn)=>fn(queue)
                };
                dep.then((res)=>{
                    obj[turbopackExports] = res;
                    resolveQueue(queue);
                }, (err)=>{
                    obj[turbopackError] = err;
                    resolveQueue(queue);
                });
                return obj;
            }
        }
        return {
            [turbopackExports]: dep,
            [turbopackQueues]: ()=>{}
        };
    });
}
function asyncModule(body, hasAwait) {
    const module = this.m;
    const queue = hasAwait ? Object.assign([], {
        status: -1
    }) : undefined;
    const depQueues = new Set();
    const { resolve, reject, promise: rawPromise } = createPromise();
    const promise = Object.assign(rawPromise, {
        [turbopackExports]: module.exports,
        [turbopackQueues]: (fn)=>{
            queue && fn(queue);
            depQueues.forEach(fn);
            promise['catch'](()=>{});
        }
    });
    const attributes = {
        get () {
            return promise;
        },
        set (v) {
            // Calling `esmExport` leads to this.
            if (v !== promise) {
                promise[turbopackExports] = v;
            }
        }
    };
    Object.defineProperty(module, 'exports', attributes);
    Object.defineProperty(module, 'namespaceObject', attributes);
    function handleAsyncDependencies(deps) {
        const currentDeps = wrapDeps(deps);
        const getResult = ()=>currentDeps.map((d)=>{
                if (d[turbopackError]) throw d[turbopackError];
                return d[turbopackExports];
            });
        const { promise, resolve } = createPromise();
        const fn = Object.assign(()=>resolve(getResult), {
            queueCount: 0
        });
        function fnQueue(q) {
            if (q !== queue && !depQueues.has(q)) {
                depQueues.add(q);
                if (q && q.status === 0) {
                    fn.queueCount++;
                    q.push(fn);
                }
            }
        }
        currentDeps.map((dep)=>dep[turbopackQueues](fnQueue));
        return fn.queueCount ? promise : getResult();
    }
    function asyncResult(err) {
        if (err) {
            reject(promise[turbopackError] = err);
        } else {
            resolve(promise[turbopackExports]);
        }
        resolveQueue(queue);
    }
    body(handleAsyncDependencies, asyncResult);
    if (queue && queue.status === -1) {
        queue.status = 0;
    }
}
contextPrototype.a = asyncModule;
/**
 * A pseudo "fake" URL object to resolve to its relative path.
 *
 * When UrlRewriteBehavior is set to relative, calls to the `new URL()` will construct url without base using this
 * runtime function to generate context-agnostic urls between different rendering context, i.e ssr / client to avoid
 * hydration mismatch.
 *
 * This is based on webpack's existing implementation:
 * https://github.com/webpack/webpack/blob/87660921808566ef3b8796f8df61bd79fc026108/lib/runtime/RelativeUrlRuntimeModule.js
 */ const relativeURL = function relativeURL(inputUrl) {
    const realUrl = new URL(inputUrl, 'x:/');
    const values = {};
    for(const key in realUrl)values[key] = realUrl[key];
    values.href = inputUrl;
    values.pathname = inputUrl.replace(/[?#].*/, '');
    values.origin = values.protocol = '';
    values.toString = values.toJSON = (..._args)=>inputUrl;
    for(const key in values)Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        value: values[key]
    });
};
relativeURL.prototype = URL.prototype;
contextPrototype.U = relativeURL;
/**
 * Utility function to ensure all variants of an enum are handled.
 */ function invariant(never, computeMessage) {
    throw new Error(`Invariant: ${computeMessage(never)}`);
}
/**
 * Constructs an error message for when a module factory is not available.
 */ function factoryNotAvailableMessage(moduleId, sourceType, sourceData) {
    let instantiationReason;
    switch(sourceType){
        case 0:
            instantiationReason = `as a runtime entry of chunk ${sourceData}`;
            break;
        case 1:
            instantiationReason = `because it was required from module ${sourceData}`;
            break;
        case 2:
            instantiationReason = 'because of an HMR update';
            break;
        default:
            invariant(sourceType, (sourceType)=>`Unknown source type: ${sourceType}`);
    }
    return `Module ${moduleId} was instantiated ${instantiationReason}, but the module factory is not available.`;
}
/**
 * A stub function to make `require` available but non-functional in ESM.
 */ function requireStub(_moduleId) {
    throw new Error('dynamic usage of require is not supported');
}
contextPrototype.z = requireStub;
// Make `globalThis` available to the module in a way that cannot be shadowed by a local variable.
contextPrototype.g = globalThis;
function applyModuleFactoryName(factory) {
    // Give the module factory a nice name to improve stack traces.
    Object.defineProperty(factory, 'name', {
        value: 'module evaluation'
    });
}
/// <reference path="../shared/runtime/runtime-utils.ts" />
/// A 'base' utilities to support runtime can have externals.
/// Currently this is for node.js / edge runtime both.
/// If a fn requires node.js specific behavior, it should be placed in `node-external-utils` instead.
async function externalImport(id) {
    let raw;
    try {
        switch (id) {
  case "next/dist/compiled/@vercel/og/index.node.js":
    raw = await import("next/dist/compiled/@vercel/og/index.edge.js");
    break;
  case "pg-587764f78a6c7a9c":
    raw = await import("pg");
    break;
  case "@prisma/client-2c3a283f134fdcb6/runtime/wasm-compiler-edge":
    raw = await import("@prisma/client-2c3a283f134fdcb6/runtime/wasm-compiler-edge");
    break;
  default:
    raw = await import(id);
};
    } catch (err) {
        // TODO(alexkirsz) This can happen when a client-side module tries to load
        // an external module we don't provide a shim for (e.g. querystring, url).
        // For now, we fail semi-silently, but in the future this should be a
        // compilation error.
        throw new Error(`Failed to load external module ${id}: ${err}`);
    }
    if (raw && raw.__esModule && raw.default && 'default' in raw.default) {
        return interopEsm(raw.default, createNS(raw), true);
    }
    return raw;
}
contextPrototype.y = externalImport;
function externalRequire(id, thunk, esm = false) {
    let raw;
    try {
        raw = thunk();
    } catch (err) {
        // TODO(alexkirsz) This can happen when a client-side module tries to load
        // an external module we don't provide a shim for (e.g. querystring, url).
        // For now, we fail semi-silently, but in the future this should be a
        // compilation error.
        throw new Error(`Failed to load external module ${id}: ${err}`);
    }
    if (!esm || raw.__esModule) {
        return raw;
    }
    return interopEsm(raw, createNS(raw), true);
}
externalRequire.resolve = (id, options)=>{
    return require.resolve(id, options);
};
contextPrototype.x = externalRequire;
/* eslint-disable @typescript-eslint/no-unused-vars */ const path = require('path');
const relativePathToRuntimeRoot = path.relative(RUNTIME_PUBLIC_PATH, '.');
// Compute the relative path to the `distDir`.
const relativePathToDistRoot = path.join(relativePathToRuntimeRoot, RELATIVE_ROOT_PATH);
const RUNTIME_ROOT = path.resolve(__filename, relativePathToRuntimeRoot);
// Compute the absolute path to the root, by stripping distDir from the absolute path to this file.
const ABSOLUTE_ROOT = path.resolve(__filename, relativePathToDistRoot);
/**
 * Returns an absolute path to the given module path.
 * Module path should be relative, either path to a file or a directory.
 *
 * This fn allows to calculate an absolute path for some global static values, such as
 * `__dirname` or `import.meta.url` that Turbopack will not embeds in compile time.
 * See ImportMetaBinding::code_generation for the usage.
 */ function resolveAbsolutePath(modulePath) {
    if (modulePath) {
        return path.join(ABSOLUTE_ROOT, modulePath);
    }
    return ABSOLUTE_ROOT;
}
Context.prototype.P = resolveAbsolutePath;
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="../shared/runtime/runtime-utils.ts" />
function readWebAssemblyAsResponse(path) {
    const { createReadStream } = require('fs');
    const { Readable } = require('stream');
    const stream = createReadStream(path);
    // @ts-ignore unfortunately there's a slight type mismatch with the stream.
    return new Response(Readable.toWeb(stream), {
        headers: {
            'content-type': 'application/wasm'
        }
    });
}
async function compileWebAssemblyFromPath(path) {
    const response = readWebAssemblyAsResponse(path);
    return await WebAssembly.compileStreaming(response);
}
async function instantiateWebAssemblyFromPath(path, importsObj) {
    const response = readWebAssemblyAsResponse(path);
    const { instance } = await WebAssembly.instantiateStreaming(response, importsObj);
    return instance.exports;
}
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="../../shared/runtime/runtime-utils.ts" />
/// <reference path="../../shared-node/base-externals-utils.ts" />
/// <reference path="../../shared-node/node-externals-utils.ts" />
/// <reference path="../../shared-node/node-wasm-utils.ts" />
/// <reference path="./nodejs-globals.d.ts" />
/**
 * Base Node.js runtime shared between production and development.
 * Contains chunk loading, module caching, and other non-HMR functionality.
 */ process.env.TURBOPACK = '1';
const url = require('url');
const moduleFactories = new Map();
const moduleCache = Object.create(null);
/**
 * Returns an absolute path to the given module's id.
 */ function resolvePathFromModule(moduleId) {
    const exported = this.r(moduleId);
    const exportedPath = exported?.default ?? exported;
    if (typeof exportedPath !== 'string') {
        return exported;
    }
    const strippedAssetPrefix = exportedPath.slice(ASSET_PREFIX.length);
    const resolved = path.resolve(RUNTIME_ROOT, strippedAssetPrefix);
    return url.pathToFileURL(resolved).href;
}
/**
 * Exports a URL value. No suffix is added in Node.js runtime.
 */ function exportUrl(urlValue, id) {
    exportValue.call(this, urlValue, id);
}
function loadRuntimeChunk(sourcePath, chunkData) {
    if (typeof chunkData === 'string') {
        loadRuntimeChunkPath(sourcePath, chunkData);
    } else {
        loadRuntimeChunkPath(sourcePath, chunkData.path);
    }
}
const loadedChunks = new Set();
const unsupportedLoadChunk = Promise.resolve(undefined);
const loadedChunk = Promise.resolve(undefined);
const chunkCache = new Map();
function clearChunkCache() {
    chunkCache.clear();
    loadedChunks.clear();
}
function loadRuntimeChunkPath(sourcePath, chunkPath) {
    if (!isJs(chunkPath)) {
        // We only support loading JS chunks in Node.js.
        // This branch can be hit when trying to load a CSS chunk.
        return;
    }
    if (loadedChunks.has(chunkPath)) {
        return;
    }
    try {
        const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
        const chunkModules = requireChunk(chunkPath);
        installCompressedModuleFactories(chunkModules, 0, moduleFactories);
        loadedChunks.add(chunkPath);
    } catch (cause) {
        let errorMessage = `Failed to load chunk ${chunkPath}`;
        if (sourcePath) {
            errorMessage += ` from runtime for chunk ${sourcePath}`;
        }
        const error = new Error(errorMessage, {
            cause
        });
        error.name = 'ChunkLoadError';
        throw error;
    }
}
function loadChunkAsync(chunkData) {
    const chunkPath = typeof chunkData === 'string' ? chunkData : chunkData.path;
    if (!isJs(chunkPath)) {
        // We only support loading JS chunks in Node.js.
        // This branch can be hit when trying to load a CSS chunk.
        return unsupportedLoadChunk;
    }
    let entry = chunkCache.get(chunkPath);
    if (entry === undefined) {
        try {
            // resolve to an absolute path to simplify `require` handling
            const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
            // TODO: consider switching to `import()` to enable concurrent chunk loading and async file io
            // However this is incompatible with hot reloading (since `import` doesn't use the require cache)
            const chunkModules = requireChunk(chunkPath);
            installCompressedModuleFactories(chunkModules, 0, moduleFactories);
            entry = loadedChunk;
        } catch (cause) {
            const errorMessage = `Failed to load chunk ${chunkPath} from module ${this.m.id}`;
            const error = new Error(errorMessage, {
                cause
            });
            error.name = 'ChunkLoadError';
            // Cache the failure promise, future requests will also get this same rejection
            entry = Promise.reject(error);
        }
        chunkCache.set(chunkPath, entry);
    }
    // TODO: Return an instrumented Promise that React can use instead of relying on referential equality.
    return entry;
}
contextPrototype.l = loadChunkAsync;
function loadChunkAsyncByUrl(chunkUrl) {
    const path1 = url.fileURLToPath(new URL(chunkUrl, RUNTIME_ROOT));
    return loadChunkAsync.call(this, path1);
}
contextPrototype.L = loadChunkAsyncByUrl;
async function loadWebAssembly(chunkPath, _edgeModule, imports) {
  const mod = await loadWasmChunk(chunkPath);
  const { exports } = await WebAssembly.instantiate(mod, imports);
  return exports;
}
contextPrototype.w = loadWebAssembly;
function loadWebAssemblyModule(chunkPath, _edgeModule) {
  return loadWasmChunk(chunkPath);
}
contextPrototype.u = loadWebAssemblyModule;
/**
 * Creates a Node.js worker thread by instantiating the given WorkerConstructor
 * with the appropriate path and options, including forwarded globals.
 *
 * @param WorkerConstructor The Worker constructor from worker_threads
 * @param workerPath Path to the worker entry chunk
 * @param workerOptions options to pass to the Worker constructor (optional)
 */ function createWorker(WorkerConstructor, workerPath, workerOptions) {
    // Build the forwarded globals object
    const forwardedGlobals = {};
    for (const name of WORKER_FORWARDED_GLOBALS){
        forwardedGlobals[name] = globalThis[name];
    }
    // Merge workerData with forwarded globals
    const existingWorkerData = workerOptions?.workerData || {};
    const options = {
        ...workerOptions,
        workerData: {
            ...typeof existingWorkerData === 'object' ? existingWorkerData : {},
            __turbopack_globals__: forwardedGlobals
        }
    };
    return new WorkerConstructor(workerPath, options);
}
const regexJsUrl = /\.js(?:\?[^#]*)?(?:#.*)?$/;
/**
 * Checks if a given path/URL ends with .js, optionally followed by ?query or #fragment.
 */ function isJs(chunkUrlOrPath) {
    return regexJsUrl.test(chunkUrlOrPath);
}
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="./runtime-base.ts" />
/**
 * Production Node.js runtime.
 * Uses ModuleWithDirection and simple module instantiation without HMR support.
 */ // moduleCache and moduleFactories are declared in runtime-base.ts
// this is read in runtime-utils.ts so it creates a module with direction for hmr
createModuleWithDirectionFlag = true;
const nodeContextPrototype = Context.prototype;
nodeContextPrototype.q = exportUrl;
nodeContextPrototype.M = moduleFactories;
// Cast moduleCache to ModuleWithDirection for production mode
nodeContextPrototype.c = moduleCache;
nodeContextPrototype.R = resolvePathFromModule;
nodeContextPrototype.b = createWorker;
nodeContextPrototype.C = clearChunkCache;
function instantiateModule(id, sourceType, sourceData) {
    const moduleFactory = moduleFactories.get(id);
    if (typeof moduleFactory !== 'function') {
        // This can happen if modules incorrectly handle HMR disposes/updates,
        // e.g. when they keep a `setTimeout` around which still executes old code
        // and contains e.g. a `require("something")` call.
        throw new Error(factoryNotAvailableMessage(id, sourceType, sourceData));
    }
    const module1 = createModuleWithDirection(id);
    const exports = module1.exports;
    moduleCache[id] = module1;
    const context = new Context(module1, exports);
    // NOTE(alexkirsz) This can fail when the module encounters a runtime error.
    try {
        moduleFactory(context, module1, exports);
    } catch (error) {
        module1.error = error;
        throw error;
    }
    ;
    module1.loaded = true;
    if (module1.namespaceObject && module1.exports !== module1.namespaceObject) {
        // in case of a circular dependency: cjs1 -> esm2 -> cjs1
        interopEsm(module1.exports, module1.namespaceObject);
    }
    return module1;
}
/**
 * Retrieves a module from the cache, or instantiate it if it is not cached.
 */ // @ts-ignore
function getOrInstantiateModuleFromParent(id, sourceModule) {
    const module1 = moduleCache[id];
    if (module1) {
        if (module1.error) {
            throw module1.error;
        }
        return module1;
    }
    return instantiateModule(id, SourceType.Parent, sourceModule.id);
}
/**
 * Instantiates a runtime module.
 */ function instantiateRuntimeModule(chunkPath, moduleId) {
    return instantiateModule(moduleId, SourceType.Runtime, chunkPath);
}
/**
 * Retrieves a module from the cache, or instantiate it as a runtime module if it is not cached.
 */ // @ts-ignore TypeScript doesn't separate this module space from the browser runtime
function getOrInstantiateRuntimeModule(chunkPath, moduleId) {
    const module1 = moduleCache[moduleId];
    if (module1) {
        if (module1.error) {
            throw module1.error;
        }
        return module1;
    }
    return instantiateRuntimeModule(chunkPath, moduleId);
}
module.exports = (sourcePath)=>({
        m: (id)=>getOrInstantiateRuntimeModule(sourcePath, id),
        c: (chunkData)=>loadRuntimeChunk(sourcePath, chunkData)
    });


//# sourceMappingURL=%5Bturbopack%5D_runtime.js.map

  function requireChunk(chunkPath) {
    switch(chunkPath) {
      case "server/chunks/ssr/[root-of-the-server]__0-mo_hw._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0-mo_hw._.js");
      case "server/chunks/ssr/[root-of-the-server]__11x-rln._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__11x-rln._.js");
      case "server/chunks/ssr/[root-of-the-server]__14jxa96._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__14jxa96._.js");
      case "server/chunks/ssr/[root-of-the-server]__1f3rnfv._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1f3rnfv._.js");
      case "server/chunks/ssr/[turbopack]_runtime.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[turbopack]_runtime.js");
      case "server/chunks/ssr/_0kb5c-z._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0kb5c-z._.js");
      case "server/chunks/ssr/_1690451._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1690451._.js");
      case "server/chunks/ssr/_1ag3qel._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1ag3qel._.js");
      case "server/chunks/ssr/_next-internal_server_app__not-found_page_actions_0pt47yr.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app__not-found_page_actions_0pt47yr.js");
      case "server/chunks/ssr/node_modules_0-fd4hy._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_0-fd4hy._.js");
      case "server/chunks/ssr/node_modules_framer-motion_dist_es_render_components_motion_proxy_mjs_1hcb7fs._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_framer-motion_dist_es_render_components_motion_proxy_mjs_1hcb7fs._.js");
      case "server/chunks/ssr/node_modules_next_13dl5wv._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_13dl5wv._.js");
      case "server/chunks/ssr/node_modules_next_1iemwhs._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_1iemwhs._.js");
      case "server/chunks/ssr/node_modules_next_dist_0alesp5._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_0alesp5._.js");
      case "server/chunks/ssr/node_modules_next_dist_0f-8op-._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_0f-8op-._.js");
      case "server/chunks/ssr/node_modules_next_dist_0qskf83._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_0qskf83._.js");
      case "server/chunks/ssr/node_modules_next_dist_0uboya6._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_0uboya6._.js");
      case "server/chunks/ssr/node_modules_next_dist_17i19if._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_17i19if._.js");
      case "server/chunks/ssr/node_modules_next_dist_1h4k0e-._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_1h4k0e-._.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_0bew68i._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_0bew68i._.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_0wpq8j3._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_0wpq8j3._.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_builtin_forbidden_0symwr9.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_builtin_forbidden_0symwr9.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_builtin_unauthorized_0l_sp0x.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_builtin_unauthorized_0l_sp0x.js");
      case "server/chunks/ssr/node_modules_next_dist_compiled_@opentelemetry_api_index_1oy1nwh.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_compiled_@opentelemetry_api_index_1oy1nwh.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0cz7t1p.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0cz7t1p.js");
      case "server/chunks/ssr/src_generated_prisma_internal_query_compiler_fast_bg_0athij3.wasm": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_generated_prisma_internal_query_compiler_fast_bg_0athij3.wasm");
      case "server/chunks/ssr/src_generated_prisma_internal_query_compiler_fast_bg_1u1uj4b.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_generated_prisma_internal_query_compiler_fast_bg_1u1uj4b.js");
      case "server/chunks/ssr/src_generated_prisma_internal_query_compiler_fast_bg_wasm_0jfi6gu._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_generated_prisma_internal_query_compiler_fast_bg_wasm_0jfi6gu._.js");
      case "server/chunks/ssr/src_i18n_locales_ar_index_ts_0a-o2uv._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_i18n_locales_ar_index_ts_0a-o2uv._.js");
      case "server/chunks/ssr/src_i18n_locales_en_index_ts_1tb4na1._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_i18n_locales_en_index_ts_1tb4na1._.js");
      case "server/chunks/ssr/[root-of-the-server]__1oic7b-._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1oic7b-._.js");
      case "server/chunks/ssr/_0w2oxcd._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0w2oxcd._.js");
      case "server/chunks/ssr/_1mmk-ig._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1mmk-ig._.js");
      case "server/chunks/ssr/_next-internal_server_app_[username]_page_actions_1yw9-32.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_[username]_page_actions_1yw9-32.js");
      case "server/chunks/ssr/node_modules_next_13m025q._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_13m025q._.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_builtin_global-error_0-o-goa.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_builtin_global-error_0-o-goa.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_20esp2o.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_20esp2o.js");
      case "server/chunks/ssr/src_components_card-renderer_1sx1vlw._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_components_card-renderer_1sx1vlw._.js");
      case "server/chunks/ssr/[root-of-the-server]__0s9-uaf._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0s9-uaf._.js");
      case "server/chunks/ssr/[root-of-the-server]__116k9xl._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__116k9xl._.js");
      case "server/chunks/ssr/_next-internal_server_app__global-error_page_actions_0zi5s8-.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app__global-error_page_actions_0zi5s8-.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_06zp_1r.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_06zp_1r.js");
      case "server/chunks/ssr/[root-of-the-server]__1n8ebsv._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1n8ebsv._.js");
      case "server/chunks/ssr/_0jdrztl._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0jdrztl._.js");
      case "server/chunks/ssr/_13hmveh._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_13hmveh._.js");
      case "server/chunks/ssr/_1dnbcad._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1dnbcad._.js");
      case "server/chunks/ssr/_1q26bl2._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1q26bl2._.js");
      case "server/chunks/ssr/_1x2__xp._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1x2__xp._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1h45j0t.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1h45j0t.js");
      case "server/chunks/ssr/src_design_0ut6etm._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_design_0ut6etm._.js");
      case "server/chunks/ssr/src_features_appearance_workspace-session-client_ts_15_-cvv._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_features_appearance_workspace-session-client_ts_15_-cvv._.js");
      case "server/chunks/ssr/[root-of-the-server]__1am4zqc._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1am4zqc._.js");
      case "server/chunks/ssr/_1-tjugt._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1-tjugt._.js");
      case "server/chunks/ssr/_1fodcur._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1fodcur._.js");
      case "server/chunks/ssr/_next-internal_server_app_activate_page_actions_0ska36w.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_activate_page_actions_0ska36w.js");
      case "server/chunks/ssr/node_modules_lucide-react_dist_esm_0d4tdy8._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_lucide-react_dist_esm_0d4tdy8._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1kc_mta.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1kc_mta.js");
      case "server/chunks/ssr/[root-of-the-server]__0fypg89._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0fypg89._.js");
      case "server/chunks/ssr/[root-of-the-server]__1a7djbc._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1a7djbc._.js");
      case "server/chunks/ssr/_0hq57f5._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0hq57f5._.js");
      case "server/chunks/ssr/_1_vx6we._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1_vx6we._.js");
      case "server/chunks/ssr/_1mva-v4._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1mva-v4._.js");
      case "server/chunks/ssr/_1nrq_4l._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1nrq_4l._.js");
      case "server/chunks/ssr/_1p6703z._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1p6703z._.js");
      case "server/chunks/ssr/_1u16ftc._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1u16ftc._.js");
      case "server/chunks/ssr/node_modules_next_dist_0airgni._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_0airgni._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_01zjbig.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_01zjbig.js");
      case "server/chunks/ssr/src_0qk3vbc._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_0qk3vbc._.js");
      case "server/chunks/ssr/src_app_admin_(authenticated)_customers_0nl4_gg._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_(authenticated)_customers_0nl4_gg._.js");
      case "server/chunks/ssr/src_app_admin_(authenticated)_error_tsx_0rq0m06._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_(authenticated)_error_tsx_0rq0m06._.js");
      case "server/chunks/ssr/src_app_admin_(authenticated)_loading_tsx_15_1a-7._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_(authenticated)_loading_tsx_15_1a-7._.js");
      case "server/chunks/ssr/src_design_navigation_index_ts_0_pc2-f._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_design_navigation_index_ts_0_pc2-f._.js");
      case "server/chunks/ssr/src_features_admin_AccessCodeActions_tsx_1y8gvef._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_features_admin_AccessCodeActions_tsx_1y8gvef._.js");
      case "server/chunks/ssr/[root-of-the-server]__0xdztyl._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0xdztyl._.js");
      case "server/chunks/ssr/_0py_5dd._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0py_5dd._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_14tka_e.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_14tka_e.js");
      case "server/chunks/ssr/[root-of-the-server]__0rxbms8._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0rxbms8._.js");
      case "server/chunks/ssr/_0hzhlva._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0hzhlva._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_12xz1a_.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_12xz1a_.js");
      case "server/chunks/ssr/[root-of-the-server]__1kd7c7q._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1kd7c7q._.js");
      case "server/chunks/ssr/_0hfznf9._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0hfznf9._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1o24g9j.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1o24g9j.js");
      case "server/chunks/ssr/src_app_admin_(authenticated)_cards_loading_tsx_1iv_0cm._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_(authenticated)_cards_loading_tsx_1iv_0cm._.js");
      case "server/chunks/ssr/src_features_admin_IssueCardPanel_tsx_1prai8e._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_features_admin_IssueCardPanel_tsx_1prai8e._.js");
      case "server/chunks/ssr/[root-of-the-server]__04541aj._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__04541aj._.js");
      case "server/chunks/ssr/_10f7tx_._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_10f7tx_._.js");
      case "server/chunks/ssr/_1rn6g3l._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1rn6g3l._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_16uov6q.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_16uov6q.js");
      case "server/chunks/ssr/src_app_admin_(authenticated)_cards_0ltvrgd._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_(authenticated)_cards_0ltvrgd._.js");
      case "server/chunks/ssr/src_design_data-grid_1r63l-4._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_design_data-grid_1r63l-4._.js");
      case "server/chunks/ssr/[root-of-the-server]__0sy6ua-._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0sy6ua-._.js");
      case "server/chunks/ssr/_0v1s87b._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0v1s87b._.js");
      case "server/chunks/ssr/_1njq2o-._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1njq2o-._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1f4tyo6.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1f4tyo6.js");
      case "server/chunks/ssr/src_app_admin_(authenticated)_customers_04z2v4j._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_(authenticated)_customers_04z2v4j._.js");
      case "server/chunks/ssr/src_app_admin_(authenticated)_customers_1m7mxt3._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_(authenticated)_customers_1m7mxt3._.js");
      case "server/chunks/ssr/[root-of-the-server]__0q_esjk._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0q_esjk._.js");
      case "server/chunks/ssr/_0448zxm._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0448zxm._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0pp1-h8.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0pp1-h8.js");
      case "server/chunks/ssr/[root-of-the-server]__1acz8ob._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1acz8ob._.js");
      case "server/chunks/ssr/_1-15x76._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1-15x76._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_084200l.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_084200l.js");
      case "server/chunks/ssr/[root-of-the-server]__1gav08g._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1gav08g._.js");
      case "server/chunks/ssr/_0f-5b3o._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0f-5b3o._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0k3215f.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0k3215f.js");
      case "server/chunks/ssr/[root-of-the-server]__08dxc_4._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__08dxc_4._.js");
      case "server/chunks/ssr/_0re4cez._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0re4cez._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0e4_sg7.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0e4_sg7.js");
      case "server/chunks/ssr/[root-of-the-server]__08qr-x_._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__08qr-x_._.js");
      case "server/chunks/ssr/_1q_5cs8._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1q_5cs8._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1c_nd5-.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1c_nd5-.js");
      case "server/chunks/ssr/src_features_admin_MediaLibrary_tsx_15b9h3c._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_features_admin_MediaLibrary_tsx_15b9h3c._.js");
      case "server/chunks/ssr/[root-of-the-server]__095dsun._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__095dsun._.js");
      case "server/chunks/ssr/_02f4i_c._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_02f4i_c._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_170p0py.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_170p0py.js");
      case "server/chunks/ssr/[root-of-the-server]__1p0din_._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1p0din_._.js");
      case "server/chunks/ssr/_13fac5u._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_13fac5u._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0_-s6k5.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0_-s6k5.js");
      case "server/chunks/ssr/[root-of-the-server]__1vauf9x._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1vauf9x._.js");
      case "server/chunks/ssr/_0ubjg-c._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0ubjg-c._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_15r-bqa.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_15r-bqa.js");
      case "server/chunks/ssr/[root-of-the-server]__0k-r9u8._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0k-r9u8._.js");
      case "server/chunks/ssr/_1yf4o57._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1yf4o57._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1hxlha_.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1hxlha_.js");
      case "server/chunks/ssr/[root-of-the-server]__0149_7o._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0149_7o._.js");
      case "server/chunks/ssr/_0-js_f0._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0-js_f0._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0x-ony5.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0x-ony5.js");
      case "server/chunks/ssr/src_app_admin_(authenticated)_orders_OrdersDataGrid_tsx_0vwth66._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_(authenticated)_orders_OrdersDataGrid_tsx_0vwth66._.js");
      case "server/chunks/ssr/src_app_admin_(authenticated)_orders_loading_tsx_1471gj0._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_(authenticated)_orders_loading_tsx_1471gj0._.js");
      case "server/chunks/ssr/[root-of-the-server]__03aco41._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__03aco41._.js");
      case "server/chunks/ssr/_0piy61r._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0piy61r._.js");
      case "server/chunks/ssr/_1j000g6._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1j000g6._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0l--bvd.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0l--bvd.js");
      case "server/chunks/ssr/[root-of-the-server]__053bgko._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__053bgko._.js");
      case "server/chunks/ssr/_1hint9v._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1hint9v._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0k1otjp.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0k1otjp.js");
      case "server/chunks/ssr/[root-of-the-server]__0j08r-o._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0j08r-o._.js");
      case "server/chunks/ssr/_0uih3rw._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0uih3rw._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0o73_tv.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0o73_tv.js");
      case "server/chunks/ssr/src_app_admin_(authenticated)_plans_loading_tsx_0vx80oo._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_(authenticated)_plans_loading_tsx_0vx80oo._.js");
      case "server/chunks/ssr/src_features_admin_PlansManager_tsx_157cj4w._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_features_admin_PlansManager_tsx_157cj4w._.js");
      case "server/chunks/ssr/[root-of-the-server]__11zmnea._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__11zmnea._.js");
      case "server/chunks/ssr/_1gfv5an._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1gfv5an._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0x4c9mj.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0x4c9mj.js");
      case "server/chunks/ssr/src_app_admin_(authenticated)_settings_1h46py3._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_(authenticated)_settings_1h46py3._.js");
      case "server/chunks/ssr/src_app_admin_(authenticated)_settings_loading_tsx_1rx8b-a._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_(authenticated)_settings_loading_tsx_1rx8b-a._.js");
      case "server/chunks/ssr/[root-of-the-server]__1zqiugw._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1zqiugw._.js");
      case "server/chunks/ssr/_0x4_bg7._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0x4_bg7._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1yg9vrn.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1yg9vrn.js");
      case "server/chunks/ssr/[root-of-the-server]__0yrfbpf._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0yrfbpf._.js");
      case "server/chunks/ssr/_0yp1ks2._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0yp1ks2._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1b09_h8.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1b09_h8.js");
      case "server/chunks/ssr/src_app_admin_(authenticated)_subscription-activations_loading_tsx_1smtj8i._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_(authenticated)_subscription-activations_loading_tsx_1smtj8i._.js");
      case "server/chunks/ssr/[root-of-the-server]__0abvfco._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0abvfco._.js");
      case "server/chunks/ssr/_100imu5._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_100imu5._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1u40po8.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1u40po8.js");
      case "server/chunks/ssr/[root-of-the-server]__0pc0hor._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0pc0hor._.js");
      case "server/chunks/ssr/_1bvj9yq._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1bvj9yq._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1vem8bo.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1vem8bo.js");
      case "server/chunks/ssr/[root-of-the-server]__1tpd_-s._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1tpd_-s._.js");
      case "server/chunks/ssr/_13flll7._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_13flll7._.js");
      case "server/chunks/ssr/_1uojk83._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1uojk83._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_login_page_actions_024efkc.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_login_page_actions_024efkc.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0h_aw0r.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0h_aw0r.js");
      case "server/chunks/[root-of-the-server]__1967z9i._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1967z9i._.js");
      case "server/chunks/[root-of-the-server]__1y_g68p._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1y_g68p._.js");
      case "server/chunks/[turbopack]_runtime.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[turbopack]_runtime.js");
      case "server/chunks/_0-jxlav._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_0-jxlav._.js");
      case "server/chunks/_0w4-86b._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_0w4-86b._.js");
      case "server/chunks/_next-internal_server_app_api_admin_cards_export_route_actions_0bvxuhi.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_admin_cards_export_route_actions_0bvxuhi.js");
      case "server/chunks/node_modules_next_1_14bcs._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/node_modules_next_1_14bcs._.js");
      case "server/chunks/node_modules_next_1lo724y._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/node_modules_next_1lo724y._.js");
      case "server/chunks/node_modules_next_dist_0asya_d._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/node_modules_next_dist_0asya_d._.js");
      case "server/chunks/node_modules_next_dist_13kw1hb._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/node_modules_next_dist_13kw1hb._.js");
      case "server/chunks/src_generated_prisma_internal_query_compiler_fast_bg_0athij3.wasm": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/src_generated_prisma_internal_query_compiler_fast_bg_0athij3.wasm");
      case "server/chunks/src_generated_prisma_internal_query_compiler_fast_bg_15rgq9b.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/src_generated_prisma_internal_query_compiler_fast_bg_15rgq9b.js");
      case "server/chunks/src_generated_prisma_internal_query_compiler_fast_bg_wasm_1427e-x._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/src_generated_prisma_internal_query_compiler_fast_bg_wasm_1427e-x._.js");
      case "server/chunks/[root-of-the-server]__0ekjb-3._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0ekjb-3._.js");
      case "server/chunks/_next-internal_server_app_api_admin_customers_export_route_actions_1r4huty.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_admin_customers_export_route_actions_1r4huty.js");
      case "server/chunks/[root-of-the-server]__1snryoh._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1snryoh._.js");
      case "server/chunks/_next-internal_server_app_api_auth_[___nextauth]_route_actions_08nexdk.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_auth_[___nextauth]_route_actions_08nexdk.js");
      case "server/chunks/[root-of-the-server]__1g437a_._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1g437a_._.js");
      case "server/chunks/_next-internal_server_app_api_cards_route_actions_0w85oxc.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_cards_route_actions_0w85oxc.js");
      case "server/chunks/[root-of-the-server]__0ivxj29._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0ivxj29._.js");
      case "server/chunks/_19-lhc2._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_19-lhc2._.js");
      case "server/chunks/_next-internal_server_app_api_cards_upload-avatar_route_actions_07p650l.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_cards_upload-avatar_route_actions_07p650l.js");
      case "server/chunks/node_modules_next_dist_0w_6_3_._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/node_modules_next_dist_0w_6_3_._.js");
      case "server/chunks/node_modules_next_dist_0wckegx._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/node_modules_next_dist_0wckegx._.js");
      case "server/chunks/[root-of-the-server]__15975e9._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__15975e9._.js");
      case "server/chunks/_next-internal_server_app_api_download_route_actions_07yss3k.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_download_route_actions_07yss3k.js");
      case "server/chunks/[root-of-the-server]__1gis1y0._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1gis1y0._.js");
      case "server/chunks/_next-internal_server_app_api_internal_subscriptions_daily_route_actions_16bfegt.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_internal_subscriptions_daily_route_actions_16bfegt.js");
      case "server/chunks/[root-of-the-server]__1d4cm5w._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1d4cm5w._.js");
      case "server/chunks/_next-internal_server_app_api_upload_route_actions_1yybo5l.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_upload_route_actions_1yybo5l.js");
      case "server/chunks/[root-of-the-server]__0jzaz67._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0jzaz67._.js");
      case "server/chunks/_next-internal_server_app_card_[slug]_route_actions_1jym7h2.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_card_[slug]_route_actions_1jym7h2.js");
      case "server/chunks/[root-of-the-server]__0-y2acw._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0-y2acw._.js");
      case "server/chunks/_next-internal_server_app_cards_[id]_appearance_route_actions_19akhao.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_cards_[id]_appearance_route_actions_19akhao.js");
      case "server/chunks/1oeh_server_app_cards_[id]_blocks_[blockId]_duplicate_route_actions_00224g_.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/1oeh_server_app_cards_[id]_blocks_[blockId]_duplicate_route_actions_00224g_.js");
      case "server/chunks/[root-of-the-server]__1hqfngp._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1hqfngp._.js");
      case "server/chunks/[root-of-the-server]__0q5j60q._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0q5j60q._.js");
      case "server/chunks/_next-internal_server_app_cards_[id]_blocks_[blockId]_route_actions_1c6djyl.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_cards_[id]_blocks_[blockId]_route_actions_1c6djyl.js");
      case "server/chunks/[root-of-the-server]__11wlg03._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__11wlg03._.js");
      case "server/chunks/_next-internal_server_app_cards_[id]_blocks_initialize_route_actions_0l_zxkj.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_cards_[id]_blocks_initialize_route_actions_0l_zxkj.js");
      case "server/chunks/[root-of-the-server]__1go1lgt._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1go1lgt._.js");
      case "server/chunks/_next-internal_server_app_cards_[id]_blocks_route_actions_08ojzu3.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_cards_[id]_blocks_route_actions_08ojzu3.js");
      case "server/chunks/[root-of-the-server]__101q917._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__101q917._.js");
      case "server/chunks/_next-internal_server_app_cards_[id]_buttons_[buttonId]_route_actions_1jkbu31.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_cards_[id]_buttons_[buttonId]_route_actions_1jkbu31.js");
      case "server/chunks/[root-of-the-server]__1hpw91i._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1hpw91i._.js");
      case "server/chunks/_next-internal_server_app_cards_[id]_buttons_route_actions_02amc6b.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_cards_[id]_buttons_route_actions_02amc6b.js");
      case "server/chunks/[root-of-the-server]__1-161s9._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1-161s9._.js");
      case "server/chunks/_next-internal_server_app_cards_[id]_profile_route_actions_1isye34.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_cards_[id]_profile_route_actions_1isye34.js");
      case "server/chunks/[root-of-the-server]__1sk077o._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1sk077o._.js");
      case "server/chunks/_next-internal_server_app_cards_[id]_publication_route_actions_1qil841.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_cards_[id]_publication_route_actions_1qil841.js");
      case "server/chunks/[root-of-the-server]__1plgu7b._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1plgu7b._.js");
      case "server/chunks/_next-internal_server_app_cards_[id]_sections_route_actions_0765wi6.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_cards_[id]_sections_route_actions_0765wi6.js");
      case "server/chunks/[root-of-the-server]__1o9qybf._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1o9qybf._.js");
      case "server/chunks/_next-internal_server_app_cards_[id]_settings_route_actions_0sl216l.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_cards_[id]_settings_route_actions_0sl216l.js");
      case "server/chunks/[root-of-the-server]__13h5cqa._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__13h5cqa._.js");
      case "server/chunks/_next-internal_server_app_cards_[id]_slug_route_actions_0evixi7.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_cards_[id]_slug_route_actions_0evixi7.js");
      case "server/chunks/1oeh_server_app_cards_[id]_social-links_[socialLinkId]_route_actions_1nvf7ya.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/1oeh_server_app_cards_[id]_social-links_[socialLinkId]_route_actions_1nvf7ya.js");
      case "server/chunks/[root-of-the-server]__1d11mm8._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1d11mm8._.js");
      case "server/chunks/[root-of-the-server]__0q4ed3h._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0q4ed3h._.js");
      case "server/chunks/_next-internal_server_app_cards_[id]_social-links_route_actions_1w2nx80.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_cards_[id]_social-links_route_actions_1w2nx80.js");
      case "server/chunks/[root-of-the-server]__09ipv7i._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__09ipv7i._.js");
      case "server/chunks/_next-internal_server_app_cards_route_actions_05f_4du.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_cards_route_actions_05f_4du.js");
      case "server/chunks/ssr/[root-of-the-server]__16wbu9c._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__16wbu9c._.js");
      case "server/chunks/ssr/_next-internal_server_app_create-card_page_actions_1bv0jcn.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_create-card_page_actions_1bv0jcn.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0zfaznj.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0zfaznj.js");
      case "server/chunks/ssr/[root-of-the-server]__119ubvh._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__119ubvh._.js");
      case "server/chunks/ssr/_1ewj_mo._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1ewj_mo._.js");
      case "server/chunks/ssr/_1yzsd87._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1yzsd87._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0htkqbh.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0htkqbh.js");
      case "server/chunks/[root-of-the-server]__1uhamdi._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1uhamdi._.js");
      case "server/chunks/_next-internal_server_app_customer_logout_route_actions_0c81_vy.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_customer_logout_route_actions_0c81_vy.js");
      case "server/chunks/ssr/[root-of-the-server]__0i_8d1m._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0i_8d1m._.js");
      case "server/chunks/ssr/_1zu4bi7._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1zu4bi7._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_01fl5k5.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_01fl5k5.js");
      case "server/chunks/[root-of-the-server]__05pkrq3._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__05pkrq3._.js");
      case "server/chunks/_next-internal_server_app_customers_route_actions_0bgt3v1.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_customers_route_actions_0bgt3v1.js");
      case "server/chunks/[externals]_next_dist_1ce_grm._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/[externals]_next_dist_1ce_grm._.js");
      case "server/chunks/_next-internal_server_app_favicon_ico_route_actions_0g2jjls.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_favicon_ico_route_actions_0g2jjls.js");
      case "server/chunks/node_modules_next_dist_esm_build_templates_app-route_12f2k_b.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/node_modules_next_dist_esm_build_templates_app-route_12f2k_b.js");
      case "server/chunks/ssr/[root-of-the-server]__048ixqf._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__048ixqf._.js");
      case "server/chunks/ssr/_next-internal_server_app_gallery_page_actions_1ci3vpy.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_gallery_page_actions_1ci3vpy.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1c4z2gc.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1c4z2gc.js");
      case "server/chunks/ssr/[root-of-the-server]__1u4u3ue._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1u4u3ue._.js");
      case "server/chunks/ssr/_18qaclx._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_18qaclx._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0el1i9x.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0el1i9x.js");
      case "server/chunks/ssr/[root-of-the-server]__0r5zg55._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0r5zg55._.js");
      case "server/chunks/ssr/_next-internal_server_app_page_actions_0hhsz1j.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_page_actions_0hhsz1j.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1unvtta.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1unvtta.js");
      case "server/chunks/ssr/src_features_marketing_1b5_vnv._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_features_marketing_1b5_vnv._.js");
      case "server/chunks/ssr/[root-of-the-server]__1pr9t_f._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1pr9t_f._.js");
      case "server/chunks/ssr/_next-internal_server_app_products_page_actions_1zy_1pe.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_products_page_actions_1zy_1pe.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_15r-qbv.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_15r-qbv.js");
      case "server/chunks/ssr/src_app_products_0zebljb._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_products_0zebljb._.js");
      case "server/chunks/ssr/[root-of-the-server]__1-ddrol._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1-ddrol._.js");
      case "server/chunks/ssr/_0xwq0vo._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0xwq0vo._.js");
      case "server/chunks/ssr/_14kqb60._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_14kqb60._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1fsrk1z.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1fsrk1z.js");
      case "server/chunks/ssr/[root-of-the-server]__1q6h_gx._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1q6h_gx._.js");
      case "server/chunks/ssr/_0blncf4._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_0blncf4._.js");
      case "server/chunks/ssr/_20fbj6_._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_20fbj6_._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_20sdehd.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_20sdehd.js");
      case "server/chunks/ssr/[root-of-the-server]__0fmjjmq._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0fmjjmq._.js");
      case "server/chunks/ssr/_05fn-8a._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_05fn-8a._.js");
      case "server/chunks/ssr/_09l1_pm._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_09l1_pm._.js");
      case "server/chunks/ssr/_11rh913._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_11rh913._.js");
      case "server/chunks/ssr/_1380o6_._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1380o6_._.js");
      case "server/chunks/ssr/_1cpo4jq._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/_1cpo4jq._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_00xrcp_.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_00xrcp_.js");
      case "server/chunks/ssr/src_0mexk2p._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_0mexk2p._.js");
      case "server/chunks/ssr/src_0p3nkig._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_0p3nkig._.js");
      case "server/chunks/ssr/src_1z5hleu._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_1z5hleu._.js");
      case "server/chunks/ssr/src_app_workspace_error_tsx_1xb5tg-._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_workspace_error_tsx_1xb5tg-._.js");
      case "server/chunks/ssr/src_app_workspace_loading_tsx_11swdym._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_workspace_loading_tsx_11swdym._.js");
      case "server/chunks/ssr/src_components_workspace_workspace-page-content_tsx_1ehk5n8._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_components_workspace_workspace-page-content_tsx_1ehk5n8._.js");
      case "server/chunks/ssr/src_store_use-card-editor-store_ts_017yqpk._.js": return require("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_store_use-card-editor-store_ts_017yqpk._.js");
      default:
        throw new Error(`Not found ${chunkPath}`);
    }
  }


  async function loadWasmChunk(chunkPath) {
    switch (chunkPath) {
      case "server/chunks/ssr/src_generated_prisma_internal_query_compiler_fast_bg_0athij3.wasm": return (await import("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/ssr/src_generated_prisma_internal_query_compiler_fast_bg_0athij3.wasm")).default;
      case "server/chunks/src_generated_prisma_internal_query_compiler_fast_bg_0athij3.wasm": return (await import("/home/sherif/Pictures/ai-business-card-main/.open-next/server-functions/default/.next/server/chunks/src_generated_prisma_internal_query_compiler_fast_bg_0athij3.wasm")).default;
      default:
        throw new Error(`Unknown wasm chunk: ${chunkPath}`);
    }
  }
