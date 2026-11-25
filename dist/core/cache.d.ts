/** @internal */
export declare function getCached<T>(key: string): T | undefined;
export declare function setCached<T>(key: string, value: T): void;
export declare function clearGeoCache(): void;
export declare function loadDeduped<T>(key: string, loader: () => Promise<T>): Promise<T>;
//# sourceMappingURL=cache.d.ts.map