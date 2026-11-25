const graphemeSegmenter = new Intl.Segmenter(undefined, {
    granularity: "grapheme",
});
export function createSearchCollator(locales) {
    return new Intl.Collator(locales, {
        usage: "search",
        sensitivity: "base",
        ignorePunctuation: true,
    });
}
const defaultCollator = createSearchCollator();
export function normalizeQuery(query) {
    return query.normalize("NFC").trim();
}
export function graphemes(text) {
    return [...graphemeSegmenter.segment(text)].map((s) => s.segment);
}
/** Punctuation/symbol graphemes removed for matching only (not source data). */
function stripPunctuationGraphemes(text) {
    return graphemes(text)
        .filter((g) => !/[\p{P}\p{S}]/u.test(g))
        .join("");
}
/**
 * Substring match using grapheme windows and collator.compare (no includes/indexOf).
 */
export function collatorContains(haystack, needle, collator = defaultCollator) {
    const n = normalizeQuery(needle);
    if (!n)
        return false;
    const h = haystack.normalize("NFC");
    const hCmp = stripPunctuationGraphemes(h);
    const nCmp = stripPunctuationGraphemes(n);
    const hG = graphemes(hCmp);
    const nG = graphemes(nCmp);
    const win = nG.length;
    if (win === 0 || hG.length < win)
        return false;
    for (let i = 0; i <= hG.length - win; i++) {
        const slice = hG.slice(i, i + win).join("");
        if (collator.compare(slice, nCmp) === 0)
            return true;
    }
    return false;
}
export function matchesSearch(fields, query, collator = defaultCollator) {
    const q = normalizeQuery(query);
    if (!q)
        return false;
    for (const f of fields) {
        if (f != null && f !== "" && collatorContains(f, q, collator))
            return true;
    }
    return false;
}
export function applyLimit(items, limit) {
    if (limit == null || limit <= 0)
        return items;
    return items.slice(0, limit);
}
//# sourceMappingURL=search.js.map