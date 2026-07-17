# Dashboard Infaq Sekolah

Aplikasi Dashboard untuk mengelola dana Infaq Sekolah SMP IT Nurul Muhajirin Batam.

## Fitur Utama

- 📊 **Dashboard** - Tampilan ringkasan uang masuk, uang keluar, dan saldo akhir
- 💰 **Uang Masuk** - Pencatatan dan pengelolaan pemasukan infaq
- 💸 **Uang Keluar** - Pencatatan dan pengelolaan pengeluaran
- 💵 **Saldo Akhir** - Tampilan total saldo aktual
- 📋 **Riwayat** - Daftar lengkap semua transaksi dengan filter

## Teknologi

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript
- **Database**: SQLite3
- **Styling**: Custom CSS dengan responsive design

## Instalasi

1. Clone atau unduh repository ini
2. Buka folder di terminal
3. Install dependencies:
   ```bash
   npm install
   ```

## Menjalankan Aplikasi

### Development Mode (dengan Nodemon)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

## Penggunaan

### Menu Utama

1. **Dashboard**
   - Melihat ringkasan uang masuk, uang keluar, dan saldo akhir
   - Melihat 5 transaksi terbaru

2. **Uang Masuk**
   - Tambah transaksi pemasukan dengan deskripsi, jumlah, dan tanggal
   - Lihat daftar semua pemasukan
   - Hapus transaksi pemasukan

3. **Uang Keluar**
   - Tambah transaksi pengeluaran dengan deskripsi, jumlah, dan tanggal
   - Lihat daftar semua pengeluaran
   - Hapus transaksi pengeluaran

4. **Saldo Akhir**
   - Lihat total pemasukan
   - Lihat total pengeluaran
   - Lihat saldo akhir (pemasukan - pengeluaran)

5. **Riwayat**
   - Lihat semua transaksi
   - Filter berdasarkan tipe (masuk/keluar)

## API Endpoints

- `GET /api/transactions` - Dapatkan semua transaksi
- `GET /api/stats` - Dapatkan statistik (total masuk, keluar, saldo)
- `POST /api/transactions` - Tambah transaksi baru
- `DELETE /api/transactions/:id` - Hapus transaksi

## Struktur Database

### Table: transactions
- `id` - Primary key (auto increment)
- `type` - Tipe transaksi (masuk/keluar)
- `amount` - Jumlah transaksi (numeric)
- `description` - Deskripsi transaksi (text)
- `date` - Tanggal transaksi (date)
- `created_at` - Waktu dibuat (timestamp)

## Fitur yang Dapat Ditambahkan di Masa Depan

- Autentikasi user
- Export data ke Excel/PDF
- Grafik statistik
- Multi-user dengan role-based access
- Backup data otomatis

## Lisensi

SMP IT Nurul Muhajirin Batam

## Author

Dibuat dengan ❤️ untuk SMP IT Nurul Muhajirin Batam
