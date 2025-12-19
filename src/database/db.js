// Database connection wrapper for React app
// This file provides an abstraction layer between React and Electron's database

const isElectron = () => {
  return window.electron !== undefined;
};

const db = {
  query: async (sql, params = []) => {
    if (isElectron()) {
      return await window.electron.db.query(sql, params);
    }
    // Fallback for web version (if needed)
    console.warn('Database not available in web mode');
    return [];
  },

  run: async (sql, params = []) => {
    if (isElectron()) {
      return await window.electron.db.run(sql, params);
    }
    console.warn('Database not available in web mode');
    return { changes: 0, lastInsertRowid: 0 };
  },

  get: async (sql, params = []) => {
    if (isElectron()) {
      return await window.electron.db.get(sql, params);
    }
    console.warn('Database not available in web mode');
    return null;
  }
};

export default db;
