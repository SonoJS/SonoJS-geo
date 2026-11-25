#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(cwd, cmd, args) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run(path.join(root, "test/fixtures/consumer-node"), "npm", ["install"]);
run(path.join(root, "test/fixtures/consumer-node"), "node", ["import.mjs"]);

run(path.join(root, "test/fixtures/consumer-vite"), "npm", ["install"]);
run(path.join(root, "test/fixtures/consumer-vite"), "npm", ["run", "build"]);