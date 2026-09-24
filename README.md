# Dhobi Laundry Service Website

A comprehensive laundry service platform with role-based dashboards for Admin, Users (Customers), and Dhobis (Service Providers).

## 🚀 Features

- **Authentication System**: JWT-based secure login and registration
- **Role-Based Access**: 
  - **Admin**: Manage users, dhobis, orders, and view analytics
  - **User (Customer)**: Place orders, track status, view history
  - **Dhobi (Service Provider)**: View assigned orders, manage schedule
- **Clean Modern UI**: Fast, responsive design with Tailwind CSS
- **Database**: MySQL for data persistence

## 📁 Project Structure

```
dhobi-website/
├── server/                  # Backend (Node.js + Express)
│   ├── config/
│   │   ├── database.js     # MySQL connection
│   │   └── database.sql    # Database schema
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   └── auth.js         # JWT authentication
│   ├── routes/
│   │   └── authRoutes.js
│   ├── .env                # Environment variables
│   ├── package.json
│   └── server.js           # Main server file
│
├── src/                    # Frontend (React + TypeScript)
│   ├── context/
│   │   └── AuthContext.tsx # Auth state management
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── UserDashboard.tsx
│   │   └── DhobiDashboard.tsx
│   ├── App.tsx             # Main app component
│   ├── main.tsx
│   └── index.css
│
└── package.json
```

## 🛠️ Setup Instructions

### 1. Database Setup

```sql
-- Import the database schema
mysql -u root -p < server/config/database.sql
```

Or manually create database in phpMyAdmin/MySQL:
- Open phpMyAdmin (http://localhost/phpmyadmin)
- Import `server/config/database.sql`

### 2. Backend Setup

```bash
cd server
npm install
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# In the root directory
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Environment Variables

Update `server/.env` with your MySQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dhobi_service
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
```

## 👤 Demo Accounts

### Admin
- Email: `admin@dhobi.com`
- Password: `admin123`

### Dhobi (Service Provider)
- Email: `ramesh@dhobi.com`
- Password: `dhobi123`

### User (Customer)
- Email: `user@dhobi.com`
- Password: `user123`

## 🔧 Tech Stack

### Frontend
- **React** 19 + TypeScript
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP requests
- **Lucide React** - Icons
- **Vite** - Build tool

### Backend
- **Node.js** + **Express**
- **MySQL** (mysql2)
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation

## 📱 Pages & Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Login page |
| `/register` | Public | Registration page |
| `/dashboard` | Private | Role-based dashboard (auto-redirects) |

## 🔐 Authentication Flow

1. User registers/logs in
2. Server validates credentials
3. JWT token generated and sent to client
4. Token stored in localStorage
5. Token included in all protected API requests
6. Role-based dashboard rendered

## 📊 Database Schema

- **users**: Store user accounts (admin, user, dhobi)
- **dhobi_profiles**: Service provider details
- **orders**: Laundry orders (ready for implementation)

## 🚧 Next Steps (To Implement)

1. Order management system
2. Payment integration
3. Real-time order tracking
4. Notifications
5. User profile management
6. Dhobi availability calendar
7. Service pricing management
8. Reviews & ratings system

## 💻 Development

```bash
# Frontend dev server
npm run dev

# Backend dev server (with nodemon)
cd server && npm run dev

# Build frontend for production
npm run build
```

## 📝 License

MIT License - Feel free to use this project for learning or commercial purposes.

---

Built with ❤️ for efficient laundry service management
