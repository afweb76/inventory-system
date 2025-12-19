const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

const isDev = !app.isPackaged;
const userDataPath = app.getPath('userData');
const dbPath = isDev 
  ? path.join(__dirname, '../inventory.db')
  : path.join(userDataPath, 'inventory.db');

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize database schema
const initSchema = () => {
  const schemaSQL = fs.readFileSync(
    path.join(__dirname, '../src/database/schema.sql'),
    'utf-8'
  );
  
  db.exec(schemaSQL);
};

// Check if database needs initialization
const needsInit = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get() === undefined;

if (needsInit) {
  initSchema();
}

module.exports = {
  query: (sql, params = []) => {
    try {
      return db.prepare(sql).all(params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  
  run: (sql, params = []) => {
    try {
      return db.prepare(sql).run(params);
    } catch (error) {
      console.error('Database run error:', error);
      throw error;
    }
  },
  
  get: (sql, params = []) => {
    try {
      return db.prepare(sql).get(params);
    } catch (error) {
      console.error('Database get error:', error);
      throw error;
    }
  }
};
