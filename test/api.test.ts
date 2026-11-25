import test from "node:test";
import assert from "node:assert/strict";
import {
  clearGeoCache,
  getCitiesByCountry,
  getCitiesByState,
  getCityById,
  getCountries,
  getCountryById,
  getCountryByIso2,
  getCountryByIso3,
  getStateById,
  getStatesByCountry,
  searchCities,
  searchCountries,
  searchStates,
} from "../dist/node.js";
import { getCached } from "../dist/core/cache.js";
import { collatorContains, createSearchCollator } from "../src/core/search.js";

const collator = createSearchCollator();

test("getCountries loads real data", async () => {
  clearGeoCache();
  const countries = await getCountries();
  assert.equal(countries.length, 250);
});

test("country lookups", async () => {
  const us = await getCountryByIso2("US");
  assert.equal(us?.name, "United States");
  assert.equal((await getCountryByIso3("USA"))?.id, us?.id);
  assert.equal((await getCountryById(us!.id))?.iso2, "US");
  assert.equal(await getCountryById(-1), undefined);
});

test("searchCountries unicode and iso", async () => {
  const tr = await searchCountries("turkey", { limit: 5 });
  assert.ok(tr.some((c) => c.iso2 === "TR"));
  const de = await searchCountries("DE");
  assert.ok(de.some((c) => c.iso2 === "DE"));
  assert.deepEqual(await searchCountries("   "), []);
});

test("states lazy per country", async () => {
  clearGeoCache();
  const states = await getStatesByCountry("US");
  assert.ok(states.length > 50);
  const st = await getStateById(states[0].id);
  assert.equal(st?.id, states[0].id);
  assert.ok(getCached("json:states/us.json"));
  assert.equal(getCached("json:states/af.json"), undefined);
});

test("cities lazy load", async () => {
  clearGeoCache();
  const cities = await getCitiesByCountry("AF");
  assert.ok(cities.length > 10);
  const kabul = cities.find((c) => c.name === "Kabul");
  assert.ok(kabul);
  const byId = await getCityById(kabul!.id);
  assert.equal(byId?.name, "Kabul");
});

test("getCitiesByState", async () => {
  const states = await getStatesByCountry(1);
  const state = states.find((s) => s.name === "Kabul") ?? states[0];
  const cities = await getCitiesByState(state.id);
  assert.ok(cities.every((c) => c.state_id === state.id));
});

test("searchCities country scope", async () => {
  const hits = await searchCities("kabul", { countryCode: "AF", limit: 10 });
  assert.ok(hits.length >= 1);
});

test("searchCities global loads index only when requested", async () => {
  clearGeoCache();
  assert.equal(getCached("json:city-search-index.json"), undefined);
  const hits = await searchCities("london", { scope: "global", limit: 5 });
  assert.ok(hits.length >= 1);
  assert.ok(getCached("json:city-search-index.json"));
});

test("searchCities without scope or country returns empty", async () => {
  assert.deepEqual(await searchCities("paris"), []);
});

test("searchStates requires country", async () => {
  const hits = await searchStates("cali", { countryCode: "US", limit: 5 });
  assert.ok(hits.some((s) => collatorContains(s.name, "cali", collator)));
  assert.deepEqual(await searchStates("cali", {}), []);
});

test("concurrent city shard loads dedupe", async () => {
  clearGeoCache();
  const [a, b] = await Promise.all([
    getCitiesByCountry("US"),
    getCitiesByCountry("US"),
  ]);
  assert.equal(a.length, b.length);
});

test("invalid inputs", async () => {
  assert.equal(await getCityById(0), undefined);
  assert.deepEqual(await getStatesByCountry("XX"), []);
});

test("global index not loaded for country-only search", async () => {
  clearGeoCache();
  await searchCities("kabul", { countryCode: "AF" });
  assert.equal(getCached("json:city-search-index.json"), undefined);
});