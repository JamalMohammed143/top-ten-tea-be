<div align="center">
  <h1>🍃 Top Ten Tea - Backend Server</h1>
  <p><strong>The robust API and database management system powering the Top Ten Tea distribution application.</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Node.js-v18+-blue?logo=node.js&logoColor=white" alt="Node.js version" />
    <img src="https://img.shields.io/badge/Express.js-5.x-lightgrey?logo=express&logoColor=white" alt="Express version" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb&logoColor=white" alt="MongoDB" />
  </p>
</div>

---

## 🚀 Project Overview

The **Top Ten Tea Backend** provides a secure, efficient, and reliable RESTful API for managing tea sales, inventory, and field deliveries. It handles all the complex business logic required to bridge the gap between business owners (admins) and their on-the-ground delivery staff.

It acts as the central brain of the system, keeping track of store lists, driver assignments, sales tracking, and end-of-day financial settlements.

---

## ⚙️ Tech Stack

- **Runtime Environment:** [Node.js](https://nodejs.org/) (v18+)
- **Framework:** [Express.js](https://expressjs.com/) (v5.x)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) ORM
- **Security & Middleware:** 
  - **Authentication:** JWT (JSON Web Tokens) for secure, stateless sessions
  - **Encryption:** `bcryptjs` for secure password hashing
  - **Protection:** `helmet` & `cors` for API security and header protection
  - **Logging:** `morgan` for development request logging

---

## 📁 Project Directory Structure

Below is the directory map of the backend application:

- [src](file:///d:/Jassir/Personal/Jamal%20Bhai's%20Work/top-ten-tea-be/src) - Root folder containing codebase
  - [config](file:///d:/Jassir/Personal/Jamal%20Bhai's%20Work/top-ten-tea-be/src/config) - Database configuration files
  - [controllers](file:///d:/Jassir/Personal/Jamal%20Bhai's%20Work/top-ten-tea-be/src/controllers) - Request handler logic
  - [middlewares](file:///d:/Jassir/Personal/Jamal%20Bhai's%20Work/top-ten-tea-be/src/middlewares) - Authentication and error handlers
  - [models](file:///d:/Jassir/Personal/Jamal%20Bhai's%20Work/top-ten-tea-be/src/models) - Mongoose models (User, Product, Store, Assignment, etc.)
  - [routes](file:///d:/Jassir/Personal/Jamal%20Bhai's%20Work/top-ten-tea-be/src/routes) - Express route definitions
  - [utils](file:///d:/Jassir/Personal/Jamal%20Bhai's%20Work/top-ten-tea-be/src/utils) - Helper utilities and exceptions
  - [app.ts](file:///d:/Jassir/Personal/Jamal%20Bhai's%20Work/top-ten-tea-be/src/app.ts) - Express App configure
  - [server.ts](file:///d:/Jassir/Personal/Jamal%20Bhai's%20Work/top-ten-tea-be/src/server.ts) - Main entrypoint to listen to ports
  - [seedAdmin.ts](file:///d:/Jassir/Personal/Jamal%20Bhai's%20Work/top-ten-tea-be/src/seedAdmin.ts) - Seed default administrator account
- [.env](file:///d:/Jassir/Personal/Jamal%20Bhai's%20Work/top-ten-tea-be/.env) - Local config variables (git ignored)
- [tsconfig.json](file:///d:/Jassir/Personal/Jamal%20Bhai's%20Work/top-ten-tea-be/tsconfig.json) - TypeScript compiler setup
- [package.json](file:///d:/Jassir/Personal/Jamal%20Bhai's%20Work/top-ten-tea-be/package.json) - Node scripts and packages

---

## 🏗️ Core Features & Capabilities

### 👑 Admin API Flow
- **Inventory & Pricing:** Full CRUD operations for products, custom pricing, and driver incentives.
- **Store & Areas Management:** Manage store categories, groups, geo-locations, and contact points.
- **Staff Assignment:** Assign specific tea stock and quantities to delivery drivers.
- **Tracking & Settlements:** Real-time metrics for daily tracking, petrol allowance calculation, driver incentives, and finalized daily settlements.

### 🚚 Delivery Staff API Flow
- **Daily Assignments:** Instantly view assigned products and groups for the day.
- **Sales Logging:** Log sales on-the-go with real-time calculations. Supports existing store IDs or register new custom store entries directly.
- **Performance Summary:** Fetch personal sales histories and metrics.

---

## 🛠️ Setup & Running

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Yarn](https://yarnpkg.com/) or npm
- [MongoDB](https://www.mongodb.com/) (Local server or Atlas cloud)

### 1. Install Dependencies
```bash
# Using yarn
yarn install

# Or using npm
npm install
```

### 2. Environment Variables Configuration
Create a `.env` file in the root of the backend directory (`top-ten-tea-be/.env`) and add the following keys:
```env
# Server Port Configuration
PORT=5000

# MongoDB Connection String (Update as needed)
MONGO_URI=mongodb://localhost:27017/top-ten-tea-db

# JWT Security Configurations
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=1d
```

### 3. Database Seeding
To seed an initial Admin account in the database (for first-time setup and login), run:
```bash
# Using yarn
yarn seed

# Or using npm
npm run seed
```
This creates a default administrator:
- **Email:** `admin@example.com`
- **Password:** `password123`

### 4. Running the Server

**Development Mode (Live Reloading via nodemon):**
```bash
yarn dev
```

**Production Mode:**
```bash
yarn build
yarn start
```

Once running, the API will be accessible at: `http://localhost:5000`

---

## 📡 API Reference & Documentation

For detailed endpoints, request payloads, schemas, and response examples, refer to:
👉 **[API Documentation](file:///d:/Jassir/Personal/Jamal%20Bhai's%20Work/top-ten-tea-be/API_Documentation.md)**

---

## 💡 Future Roadmap

- **Role-Based Access Control (RBAC) Hardening:** Add middleware to strictly protect specific admin routes from delivery staff tokens.
- **Data Export:** Implement API endpoints to generate and download daily settlement reports as PDFs or Excel files.
- **Pagination & Filtering:** Add query-based pagination to endpoints like `/admin/sales` and `/admin/settlements` to handle large datasets efficiently.
