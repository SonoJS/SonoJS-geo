import test from "node:test";
import assert from "node:assert/strict";
import {
  collatorContains,
  createSearchCollator,
  normalizeQuery,
} from "../src/core/search.ts";

const collator = createSearchCollator();

test("normalizeQuery trims and NFC", () => {
  assert.equal(normalizeQuery("  test  "), "test");
  const nfd = "café".normalize("NFD");
  assert.equal(normalizeQuery(nfd), "café".normalize("NFC"));
});

test("collatorContains case insensitive", () => {
  assert.equal(collatorContains("Turkey", "turkey", collator), true);
  assert.equal(collatorContains("UNITED STATES", "united", collator), true);
});

test("collatorContains accent insensitive", () => {
  assert.equal(collatorContains("München", "munchen", collator), true);
  assert.equal(collatorContains("São Paulo", "sao", collator), true);
});

test("collatorContains punctuation ignored", () => {
  assert.equal(collatorContains("U.S.A.", "usa", collator), true);
});

test("collatorContains non-Latin scripts", () => {
  assert.equal(collatorContains("東京都", "東京", collator), true);
  assert.equal(collatorContains("كابل", "كاب", collator), true);
});

test("collatorContains empty needle is false", () => {
  assert.equal(collatorContains("Japan", "   ", collator), false);
});

test("collatorContains no false positive", () => {
  assert.equal(collatorContains("Iran", "iraq", collator), false);
});