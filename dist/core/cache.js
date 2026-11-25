const dataCache = new Map();
const inflight = new Map();
/** @internal */
export function getCached(key) {
    return dataCache.get(key);
}
export function setCached(key, value) {
    dataCache.set(key, value);
}
export function clearGeoCache() {
    dataCache.clear();
    inflight.clear();
}
export function loadDeduped(key, loader) {
    const hit = getCached(key);
    if (hit !== undefined)
        return Promise.resolve(hit);
    const pending = inflight.get(key);
    if (pending)
        return pending;
    const p = loader()
        .then((value) => {
        setCached(key, value);
        inflight.delete(key);
        return value;
    })
        .catch((err) => {
        inflight.delete(key);
        throw err;
    });
    inflight.set(key, p);
    return p;
}
//# sourceMappingURL=cache.js.map