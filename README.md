# 🚀 Application Setup and Run Instructions

## 🔗 Project Repository

[https://github.com/chotaliya-yash/libra360](https://github.com/chotaliya-yash/libra360)

---

## 1️⃣ Database Setup

* Import the database file:

  ```bash
  Database/db.sql
  ```
* Load it into your **PostgreSQL** database instance.

---

## 2️⃣ Dependency Installation

1. Open your terminal or command prompt.

2. Install all project dependencies:

   ```bash
   npm ci
   ```

---

## 3️⃣ Run the Application

You will need **three separate terminal windows** to run all components simultaneously.

### ▶️ Terminal 1 – Frontend

```bash
npm run dev
```

* Starts the frontend development server
* Typically uses tools like Vite or Webpack

---

### ▶️ Terminal 2 – User Backend

```bash
cd Backend
nodemon userBackend.js
```

* Starts the user backend server
* Uses **nodemon** for auto-restart on file changes

---

### ▶️ Terminal 3 – Admin Backend

```bash
cd Backend
nodemon adminBackend.js
```

* Starts the admin backend server
* Runs separately from the user backend

---

## ✅ Notes

* Ensure **PostgreSQL** is running before starting the backend.
* Make sure all environment variables (if any) are configured properly.
* Install nodemon globally if not already installed:

  ```bash
  npm install -g nodemon
  ```

---

![Dashboard](./screenshots/admin_dashboard.png)