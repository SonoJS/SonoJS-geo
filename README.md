# @sonojs/geo

Countries, states, and cities for JavaScript. Lazy-loaded shards, async API, TypeScript types.

## Links

- [SonoJS](https://sonojs.com)
- [GitHub](https://github.com/SonoJS/SonoJS-geo)
- [Demo](https://sonojs.github.io/SonoJS-geo/)
- [npm](https://www.npmjs.com/package/@sonojs/geo)

## Install

```bash
npm install @sonojs/geo
```

## Usage

```js
import { getCountryByIso2, getCitiesByCountry } from "@sonojs/geo";

const country = await getCountryByIso2("JP");
const cities = await getCitiesByCountry("JP");
```

Browser or custom hosting:

```js
import { configureGeo, getCountryByIso2 } from "@sonojs/geo";

configureGeo({
  dataBaseUrl: new URL("./node_modules/@sonojs/geo/data/", import.meta.url).href,
});

await getCountryByIso2("JP");
```

## License

Package **code**: MIT ([LICENSE](LICENSE)). Geographic **data**: ODbL 1.0 ([NOTICE.md](NOTICE.md), [ODbL-1.0.txt](ODbL-1.0.txt)) from [dr5hn/countries-states-cities-database](https://github.com/dr5hn/countries-states-cities-database).