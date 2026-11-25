import {
  getCountryByIso2,
  getCitiesByCountry,
} from "@sonojs/geo";

const us = await getCountryByIso2("US");
if (!us) throw new Error("missing US");
const cities = await getCitiesByCountry("US");
if (cities.length < 1000) throw new Error("expected many US cities");
console.log("consumer-node OK", us.name, cities.length);