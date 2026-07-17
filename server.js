const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./src/db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// API Routes

// Get semua transaksi
app.get('/api/transactions', (req, res) => {
  db.all('SELECT * FROM transactions ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get statistik (uang masuk, keluar, saldo)
app.get('/api/stats', (req, res) => {
  db.serialize(() => {
    let stats = {
      totalMasuk: 0,
      totalKeluar: 0,
      saldoAkhir: 0
    };
    
    // Get total uang masuk
    db.get("SELECT SUM(amount) as total FROM transactions WHERE type = 'masuk'", [], (err, row) => {
      if (!err && row && row.total) {
        stats.totalMasuk = row.total;
      }
      
      // Get total uang keluar
      db.get("SELECT SUM(amount) as total FROM transactions WHERE type = 'keluar'", [], (err, row) => {
        if (!err && row && row.total) {
          stats.totalKeluar = row.total;
        }
        
        stats.saldoAkhir = stats.totalMasuk - stats.totalKeluar;
        res.json(stats);
      });
    });
  });
});

// Add transaksi (uang masuk atau keluar)
app.post('/api/transactions', (req, res) => {
  const { type, amount, description, date } = req.body;
  
  if (!type || !amount || !date) {
    res.status(400).json({ error: 'Type, amount, and date are required' });
    return;
  }
  
  if (type !== 'masuk' && type !== 'keluar') {
    res.status(400).json({ error: 'Type must be "masuk" or "keluar"' });
    return;
  }
  
  db.run(
    'INSERT INTO transactions (type, amount, description, date) VALUES (?, ?, ?, ?)',
    [type, amount, description || '', date],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, type, amount, description, date });
    }
  );
});

// Delete transaksi
app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM transactions WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Transaction deleted' });
  });
});

// Get laporan per hari
app.get('/api/reports/daily', (req, res) => {
  const query = `
    SELECT 
      date,
      SUM(CASE WHEN type = 'masuk' THEN amount ELSE 0 END) as masuk,
      SUM(CASE WHEN type = 'keluar' THEN amount ELSE 0 END) as keluar
    FROM transactions
    GROUP BY date
    ORDER BY date DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const report = rows.map(row => ({
      date: row.date,
      masuk: row.masuk || 0,
      keluar: row.keluar || 0,
      saldo: (row.masuk || 0) - (row.keluar || 0)
    }));
    res.json(report);
  });
});

// Get laporan per bulan
app.get('/api/reports/monthly', (req, res) => {
  const query = `
    SELECT 
      SUBSTR(date, 1, 7) as month,
      SUM(CASE WHEN type = 'masuk' THEN amount ELSE 0 END) as masuk,
      SUM(CASE WHEN type = 'keluar' THEN amount ELSE 0 END) as keluar
    FROM transactions
    GROUP BY SUBSTR(date, 1, 7)
    ORDER BY month DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const report = rows.map(row => ({
      month: row.month,
      masuk: row.masuk || 0,
      keluar: row.keluar || 0,
      saldo: (row.masuk || 0) - (row.keluar || 0)
    }));
    res.json(report);
  });
});

// Get laporan per tahun
app.get('/api/reports/yearly', (req, res) => {
  const query = `
    SELECT 
      SUBSTR(date, 1, 4) as year,
      SUM(CASE WHEN type = 'masuk' THEN amount ELSE 0 END) as masuk,
      SUM(CASE WHEN type = 'keluar' THEN amount ELSE 0 END) as keluar
    FROM transactions
    GROUP BY SUBSTR(date, 1, 4)
    ORDER BY year DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const report = rows.map(row => ({
      year: row.year,
      masuk: row.masuk || 0,
      keluar: row.keluar || 0,
      saldo: (row.masuk || 0) - (row.keluar || 0)
    }));
    res.json(report);
  });
});

// Get detail transaksi per hari
app.get('/api/reports/daily-detail/:date', (req, res) => {
  const { date } = req.params;
  const query = `
    SELECT * FROM transactions
    WHERE date = ?
    ORDER BY type DESC, amount DESC
  `;
  
  db.all(query, [date], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows || []);
  });
});

// Get detail transaksi per bulan
app.get('/api/reports/monthly-detail/:month', (req, res) => {
  const { month } = req.params;
  const query = `
    SELECT * FROM transactions
    WHERE SUBSTR(date, 1, 7) = ?
    ORDER BY date DESC, type DESC, amount DESC
  `;
  
  db.all(query, [month], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows || []);
  });
});

// Get detail transaksi per tahun
app.get('/api/reports/yearly-detail/:year', (req, res) => {
  const { year } = req.params;
  const query = `
    SELECT * FROM transactions
    WHERE SUBSTR(date, 1, 4) = ?
    ORDER BY date DESC, type DESC, amount DESC
  `;
  
  db.all(query, [year], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows || []);
  });
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
