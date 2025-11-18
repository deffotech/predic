// Fix for localStorage access during SSR
if (typeof window === 'undefined') {
  // We're on the server
  const storage: { [key: string]: string } = {};

  (global as any).localStorage = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      for (const key in storage) {
        delete storage[key];
      }
    },
    get length() {
      return Object.keys(storage).length;
    },
    key: (index: number) => Object.keys(storage)[index] || null,
  };
}
