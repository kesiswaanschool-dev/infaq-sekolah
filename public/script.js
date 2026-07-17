// API Base URL
const API_BASE = 'http://localhost:3000/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupMenuListeners();
    setupFormListeners();
    loadStats();
    loadTransactions();
    
    // Set today's date as default
    document.getElementById('masukDate').valueAsDate = new Date();
    document.getElementById('keluarDate').valueAsDate = new Date();
});

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

// Setup form listeners
function setupFormListeners() {
    const formMasuk = document.getElementById('formMasuk');
    const formKeluar = document.getElementById('formKeluar');
    
    formMasuk.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addTransaction(
            'masuk',
            document.getElementById('masukAmount').value,
            document.getElementById('masukDesc').value,
            document.getElementById('masukDate').value
        );
        formMasuk.reset();
        document.getElementById('masukDate').valueAsDate = new Date();
        await loadTransactions();
        loadMasukTransactions();
        loadStats();
    });
    
    formKeluar.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addTransaction(
            'keluar',
            document.getElementById('keluarAmount').value,
            document.getElementById('keluarDesc').value,
            document.getElementById('keluarDate').value
        );
        formKeluar.reset();
        document.getElementById('keluarDate').valueAsDate = new Date();
        await loadTransactions();
        loadKeluarTransactions();
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
        const response = await fetch(`${API_BASE}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type,
                amount: parseFloat(amount),
                description,
                date
            })
        });
        
        if (response.ok) {
            alert('Transaksi berhasil ditambahkan!');
        } else {
            alert('Gagal menambahkan transaksi');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}

// Delete transaction
async function deleteTransaction(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/transactions/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Transaksi berhasil dihapus!');
            loadTransactions();
            loadStats();
        } else {
            alert('Gagal menghapus transaksi');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}

// Load stats
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const data = await response.json();
        
        document.getElementById('totalMasuk').textContent = formatCurrency(data.totalMasuk);
        document.getElementById('totalKeluar').textContent = formatCurrency(data.totalKeluar);
        document.getElementById('saldoAkhir').textContent = formatCurrency(data.saldoAkhir);
        
        // Update saldo view
        document.getElementById('saldoMasuk').textContent = formatCurrency(data.totalMasuk);
        document.getElementById('saldoKeluar').textContent = formatCurrency(data.totalKeluar);
        document.getElementById('saldoTotal').textContent = formatCurrency(data.saldoAkhir);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load all transactions
async function loadTransactions() {
    try {
        const response = await fetch(`${API_BASE}/transactions`);
        const transactions = await response.json();
        
        // Store for filtering
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
    const endpoint = `${API_BASE}/reports/${period}`;
    
    try {
        // Fetch summary data
        const response = await fetch(endpoint);
        const report = await response.json();
        
        // Fetch all transactions for detailed view
        const transResponse = await fetch(`${API_BASE}/transactions`);
        const transactions = await transResponse.json();
        
        // Enrich transactions with running balance
        const enrichedTransactions = calculateRunningBalances(transactions);
        
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
