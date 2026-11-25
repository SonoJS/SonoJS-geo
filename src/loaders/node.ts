import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { LoadJson } from "../core/loader.js";

const distDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const defaultDataDir = path.join(distDir, "..", "data");

export function createNodeLoadJson(dataDir = defaultDataDir): LoadJson {
  return async <T>(urlOrPath: string): Promise<T> => {
    let filePath: string;
    if (urlOrPath.startsWith("file:")) {
      filePath = fileURLToPath(urlOrPath);
    } else if (/^https?:\/\//i.test(urlOrPath)) {
      const res = await fetch(urlOrPath);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${urlOrPath}`);
      return (await res.json()) as T;
    } else {
      const rel = urlOrPath.replace(/^\//, "");
      filePath = path.join(dataDir, rel);
    }

    const text = await fs.readFile(filePath, "utf8");
    return JSON.parse(text) as T;
  };
}

export function defaultNodeDataBaseUrl(): string {
  const withSep = defaultDataDir.endsWith(path.sep)
    ? defaultDataDir
    : defaultDataDir + path.sep;
  return pathToFileURL(withSep).href;
}