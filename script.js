const SUPABASE_URL = 'https://htkbvsfmliphtezxtjhj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Eme1Z04mqhuZ7Fbej5b96g_l16QduF7';

const HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const loginOverlay = document.getElementById('loginOverlay');
    const loginForm = document.getElementById('loginForm');
    const adminPasswordInput = document.getElementById('adminPassword');
    const loginError = document.getElementById('loginError');

    // Check if already authenticated in this session
    if (sessionStorage.getItem('infaq_admin_authenticated') === 'true') {
        if (loginOverlay) loginOverlay.style.display = 'none';
        await initApp();
    } else {
        if (loginOverlay) {
            loginOverlay.style.display = 'flex';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = adminPasswordInput.value;
            if (password === 'Alsada123##') {
                sessionStorage.setItem('infaq_admin_authenticated', 'true');
                if (loginOverlay) {
                    loginOverlay.style.opacity = '0';
                    setTimeout(() => {
                        loginOverlay.style.display = 'none';
                    }, 300);
                }
                await initApp();
            } else {
                loginError.textContent = 'Password salah! Silakan coba lagi.';
                loginError.style.display = 'block';
                adminPasswordInput.value = '';
                adminPasswordInput.focus();
            }
        });
    }

    // Setup Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin keluar?')) {
                sessionStorage.removeItem('infaq_admin_authenticated');
                window.location.reload();
            }
        });
    }
});

async function initApp() {
    setupMenuListeners();
    setupFormListeners();
    await loadTransactions();
    loadStats();
    
    // Set today's date as default
    const masukDate = document.getElementById('masukDate');
    const keluarDate = document.getElementById('keluarDate');
    if (masukDate) masukDate.valueAsDate = new Date();
    if (keluarDate) keluarDate.valueAsDate = new Date();
}

// Format currency to IDR
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Setup menu listeners
function setupMenuListeners() {
    const menuBtns = document.querySelectorAll('.menu-btn');
    menuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const menuName = btn.getAttribute('data-menu');
            showView(menuName);
            
            // Remove active from all buttons
            menuBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Show view
function showView(viewName) {
    const views = document.querySelectorAll('.content-view');
    views.forEach(view => view.classList.remove('active'));
    
    const activeView = document.getElementById(viewName);
    if (activeView) {
        activeView.classList.add('active');
        
        // Reload data when switching views
        if (viewName === 'dashboard') {
            loadStats();
            loadRecentTransactions();
        } else if (viewName === 'masuk') {
            loadMasukTransactions();
        } else if (viewName === 'keluar') {
            loadKeluarTransactions();
        } else if (viewName === 'saldo') {
            loadSaldoInfo();
        } else if (viewName === 'riwayat') {
            loadAllTransactions();
        } else if (viewName === 'laporan') {
            loadLaporan();
        }
    }
}

let editingMasukId = null;
let editingKeluarId = null;

// Setup form listeners
function setupFormListeners() {
    const formMasuk = document.getElementById('formMasuk');
    const formKeluar = document.getElementById('formKeluar');
    
    formMasuk.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = document.getElementById('masukAmount').value;
        const desc = document.getElementById('masukDesc').value;
        const date = document.getElementById('masukDate').value;
        
        if (editingMasukId) {
            await updateTransaction(editingMasukId, 'masuk', amount, desc, date);
            editingMasukId = null;
            document.querySelector('#formMasuk .btn-submit').textContent = 'Tambah Uang Masuk';
        } else {
            await addTransaction('masuk', amount, desc, date);
        }
        
        formMasuk.reset();
        document.getElementById('masukDate').valueAsDate = new Date();
        await loadTransactions();
        loadStats();
    });
    
    formKeluar.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = document.getElementById('keluarAmount').value;
        const desc = document.getElementById('keluarDesc').value;
        const date = document.getElementById('keluarDate').value;
        
        if (editingKeluarId) {
            await updateTransaction(editingKeluarId, 'keluar', amount, desc, date);
            editingKeluarId = null;
            document.querySelector('#formKeluar .btn-submit').textContent = 'Tambah Uang Keluar';
        } else {
            await addTransaction('keluar', amount, desc, date);
        }
        
        formKeluar.reset();
        document.getElementById('keluarDate').valueAsDate = new Date();
        await loadTransactions();
        loadStats();
    });
    
    // Filter listener
    const filterType = document.getElementById('filterType');
    if (filterType) {
        filterType.addEventListener('change', loadAllTransactions);
    }
    
    // Laporan filter listener
    const reportPeriod = document.getElementById('reportPeriod');
    if (reportPeriod) {
        reportPeriod.addEventListener('change', loadLaporan);
    }
}

// Add transaction
async function addTransaction(type, amount, description, date) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
            method: 'POST',
            headers: {
                ...HEADERS,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                type,
                amount: parseFloat(amount),
                description: description || '',
                date
            })
        });
        
        if (response.ok) {
            alert('Transaksi berhasil ditambahkan!');
        } else {
            const err = await response.json();
            throw new Error(err.message || 'Gagal menambahkan transaksi');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}

// Update transaction
async function updateTransaction(id, type, amount, description, date) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                ...HEADERS,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                amount: parseFloat(amount),
                description: description || '',
                date
            })
        });
        
        if (response.ok) {
            alert('Transaksi berhasil diubah!');
        } else {
            const err = await response.json();
            throw new Error(err.message || 'Gagal mengubah transaksi');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}

// Edit transaction
function editTransaction(id) {
    const transactions = window.allTransactions || [];
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    if (transaction.type === 'masuk') {
        editingMasukId = id;
        showView('masuk');
        document.getElementById('masukDesc').value = transaction.description;
        document.getElementById('masukAmount').value = transaction.amount;
        document.getElementById('masukDate').value = transaction.date;
        document.querySelector('#formMasuk .btn-submit').textContent = 'Simpan Perubahan';
    } else if (transaction.type === 'keluar') {
        editingKeluarId = id;
        showView('keluar');
        document.getElementById('keluarDesc').value = transaction.description;
        document.getElementById('keluarAmount').value = transaction.amount;
        document.getElementById('keluarDate').value = transaction.date;
        document.querySelector('#formKeluar .btn-submit').textContent = 'Simpan Perubahan';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Delete transaction
async function deleteTransaction(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
        return;
    }
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${id}`, {
            method: 'DELETE',
            headers: HEADERS
        });
        
        if (response.ok) {
            alert('Transaksi berhasil dihapus!');
            await loadTransactions();
            loadStats();
        } else {
            throw new Error('Gagal menghapus transaksi');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}

// Load stats
function loadStats() {
    try {
        const transactions = window.allTransactions || [];
        let totalMasuk = 0;
        let totalKeluar = 0;
        
        transactions.forEach(t => {
            if (t.type === 'masuk') {
                totalMasuk += t.amount;
            } else if (t.type === 'keluar') {
                totalKeluar += t.amount;
            }
        });
        
        const saldoAkhir = totalMasuk - totalKeluar;
        
        document.getElementById('totalMasuk').textContent = formatCurrency(totalMasuk);
        document.getElementById('totalKeluar').textContent = formatCurrency(totalKeluar);
        document.getElementById('saldoAkhir').textContent = formatCurrency(saldoAkhir);
        
        // Update saldo view
        document.getElementById('saldoMasuk').textContent = formatCurrency(totalMasuk);
        document.getElementById('saldoKeluar').textContent = formatCurrency(totalKeluar);
        document.getElementById('saldoTotal').textContent = formatCurrency(saldoAkhir);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load all transactions
async function loadTransactions() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/transactions?select=*&order=date.desc`, {
            headers: HEADERS
        });
        if (!response.ok) throw new Error('Gagal mengambil data dari Supabase');
        const transactions = await response.json();
        
        window.allTransactions = transactions;
        
        loadRecentTransactions();
        loadMasukTransactions();
        loadKeluarTransactions();
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// Load recent transactions (for dashboard)
function loadRecentTransactions() {
    const transactions = window.allTransactions || [];
    const recentList = document.getElementById('recentList');
    const recent = transactions.slice(0, 5);
    
    if (recent.length === 0) {
        recentList.innerHTML = '<p>Tidak ada transaksi</p>';
        return;
    }
    
    recentList.innerHTML = recent.map(t => `
        <div class="transaction-item ${t.type}">
            <div class="transaction-item-info">
                <div class="transaction-item-desc">${t.description || 'Transaksi'}</div>
                <div class="transaction-item-date">${new Date(t.date).toLocaleDateString('id-ID')}</div>
            </div>
            <div class="transaction-item-amount">${t.type === 'masuk' ? '+' : '-'} ${formatCurrency(t.amount)}</div>
            <div class="transaction-item-actions">
                <button class="btn-delete" onclick="deleteTransaction(${t.id})">Hapus</button>
            </div>
        </div>
    `).join('');
}

// Load masuk transactions
function loadMasukTransactions() {
    const transactions = window.allTransactions || [];
    const masukList = document.getElementById('masukList');
    const masuk = transactions.filter(t => t.type === 'masuk');
    
    if (masuk.length === 0) {
        masukList.innerHTML = '<p>Tidak ada data uang masuk</p>';
        return;
    }
    
    masukList.innerHTML = masuk.map(t => `
        <div class="transaction-item masuk">
            <div class="transaction-item-info">
                <div class="transaction-item-desc">${t.description || 'Pemasukan'}</div>
                <div class="transaction-item-date">${new Date(t.date).toLocaleDateString('id-ID')}</div>
            </div>
            <div class="transaction-item-amount">+ ${formatCurrency(t.amount)}</div>
            <div class="transaction-item-actions">
                <button class="btn-edit" onclick="editTransaction(${t.id})">Edit</button>
                <button class="btn-delete" onclick="deleteTransaction(${t.id})">Hapus</button>
            </div>
        </div>
    `).join('');
}

// Load keluar transactions
function loadKeluarTransactions() {
    const transactions = window.allTransactions || [];
    const keluarList = document.getElementById('keluarList');
    const keluar = transactions.filter(t => t.type === 'keluar');
    
    if (keluar.length === 0) {
        keluarList.innerHTML = '<p>Tidak ada data uang keluar</p>';
        return;
    }
    
    keluarList.innerHTML = keluar.map(t => `
        <div class="transaction-item keluar">
            <div class="transaction-item-info">
                <div class="transaction-item-desc">${t.description || 'Pengeluaran'}</div>
                <div class="transaction-item-date">${new Date(t.date).toLocaleDateString('id-ID')}</div>
            </div>
            <div class="transaction-item-amount">- ${formatCurrency(t.amount)}</div>
            <div class="transaction-item-actions">
                <button class="btn-edit" onclick="editTransaction(${t.id})">Edit</button>
                <button class="btn-delete" onclick="deleteTransaction(${t.id})">Hapus</button>
            </div>
        </div>
    `).join('');
}

// Load saldo info
function loadSaldoInfo() {
    loadStats();
}

// Load all transactions with filter
function loadAllTransactions() {
    const transactions = window.allTransactions || [];
    const riwayatList = document.getElementById('riwayatList');
    const filterType = document.getElementById('filterType').value;
    
    let filtered = transactions;
    if (filterType) {
        filtered = transactions.filter(t => t.type === filterType);
    }
    
    if (filtered.length === 0) {
        riwayatList.innerHTML = '<p>Tidak ada transaksi</p>';
        return;
    }
    
    riwayatList.innerHTML = filtered.map(t => `
        <div class="transaction-item ${t.type}">
            <div class="transaction-item-info">
                <div class="transaction-item-desc">${t.description || 'Transaksi'}</div>
                <div class="transaction-item-date">${new Date(t.date).toLocaleDateString('id-ID')}</div>
            </div>
            <div class="transaction-item-amount">${t.type === 'masuk' ? '+' : '-'} ${formatCurrency(t.amount)}</div>
            <div class="transaction-item-actions">
                <button class="btn-delete" onclick="deleteTransaction(${t.id})">Hapus</button>
            </div>
        </div>
    `).join('');
}

// Calculate running balance for all transactions in chronological order (earliest to latest)
function calculateRunningBalances(transactions) {
    // Sort ascending to calculate running balance
    const sorted = [...transactions].sort((a, b) => {
        if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
        }
        return a.id - b.id;
    });
    
    let running = 0;
    sorted.forEach(t => {
        if (t.type === 'masuk') {
            running += t.amount;
        } else if (t.type === 'keluar') {
            running -= t.amount;
        }
        t.runningBalance = running;
    });
    
    // Return them in chronological order (oldest first) to make the ledger/bank statement flow naturally
    return sorted;
}

// Load laporan
async function loadLaporan() {
    const period = document.getElementById('reportPeriod').value || 'daily';
    
    try {
        const transactions = window.allTransactions || [];
        
        // Enrich transactions with running balance
        const enrichedTransactions = calculateRunningBalances(transactions);
        
        // Group transactions by period
        const groups = {};
        enrichedTransactions.forEach(t => {
            let key;
            if (period === 'daily') {
                key = t.date;
            } else if (period === 'monthly') {
                key = t.date.substring(0, 7); // YYYY-MM
            } else if (period === 'yearly') {
                key = t.date.substring(0, 4); // YYYY
            }
            
            if (!groups[key]) {
                groups[key] = { masuk: 0, keluar: 0 };
            }
            
            if (t.type === 'masuk') {
                groups[key].masuk += t.amount;
            } else if (t.type === 'keluar') {
                groups[key].keluar += t.amount;
            }
        });
        
        // Convert groups object to array of report items
        const report = Object.keys(groups).map(key => {
            const item = {
                masuk: groups[key].masuk,
                keluar: groups[key].keluar,
                saldo: groups[key].masuk - groups[key].keluar
            };
            
            if (period === 'daily') item.date = key;
            else if (period === 'monthly') item.month = key;
            else if (period === 'yearly') item.year = key;
            
            return item;
        });
        
        // Sort report groups descending (newest first) for the main table
        report.sort((a, b) => {
            const keyA = period === 'daily' ? a.date : (period === 'monthly' ? a.month : a.year);
            const keyB = period === 'daily' ? b.date : (period === 'monthly' ? b.month : b.year);
            return keyB.localeCompare(keyA);
        });
        
        displayLaporan(report, period, enrichedTransactions);
    } catch (error) {
        console.error('Error loading laporan:', error);
    }
}

// Display laporan
function displayLaporan(report, period, allTransactions) {
    const laporanBody = document.getElementById('laporanBody');
    const detailBody = document.getElementById('laporanDetailBody');
    let totalMasuk = 0;
    let totalKeluar = 0;
    
    if (report.length === 0) {
        laporanBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Tidak ada data</td></tr>';
        detailBody.innerHTML = '<p>Tidak ada data</p>';
        updateLaporanSummary(0, 0);
        return;
    }
    
    let periodLabel = '';
    if (period === 'daily') periodLabel = 'Hari';
    else if (period === 'monthly') periodLabel = 'Bulan';
    else if (period === 'yearly') periodLabel = 'Tahun';
    
    // Update table header
    document.querySelector('.laporan-table thead tr').innerHTML = `
        <th>${periodLabel}</th>
        <th class="amount">Uang Masuk</th>
        <th class="amount">Uang Keluar</th>
        <th class="amount">Saldo</th>
    `;
    
    laporanBody.innerHTML = report.map(item => {
        const key = period === 'daily' ? item.date : (period === 'monthly' ? item.month : item.year);
        const displayKey = formatPeriodLabel(key, period);
        const masuk = item.masuk || 0;
        const keluar = item.keluar || 0;
        const saldo = item.saldo || 0;
        
        totalMasuk += masuk;
        totalKeluar += keluar;
        
        return `
            <tr>
                <td>${displayKey}</td>
                <td class="amount" style="color: var(--success-color); font-weight: bold;">${formatCurrency(masuk)}</td>
                <td class="amount" style="color: var(--danger-color); font-weight: bold;">${formatCurrency(keluar)}</td>
                <td class="amount" style="color: var(--primary-color); font-weight: bold;">${formatCurrency(saldo)}</td>
            </tr>
        `;
    }).join('');
    
    // Generate detailed transaction table grouped by period
    let detailHTML = '';
    
    // Sort period groups chronologically ascending (oldest first)
    const sortedReport = [...report].sort((a, b) => {
        const keyA = period === 'daily' ? a.date : (period === 'monthly' ? a.month : a.year);
        const keyB = period === 'daily' ? b.date : (period === 'monthly' ? b.month : b.year);
        return keyA.localeCompare(keyB);
    });
    
    sortedReport.forEach(item => {
        const key = period === 'daily' ? item.date : (period === 'monthly' ? item.month : item.year);
        const displayKey = formatPeriodLabel(key, period);
        
        // Filter transactions for this period
        const periodTransactions = allTransactions.filter(trans => {
            if (period === 'daily') {
                return trans.date === key;
            } else if (period === 'monthly') {
                return trans.date.substring(0, 7) === key;
            } else if (period === 'yearly') {
                return trans.date.substring(0, 4) === key;
            }
            return false;
        });
        
        if (periodTransactions.length > 0) {
            detailHTML += `
                <div class="detail-period-section">
                    <h3 class="detail-period-title">${displayKey}</h3>
                    <div style="overflow-x: auto; margin-bottom: 15px;">
                        <table class="laporan-table">
                            <thead>
                                <tr>
                                    <th>Tgl</th>
                                    <th>Keterangan</th>
                                    <th class="amount">Nilai</th>
                                    <th style="text-align: center;">Jenis Transaksi</th>
                                    <th class="amount">Saldo Akhir</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${periodTransactions.map(trans => `
                                    <tr>
                                        <td>${new Date(trans.date).toLocaleDateString('id-ID')}</td>
                                        <td>${trans.description || 'Transaksi'}</td>
                                        <td class="amount" style="color: ${trans.type === 'masuk' ? 'var(--success-color)' : 'var(--danger-color)'}; font-weight: bold;">
                                            ${trans.type === 'masuk' ? '+' : '-'} ${formatCurrency(trans.amount)}
                                        </td>
                                        <td style="text-align: center;">
                                            <span class="detail-trans-type ${trans.type}">
                                                ${trans.type === 'masuk' ? 'Masuk' : 'Keluar'}
                                            </span>
                                        </td>
                                        <td class="amount" style="font-weight: bold; color: var(--primary-color);">
                                            ${formatCurrency(trans.runningBalance)}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
    });
    
    if (detailHTML) {
        detailBody.innerHTML = detailHTML;
    } else {
        detailBody.innerHTML = '<p>Tidak ada detail transaksi</p>';
    }
    
    updateLaporanSummary(totalMasuk, totalKeluar);
    
    // Store current report for export
    window.currentReport = {
        data: report,
        period: period,
        totalMasuk: totalMasuk,
        totalKeluar: totalKeluar,
        transactions: allTransactions
    };
}

// Format periode label
function formatPeriodLabel(value, period) {
    if (period === 'daily') {
        return new Date(value).toLocaleDateString('id-ID');
    } else if (period === 'monthly') {
        const [year, month] = value.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
    } else if (period === 'yearly') {
        return value;
    }
}

// Update laporan summary
function updateLaporanSummary(totalMasuk, totalKeluar) {
    const totalSaldo = totalMasuk - totalKeluar;
    
    document.getElementById('laporanTotalMasuk').textContent = formatCurrency(totalMasuk);
    document.getElementById('laporanTotalKeluar').textContent = formatCurrency(totalKeluar);
    document.getElementById('laporanTotalSaldo').textContent = formatCurrency(totalSaldo);
}

// Export to CSV with detailed transactions
function exportToCSV() {
    if (!window.currentReport || !window.currentReport.data) {
        alert('Tidak ada data untuk diexport');
        return;
    }
    
    const report = window.currentReport;
    const period = report.period;
    let csv = 'Laporan Keuangan Infaq Sekolah\n';
    csv += `Periode: ${period === 'daily' ? 'Per Hari' : period === 'monthly' ? 'Per Bulan' : 'Per Tahun'}\n`;
    csv += `Tanggal Export: ${new Date().toLocaleDateString('id-ID')}\n\n`;
    
    // ===== RINGKASAN AGREGASI =====
    csv += '=== RINGKASAN AGREGASI ===\n';
    csv += 'Periode,Uang Masuk,Uang Keluar,Saldo\n';
    
    report.data.forEach(item => {
        const key = period === 'daily' ? item.date : (period === 'monthly' ? item.month : item.year);
        const displayKey = formatPeriodLabel(key, period);
        const masuk = item.masuk || 0;
        const keluar = item.keluar || 0;
        const saldo = item.saldo || 0;
        
        csv += `"${displayKey}",${masuk},${keluar},${saldo}\n`;
    });
    
    csv += '\n';
    csv += `Total Uang Masuk,${report.totalMasuk}\n`;
    csv += `Total Uang Keluar,${report.totalKeluar}\n`;
    csv += `Saldo Keseluruhan,${report.totalMasuk - report.totalKeluar}\n`;
    
    // ===== DETAIL TRANSAKSI =====
    csv += '\n\n=== DETAIL TRANSAKSI ===\n';
    
    // Sort period groups chronologically ascending (oldest first) for CSV export
    const csvReportGroups = [...report.data].sort((a, b) => {
        const keyA = period === 'daily' ? a.date : (period === 'monthly' ? a.month : a.year);
        const keyB = period === 'daily' ? b.date : (period === 'monthly' ? b.month : b.year);
        return keyA.localeCompare(keyB);
    });
    
    csvReportGroups.forEach(item => {
        const key = period === 'daily' ? item.date : (period === 'monthly' ? item.month : item.year);
        const displayKey = formatPeriodLabel(key, period);
        
        // Filter transactions for this period
        const periodTransactions = report.transactions.filter(trans => {
            if (period === 'daily') {
                return trans.date === key;
            } else if (period === 'monthly') {
                return trans.date.substring(0, 7) === key;
            } else if (period === 'yearly') {
                return trans.date.substring(0, 4) === key;
            }
            return false;
        });
        
        if (periodTransactions.length > 0) {
            csv += `\nPeriode: ${displayKey}\n`;
            csv += 'Tgl,Keterangan,Nilai,Jenis Transaksi,Saldo Akhir\n';
            
            periodTransactions.forEach(trans => {
                const tanggal = new Date(trans.date).toLocaleDateString('id-ID');
                const deskripsi = trans.description || 'Transaksi';
                const tipe = trans.type === 'masuk' ? 'Masuk' : 'Keluar';
                const nilai = trans.amount;
                const saldoAkhir = trans.runningBalance;
                
                csv += `"${tanggal}","${deskripsi}",${nilai},"${tipe}",${saldoAkhir}\n`;
            });
        }
    });
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filename = `Laporan_Infaq_Rinci_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Laporan berhasil diexport!');
}
