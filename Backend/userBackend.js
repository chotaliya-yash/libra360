import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import cors from "cors";

const app = express();

// --- 1. Middleware Hierarchy (Crucial) ---
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. Session Configuration ---
app.use(
  session({
    name: "lib_session",
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS/Production
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  }),
);

// --- 3. Passport Initialization ---
app.use(passport.initialize());
app.use(passport.session());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "booksheif1",
  password: "123",
  port: 5432,
});

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

app.get("/Books", isAuthenticated, async (req, res) => {
  const userId = req.user.member_id;
  console.log("Fetching books requested by User...");
  try {
    const result = await pool.query(
      "SELECT * FROM book_issue where user_id = $1 ORDER BY created_at DESC;",[userId]
    );
    if(result.rows.length === 0){
      return res.status(404).json({ message: "No books found" });
    }
    console.log(result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- 4. Passport Strategy Logic ---
passport.use(
  "member-local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const result = await pool.query(
          "SELECT * FROM members WHERE email = $1",
          [email],
        );
        if (result.rows.length === 0)
          return done(null, false, { message: "User not found" });

        const user = result.rows[0];
        if (!user.is_active)
          return done(null, false, { message: "Account deactivated" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: "Invalid password" });

        return done(null, user); // Success: passes user to serializeUser
      } catch (err) {
        return done(err);
      }
    },
  ),
);

// How to store user in session
passport.serializeUser((user, done) => {
  done(null, user.member_id);
});

// How to retrieve user from session
passport.deserializeUser(async (id, done) => {
  try {
    const res = await pool.query("SELECT * FROM members WHERE member_id = $1", [
      id,
    ]);
    done(null, res.rows[0]);
  } catch (err) {
    done(err);
  }
});

// --- 5. Routes ---

// Updated Login using Passport
app.post("/api/member/login", (req, res, next) => {
  passport.authenticate("member-local", (err, user, info) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (!user) return res.status(401).json({ message: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({
        message: "Login successful",
        user: { id: user.member_id, name: user.full_name },
      });
    });
  })(req, res, next);
});

// Check Auth Status (The "Me" endpoint)
app.get("/api/member/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({
      loggedIn: true,
      user: {
        memberId: req.user.member_id,
        memberName: req.user.full_name,
        email: req.user.email,
      },
    });
  } else {
    res.status(200).json({ loggedIn: false });
  }
});

// Logout
app.post("/api/member/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("lib_session");
    res.status(200).json({ message: "Logged out" });
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));
