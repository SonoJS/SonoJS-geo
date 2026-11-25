const dataCache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

/** @internal */
export function getCached<T>(key: string): T | undefined {
  return dataCache.get(key) as T | undefined;
}

export function setCached<T>(key: string, value: T): void {
  dataCache.set(key, value);
}

export function clearGeoCache(): void {
  dataCache.clear();
  inflight.clear();
}

export function loadDeduped<T>(
  key: string,
  loader: () => Promise<T>
): Promise<T> {
  const hit = getCached<T>(key);
  if (hit !== undefined) return Promise.resolve(hit);

  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const p = loader()
    .then((value) => {
      setCached(key, value);
      inflight.delete(key);
      return value;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, p);
  return p;
}