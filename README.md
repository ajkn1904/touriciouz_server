# 🗺️ Touriciouz - Backend

## 🎯 Project Overview
A secure, scalable backend API for the Travel Agency  Platform built with Express.js, Prisma, PostgreSQL and TypeScript. Features role-based authentication, booking management, and payment processing.

---

## 🛠️ Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: Postgres
- **Authentication**: JWT
- **Validation**: Zod
- **Security**: bcryptjs, cors
- **Payments**: SSLCommerz integration
- **File Upload**: Multer + Cloudinary

---

## 🚀 Quick Start

### Installation
```bash
# Initialize project
npm init -y
npm i -D typescript
tsc --init
# Install core dependencies
npm install express cors zod jsonwebtoken dotenv bcryptjs
npm install cookie-parser
npm install cloudinary multer
npm install -D typescript ts-node-dev @types/node
npm install -D @types/express @types/cors @types/jsonwebtoken
npm install -D @types/bcryptjs @types/cookie-parser
npm install -D eslint @typescript-eslint/eslint-plugin
npm i bcryptjs
npm i -D @types/bcryptjs
```

---


### 🌐 API Endpoints


| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Register user (Tourist/Guide) |
| POST | `/api/auth/login` | Login user |
| GET | `/api/user/:id` | Get public profile |
| PATCH | `/api/user/:id` | Update user profile |
| GET | `/api/tours` | Search/Filter tours |
| PATCH | `/api/tours/:id` | Update tour |
| DELETE | `/api/tours/:id` | Delete tour  |
| POST | `/api/bookings` | Request a booking |
| PATCH | `/api/bookings/:id` | Accept/Reject booking |
| POST | `/api/reviews` | Submit a review |
| POST | `/api/payments/booking` | Pay for booking |