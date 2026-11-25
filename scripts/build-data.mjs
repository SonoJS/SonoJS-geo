#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const DEFAULT_UPSTREAM =
  "C:/Users/Salam/Downloads/Compressed/countries-states-cities-database-master/countries-states-cities-database-master";

const upstreamRoot = path.resolve(
  process.env.GEO_UPSTREAM_PATH || DEFAULT_UPSTREAM
);

const dataRoot = path.join(repoRoot, "data");
const statesDir = path.join(dataRoot, "states");
const citiesDir = path.join(dataRoot, "cities");

function readJson(rel) {
  const p = path.join(upstreamRoot, rel);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(target, value) {
  fs.writeFileSync(target, JSON.stringify(value), "utf8");
}

function ensureDirs() {
  for (const d of [dataRoot, statesDir, citiesDir]) {
    fs.mkdirSync(d, { recursive: true });
  }
  for (const f of fs.readdirSync(statesDir)) {
    if (f.endsWith(".json")) fs.unlinkSync(path.join(statesDir, f));
  }
  for (const f of fs.readdirSync(citiesDir)) {
    if (f.endsWith(".json")) fs.unlinkSync(path.join(citiesDir, f));
  }
}

function extractUpstreamDate() {
  try {
    const readme = fs.readFileSync(path.join(upstreamRoot, "README.md"), "utf8");
    const m = readme.match(/Last Updated On:\s*(.+)/i);
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

function main() {
  console.log("Upstream:", upstreamRoot);
  ensureDirs();

  const countries = readJson("json/countries.json");
  const states = readJson("json/states.json");
  const hierarchy = readJson("json/countries+states+cities.json");

  const iso2ByCountryId = new Map(countries.map((c) => [c.id, c.iso2]));

  fs.copyFileSync(
    path.join(upstreamRoot, "json/countries.json"),
    path.join(dataRoot, "countries.json")
  );

  const statesByIso = new Map();
  const stateRefs = [];

  for (const st of states) {
    const iso = iso2ByCountryId.get(st.country_id);
    if (!iso) {
      console.warn("state", st.id, "orphan country_id", st.country_id);
      continue;
    }
  const key = iso.toLowerCase();
    if (!statesByIso.has(key)) statesByIso.set(key, []);
    statesByIso.get(key).push(st);
    stateRefs.push([st.id, iso]);
  }

  for (const [iso, list] of statesByIso) {
    writeJson(path.join(statesDir, `${iso}.json`), list);
  }
  writeJson(path.join(dataRoot, "state-refs.json"), stateRefs);

  const cityRefs = [];
  const citySearchIndex = [];
  const issues = {
    citiesWithoutStateAtCountryLevel: 0,
    emptyCityNames: 0,
  };

  for (const co of hierarchy) {
    const countryId = co.id;
    const countryCode = co.iso2;
    const isoKey = countryCode.toLowerCase();
    const cities = [];

    for (const st of co.states || []) {
      const stateId = st.id;
      const stateCode = st.iso2 ?? null;
      for (const raw of st.cities || []) {
        if (!raw.name || !String(raw.name).trim()) issues.emptyCityNames++;
        const city = {
          ...raw,
          country_id: countryId,
          country_code: countryCode,
          state_id: stateId,
          state_code: stateCode,
        };
        cities.push(city);
        cityRefs.push([raw.id, countryCode, stateId]);
        citySearchIndex.push([raw.id, raw.name, countryCode, stateId]);
      }
    }

    for (const raw of co.cities || []) {
      issues.citiesWithoutStateAtCountryLevel++;
      if (!raw.name || !String(raw.name).trim()) issues.emptyCityNames++;
      const city = {
        ...raw,
        country_id: countryId,
        country_code: countryCode,
        state_id: null,
        state_code: null,
      };
      cities.push(city);
      cityRefs.push([raw.id, countryCode, null]);
      citySearchIndex.push([raw.id, raw.name, countryCode, null]);
    }

    writeJson(path.join(citiesDir, `${isoKey}.json`), cities);
  }

  writeJson(path.join(dataRoot, "city-refs.json"), cityRefs);
  writeJson(path.join(dataRoot, "city-search-index.json"), citySearchIndex);

  const metadata = {
    source: {
      repository: "https://github.com/dr5hn/countries-states-cities-database",
      upstreamPath: upstreamRoot,
      license: "ODbL-1.0",
      licenseUri: "https://opendatacommons.org/licenses/odbl/1-0/",
      lastUpdatedUpstream: extractUpstreamDate(),
    },
    builtAt: new Date().toISOString(),
    counts: {
      countries: countries.length,
      states: states.length,
      cities: cityRefs.length,
      stateShards: statesByIso.size,
      cityShards: hierarchy.length,
    },
    transforms: [
      "Copied countries.json verbatim",
      "Split states.json into data/states/{iso2}.json",
      "Generated state-refs.json as [stateId, countryIso2]",
      "Flattened countries+states+cities.json into per-country city shards",
      "Enriched cities with country_id, country_code, state_id, state_code",
      "Generated city-refs.json and city-search-index.json",
    ],
    buildIssues: issues,
    limitations: [
      "City count in nested JSON export may differ from upstream README marketing numbers",
      "County-level records and postcodes are not included in this package",
    ],
  };

  writeJson(path.join(dataRoot, "metadata.json"), metadata);

  console.log("Build complete.", metadata.counts);
}

main();