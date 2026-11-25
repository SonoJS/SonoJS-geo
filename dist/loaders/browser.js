export function createBrowserLoadJson() {
    return async (url) => {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
        }
        return (await res.json());
    };
}
export function defaultBrowserDataBaseUrl() {
    return new URL("../data/", import.meta.url).href;
}
//# sourceMappingURL=browser.js.map