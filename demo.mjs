import {
  configureGeo,
  getCountries,
  getCitiesByCountry,
} from "./dist/browser.js";

configureGeo({ dataBaseUrl: new URL("./data/", import.meta.url).href });

const countryEl = document.getElementById("country");
const cityEl = document.getElementById("city");
const outEl = document.getElementById("out");

const sort = new Intl.Collator(undefined, { sensitivity: "base" });

/** @type {import("./dist/browser.js").Country[]} */
let countries = [];
/** @type {import("./dist/browser.js").City[]} */
let cities = [];

function fillSelect(el, items, valueKey, labelFn, placeholder) {
  el.replaceChildren();
  const ph = document.createElement("option");
  ph.value = "";
  ph.textContent = placeholder;
  ph.disabled = true;
  ph.selected = true;
  el.appendChild(ph);
  for (const item of items) {
    const opt = document.createElement("option");
    opt.value = String(item[valueKey]);
    opt.textContent = labelFn(item);
    el.appendChild(opt);
  }
}

function showSelection() {
  const country = countries.find((c) => c.iso2 === countryEl.value);
  const city = cities.find((c) => String(c.id) === cityEl.value);
  if (!country) {
    outEl.textContent = "Select a country and city.";
    return;
  }
  if (!city) {
    outEl.innerHTML = `Country: <strong>${country.name}</strong> (${country.iso2})`;
    return;
  }
  outEl.innerHTML =
    `Country: <strong>${country.name}</strong> (${country.iso2})` +
    `<br>City: <strong>${city.name}</strong> (id ${city.id})`;
}

async function onCountryChange() {
  const iso = countryEl.value;
  cityEl.disabled = true;
  cities = [];
  fillSelect(cityEl, [], "id", () => "", "Loading…");
  showSelection();

  if (!iso) return;

  cities = (await getCitiesByCountry(iso)).sort((a, b) =>
    sort.compare(a.name, b.name)
  );
  cityEl.disabled = false;
  fillSelect(cityEl, cities, "id", (c) => c.name, "Choose a city");
  showSelection();
}

cityEl.addEventListener("change", showSelection);
countryEl.addEventListener("change", () => void onCountryChange());

countries = (await getCountries()).sort((a, b) => sort.compare(a.name, b.name));
fillSelect(countryEl, countries, "iso2", (c) => c.name, "Choose a country");

const defaultCountry = countries.find((c) => c.iso2 === "US") ?? countries[0];
if (defaultCountry) {
  countryEl.value = defaultCountry.iso2;
  await onCountryChange();
}