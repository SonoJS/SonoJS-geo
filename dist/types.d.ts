export type Country = {
    id: number;
    name: string;
    iso3: string;
    iso2: string;
    numeric_code?: string;
    phonecode?: string;
    capital?: string;
    currency?: string;
    currency_name?: string;
    currency_symbol?: string;
    tld?: string;
    native?: string;
    population?: number | null;
    gdp?: number | null;
    region?: string;
    region_id?: number;
    subregion?: string;
    subregion_id?: number;
    nationality?: string;
    area_sq_km?: number | null;
    postal_code_format?: string | null;
    postal_code_regex?: string | null;
    timezones?: unknown[];
    translations?: Record<string, string>;
    latitude?: string;
    longitude?: string;
    emoji?: string;
    emojiU?: string;
    wikiDataId?: string | null;
};
export type State = {
    id: number;
    name: string;
    country_id: number;
    country_code: string;
    country_name?: string;
    iso2: string;
    iso3166_2?: string;
    fips_code?: string | null;
    type?: string;
    type_local?: string | null;
    level?: string | number | null;
    parent_id?: number | null;
    native?: string | null;
    latitude?: string;
    longitude?: string;
    timezone?: string;
    translations?: Record<string, string>;
    wikiDataId?: string | null;
    population?: string | number | null;
};
export type City = {
    id: number;
    name: string;
    country_id: number;
    country_code: string;
    state_id: number | null;
    state_code: string | null;
    county_id?: number | null;
    latitude?: string;
    longitude?: string;
    timezone?: string | null;
};
export type GeoConfig = {
    dataBaseUrl?: string;
};
export type SearchOptions = {
    limit?: number;
};
export type StateSearchOptions = SearchOptions & {
    countryId?: number;
    countryCode?: string;
};
export type CitySearchScope = "country" | "state" | "global";
export type CitySearchOptions = SearchOptions & {
    countryId?: number;
    countryCode?: string;
    stateId?: number;
    scope?: CitySearchScope;
};
export type StateIsoOptions = {
    countryCode?: string;
    countryId?: number;
};
export type CityRef = [cityId: number, countryIso2: string, stateId: number | null];
export type StateRef = [stateId: number, countryIso2: string];
export type CitySearchIndexEntry = [
    cityId: number,
    name: string,
    countryIso2: string,
    stateId: number | null
];
//# sourceMappingURL=types.d.ts.map