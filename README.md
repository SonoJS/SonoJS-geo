# @sonojs/geo

Countries, states, and cities for JavaScript and TypeScript. Framework-free, ESM-only, with **lazy-loaded** JSON shards.

- [GitHub](https://github.com/SonoJS/SonoJS-geo)
- [Demo](https://sonojs.github.io/SonoJS-geo/)
- [npm](https://www.npmjs.com/package/@sonojs/geo)

## License note

- **Source code** in this package: [MIT](LICENSE)
- **Geographic `data/`**: derivative database from [dr5hn/countries-states-cities-database](https://github.com/dr5hn/countries-states-cities-database) under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/) — see [NOTICE.md](NOTICE.md) and `ODbL-1.0.txt`

The npm `"license": "MIT"` field applies to the **package code**, not the bundled database.

## Install

```bash
npm install @sonojs/geo
```

## Quick start (Node.js)

```js
import { getCountryByIso2, getCitiesByCountry } from "@sonojs/geo";

const country = await getCountryByIso2("JP");
const cities = await getCitiesByCountry("JP");
```

## Quick start (browser)

```js
import { configureGeo, getCountryByIso2 } from "@sonojs/geo";

configureGeo({
  dataBaseUrl: new URL("./node_modules/@sonojs/geo/data/", import.meta.url).href,
});

const jp = await getCountryByIso2("JP");
```

Use `configureGeo({ dataBaseUrl })` when data is hosted on a CDN, GitHub Pages, or a non-root path. Trailing slashes are optional.

## API (all methods return `Promise`)

| Method | Description |
|--------|-------------|
| `configureGeo({ dataBaseUrl? })` | Override base URL for `data/` |
| `getGeoConfig()` / `clearGeoCache()` | Config and cache (tests / hot reload) |
| `preloadCountries()` | Load `countries.json` only |
| `getCountries()` | All countries |
| `getCountryById(id)` | By numeric id |
| `getCountryByIso2(code)` / `getCountryByIso3(code)` | By ISO code |
| `searchCountries(query, { limit? })` | Unicode-aware search |
| `getStatesByCountry(id \| iso)` | Load **one** state shard |
| `getStateById(id)` | Uses compact `state-refs.json` then shard |
| `getStateByIso(code, { countryCode?, countryId? })` | Scoped or global lookup |
| `searchStates(query, { countryCode \| countryId, limit? })` | **Requires** country |
| `getCitiesByCountry(id \| iso)` | Load **one** city shard |
| `getCitiesByState(stateId)` | Filter loaded country shard |
| `getCityById(id)` | Uses `city-refs.json` then shard |
| `searchCities(query, options?)` | See below |

### City search

- `{ countryCode \| countryId }` — search that country’s shard only
- `{ stateId }` — search cities in that state
- `{ scope: 'global' }` — loads `city-search-index.json` (~5 MB raw); **not loaded** for normal country/state use

Empty or invalid queries return `[]`. Missing records return `undefined` or `[]`.

### Search normalization

Queries are normalized to NFC. Matching uses `Intl.Segmenter` + `Intl.Collator` (`usage: 'search'`, `sensitivity: 'base'`). Stored names are not modified.

## TypeScript

Types are exported from the package entry (`Country`, `State`, `City`, options types, `GeoLoadError`).

## Data source and updates

Built from [countries-states-cities-database](https://github.com/dr5hn/countries-states-cities-database). Rebuild with:

```bash
GEO_UPSTREAM_PATH=/path/to/upstream npm run build:data
npm run validate:data
```

See `data/metadata.json` for record counts and provenance.

## Limitations

- Upstream README city totals may differ from the nested JSON export used at build time (counts in `metadata.json` are authoritative for this package).
- Counties and postcodes are not included in v0.1.
- `getStateByIso` without a country may load multiple state shards until a match is found — prefer `countryCode` when possible.

## Development

```bash
npm run build
npm test
npm run test:consumers
npm run test:pages
npm pack --dry-run
```