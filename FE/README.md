# 🚌 ZentroBus - Interprovincial Bus Ticket Sales System

ZentroBus is a full-stack web application for booking interprovincial bus tickets online. It supports customer ticket purchasing, operator route management, and admin-level revenue analytics.

## 🔧 Technologies Used

### Frontend
- **React + Vite**
- **TypeScript**
- **Tailwind CSS**
- **ShadCN/UI**
- **Lucide Icons**
- **React Router**

### Backend
- **Node.js + Express**
- **TypeScript**
- **SQL Server**
- **JWT Authentication**
- **RESTful API architecture**

---

## 📁 Project Structure

```bash
frontend/
├── src/
├── components/
│ └── ui/ # UI components like Button, Card, Input...
├── hooks/ # Custom React hooks
├── pages/ # Pages used in routing
│ ├── Index.tsx # Landing Page
│ ├── Login.tsx # Login Page
│ ├── Register.tsx # Register Page
│ ├── ForgotPassword.tsx # Forgot Password
│ ├── AdminDashboard.tsx # Admin Dashboard
│ ├── AdminCustomersPage.tsx # Manage Customers
│ ├── AdminRevenuePage.tsx # Revenue Overview
│ ├── TripSearchPage.tsx # Search Trips
│ └── VipSeatSelectionPage.tsx # VIP Seat Select UI
├── App.tsx # Main Routing File
├── main.tsx # Entry point
└── index.css # Global styles
```

```bash
backend/
├── src/
├── config/ # DB config
├── controllers/ # Business logic
├── middlewares/ # Auth, error handling...
├── models/ # SQL models
├── providers/ # Email/SMS services
├── routes/
│ ├── authRoutes.js # /api/auth/*
│ └── busTripRoutes.js # /api/bus-trips/*
├── services/ # Logic helpers
├── sockets/ # Real-time (if any)
├── utils/ # Utility functions
├── validations/ # Input validations
└── server.js # Express server entry
```

---

## 🚀 Features

### 👤 Customer
- Register & Login
- Search for trips (by route & date)
- Seat selection with real-time UI
- Make payment and receive e-ticket
- View & cancel bookings

### 🧑‍💼 Operator
- Manage buses, routes, schedules
- View ticket sales & revenue
- Monitor seat occupancy per trip

### 👨‍💻 Admin
- User management (customers, operators)
- Revenue dashboard (daily/monthly/yearly)
- View recent bookings
- Approve or suspend operators

---

## ⚙️ How to Run

### 1. Clone the project

```bash
git clone https://github.com/yourusername/zentrobus.git
cd zentrobus
```

### 2. Setup Backend

```bash
cd backend
npm install
npm run dev
# Make sure SQL Server is running and DB is configured correctly
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to view the application.

---

## 📸 Screenshots

> *(You can place screenshots in `/public/screenshots/` and insert them below)*

- 💻 Admin Dashboard  
- 📊 Revenue Charts  
- 🧾 Booking History  
- 🎫 Seat Selection UI  

---

## 📌 Environment Variables

Create a `.env` file in the backend root:

```env
PORT=5000
DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=yourpassword
DB_NAME=BusTicketSystem
JWT_SECRET=your-secret-key
```

---

## 📄 License

This project is licensed under the MIT License.
