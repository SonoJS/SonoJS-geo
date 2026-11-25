#!/usr/bin/env node
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const mount = "/SonoJS-geo";

function contentType(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (file.endsWith(".json")) return "application/json; charset=utf-8";
  if (file.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

const server = http.createServer((req, res) => {
  if (!req.url?.startsWith(mount)) {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  let rel = req.url.slice(mount.length);
  if (rel === "" || rel === "/") rel = "/index.html";
  const filePath = path.join(repoRoot, rel.replace(/^\//, ""));
  if (!filePath.startsWith(repoRoot)) {
    res.writeHead(403);
    res.end("forbidden");
    return;
  }
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end(`missing ${rel}`);
    return;
  }
  const buf = fs.readFileSync(filePath);
  res.writeHead(200, { "Content-Type": contentType(filePath) });
  res.end(buf);
});

const paths = [
  "/SonoJS-geo/index.html",
  "/SonoJS-geo/dist/browser.js",
  "/SonoJS-geo/data/countries.json",
  "/SonoJS-geo/demo.mjs",
];

server.listen(0, "127.0.0.1", async () => {
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  let failed = false;
  for (const p of paths) {
    const res = await fetch(base + p);
    if (!res.ok) {
      console.error("FAIL", p, res.status);
      failed = true;
    } else {
      console.log("OK", p, res.status);
    }
  }
  server.close(() => {
    setTimeout(() => process.exit(failed ? 1 : 0), 50);
  });
});