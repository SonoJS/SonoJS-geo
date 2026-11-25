let config = {};
let defaultDataBaseUrl = null;
export function setDefaultDataBaseUrl(url) {
    defaultDataBaseUrl = url;
}
export function configureGeo(next) {
    config = { ...config, ...next };
}
export function getGeoConfig() {
    return { ...config };
}
export function resolveDataBaseUrl() {
    const base = config.dataBaseUrl ?? defaultDataBaseUrl;
    if (!base) {
        throw new Error("@sonojs/geo: data base URL is not configured (internal error)");
    }
    return base.endsWith("/") ? base : `${base}/`;
}
export function resetGeoConfigForTests() {
    config = {};
}
//# sourceMappingURL=config.js.map