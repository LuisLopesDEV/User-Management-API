# User Management API

REST API for user authentication and protected resource management,  
with secure login, role-based access control, and JWT authentication.

This project simulates a **real-world freelance back-end system**, focusing on  
security, organization, and scalability.

---

## 🛠 Technologies
- Python
- FastAPI
- SQLAlchemy
- MySQL
- JWT (JSON Web Tokens)
- bcrypt
- Pydantic

![Python](https://img.shields.io/badge/Python-3.14-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![Status](https://img.shields.io/badge/Status-In%20Progress-yellow)

---

## ⚙ Features

### 🔐 Authentication
- Login with email and password
- Secure password hashing with bcrypt
- JWT token with expiration
- Logout with token invalidation
- Protected routes using dependency injection

### 👤 Users
- User registration
- Update own profile data
- Secure account deletion with confirmation
- List all users (admin only)

### 📦 Orders
- Create orders (authenticated users)
- View own orders
- Update and delete own orders
- Full access for admin users

### 🔑 Access Control
- Role-based authorization (user / admin)
- Resource ownership validation
- Proper HTTP status codes for errors

---

## 🧠 Concepts Applied
- REST API design
- Separation of concerns
- Secure authentication with JWT
- Password hashing (bcrypt)
- Role-based access control (RBAC)
- Input validation with Pydantic
- SQLAlchemy ORM
- HTTP status code best practices


