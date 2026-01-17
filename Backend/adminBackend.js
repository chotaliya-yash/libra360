import express from "express";
import session from "express-session";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5000",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
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
  }),
);

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "booksheif1",
  password: "123", // move to .env in production
  port: 5432,
});

// multichaining
const IsAdmin = (req, res, next) => {
  if (req.session && req.session.adminId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized: Admin not logged in" });
  }
};

app.post("/api/admin/Register-member", IsAdmin, async (req, res) => {
  const {
    full_name,
    email,
    password,
    phone,
    is_active,
    gender,
    home_address,
    date_of_birth,
  } = req.body;

  const client = await pool.connect();

  try {
    // Start Transaction
    await client.query("BEGIN");

    // 1. Check if email exists in the 'members' table
    const existing = await client.query(
      "SELECT email FROM members WHERE email = $1 FOR UPDATE",
      [email],
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Email already registered" });
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert into 'members' table
    const insertQuery = `
            INSERT INTO members (
                full_name, email, password, phone, 
                is_active, gender, home_address, date_of_birth
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING member_id, full_name, email
        `;

    const result = await client.query(insertQuery, [
      full_name,
      email,
      hashedPassword,
      phone,
      is_active ?? true,
      gender,
      home_address,
      date_of_birth,
    ]);

    // 4. Commit Changes
    await client.query("COMMIT");

    res.status(201).json({
      message: "Member registered successfully",
      member: result.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Registration error:", err);
    res.status(500).json({
      error: "Registration failed",
      details: err.message,
    });
  } finally {
    client.release();
  }
});

app.post("/api/categories/add", IsAdmin, async (req, res) => {
  try {
    const { category_name } = req.body;
    // Safety check
    if (!category_name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    console.log("Adding category:", category_name);

    const existing = await pool.query(
      "SELECT category_id FROM categories WHERE category_name = $1",
      [category_name],
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const result = await pool.query(
      "INSERT INTO categories (category_name) VALUES ($1) RETURNING *",
      [category_name],
    );

    res.status(201).json({
      message: "Category added successfully",
      category: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.delete("/api/categories/:id", IsAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // Attempt to delete the category
    const result = await pool.query(
      "DELETE FROM categories WHERE category_id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    // Check for foreign key constraint violation
    if (err.code === "23503") {
      return res.status(400).json({
        message:
          "Cannot delete category. It might be linked to existing books.",
      });
    }
    res
      .status(500)
      .json({ error: "Failed to delete category", details: err.message });
  }
});

app.get("/api/categories", IsAdmin, async (req, res) => {
  console.log("Fetching categories");
  try {
    const result = await pool.query("SELECT * FROM categories");
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }
    res.json(result.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch categories", details: error.message });
  }
});

app.post("/api/authors/add", IsAdmin, async (req, res) => {
  try {
    const { author_name } = req.body;

    if (!author_name) {
      return res.status(400).json({ message: "Author name is required" });
    }

    console.log("Adding author:", author_name);

    const existing = await pool.query(
      "SELECT author_id FROM authors WHERE author_name = $1",
      [author_name],
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Author already exists" });
    }

    const result = await pool.query(
      "INSERT INTO authors (author_name) VALUES ($1) RETURNING *",
      [author_name],
    );

    res.status(201).json({
      message: "Author added successfully",
      author: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.get("/api/authors", IsAdmin, async (req, res) => {
  console.log("Fetching authors");
  try {
    const result = await pool.query("SELECT * FROM authors");
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No authors found" });
    }
    res.status(201).json(result.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch authors", details: error.message });
  }
});

app.delete("/api/authors/:id", IsAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    console.log("Deleting author with ID:", id);
    const result = await pool.query(
      "DELETE FROM authors WHERE author_id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Author not found" });
    }

    res.json({ message: "Author deleted successfully" });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({
        message: "Cannot delete. Author might be linked to existing books.",
      });
    }
    res
      .status(500)
      .json({ error: "Failed to delete author", details: err.message });
  }
});

app.get("/admin/auther-category", IsAdmin, async (req, res) => {
  console.log("fetching authors and categories");
  try {
    const authors = await pool.query("SELECT * FROM authors");
    const categories = await pool.query("SELECT * FROM categories");
    if (!authors.rows.length && !categories.rows.length) {
      return res
        .status(404)
        .json({ message: "No authors or categories found" });
    }
    res
      .status(200)
      .json({ authors: authors.rows, categories: categories.rows });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// book

app.post("/api/books/add", IsAdmin, async (req, res) => {
  const { title, isbn_number, category_id, author_id, price, quantity } =
    req.body;
  try {
    const isbnCheck = await pool.query(
      "SELECT book_id FROM books WHERE isbn_number = $1",
      [isbn_number],
    );

    if (isbnCheck.rows.length > 0) {
      return res.status(409).json({
        message: "A book with this ISBN already exists in the library.",
      });
    }
    console.log("Adding book:", title);
    const newBook = await pool.query(
      "INSERT INTO books (title , isbn_number ,category_name, author_name, price , quantity , available_stock) VALUES ($1, $2, $3, $4, $5, $6 , $7) RETURNING *",
      [title, isbn_number, category_id, author_id, price, quantity, quantity],
    );
    res
      .status(201)
      .json({ message: "Book added successfully", newBook: newBook.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// issues verify

app.post("/api/book-issue/verifyDetails", IsAdmin, async (req, res) => {
  const { user_id, book_id, issue_date, due_date } = req.body;
  console.log(
    "verify detaiils : " +
      user_id +
      " " +
      book_id +
      " " +
      issue_date +
      " " +
      due_date,
  );
  try {
    if (user_id === "" && book_id === "") {
      return res
        .status(400)
        .json({ message: "User ID and Book ID cannot be empty" });
    }

    const user = await pool.query(
      "SELECT member_id , full_name FROM public.members where member_id = $1 and is_active = true; ",
      [user_id],
    );
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid User ID or not Active" });
    }
    const bookVerify = await pool.query(
      "SELECT book_id , title , isbn_number,  price, quantity, available_stock FROM books where book_id = $1 and quantity > 0; ",
      [book_id],
    );
    if (bookVerify.rows.length === 0) {
      return res.status(400).json({ message: "Invalid Book ID" });
    }
    if (bookVerify.rows[0].available_stock < 1) {
      return res.status(400).json({ message: "Book is not available" });
    }
    const calculation = Math.ceil(
      (new Date(due_date) - new Date(issue_date)) / (1000 * 60 * 60 * 24),
    );
    res.status(200).json({
      user_id: user.rows[0].member_id,
      user_name: user.rows[0].full_name,
      book_id: bookVerify.rows[0].book_id,
      book_name: bookVerify.rows[0].title,
      price: bookVerify.rows[0].price,
      amount: bookVerify.rows[0].price * calculation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

app.post("/api/book-issue/add", IsAdmin, async (req, res) => {
  const {
    user_id,
    user_name,
    book_id,
    book_name,
    issue_date,
    due_date,
    amount,
    payment_method,
    status,
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start transaction

    // 1. Insert the record into book_issue
    // total_days and return_date are handled as null initially
    const issueQuery = `
      INSERT INTO public.book_issue(
        book_id, book_name, user_id, user_name, 
        issue_date, due_date, status, payment_method, amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`;

    const issueResult = await client.query(issueQuery, [
      book_id,
      book_name,
      user_id,
      user_name,
      issue_date,
      due_date,
      status || 'Issued',
      payment_method,
      amount
    ]);

    // 2. Update the Books table to decrease available_stock
    const updateStockQuery = `
      UPDATE books 
      SET available_stock = available_stock - 1 
      WHERE book_id = $1 AND available_stock > 0
      RETURNING available_stock`;

    const stockResult = await client.query(updateStockQuery, [book_id]);

    if (stockResult.rows.length === 0) {
      throw new Error("Book out of stock or invalid Book ID");
    }

    await client.query('COMMIT'); // Save changes

    res.status(201).json({
      message: "Book issued successfully",
      data: issueResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK'); // Undo changes if any step fails
    console.error("Issue Error:", error.message);
    res.status(500).json({ 
      error: "Failed to issue book", 
      details: error.message 
    });
  } finally {
    client.release(); // Return connection to pool
  }
});

app.post("/api/admin/signup", async (req, res) => {
  const { full_name, email, password, role, phone } = req.body;

  try {
    // Check if admin already exists
    const existing = await pool.query(
      "SELECT admin_id FROM admins WHERE email = $1",
      [email],
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO admins (full_name, email, password, role, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING admin_id`,
      [full_name, email, hashedPassword, role, phone],
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
