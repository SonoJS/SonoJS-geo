import type { GeoConfig } from "../types.js";

let config: GeoConfig = {};
let defaultDataBaseUrl: string | null = null;

export function setDefaultDataBaseUrl(url: string): void {
  defaultDataBaseUrl = url;
}

export function configureGeo(next: GeoConfig): void {
  config = { ...config, ...next };
}

export function getGeoConfig(): Readonly<GeoConfig> {
  return { ...config };
}

export function resolveDataBaseUrl(): string {
  const base = config.dataBaseUrl ?? defaultDataBaseUrl;
  if (!base) {
    throw new Error(
      "@sonojs/geo: data base URL is not configured (internal error)"
    );
  }
  return base.endsWith("/") ? base : `${base}/`;
}

export function resetGeoConfigForTests(): void {
  config = {};
}