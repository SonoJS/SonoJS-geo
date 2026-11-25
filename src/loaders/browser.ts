import type { LoadJson } from "../core/loader.js";

export function createBrowserLoadJson(): LoadJson {
  return async <T>(url: string): Promise<T> => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
    }
    return (await res.json()) as T;
  };
}

export function defaultBrowserDataBaseUrl(): string {
  return new URL("../data/", import.meta.url).href;
}