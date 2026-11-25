import { configureGeo as configure, getGeoConfig, resetGeoConfigForTests, } from "./config.js";
import { clearGeoCache } from "./cache.js";
import { createDataStore } from "./data-store.js";
import { applyLimit, createSearchCollator, matchesSearch, normalizeQuery, } from "./search.js";
const collator = createSearchCollator();
function parseCountryRef(ref) {
    if (typeof ref === "number")
        return { kind: "id", value: ref };
    const s = String(ref).trim();
    if (!s)
        return { kind: "iso", value: "" };
    if (/^\d+$/.test(s))
        return { kind: "id", value: Number(s) };
    return { kind: "iso", value: s.toUpperCase() };
}
export function createGeoApi(loadJson) {
    const store = createDataStore(loadJson);
    async function resolveCountryIso(countryIdOrIso) {
        const ref = parseCountryRef(countryIdOrIso);
        const countries = await store.loadCountries();
        if (ref.kind === "id") {
            return countries.find((c) => c.id === ref.value)?.iso2;
        }
        const code = String(ref.value).toUpperCase();
        return countries.find((c) => c.iso2.toUpperCase() === code || c.iso3.toUpperCase() === code)?.iso2;
    }
    async function getCountryRecordByRef(countryIdOrIso) {
        const ref = parseCountryRef(countryIdOrIso);
        const countries = await store.loadCountries();
        if (ref.kind === "id") {
            return countries.find((c) => c.id === ref.value);
        }
        const code = String(ref.value).toUpperCase();
        return countries.find((c) => c.iso2.toUpperCase() === code || c.iso3.toUpperCase() === code);
    }
    return {
        configureGeo(config) {
            configure(config);
        },
        getGeoConfig,
        clearGeoCache,
        /** @internal */
        _resetGeoConfigForTests: resetGeoConfigForTests,
        async preloadCountries() {
            await store.loadCountries();
        },
        async getCountries() {
            return store.loadCountries();
        },
        async getCountryById(id) {
            if (!Number.isFinite(id) || id <= 0)
                return undefined;
            const countries = await store.loadCountries();
            return countries.find((c) => c.id === id);
        },
        async getCountryByIso2(code) {
            const c = String(code ?? "").trim();
            if (!c)
                return undefined;
            const countries = await store.loadCountries();
            return countries.find((x) => x.iso2.toUpperCase() === c.toUpperCase());
        },
        async getCountryByIso3(code) {
            const c = String(code ?? "").trim();
            if (!c)
                return undefined;
            const countries = await store.loadCountries();
            return countries.find((x) => x.iso3.toUpperCase() === c.toUpperCase());
        },
        async searchCountries(query, options) {
            const q = normalizeQuery(query);
            if (!q)
                return [];
            const countries = await store.loadCountries();
            const matched = countries.filter((c) => {
                const translationValues = c.translations
                    ? Object.values(c.translations)
                    : [];
                return matchesSearch([c.name, c.native, c.iso2, c.iso3, ...translationValues], q, collator);
            });
            return applyLimit(matched, options?.limit);
        },
        async getStatesByCountry(countryIdOrIso) {
            const iso = await resolveCountryIso(countryIdOrIso);
            if (!iso)
                return [];
            return store.loadStatesByCountryIso(iso);
        },
        async getStateById(id) {
            if (!Number.isFinite(id) || id <= 0)
                return undefined;
            const refs = await store.loadStateRefs();
            const hit = refs.find((r) => r[0] === id);
            if (!hit)
                return undefined;
            const [, iso] = hit;
            const states = await store.loadStatesByCountryIso(iso);
            return states.find((s) => s.id === id);
        },
        async getStateByIso(code, options) {
            const c = String(code ?? "").trim();
            if (!c)
                return undefined;
            const upper = c.toUpperCase();
            let iso;
            if (options?.countryCode) {
                iso = String(options.countryCode).toUpperCase();
            }
            else if (options?.countryId != null) {
                iso = await resolveCountryIso(options.countryId);
            }
            if (iso) {
                const states = await store.loadStatesByCountryIso(iso);
                return states.find((s) => s.iso2.toUpperCase() === upper ||
                    (s.iso3166_2 && s.iso3166_2.toUpperCase() === upper));
            }
            const refs = await store.loadStateRefs();
            const countryIsos = [...new Set(refs.map((r) => r[1]))];
            for (const countryIso of countryIsos) {
                const states = await store.loadStatesByCountryIso(countryIso);
                const st = states.find((s) => s.iso2.toUpperCase() === upper ||
                    (s.iso3166_2 && s.iso3166_2.toUpperCase() === upper));
                if (st)
                    return st;
            }
            return undefined;
        },
        async searchStates(query, options) {
            const q = normalizeQuery(query);
            if (!q)
                return [];
            let states = [];
            if (options.countryId != null) {
                states = await getStatesByCountryFromStore(store, options.countryId);
            }
            else if (options.countryCode) {
                states = await store.loadStatesByCountryIso(options.countryCode);
            }
            else {
                return [];
            }
            const matched = states.filter((s) => matchesSearch([s.name, s.native ?? undefined, s.iso2, s.iso3166_2], q, collator));
            return applyLimit(matched, options.limit);
        },
        async getCitiesByCountry(countryIdOrIso) {
            const iso = await resolveCountryIso(countryIdOrIso);
            if (!iso)
                return [];
            return store.loadCitiesByCountryIso(iso);
        },
        async getCitiesByState(stateId) {
            if (!Number.isFinite(stateId) || stateId <= 0)
                return [];
            const st = await getStateByIdFromStore(store, stateId);
            if (!st)
                return [];
            const cities = await store.loadCitiesByCountryIso(st.country_code);
            return cities.filter((c) => c.state_id === stateId);
        },
        async getCityById(id) {
            if (!Number.isFinite(id) || id <= 0)
                return undefined;
            const refs = await store.loadCityRefs();
            const hit = refs.find((r) => r[0] === id);
            if (!hit)
                return undefined;
            const [, iso] = hit;
            const cities = await store.loadCitiesByCountryIso(iso);
            return cities.find((c) => c.id === id);
        },
        async searchCities(query, options) {
            const q = normalizeQuery(query);
            if (!q)
                return [];
            const opts = options ?? {};
            if (opts.scope === "global") {
                const index = await store.loadCitySearchIndex();
                const hits = index.filter((row) => matchesSearch([row[1]], q, collator));
                const limited = applyLimit(hits, opts.limit);
                const cities = [];
                for (const [cityId, , iso] of limited) {
                    const shard = await store.loadCitiesByCountryIso(iso);
                    const city = shard.find((c) => c.id === cityId);
                    if (city)
                        cities.push(city);
                }
                return cities;
            }
            if (opts.stateId != null) {
                const cities = await getCitiesByStateFromApi(store, opts.stateId);
                const matched = cities.filter((c) => matchesSearch([c.name], q, collator));
                return applyLimit(matched, opts.limit);
            }
            let iso;
            if (opts.countryCode) {
                iso = String(opts.countryCode).toUpperCase();
            }
            else if (opts.countryId != null) {
                iso = await resolveCountryIso(opts.countryId);
            }
            else {
                return [];
            }
            if (!iso)
                return [];
            const cities = await store.loadCitiesByCountryIso(iso);
            const matched = cities.filter((c) => matchesSearch([c.name], q, collator));
            return applyLimit(matched, opts.limit);
        },
    };
}
async function getStatesByCountryFromStore(store, countryId) {
    const countries = await store.loadCountries();
    const iso = countries.find((c) => c.id === countryId)?.iso2;
    if (!iso)
        return [];
    return store.loadStatesByCountryIso(iso);
}
async function getStateByIdFromStore(store, id) {
    const refs = await store.loadStateRefs();
    const hit = refs.find((r) => r[0] === id);
    if (!hit)
        return undefined;
    const states = await store.loadStatesByCountryIso(hit[1]);
    return states.find((s) => s.id === id);
}
async function getCitiesByStateFromApi(store, stateId) {
    const st = await getStateByIdFromStore(store, stateId);
    if (!st)
        return [];
    const cities = await store.loadCitiesByCountryIso(st.country_code);
    return cities.filter((c) => c.state_id === stateId);
}
//# sourceMappingURL=api.js.map