const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Alsada123###@db.htkbvsfmliphtezxtjhj.supabase.co:5432/postgres';
const isPostgres = !!DATABASE_URL;
let db;

if (isPostgres) {
    console.log('Using PostgreSQL database');
    const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    db = {
        all: (sql, params, callback) => {
            const postgresSql = convertPlaceholders(sql);
            pool.query(postgresSql, params, (err, res) => {
                if (err) return callback(err);
                callback(null, res.rows);
            });
        },
        get: (sql, params, callback) => {
            const postgresSql = convertPlaceholders(sql);
            pool.query(postgresSql, params, (err, res) => {
                if (err) return callback(err);
                callback(null, res.rows[0]);
            });
        },
        run: function(sql, params, callback) {
            const postgresSql = convertPlaceholders(sql);
            let finalSql = postgresSql;
            const isInsert = sql.trim().toUpperCase().startsWith('INSERT');
            if (isInsert) {
                finalSql += ' RETURNING id';
            }

            pool.query(finalSql, params, function(err, res) {
                if (err) {
                    if (callback) callback(err);
                    return;
                }
                const resultContext = {
                    lastID: isInsert && res.rows[0] ? res.rows[0].id : null
                };
                if (callback) callback.call(resultContext, null);
            });
        },
        serialize: (callback) => {
            callback();
        }
    };

    // Initialize Postgres table
    pool.query(`CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('masuk', 'keluar')),
      amount REAL NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating transactions table in Postgres:', err);
        else console.log('Transactions table ready (PostgreSQL)');
    });

} else {
    console.log('Using SQLite database');
    const dbPath = path.join(__dirname, '../../infaq.db');
    const sqliteDb = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening SQLite database:', err);
        } else {
            console.log('Connected to SQLite database');
            initializeSQLiteDatabase();
        }
    });

    db = {
        all: (sql, params, callback) => sqliteDb.all(sql, params, callback),
        get: (sql, params, callback) => sqliteDb.get(sql, params, callback),
        run: function(sql, params, callback) {
            sqliteDb.run(sql, params, callback);
        },
        serialize: (callback) => sqliteDb.serialize(callback)
    };

    function initializeSQLiteDatabase() {
        sqliteDb.serialize(() => {
            sqliteDb.run(`CREATE TABLE IF NOT EXISTS transactions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              type TEXT NOT NULL CHECK(type IN ('masuk', 'keluar')),
              amount REAL NOT NULL,
              description TEXT,
              date TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) console.error('Error creating SQLite transactions table:', err);
                else console.log('Transactions table ready (SQLite)');
            });
        });
    }
}

function convertPlaceholders(query) {
    let index = 1;
    return query.replace(/\?/g, () => `$${index++}`);
}

module.exports = db;
