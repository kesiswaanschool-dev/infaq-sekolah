const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Alsada123%23%23%23@db.htkbvsfmliphtezxtjhj.supabase.co:5432/postgres';
const isPostgres = !!DATABASE_URL;

let db;
let usePostgres = false;
let pool;
let sqliteDb;

const sqliteDbPath = path.join(__dirname, '../../infaq.db');

db = {
    all: (sql, params, callback) => {
        if (usePostgres) {
            const postgresSql = convertPlaceholders(sql);
            pool.query(postgresSql, params, (err, res) => {
                if (err) return callback(err);
                callback(null, res.rows);
            });
        } else {
            if (!sqliteDb) return callback(new Error('SQLite database not initialized'));
            sqliteDb.all(sql, params, callback);
        }
    },
    get: (sql, params, callback) => {
        if (usePostgres) {
            const postgresSql = convertPlaceholders(sql);
            pool.query(postgresSql, params, (err, res) => {
                if (err) return callback(err);
                callback(null, res.rows[0]);
            });
        } else {
            if (!sqliteDb) return callback(new Error('SQLite database not initialized'));
            sqliteDb.get(sql, params, callback);
        }
    },
    run: function(sql, params, callback) {
        if (usePostgres) {
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
        } else {
            if (!sqliteDb) {
                if (callback) callback(new Error('SQLite database not initialized'));
                return;
            }
            sqliteDb.run(sql, params, callback);
        }
    },
    serialize: (callback) => {
        callback();
    }
};

if (isPostgres) {
    console.log('Testing connection to PostgreSQL...');
    pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        connectionTimeoutMillis: 5000 // 5 seconds timeout
    });

    pool.query('SELECT 1', (err) => {
        if (err) {
            console.warn('PostgreSQL connection failed. Falling back to local SQLite database.');
            console.warn('Reason:', err.message);
            usePostgres = false;
            pool.end().catch(() => {});
            initSQLite();
        } else {
            console.log('Successfully connected to PostgreSQL! Using Supabase database.');
            usePostgres = true;
            initPostgresTable();
        }
    });
} else {
    initSQLite();
}

function initPostgresTable() {
    pool.query(`CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('masuk', 'keluar')),
      amount NUMERIC NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating transactions table in Postgres:', err);
        else console.log('Transactions table ready (PostgreSQL)');
    });
}

function initSQLite() {
    console.log('Connecting to local SQLite database...');
    sqliteDb = new sqlite3.Database(sqliteDbPath, (err) => {
        if (err) {
            console.error('Error opening SQLite database:', err);
        } else {
            console.log('Connected to SQLite database');
            initializeSQLiteDatabase();
        }
    });
}

function initializeSQLiteDatabase() {
    sqliteDb.serialize(() => {
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL CHECK(type IN ('masuk', 'keluar')),
          amount NUMERIC NOT NULL,
          description TEXT,
          date TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('Error creating SQLite transactions table:', err);
            else console.log('Transactions table ready (SQLite)');
        });
    });
}

function convertPlaceholders(query) {
    let index = 1;
    return query.replace(/\?/g, () => `$${index++}`);
}

module.exports = db;
