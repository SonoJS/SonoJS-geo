import { resolveDataBaseUrl } from "./config.js";
import { loadDeduped, getCached } from "./cache.js";
import { GeoLoadError } from "./errors.js";
export function createDataStore(loadJson) {
    function urlPath(relative) {
        return `${resolveDataBaseUrl()}${relative.replace(/^\//, "")}`;
    }
    async function load(relative) {
        const key = `json:${relative}`;
        return loadDeduped(key, async () => {
            try {
                return await loadJson(urlPath(relative));
            }
            catch (err) {
                throw new GeoLoadError(relative, `Failed to load geographic data at ${relative}`, err);
            }
        });
    }
    function countriesLoaded() {
        return getCached("json:countries.json");
    }
    return {
        loadCountries() {
            return load("countries.json");
        },
        loadStateRefs() {
            return load("state-refs.json");
        },
        loadCityRefs() {
            return load("city-refs.json");
        },
        loadCitySearchIndex() {
            return load("city-search-index.json");
        },
        loadStatesByCountryIso(iso2) {
            const code = iso2.toLowerCase();
            return load(`states/${code}.json`);
        },
        loadCitiesByCountryIso(iso2) {
            const code = iso2.toLowerCase();
            return load(`cities/${code}.json`);
        },
        countriesLoaded,
        urlPath,
    };
}
//# sourceMappingURL=data-store.js.map