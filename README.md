# Library Management System

A modern, full-stack Library Management System with enterprise-level UI/UX, built for schools, colleges, and organizations.

## Features

- **Authentication System** - JWT-based auth with role-based access (Admin, Librarian, Borrower)
- **Dashboard** - Analytics with charts, stats cards, recent activity, and genre distribution
- **Book Management** - Full CRUD, CSV import/export, cover images, barcode generation
- **Author Management** - Manage authors with profiles and book counts
- **Borrower Management** - Member management with fines tracking and membership tiers
- **Borrow & Return System** - Issue/return books with auto fine calculation
- **Reports & Analytics** - Monthly trends, popular authors, inventory stats, overdue reports
- **Notifications** - Real-time alerts for due dates, overdues, and system events
- **Dark/Light Mode** - Persistent theme with system preference detection
- **Search** - Debounced global search with suggestions
- **Responsive Design** - Mobile-first, works on all screen sizes
- **Animations** - Smooth transitions with Framer Motion
- **Export** - Download reports as PDF/CSV

## Tech Stack

### Frontend
- React.js + Vite
- Tailwind CSS v4
- React Router v7
- Axios
- Framer Motion
- Recharts
- React Hot Toast
- React Icons
- TanStack Table

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- Helmet, CORS, Rate Limiting
- Multer (file uploads)
- csv-parse / json2csv / PDFKit (exports)

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd library-management-system
npm run install:all
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/library-management
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Run Development
```bash
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:5000

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@library.com | admin123 |
| Librarian | librarian@library.com | lib123 |

## API Documentation

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Books
- `GET /api/books` - List books (paginated, filterable)
- `GET /api/books/:id` - Get book
- `POST /api/books` - Create book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Soft delete book
- `POST /api/books/bulk-import` - CSV import
- `GET /api/books/export?format=csv|pdf` - Export
- `GET /api/books/genres` - List genres
- `GET /api/books/suggestions?q=` - Search suggestions

### Authors
- `GET /api/authors` - List authors
- `GET /api/authors/:id` - Get author with books
- `POST /api/authors` - Create author
- `PUT /api/authors/:id` - Update author
- `DELETE /api/authors/:id` - Soft delete

### Borrowers
- `GET /api/borrowers` - List borrowers
- `GET /api/borrowers/:id` - Get borrower with transactions
- `POST /api/borrowers` - Create borrower
- `PUT /api/borrowers/:id` - Update borrower
- `DELETE /api/borrowers/:id` - Soft delete

### Transactions
- `GET /api/transactions` - List transactions
- `GET /api/transactions/overdue` - Get overdue items
- `POST /api/transactions/issue` - Issue book
- `PUT /api/transactions/:id/return` - Return book

### Reports
- `GET /api/reports/dashboard` - Dashboard stats
- `GET /api/reports/trends` - Monthly trends
- `GET /api/reports/popular-authors` - Popular authors
- `GET /api/reports/active-borrowers` - Active borrowers
- `GET /api/reports/overdue-report` - Download PDF
- `GET /api/reports/inventory` - Inventory stats

### Notifications
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete

## Database Schema

- **Users** - name, email, password, role, isActive
- **Books** - title, isbn, author (ref), publisher, genre, language, copies, shelf, cover
- **Authors** - name, biography, nationality, birthDate, booksWritten
- **Borrowers** - name, email, phone, membershipType, borrowLimit, fines
- **Transactions** - book, borrower, issueDate, dueDate, returnDate, status, fine
- **Notifications** - user, title, message, type, isRead
- **Fines** - transaction, borrower, amount, daysOverdue, status
- **ActivityLogs** - user, action, resource, details

## Deployment

The frontend is integrated into the Express backend for production. A single server serves both the API and the built React app.

### Single-Server Deploy (Render/Railway)
1. Set environment variables in dashboard (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`)
2. Build command: `npm run build` (builds frontend into `frontend/dist/`)
3. Start command: `npm start` (runs `node backend/server.js`)

### Separate Deploy (optional)
**Backend (Render/Railway):**
- Build: `npm install --prefix backend`
- Start: `node backend/server.js`
- Set `FRONTEND_URL` to your frontend domain

**Frontend (Vercel/Netlify):**
- Set `VITE_API_URL` to your deployed backend URL
- Build: `cd frontend && npm install && npm run build`
- Output: `frontend/dist`

## Project Structure

```
├── backend/
│   ├── config/          # DB connection, env config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, error, upload, validation
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── utils/           # Helpers (token, pagination, fine)
│   ├── validators/      # Joi schemas
│   ├── seed.js          # Database seeder
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth & Theme context
│   │   ├── hooks/       # Custom hooks
│   │   ├── layouts/     # Dashboard layout
│   │   ├── pages/       # Route pages
│   │   └── services/    # API client
│   ├── index.html
│   └── vite.config.js
├── package.json         # Root orchestration
└── README.md
```
