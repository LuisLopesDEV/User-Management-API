# User Management API

RESTful API for user authentication and protected resource management,  
designed to simulate a real-world back-end system with focus on security, access control, and clean design principles.

This project emphasizes practical back-end concerns such as authentication, authorization, resource ownership, and database integration.

---

## 🛠 Technologies

- Python
- FastAPI
- SQLAlchemy
- MySQL
- JWT (JSON Web Tokens)
- bcrypt
- Pydantic

![Python](https://img.shields.io/badge/Python-3.11+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Production_Ready-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![Status](https://img.shields.io/badge/Status-Active_Development-orange)

---

## ⚙ Features

### 🔐 Authentication
- Login with email and password
- Secure password hashing using bcrypt
- JWT-based authentication
- Token expiration control
- Protected routes via dependency injection

### 👤 Users
- User registration
- Profile update (authenticated users)
- Secure account deletion
- List users (admin only)

### 📦 Orders
- Create orders (authenticated users)
- View own orders
- Update and delete own orders
- Administrative access control

### 🔑 Access Control
- Role-based authorization (user / admin)
- Resource ownership validation
- Consistent HTTP status codes

---

## 🧠 Concepts Applied

- RESTful API design
- Separation of concerns
- JWT authentication flow
- Password hashing (bcrypt)
- Role-Based Access Control (RBAC)
- Resource ownership enforcement
- Input validation with Pydantic
- SQLAlchemy ORM usage
- HTTP status code best practices

---

## 🔐 Authentication Design Notes

This project currently uses JWT tokens combined with server-side persistence.

During the front-end integration phase, token validation is handled through database verification (active / expiration).

Middleware-based cryptographic validation (JWT signature and claims verification) is planned as part of the client integration refinement stage.

This design reflects an incremental development workflow commonly used in real-world applications.

---

## 📁 Project Structure

Back-End/

- main.py  
- config.py  

Database/

- database.py  
- models.py  

Routes/

- auth.py  
- users.py  
- requestes.py  
- resources.py  

Root files:

- schemas.py  
- security.py  

---

## ▶ How to Run

### 1) Clone repository

git clone <repo_url>  
cd User-Management-API

---

### 2) Configure environment variables

Create a `.env` file:

DATABASE_URL=mysql+pymysql://user:password@localhost:3306/App  
SECRET_KEY=your_secret_key  
ALGORITHM=HS256  
ACCESS_TOKEN_EXPIRES_MINUTES=30  

---

### 3) Install dependencies

pip install -r requirements.txt

---

### 4) Run the application

uvicorn Back-End.main:app --reload

---

### 5) Access API documentation

http://localhost:8000/docs

---

## 📌 Notes

This project was developed for study and portfolio purposes,  
simulating realistic back-end scenarios including:

- Authentication flows
- Authorization rules
- Database-backed resources
- Access restrictions

The focus is on practical backend engineering concerns, not UI.
