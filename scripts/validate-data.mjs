#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const dataRoot = path.join(repoRoot, "data");

const ISO2 = /^[A-Z]{2}$/;
const report = {
  validatedAt: new Date().toISOString(),
  counts: {},
  issues: [],
  warnings: [],
  unicodeSpotChecks: [],
  critical: false,
};

function issue(level, code, message, extra) {
  const entry = { level, code, message, ...extra };
  if (level === "error") {
    report.issues.push(entry);
    report.critical = true;
  } else {
    report.warnings.push(entry);
  }
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function main() {
  const countries = readJson(path.join(dataRoot, "countries.json"));
  const stateRefs = readJson(path.join(dataRoot, "state-refs.json"));
  const cityRefs = readJson(path.join(dataRoot, "city-refs.json"));

  report.counts = {
    countries: countries.length,
    stateRefs: stateRefs.length,
    cityRefs: cityRefs.length,
  };

  const countryIds = new Set();
  const countryIso2 = new Set();
  for (const c of countries) {
    if (countryIds.has(c.id)) issue("error", "DUP_COUNTRY_ID", `duplicate country id ${c.id}`);
    countryIds.add(c.id);
    if (!c.name?.trim()) issue("error", "EMPTY_COUNTRY_NAME", `country id ${c.id}`);
    if (!ISO2.test(c.iso2)) issue("error", "BAD_ISO2", `country id ${c.id}`, { iso2: c.iso2 });
    countryIso2.add(c.iso2);
  }

  const stateIdToIso = new Map();
  for (const [sid, iso] of stateRefs) {
    if (stateIdToIso.has(sid)) issue("error", "DUP_STATE_REF", `duplicate state ref ${sid}`);
    stateIdToIso.set(sid, iso);
    if (!ISO2.test(iso)) issue("error", "BAD_STATE_REF_ISO", `state ${sid}`, { iso });
    const shardPath = path.join(dataRoot, "states", `${iso.toLowerCase()}.json`);
    if (!fs.existsSync(shardPath)) issue("error", "MISSING_STATE_SHARD", shardPath);
  }

  const stateIds = new Set();
  for (const isoFile of fs.readdirSync(path.join(dataRoot, "states"))) {
    if (!isoFile.endsWith(".json")) continue;
    const list = readJson(path.join(dataRoot, "states", isoFile));
    for (const st of list) {
      if (stateIds.has(st.id)) issue("error", "DUP_STATE_ID", `state id ${st.id}`);
      stateIds.add(st.id);
      if (!countryIds.has(st.country_id)) {
        issue("error", "ORPHAN_STATE", `state ${st.id} country ${st.country_id}`);
      }
    }
  }

  const cityIds = new Set();
  for (const [cid, iso, stateId] of cityRefs) {
    if (cityIds.has(cid)) issue("error", "DUP_CITY_REF", `duplicate city id ${cid}`);
    cityIds.add(cid);
    const shard = path.join(dataRoot, "cities", `${iso.toLowerCase()}.json`);
    if (!fs.existsSync(shard)) issue("error", "MISSING_CITY_SHARD", shard, { cityId: cid });
    if (stateId != null && !stateIds.has(stateId)) {
      issue("error", "ORPHAN_CITY_STATE", `city ${cid} state ${stateId}`);
    }
  }

  for (const isoFile of fs.readdirSync(path.join(dataRoot, "cities"))) {
    if (!isoFile.endsWith(".json")) continue;
    const list = readJson(path.join(dataRoot, "cities", isoFile));
    for (const city of list) {
      if (!city.name?.trim()) issue("warning", "EMPTY_CITY_NAME", `city id ${city.id}`);
      if (city.id !== undefined && !cityIds.has(city.id)) {
        issue("error", "CITY_NOT_IN_REFS", `city ${city.id} in shard ${isoFile}`);
      }
    }
  }

  const spotCountries = ["AF", "JP", "IR", "TR", "SA"];
  for (const code of spotCountries) {
    const c = countries.find((x) => x.iso2 === code);
    if (c) report.unicodeSpotChecks.push({ iso2: code, name: c.name, native: c.native });
  }

  const outPath = path.join(repoRoot, "validation-report.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
  console.log("Validation report:", outPath);
  console.log(
    "issues:",
    report.issues.length,
    "warnings:",
    report.warnings.length
  );

  if (report.critical) {
    process.exitCode = 1;
    console.error("Validation failed with critical issues.");
  }
}

main();