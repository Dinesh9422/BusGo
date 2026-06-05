# 🚌 BusGo — Full Stack Bus Reservation System

A production-ready bus ticket booking platform built with **Django REST Framework** + **React JS** + **MySQL**.

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Django 4.2, Django REST Framework |
| Auth      | JWT (SimpleJWT)                   |
| Database  | MySQL                             |
| Frontend  | React 18, React Router v6         |
| Styling   | Custom CSS (Sora + DM Sans fonts) |
| PDF       | ReportLab                         |
| Email     | Django SMTP (Gmail)               |

---

## ✨ Features

- 🔐 JWT Authentication (Register / Login / Logout)
- 🔍 Search buses by route, date, and bus type
- 💺 Visual seat selection map
- 🎫 Booking with passenger details
- 💳 Dummy Payment Gateway (Card / UPI / Net Banking / Wallet)
- 📄 PDF ticket download
- ❌ Booking cancellation with refund flow
- 📧 Email notifications (Welcome, Booking confirmation, Cancellation)
- 👤 User dashboard with booking history
- 🛡️ Admin panel — manage buses, routes, bookings, payments

---

## 🚀 Setup Instructions

### 1. Clone & Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env
# Edit .env with your MySQL credentials and Gmail SMTP details

# Create MySQL database
mysql -u root -p
CREATE DATABASE bus_reservation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (Admin)
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

Backend runs at: `http://localhost:8000`
Django Admin: `http://localhost:8000/admin`

---

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start React dev server
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 📁 Project Structure

```
bus-reservation/
├── backend/
│   ├── accounts/         # User auth (register, login, profile)
│   ├── buses/            # Bus, Route, Schedule, Trip models
│   ├── bookings/         # Booking logic + PDF ticket
│   ├── payments/         # Dummy payment gateway
│   ├── templates/emails/ # HTML email templates
│   ├── config/           # Django settings, URLs
│   ├── .env.example      # Environment variables template
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── pages/        # HomePage, SearchPage, BookingPage
    │   │   ├── auth/     # LoginPage, RegisterPage
    │   │   ├── user/     # DashboardPage
    │   │   └── admin/    # AdminDashboard
    │   ├── components/   # Navbar, common components
    │   ├── context/      # AuthContext (JWT management)
    │   ├── utils/        # api.js (Axios + interceptors)
    │   └── index.css     # Global styles
    └── public/
```

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint               | Description       |
|--------|------------------------|-------------------|
| POST   | /api/auth/register/    | Register new user |
| POST   | /api/auth/login/       | Login + get tokens|
| POST   | /api/auth/logout/      | Logout            |
| GET    | /api/auth/profile/     | Get profile       |
| PATCH  | /api/auth/profile/     | Update profile    |

### Buses
| Method | Endpoint                | Description         |
|--------|-------------------------|---------------------|
| GET    | /api/buses/search/      | Search trips        |
| GET    | /api/buses/trips/:id/   | Trip details        |
| GET    | /api/buses/routes/      | All routes          |

### Bookings
| Method | Endpoint                       | Description        |
|--------|--------------------------------|--------------------|
| POST   | /api/bookings/create/          | Create booking     |
| GET    | /api/bookings/my-bookings/     | User's bookings    |
| POST   | /api/bookings/:id/cancel/      | Cancel booking     |
| GET    | /api/bookings/:id/download-ticket/ | PDF ticket    |

### Payments
| Method | Endpoint                | Description         |
|--------|-------------------------|---------------------|
| POST   | /api/payments/initiate/ | Process payment     |
| GET    | /api/payments/history/  | Payment history     |

---

## 📧 Email Setup (Gmail)

1. Go to Google Account → Security → App Passwords
2. Generate an App Password
3. Add to `.env`:
```
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

---

## 🎨 UI Pages

| Page           | Route          | Access  |
|----------------|----------------|---------|
| Home           | /              | Public  |
| Search Buses   | /search        | Public  |
| Login          | /login         | Public  |
| Register       | /register      | Public  |
| Book a Seat    | /book/:tripId  | Auth    |
| My Dashboard   | /dashboard     | Auth    |
| Admin Panel    | /admin         | Admin   |

---

## 💡 Portfolio Tips

- Add sample data via Django Admin (`/admin`)
- Create a superuser to access Admin Panel
- Add 2-3 bus operators, routes, buses, schedules and trips via Admin
- Then test the full booking flow from frontend

---

*Built with ❤️ — BusGo, India's Trusted Bus Booking Platform*
