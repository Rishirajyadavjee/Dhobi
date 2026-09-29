# Dhobi Laundry Service Platform - Complete Project Documentation

## 📋 Project Overview

**Project Name**: Dhobi Laundry Service Website  
**Purpose**: A comprehensive role-based laundry service platform connecting customers, service providers (Dhobis), and administrators.  
**Technology Stack**: React + TypeScript (Frontend), Node.js + Express (Backend), MongoDB (Database)  
**Current Status**: Active Development

---

## 🗂️ Complete Project Structure

```
dhobi-website/
│
├── 📁 backend/                          # Node.js + Express Server
│   ├── 📁 config/
│   │   ├── database.js                  # MongoDB Connection Configuration
│   │   └── database.sql                 # Database Schema (Legacy/Reference)
│   │
│   ├── 📁 controllers/
│   │   ├── authController.js            # Authentication & Registration Logic
│   │   ├── orderController.js           # Order Management Logic
│   │   ├── paymentController.js         # Payment Processing Logic
│   │   └── userController.js            # User Management Logic
│   │
│   ├── 📁 models/
│   │   ├── User.js                      # User Data Model (Schema)
│   │   ├── Order.js                     # Order Data Model (Schema)
│   │   └── Payment.js                   # Payment Data Model (Schema)
│   │
│   ├── 📁 routes/
│   │   ├── authRoutes.js                # Authentication Endpoints
│   │   ├── orderRoutes.js               # Order Management Endpoints
│   │   ├── paymentRoutes.js             # Payment Processing Endpoints
│   │   └── userRoutes.js                # User Management Endpoints
│   │
│   ├── 📁 middleware/
│   │   └── auth.js                      # JWT Authentication & Authorization
│   │
│   ├── 📁 node_modules/                 # Project Dependencies (Auto-generated)
│   │
│   ├── .env                             # Environment Variables (Local)
│   ├── .env.example                     # Environment Variables Template
│   ├── .gitignore                       # Git Ignore Configuration
│   ├── package.json                     # Backend Dependencies & Scripts
│   ├── package-lock.json                # Dependency Lock File
│   ├── server.js                        # Main Express Server Entry Point
│   │
│   ├── 📄 Utility Scripts:
│   ├── check-db.js                      # Database Connection Checker
│   ├── generate-hashes.js               # Password Hash Generator
│   ├── init-db.js                       # Database Initialization Script
│   ├── update-passwords.js              # Password Update Utility
│   │
│   └── 📄 Test Scripts:
│       ├── test-endpoints.js            # General Endpoint Testing
│       ├── test-payment-endpoints.js    # Payment API Testing
│       ├── test-payment-simple.js       # Simple Payment Testing
│       ├── test-server.js               # Server Health Testing
│       └── test-endpoints.js            # Comprehensive Endpoint Testing
│
├── 📁 frontend/                         # React + TypeScript Frontend
│   ├── 📁 src/
│   │   ├── 📁 pages/                    # Page Components
│   │   │   ├── Home.tsx                 # Home/Landing Page
│   │   │   ├── About.tsx                # About Page
│   │   │   ├── Services.tsx             # Services Listing
│   │   │   ├── ServiceFlow.tsx          # Service Process Flow
│   │   │   ├── Login.tsx                # Login Page
│   │   │   ├── Register.tsx             # Registration Page
│   │   │   ├── Profile.tsx              # User Profile Page
│   │   │   ├── AdminDashboard.tsx       # Admin Dashboard
│   │   │   ├── UserDashboard.tsx        # Customer Dashboard
│   │   │   └── DhobiDashboard.tsx       # Dhobi Dashboard
│   │   │
│   │   ├── 📁 components/               # Reusable Components
│   │   │   ├── Navigation.tsx           # Navigation Bar
│   │   │   ├── AuthModal.tsx            # Authentication Modal
│   │   │   ├── LoginForm.tsx            # Login Form Component
│   │   │   ├── RegisterForm.tsx         # Registration Form Component
│   │   │   ├── UserPaymentSection.tsx   # User Payment Component
│   │   │   ├── DhobiPaymentSection.tsx  # Dhobi Payment Component
│   │   │   └── AdminPaymentSection.tsx  # Admin Payment Component
│   │   │
│   │   ├── 📁 context/                  # React Context (State Management)
│   │   │   └── AuthContext.tsx          # Authentication Context Provider
│   │   │
│   │   ├── 📁 styles/                   # CSS Styles
│   │   │   ├── auth.css                 # Authentication Pages Styles
│   │   │   ├── dashboard.css            # Dashboard Styles
│   │   │   └── profile.css              # Profile Page Styles
│   │   │
│   │   ├── 📁 assets/                   # Images & Static Assets
│   │   │   ├── hero.png                 # Hero Image
│   │   │   ├── react.svg                # React Logo
│   │   │   └── vite.svg                 # Vite Logo
│   │   │
│   │   ├── App.tsx                      # Main App Component
│   │   ├── App.css                      # App Styles
│   │   ├── main.tsx                     # React Entry Point
│   │   ├── index.css                    # Global Styles
│   │   └── vite-env.d.ts                # Vite Type Definitions
│   │
│   ├── 📁 public/                       # Public Static Files
│   │   ├── favicon.svg                  # Website Favicon
│   │   └── icons.svg                    # Icon Sprite Sheet
│   │
│   ├── 📁 dist/                         # Build Output (Generated)
│   ├── 📁 node_modules/                 # Frontend Dependencies (Auto-generated)
│   │
│   ├── .eslintrc.config.js              # ESLint Configuration
│   ├── index.html                       # HTML Entry Point
│   ├── package.json                     # Frontend Dependencies & Scripts
│   ├── package-lock.json                # Dependency Lock File
│   ├── tailwind.config.js               # Tailwind CSS Configuration
│   ├── postcss.config.js                # PostCSS Configuration
│   ├── vite.config.ts                   # Vite Build Configuration
│   ├── tsconfig.json                    # TypeScript Base Configuration
│   ├── tsconfig.app.json                # TypeScript App Configuration
│   └── tsconfig.node.json               # TypeScript Node Configuration
│
├── 📁 .vscode/                          # VS Code Settings
├── 📁 .git/                             # Git Repository
├── 📁 node_modules/                     # Root Dependencies
│
├── 📄 Root Configuration Files:
├── package.json                         # Root Package Configuration
├── package-lock.json                    # Root Dependency Lock
├── README.md                            # Project README
│
├── 📄 Batch/Script Files:
├── dhobi.bat                            # Main Batch Script
├── INSTALL.bat                          # Installation Batch Script
├── RUN_ME_FIRST.bat                     # Initial Setup Batch Script
└── START_DEV.bat / START_DEV.ps1        # Development Start Scripts

```

---

## 🔌 API Connection Configuration

### Frontend API Configuration
**File**: `frontend/src/context/AuthContext.tsx`

```typescript
const API_URL = 'http://localhost:5000/api';
```

**Base URL**: `http://localhost:5000/api`

### Backend Server Configuration
**File**: `backend/server.js`

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
```

---

## 🗄️ Database Connection

### Database Configuration File
**File**: `backend/config/database.js`

```javascript
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'dhobi_service'
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

export default connectDB;
```

### Database Connection Requirements
- **Database Type**: MongoDB
- **Default Database Name**: `dhobi_service`
- **Connection Method**: Mongoose ODM

---

## 🔑 Environment Variables

### Backend Environment Setup
**File**: `backend/.env`

```env
# Backend Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017
DB_NAME=dhobi_service

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

### Environment Template
**File**: `backend/.env.example`
```env
# Backend Environment Variables
# Copy this file to .env and update with your values

PORT=5000
MONGODB_URI=mongodb://localhost:27017
DB_NAME=dhobi_service
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## 🔐 Authentication & Security

### JWT Authentication Middleware
**File**: `backend/middleware/auth.js`

```javascript
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Verify JWT Token
export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Role-Based Authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};
```

### Authentication Context
**File**: `frontend/src/context/AuthContext.tsx`

```typescript
const API_URL = 'http://localhost:5000/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Token stored in localStorage
localStorage.setItem('token', newToken);
// Token included in all protected API requests
headers: { Authorization: `Bearer ${token}` }
```

---

## 📊 Data Models

### User Model
**File**: `backend/models/User.js`
- `_id`: MongoDB ObjectId
- `name`: String
- `email`: String (Unique)
- `password`: String (Hashed)
- `phone`: String
- `role`: String (admin | user | dhobi)
- `status`: String (active | inactive)
- `dhobiProfile`: Object (For dhobi users)
  - `service_area`: String
  - `experience_years`: Number
  - `rating`: Number
  - `total_orders`: Number
  - `is_verified`: Boolean
  - `availability_status`: String
  - `services_offered`: String
  - `rate_per_item`: Number
  - `bio`: String
- `createdAt`: Date
- `updatedAt`: Date

### Order Model
**File**: `backend/models/Order.js`
- `user_id`: ObjectId (Reference to User)
- `dhobi_id`: ObjectId (Reference to User - Dhobi)
- `order_number`: String (Unique)
- `service_type`: String (wash | dry-clean | iron | wash-iron)
- `pickup_address`: String
- `delivery_address`: String
- `pickup_date`: Date
- `delivery_date`: Date
- `status`: String (pending | confirmed | picked-up | processing | ready | delivered | cancelled)
- `total_items`: Number
- `total_amount`: Number
- `payment_status`: String (pending | paid | refunded)
- `payment_method`: String (cash | online | card)
- `notes`: String
- `createdAt`: Date
- `updatedAt`: Date

### Payment Model
**File**: `backend/models/Payment.js`
- `order_id`: ObjectId (Reference to Order)
- `user_id`: ObjectId (Reference to User)
- `amount`: Number
- `status`: String (pending | completed | failed | refunded)
- `payment_method`: String (online | cash | card)
- `transaction_id`: String (Optional)
- `notes`: String
- `createdAt`: Date
- `updatedAt`: Date

---

## 🔗 API Routes & Endpoints

### Authentication Routes
**File**: `backend/routes/authRoutes.js`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | ❌ No | Register new user |
| POST | `/api/auth/login` | ❌ No | Login user |
| GET | `/api/auth/profile` | ✅ Yes | Get user profile |
| PUT | `/api/auth/profile` | ✅ Yes | Update user profile |
| POST | `/api/auth/logout` | ✅ Yes | Logout user |

### Order Routes
**File**: `backend/routes/orderRoutes.js`

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/api/orders/admin/all` | ✅ Yes | Admin | Get all orders |
| GET | `/api/orders/admin/stats` | ✅ Yes | Admin | Get admin statistics |
| POST | `/api/orders` | ✅ Yes | User | Create new order |
| GET | `/api/orders/user` | ✅ Yes | User | Get user's orders |
| GET | `/api/orders/dhobi` | ✅ Yes | Dhobi | Get assigned orders |
| PUT | `/api/orders/:id/status` | ✅ Yes | Dhobi | Update order status |
| PUT | `/api/orders/:id/confirm` | ✅ Yes | Dhobi | Confirm assigned order |
| PUT | `/api/orders/admin/:id/assign-dhobi` | ✅ Yes | Admin | Assign dhobi to order |
| PUT | `/api/orders/admin/:id` | ✅ Yes | Admin | Update order |
| DELETE | `/api/orders/admin/:id` | ✅ Yes | Admin | Delete order |

### User Routes
**File**: `backend/routes/userRoutes.js`

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/api/users/dhobis` | ✅ Yes | Admin | Get all dhobis |
| GET | `/api/users/:id` | ✅ Yes | - | Get user by ID |
| PUT | `/api/users/:id` | ✅ Yes | - | Update user profile |

### Payment Routes
**File**: `backend/routes/paymentRoutes.js`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/payments` | ✅ Yes | Create payment |
| GET | `/api/payments/order/:orderId` | ✅ Yes | Get payment by order |
| GET | `/api/payments/admin` | ✅ Yes (Admin) | Get all payments |
| PUT | `/api/payments/:id` | ✅ Yes | Update payment status |

---

## 🎮 User Roles & Access Control

### Role Permissions Matrix

| Feature | Admin | User (Customer) | Dhobi |
|---------|-------|-----------------|-------|
| View Dashboard | ✅ | ✅ | ✅ |
| Create Order | ❌ | ✅ | ❌ |
| Assign Dhobi | ✅ | ❌ | ❌ |
| Confirm Order | ✅ | ❌ | ✅ |
| Update Order Status | ✅ | ❌ | ✅ |
| View All Orders | ✅ | ❌ (Own only) | ❌ (Assigned only) |
| Manage Users | ✅ | ❌ | ❌ |
| Process Payments | ✅ | ✅ | ❌ |

---

## 🛠️ Technology Stack Details

### Backend Dependencies
**File**: `backend/package.json`

```json
{
  "dependencies": {
    "axios": "^1.20.0",           // HTTP Client
    "bcryptjs": "^2.4.3",         // Password Hashing
    "cors": "^2.8.5",             // Cross-Origin Resource Sharing
    "dotenv": "^16.3.1",          // Environment Variables
    "express": "^4.18.2",         // Web Framework
    "express-validator": "^7.0.1", // Input Validation
    "jsonwebtoken": "^9.0.2",     // JWT Authentication
    "mongoose": "^8.4.0"          // MongoDB ODM
  },
  "devDependencies": {
    "nodemon": "^3.0.2"           // Auto-restart Server
  }
}
```

### Frontend Dependencies
**File**: `frontend/package.json`

```json
{
  "dependencies": {
    "react": "^18.3.1",            // UI Framework
    "react-dom": "^18.3.1",        // React DOM
    "react-router-dom": "^6.20.1", // Routing
    "axios": "^1.6.2",             // HTTP Client
    "lucide-react": "^0.294.0"     // Icon Library
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.4", // Vite React Plugin
    "typescript": "~6.0.2",           // Type Safety
    "tailwindcss": "^3.4.0",          // CSS Framework
    "vite": "^8.2.0"                  // Build Tool
  }
}
```

---

## 📱 Page Components & Routes

### Authentication Pages
- **Login** (`/login`): User login interface
- **Register** (`/register`): New user registration

### Public Pages
- **Home** (`/`): Landing page
- **About** (`/about`): About the service
- **Services** (`/services`): Service offerings
- **ServiceFlow** (`/service-flow`): Service process explanation

### Protected Pages
- **Admin Dashboard** (`/admin`): Admin control panel
  - View all orders
  - Manage users & dhobis
  - Assign dhobis to orders
  - Confirm orders
  - View analytics

- **User Dashboard** (`/dashboard`): Customer dashboard
  - View personal orders
  - Create new orders
  - Track order status
  - Make payments

- **Dhobi Dashboard** (`/dhobi`): Service provider dashboard
  - View assigned orders
  - Confirm assigned orders
  - Update order status
  - Track earnings

- **Profile** (`/profile`): User profile management

---

## 🚀 Development & Deployment

### Start Development Environment
```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm run dev

# Using batch scripts (Windows)
START_DEV.bat
```

### Build for Production
```bash
# Frontend
npm run build

# Backend (no build needed, uses Node.js directly)
npm start
```

### Database Setup
```bash
# Initialize database
node backend/init-db.js

# Check database connection
node backend/check-db.js

# Generate password hashes
node backend/generate-hashes.js
```

---

## 📝 Key Features Implemented

✅ **Authentication System**
- JWT-based login/registration
- Password hashing with bcryptjs
- Role-based access control

✅ **Order Management**
- Create, read, update, delete orders
- Order status tracking
- Dhobi assignment system
- Order confirmation flow

✅ **Payment System**
- Payment tracking
- Multiple payment methods
- Admin payment overview

✅ **User Dashboards**
- Admin analytics dashboard
- Customer order tracking
- Dhobi work management

✅ **Role-Based Access**
- Admin: Full platform control
- Customer: Order creation & tracking
- Dhobi: Order fulfillment & status updates

---

## 🔄 Order Status Workflow

```
User Creates Order
    ↓
Status: PENDING → Admin views & Assigns Dhobi
    ↓
Status: CONFIRMED → Dhobi confirms acceptance
    ↓
Status: PICKED-UP → Dhobi updates as processing
    ↓
Status: PROCESSING → Dhobi marks as ready
    ↓
Status: READY → Dhobi delivers
    ↓
Status: DELIVERED → Order Complete
    
Alternative: CANCELLED (at any point)
```

---

## 📞 Demo Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | `admin@dhobi.com` | `admin123` | Full platform access |
| Dhobi | `ramesh@dhobi.com` | `dhobi123` | Order management |
| Customer | `user@dhobi.com` | `user123` | Order creation & tracking |

---

## 🎯 Future Enhancements

- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Advanced payment integration (Stripe, PayPal)
- [ ] Dhobi rating & review system
- [ ] Service pricing management
- [ ] Availability calendar
- [ ] SMS/Email notifications
- [ ] Analytics dashboard improvements
- [ ] API documentation (Swagger)
- [ ] Unit & Integration Tests

---

## 📞 Support & Documentation

- **Server Health Check**: `GET http://localhost:5000/api/health`
- **Frontend Dev Server**: `http://localhost:5173`
- **Backend Server**: `http://localhost:5000`
- **MongoDB**: `mongodb://localhost:27017/dhobi_service`

---

**Last Updated**: September 2026  
**Project Status**: Active Development  
**License**: MIT

