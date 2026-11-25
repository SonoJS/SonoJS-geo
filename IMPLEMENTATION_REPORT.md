# @sonojs/geo — implementation report

## Architecture

- **Dual runtime:** `dist/node.js` (`fs.readFile`, `file:` URLs) and `dist/browser.js` (`fetch` only).
- **100% async public API** — identical signatures on Node and browser.
- **Data shards:** `data/countries.json`, `data/states/{iso2}.json`, `data/cities/{iso2}.json`.
- **Compact refs:** `state-refs.json` (63 KB raw) for `getStateById`; `city-refs.json` (~3 MB) for `getCityById`.
- **Global city search:** `city-search-index.json` loaded only when `searchCities(..., { scope: 'global' })`.
- **Cache:** in-memory + in-flight deduplication; `clearGeoCache()` for retry/tests.
- **Search:** grapheme windows + `Intl.Collator` (no `String.includes` in package search).

## Public API

Documented in [README.md](README.md). Version **0.1.0**.

## Dataset record counts

From `data/metadata.json` (build 2026):

| Table | Count |
|-------|------:|
| Countries | 250 |
| States | 5,327 |
| Cities | 172,237 |
| State shards | 229 |
| City shards | 250 |

## Validation

`npm run validate:data` → `validation-report.json`

- **Critical issues:** 0  
- **Warnings:** 0  
- Unicode spot-checks: AF, JP, IR, TR, SA

## Package size

From `npm run measure:sizes` and `npm pack --dry-run`:

| Metric | Value |
|--------|------:|
| `data/` raw | 45.70 MB |
| `data/` gzip (sum of files) | 6.61 MB |
| Packed tarball | 6.7 MB |
| Unpacked | 48.0 MB |
| Files in pack | 540 |

`state-refs.json`: ~63 KB raw / ~12 KB gzip — justified for O(1) country routing vs scanning all shards.

## Runtime compatibility (executed)

| Check | Result |
|-------|--------|
| `npm test` (20 tests) | Pass |
| Node consumer (`test/fixtures/consumer-node`) | Pass |
| Vite consumer build (`test/fixtures/consumer-vite`) | Pass |
| GitHub Pages subpath (`scripts/test-pages-subpath.mjs`) | HTTP 200 for index, browser bundle, data, demo |
| TypeScript `tsc` | Pass |

## Test coverage highlights

- Country ISO2/ISO3/id lookups (US)
- Unicode search (accents, non-Latin, punctuation stripping for match only)
- Lazy state/city shards and ref files
- Global index loads only with `scope: 'global'`
- Concurrent shard load deduplication
- Invalid inputs

## Licensing notes

- Package **code:** MIT (`LICENSE`)
- **Database `data/`:** ODbL 1.0 derivative; full text in `ODbL-1.0.txt`; attribution in `NOTICE.md`
- Not legal advice — consumers redistributing `data/` must comply with ODbL share-alike and notice requirements.

## Remaining limitations

- See README “Limitations”
- Showcase loads full city shard per country (expected for demo)
- Countries without states have no `states/{iso2}.json` file (empty API result)

## Before first npm publish

1. Review ODbL obligations with your counsel if you redistribute modified `data/`
2. `npm run build` from clean clone
3. `npm test` && `npm run test:consumers` && `npm run test:pages`
4. `npm pack --dry-run` — confirm `data/`, `dist/`, licenses
5. Enable GitHub Pages from `main` / root
6. `npm publish` (not run in this task)