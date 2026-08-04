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

## Konfigurasi

Salin `.env.example` menjadi `.env` dan isi nilainya (untuk pengembangan lokal):

```bash
DATABASE_URL=postgresql://postgres:PASSWORD_ANDA@db.PROYEK-ANDA.supabase.co:5432/postgres
```

- `DATABASE_URL` - Koneksi PostgreSQL (Supabase). Isi dari Dashboard Supabase → Project Settings → Database → Connection string. Jika kosong, aplikasi otomatis memakai SQLite lokal.
- `ADMIN_PASSWORD` (opsional) - Digunakan backend `POST /api/auth` jika aplikasi dipakai lewat server.

JANGAN pernah meng-commit file `.env` ke git (sudah ada di `.gitignore`).

### Login Admin (Supabase Auth)

Login admin memakai **Supabase Auth**, bukan password hardcoded di kode:

1. Buka Dashboard Supabase → **Authentication → Users → Add user**
2. Buat user admin dengan **email + password** (mis. `admin@nurulmuhajirin.sch.id` dengan password kuat)
3. Halaman login admin meminta email & password tersebut

Setiap operasi tulis (tambah/ubah/hapus transaksi) memakai token Supabase Auth sehingga aman jika RLS diaktifkan.

### Deploy

- **GitHub Pages / Vercel statis**: halaman membaca data langsung dari Supabase menggunakan publishable key. Tidak perlu env var khusus — cukup pastikan proyek Supabase aktif dan user admin Auth sudah dibuat.
- **Backend (opsional)**: jika memakai `server.js`, set env var `DATABASE_URL` di platform hosting.

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
