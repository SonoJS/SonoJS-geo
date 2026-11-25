import type { City, CityRef, CitySearchIndexEntry, Country, State, StateRef } from "../types.js";
import type { LoadJson } from "./loader.js";
export declare function createDataStore(loadJson: LoadJson): {
    loadCountries(): Promise<Country[]>;
    loadStateRefs(): Promise<StateRef[]>;
    loadCityRefs(): Promise<CityRef[]>;
    loadCitySearchIndex(): Promise<CitySearchIndexEntry[]>;
    loadStatesByCountryIso(iso2: string): Promise<State[]>;
    loadCitiesByCountryIso(iso2: string): Promise<City[]>;
    countriesLoaded: () => Country[] | undefined;
    urlPath: (relative: string) => string;
};
export type DataStore = ReturnType<typeof createDataStore>;
//# sourceMappingURL=data-store.d.ts.map