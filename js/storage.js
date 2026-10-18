/* MOMIQ Storage Helper - localStorage فقط */
const Storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      console.warn('[MOMIQ][storage] get error', key, error);
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('[MOMIQ][storage] set error', key, error);
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('[MOMIQ][storage] remove error', key, error);
      return false;
    }
  },
  keys() {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.warn('[MOMIQ][storage] keys error', error);
      return [];
    }
  }
};

window.MomiqStorage = Storage;
