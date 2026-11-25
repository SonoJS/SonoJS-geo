import type { City, CitySearchOptions, Country, GeoConfig, SearchOptions, State, StateIsoOptions, StateSearchOptions } from "../types.js";
import { getGeoConfig, resetGeoConfigForTests } from "./config.js";
import { clearGeoCache } from "./cache.js";
import type { LoadJson } from "./loader.js";
export declare function createGeoApi(loadJson: LoadJson): {
    configureGeo(config: GeoConfig): void;
    getGeoConfig: typeof getGeoConfig;
    clearGeoCache: typeof clearGeoCache;
    /** @internal */
    _resetGeoConfigForTests: typeof resetGeoConfigForTests;
    preloadCountries(): Promise<void>;
    getCountries(): Promise<Country[]>;
    getCountryById(id: number): Promise<Country | undefined>;
    getCountryByIso2(code: string): Promise<Country | undefined>;
    getCountryByIso3(code: string): Promise<Country | undefined>;
    searchCountries(query: string, options?: SearchOptions): Promise<Country[]>;
    getStatesByCountry(countryIdOrIso: number | string): Promise<State[]>;
    getStateById(id: number): Promise<State | undefined>;
    getStateByIso(code: string, options?: StateIsoOptions): Promise<State | undefined>;
    searchStates(query: string, options: StateSearchOptions): Promise<State[]>;
    getCitiesByCountry(countryIdOrIso: number | string): Promise<City[]>;
    getCitiesByState(stateId: number): Promise<City[]>;
    getCityById(id: number): Promise<City | undefined>;
    searchCities(query: string, options?: CitySearchOptions): Promise<City[]>;
};
export type GeoApi = ReturnType<typeof createGeoApi>;
//# sourceMappingURL=api.d.ts.map