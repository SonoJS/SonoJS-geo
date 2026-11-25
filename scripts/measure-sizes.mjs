#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const dataRoot = path.join(repoRoot, "data");

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, files);
    else files.push(p);
  }
  return files;
}

function sizes(buf) {
  return {
    raw: buf.length,
    gzip: zlib.gzipSync(buf).length,
    brotli: zlib.brotliCompressSync(buf).length,
  };
}

const files = walk(dataRoot);
const byFile = {};
let totals = { raw: 0, gzip: 0, brotli: 0 };

for (const p of files) {
  const buf = fs.readFileSync(p);
  const rel = path.relative(repoRoot, p).replaceAll("\\", "/");
  const s = sizes(buf);
  byFile[rel] = s;
  totals.raw += s.raw;
  totals.gzip += s.gzip;
  totals.brotli += s.brotli;
}

const report = { measuredAt: new Date().toISOString(), totals, byFile };
const outPath = path.join(repoRoot, "size-report.json");
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
console.log("Size report:", outPath);
console.log(
  "data totals MB:",
  (totals.raw / 1024 / 1024).toFixed(2),
  "gzip",
  (totals.gzip / 1024 / 1024).toFixed(2)
);