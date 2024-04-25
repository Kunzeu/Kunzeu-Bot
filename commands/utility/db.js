  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('database.db'); // Crea o conecta a 'database.db'
  
  // Código para crear tablas si es necesario
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      userId TEXT PRIMARY KEY,
      apiKey TEXT
    );
  `);
  
  async function addUserApiKey(userId, apiKey) {
    return new Promise((resolve, reject) => {
      db.run('INSERT OR REPLACE INTO users (userId, apiKey) VALUES (?, ?)', [userId, apiKey], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  
  async function getUserApiKey(userId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT apiKey FROM users WHERE userId = ?', [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.apiKey : null);
        }
      });
    });
  }
  
  async function deleteUserApiKey(userId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE userId = ?', [userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  
  async function updateUserApiKey(userId, apiKey) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET apiKey = ? WHERE userId = ?', [apiKey, userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  
  module.exports = {
    addUserApiKey,
    getUserApiKey,
    deleteUserApiKey,
    updateUserApiKey
  };
  