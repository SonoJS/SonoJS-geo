import { configureGeo, getCountryByIso2 } from "@sonojs/geo";

async function main() {
  configureGeo({
    dataBaseUrl: new URL("../../../data/", import.meta.url).href,
  });
  const jp = await getCountryByIso2("JP");
  if (!jp) throw new Error("JP missing");
  document.body.textContent = jp.name;
}

void main();