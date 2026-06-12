# Aura E-Commerce Store

Aura Store is a premium, modern, and fully functional multi-vendor E-Commerce platform built with Django. It features a complete Role-Based Authentication System with distinct flows for Buyers and Sellers.

## 🌟 Project Overview
Aura Store provides a seamless shopping experience for customers while giving vendors (sellers) a powerful administrative dashboard to manage their catalog, monitor sales, and interact with customers. The platform boasts a beautiful, modern UI built with Bootstrap 5 and custom aesthetics.

---

## 🚀 Features

### Buyer Features
- **Role-Based Login/Registration**: Dedicated tabbed interface for buyer sign-ups.
- **Product Browsing & Search**: Discover products with ease.
- **Shopping Cart & Checkout**: Secure session-based cart management.
- **Wishlist Management**: Save products for later.
- **Order History**: Track past and current orders.
- **Profile Management**: Update personal details.

### Seller / Admin Dashboard Features
- **Secure Access**: Sellers are routed directly to their dashboard (`/dashboard/`) and cannot be accessed by buyers.
- **Analytics Overview**: View total orders, revenue, products, and customers.
- **Catalog Management**: Add, edit, and delete products and categories.
- **Order Management**: Update order statuses (e.g., Shipped, Delivered) and track shipments.
- **Customer Insights**: View customer details and their order history.

---

## 🛠 Technologies Used
- **Backend**: Python 3, Django 6.0
- **Database**: SQLite3 (Development)
- **Frontend**: HTML5, CSS3, Bootstrap 5, JavaScript
- **Icons & Typography**: Bootstrap Icons, Google Fonts (Inter, Outfit)

---

## 📂 System Architecture & Folder Structure
```text
E-Commerce Store/
├── cart/               # Shopping cart logic and session management
├── dashboard/          # Seller/Admin dashboard views and templates
├── ecommerce_store/    # Core project settings and URL routing
├── orders/             # Checkout and order processing
├── products/           # Product catalog, categories, and homepage
├── static/             # CSS, JS, and Images
├── templates/          # Global HTML templates
└── users/              # Authentication, profiles, and role management
```

---

## ⚙️ Installation & Setup

### 1. Environment Setup
Clone the repository and navigate into the project directory:
```bash
cd "E-Commerce Store"
```

Create a virtual environment:
```bash
python -m venv venv
```

Activate the virtual environment:
- **Windows**: `venv\Scripts\activate`
- **macOS/Linux**: `source venv/bin/activate`

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Database Configuration
Run the following commands to apply database migrations and set up the `UserProfile` schemas:
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create an Admin Account
To access the seller/admin dashboard or the Django backend, create a superuser account:
```bash
python manage.py createsuperuser
```

### 5. How to Run the Project
Start the Django development server:
```bash
python manage.py runserver
```
Visit the website at `http://127.0.0.1:8000/`.

---

## 🔐 Authentication Flow
Aura Store uses a robust Role-Based Authentication System via a custom `UserProfile` linked to Django's built-in `User` model.

1. **Sign Up**: Users visit `/users/register/` and select either the **Buyer** or **Seller** tab.
2. **Data Storage**: Sellers are automatically granted `is_staff=True` to access the dashboard.
3. **Login (`/users/login/`)**: Users must log in via the correct tab. 
4. **Redirection**: 
   - Buyers ➡️ Homepage (`/`)
   - Sellers ➡️ Admin Dashboard (`/dashboard/`)

### 🔑 Demo Credentials

**Buyer Account:**
- **Email:** `buyer@test.com`
- **Password:** `Buyer123`

**Seller Account:**
- **Email:** `seller@test.com`
- **Password:** `Seller123`

**Superuser / Global Admin:**
- **Username:** `admin`
- **Password:** `admin123`

---

## 🧪 Testing Summary
A comprehensive audit was performed across UI/UX, Security, Performance, and Code Quality. 
- **Security Check**: Enforced `SECURE_BROWSER_XSS_FILTER` and `X_FRAME_OPTIONS`.
- **Routing Integrity**: Verified that buyers cannot access `/dashboard/` endpoints.

---
