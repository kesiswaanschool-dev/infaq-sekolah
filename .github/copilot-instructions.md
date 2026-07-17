# Dashboard Infaq Sekolah - Copilot Instructions

## Project Overview
Dashboard Infaq Sekolah SMP IT Nurul Muhajirin Batam adalah aplikasi web untuk mengelola dana infaq sekolah dengan fitur pencatatan uang masuk, uang keluar, dan perhitungan saldo akhir.

## Technology Stack
- **Backend**: Node.js + Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Database**: SQLite3
- **Port**: 3000

## Project Structure
```
infaq-sekolah/
├── public/
│   ├── index.html       # Main HTML file
│   ├── styles.css       # Styling
│   └── script.js        # Frontend logic
├── src/
│   └── db/
│       └── database.js   # Database initialization
├── server.js            # Express server
├── package.json         # Dependencies
├── README.md            # Documentation
└── .gitignore          # Git ignore rules
```

## Getting Started

### Installation
```bash
npm install
```

### Running the Application
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Features
1. **Dashboard** - Overview of income, expenses, and balance
2. **Uang Masuk** - Add and manage income transactions
3. **Uang Keluar** - Add and manage expense transactions
4. **Saldo Akhir** - View total balance calculation
5. **Riwayat** - View all transactions with filter options

## API Endpoints
- `GET /api/transactions` - Fetch all transactions
- `GET /api/stats` - Get statistics (income, expenses, balance)
- `POST /api/transactions` - Add new transaction
- `DELETE /api/transactions/:id` - Delete transaction

## Database Schema
### transactions table
- `id` - Auto-increment primary key
- `type` - Transaction type (masuk/keluar)
- `amount` - Transaction amount
- `description` - Transaction description
- `date` - Transaction date
- `created_at` - Timestamp

## Development Notes
- Frontend data is fetched from backend API
- All transactions are stored in SQLite database
- Currency formatting uses Indonesian locale (IDR)
- Responsive design for mobile and desktop devices

## Troubleshooting
- Ensure Node.js is installed
- Check if port 3000 is available
- Clear browser cache if styles don't load
- Verify database file exists (infaq.db)

## Future Enhancements
- User authentication
- Export to PDF/Excel
- Statistical charts
- Multi-user support
- Automated backups
