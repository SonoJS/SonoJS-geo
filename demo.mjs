import {
  configureGeo,
  getCountries,
  getStatesByCountry,
  getCitiesByState,
  getCitiesByCountry,
} from "./dist/browser.js";

configureGeo({ dataBaseUrl: new URL("./data/", import.meta.url).href });

const countryEl = document.getElementById("country");
const stateEl = document.getElementById("state");
const cityEl = document.getElementById("city");
const outEl = document.getElementById("out");

const sort = new Intl.Collator(undefined, { sensitivity: "base" });

/** @type {import("./dist/browser.js").Country[]} */
let countries = [];
/** @type {import("./dist/browser.js").State[]} */
let states = [];
/** @type {import("./dist/browser.js").City[]} */
let cities = [];

function fillSelect(el, items, valueKey, labelFn, placeholder, { disabled = false } = {}) {
  el.replaceChildren();
  const ph = document.createElement("option");
  ph.value = "";
  ph.textContent = placeholder;
  if (disabled || !items.length) ph.disabled = true;
  ph.selected = true;
  el.appendChild(ph);
  for (const item of items) {
    const opt = document.createElement("option");
    opt.value = String(item[valueKey]);
    opt.textContent = labelFn(item);
    el.appendChild(opt);
  }
}

function resetStateSelect(placeholder = "Choose a country first", disabled = true) {
  states = [];
  fillSelect(stateEl, [], "id", () => "", placeholder, { disabled });
  stateEl.disabled = disabled;
}

function resetCitySelect(placeholder = "Choose a state first", disabled = true) {
  cities = [];
  fillSelect(cityEl, [], "id", () => "", placeholder, { disabled });
  cityEl.disabled = disabled;
}

function showSelection() {
  const country = countries.find((c) => c.iso2 === countryEl.value);
  const state = states.find((s) => String(s.id) === stateEl.value);
  const city = cities.find((c) => String(c.id) === cityEl.value);

  if (!country) {
    outEl.textContent = "Choose a country.";
    return;
  }

  const lines = [`Country: <strong>${country.name}</strong> (${country.iso2})`];
  if (state) lines.push(`State: <strong>${state.name}</strong>`);
  if (city) lines.push(`City: <strong>${city.name}</strong> (id ${city.id})`);
  else if (state) lines.push("Choose a city.");
  else if (states.length) lines.push("Choose a state.");
  else lines.push("No states in the dataset for this country.");

  outEl.innerHTML = lines.join("<br>");
}

async function onStateChange() {
  resetCitySelect("Loading…", true);
  showSelection();

  const stateId = stateEl.value;
  if (!stateId) {
    resetCitySelect("Choose a state", true);
    return;
  }

  cities = (await getCitiesByState(Number(stateId))).sort((a, b) =>
    sort.compare(a.name, b.name)
  );

  if (!cities.length) {
    resetCitySelect("No cities in dataset", true);
  } else {
    cityEl.disabled = false;
    fillSelect(cityEl, cities, "id", (c) => c.name, "Choose a city");
  }
  showSelection();
}

async function onCountryChange() {
  const iso = countryEl.value;
  resetStateSelect();
  resetCitySelect();

  if (!iso) {
    resetStateSelect("Choose a country first", true);
    resetCitySelect("Choose a state first", true);
    showSelection();
    return;
  }

  resetStateSelect("Loading…", true);
  states = (await getStatesByCountry(iso)).sort((a, b) =>
    sort.compare(a.name, b.name)
  );

  if (states.length) {
    stateEl.disabled = false;
    fillSelect(stateEl, states, "id", (s) => s.name, "Choose a state");
    resetCitySelect("Choose a state first", true);
    showSelection();
    return;
  }

  resetStateSelect("No states in dataset", true);
  resetCitySelect("Loading…", true);
  cities = (await getCitiesByCountry(iso)).sort((a, b) =>
    sort.compare(a.name, b.name)
  );
  if (cities.length) {
    cityEl.disabled = false;
    fillSelect(cityEl, cities, "id", (c) => c.name, "Choose a city");
  } else {
    resetCitySelect("No cities in dataset", true);
  }
  showSelection();
}

stateEl.addEventListener("change", () => void onStateChange());
cityEl.addEventListener("change", showSelection);
countryEl.addEventListener("change", () => void onCountryChange());

countries = (await getCountries()).sort((a, b) => sort.compare(a.name, b.name));
fillSelect(countryEl, countries, "iso2", (c) => c.name, "Choose a country");
resetStateSelect();
resetCitySelect();
showSelection();