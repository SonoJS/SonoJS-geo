import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultDataDir = path.join(distDir, "..", "data");
export function createNodeLoadJson(dataDir = defaultDataDir) {
    return async (urlOrPath) => {
        let filePath;
        if (urlOrPath.startsWith("file:")) {
            filePath = fileURLToPath(urlOrPath);
        }
        else if (/^https?:\/\//i.test(urlOrPath)) {
            const res = await fetch(urlOrPath);
            if (!res.ok)
                throw new Error(`HTTP ${res.status} for ${urlOrPath}`);
            return (await res.json());
        }
        else {
            const rel = urlOrPath.replace(/^\//, "");
            filePath = path.join(dataDir, rel);
        }
        const text = await fs.readFile(filePath, "utf8");
        return JSON.parse(text);
    };
}
export function defaultNodeDataBaseUrl() {
    const withSep = defaultDataDir.endsWith(path.sep)
        ? defaultDataDir
        : defaultDataDir + path.sep;
    return pathToFileURL(withSep).href;
}
//# sourceMappingURL=node.js.map