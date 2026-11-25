export declare function createSearchCollator(locales?: string | string[]): Intl.Collator;
export declare function normalizeQuery(query: string): string;
export declare function graphemes(text: string): string[];
/**
 * Substring match using grapheme windows and collator.compare (no includes/indexOf).
 */
export declare function collatorContains(haystack: string, needle: string, collator?: Intl.Collator): boolean;
export declare function matchesSearch(fields: Array<string | undefined | null>, query: string, collator?: Intl.Collator): boolean;
export declare function applyLimit<T>(items: T[], limit?: number): T[];
//# sourceMappingURL=search.d.ts.map