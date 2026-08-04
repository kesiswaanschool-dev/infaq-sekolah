-- ============================================
-- Aktifkan Row Level Security (RLS) untuk tabel transactions
-- Jalankan semua baris ini di Supabase SQL Editor
-- ============================================

-- 1. Aktifkan RLS pada tabel
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 2. Bersihkan policy lama (jika ada) agar tidak bentrok
DROP POLICY IF EXISTS "Publik bisa baca" ON transactions;
DROP POLICY IF EXISTS "Admin bisa baca" ON transactions;
DROP POLICY IF EXISTS "Admin bisa menambah" ON transactions;
DROP POLICY IF EXISTS "Admin bisa mengubah" ON transactions;
DROP POLICY IF EXISTS "Admin bisa menghapus" ON transactions;

-- 3. Publik (anon) hanya boleh MEMBACA -- untuk halaman laporan publik
CREATE POLICY "Publik bisa baca" ON transactions
  FOR SELECT TO anon USING (true);

-- 4. Admin yang sudah login (authenticated) boleh membaca
CREATE POLICY "Admin bisa baca" ON transactions
  FOR SELECT TO authenticated USING (true);

-- 5. Hanya admin login yang boleh menambah transaksi
CREATE POLICY "Admin bisa menambah" ON transactions
  FOR INSERT TO authenticated WITH CHECK (true);

-- 6. Hanya admin login yang boleh mengubah transaksi
CREATE POLICY "Admin bisa mengubah" ON transactions
  FOR UPDATE TO authenticated USING (true);

-- 7. Hanya admin login yang boleh menghapus transaksi
CREATE POLICY "Admin bisa menghapus" ON transactions
  FOR DELETE TO authenticated USING (true);

-- ============================================
-- Verifikasi (harus menampilkan 'rls_enabled')
-- ============================================
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'transactions';
