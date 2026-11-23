import type { StoragePort } from "../application/ports";

export function browserStorage(): StoragePort {
  return {
    load(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    save(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* private mode or a full disk should not block the review */
      }
    },
  };
}

export function memoryStorage(): StoragePort {
  const values = new Map<string, string>();
  return {
    load: (key) => values.get(key) ?? null,
    save: (key, value) => { values.set(key, value); },
  };
}
