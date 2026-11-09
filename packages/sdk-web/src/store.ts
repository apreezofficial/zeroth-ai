/** Where verified model files are kept so later loads work with no connection. */
export interface BlobStore {
  get(key: string): Promise<Blob | undefined>;
  put(key: string, blob: Blob): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

const BASE = "https://zeroth.local/models/";

/** Browser Cache Storage. Returns undefined where the Cache API is unavailable. */
export function cacheStorageStore(name = "zeroth-models"): BlobStore | undefined {
  const caches = (globalThis as { caches?: CacheStorage }).caches;
  if (!caches) return undefined;
  const req = (key: string) => new Request(BASE + encodeURIComponent(key));
  return {
    async get(key) {
      const cache = await caches.open(name);
      const res = await cache.match(req(key));
      return res ? await res.blob() : undefined;
    },
    async put(key, blob) {
      const cache = await caches.open(name);
      await cache.put(req(key), new Response(blob));
    },
    async delete(key) {
      const cache = await caches.open(name);
      await cache.delete(req(key));
    },
    async clear() {
      await caches.delete(name);
    },
  };
}

/** In-memory store, used in tests and where nothing persistent is available. */
export function memoryStore(): BlobStore {
  const map = new Map<string, Blob>();
  return {
    async get(key) {
      return map.get(key);
    },
    async put(key, blob) {
      map.set(key, blob);
    },
    async delete(key) {
      map.delete(key);
    },
    async clear() {
      map.clear();
    },
  };
}
