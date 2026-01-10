import express from "express";
import session from "express-session";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5000'],
    credentials: true,
  })
);

app.use(
  session({
    name: "admin_session",
    secret: "user_info",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 5, // 5 hours
    },
  })
);

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "booksheif1",
  password: "123", // move to .env in production
  port: 5432,
});

app.post("/api/admin/signup", async (req, res) => {
  const { full_name, email, password, role, phone } = req.body;

  try {
    // Check if admin already exists
    const existing = await pool.query(
      "SELECT admin_id FROM admins WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO admins (full_name, email, password, role, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING admin_id`,
      [full_name, email, hashedPassword, role, phone]
    );

    res.status(201).json({
      message: "Admin created successfully",
      adminId: result.rows[0].admin_id,
    });
  } catch (err) {
    res.status(500).json({ error: "Signup failed", details: err.message });
  }
});

app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
    console.log(email, password);
  try {
    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Save session
    req.session.adminId = admin.admin_id;
    req.session.role = admin.role;

    res.status(200).json({
      message: "Login successful",
      user: {
        id: admin.admin_id,
        name: admin.full_name,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

app.get("/api/admin/me", (req, res) => {
  if (req.session.adminId) {
    return res.json({
      loggedIn: true,
      adminId: req.session.adminId,
      role: req.session.role,
    });
  }
  res.status(401).json({ loggedIn: false });
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("admin_session");
    res.json({ message: "Logged out successfully" });
  });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
