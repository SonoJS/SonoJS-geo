import type {
  City,
  CityRef,
  CitySearchIndexEntry,
  Country,
  State,
  StateRef,
} from "../types.js";
import { resolveDataBaseUrl } from "./config.js";
import { loadDeduped, getCached } from "./cache.js";
import { GeoLoadError } from "./errors.js";
import type { LoadJson } from "./loader.js";

export function createDataStore(loadJson: LoadJson) {
  function urlPath(relative: string): string {
    return `${resolveDataBaseUrl()}${relative.replace(/^\//, "")}`;
  }

  async function load<T>(relative: string): Promise<T> {
    const key = `json:${relative}`;
    return loadDeduped(key, async () => {
      try {
        return await loadJson(urlPath(relative));
      } catch (err) {
        throw new GeoLoadError(
          relative,
          `Failed to load geographic data at ${relative}`,
          err
        );
      }
    });
  }

  function countriesLoaded(): Country[] | undefined {
    return getCached<Country[]>("json:countries.json");
  }

  return {
    loadCountries(): Promise<Country[]> {
      return load<Country[]>("countries.json");
    },

    loadStateRefs(): Promise<StateRef[]> {
      return load<StateRef[]>("state-refs.json");
    },

    loadCityRefs(): Promise<CityRef[]> {
      return load<CityRef[]>("city-refs.json");
    },

    loadCitySearchIndex(): Promise<CitySearchIndexEntry[]> {
      return load<CitySearchIndexEntry[]>("city-search-index.json");
    },

    loadStatesByCountryIso(iso2: string): Promise<State[]> {
      const code = iso2.toLowerCase();
      return load<State[]>(`states/${code}.json`);
    },

    loadCitiesByCountryIso(iso2: string): Promise<City[]> {
      const code = iso2.toLowerCase();
      return load<City[]>(`cities/${code}.json`);
    },

    countriesLoaded,
    urlPath,
  };
}

export type DataStore = ReturnType<typeof createDataStore>;