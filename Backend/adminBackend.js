import express from "express";
import session from "express-session";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";
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

// automation task to update overdue books daily at midnight

cron.schedule("0 0 * * *", async () => {
  console.log("Running daily check for overdue books...");

  const updateQuery = `
    UPDATE public.book_issue
    SET status = 'overdue'
    WHERE due_date < CURRENT_DATE 
    AND status != 'returned';
  `;

  try {
    const res = await pool.query(updateQuery);
    console.log(`${res.rowCount} records updated to pending.`);
  } catch (err) {
    console.error("Error running automation task:", err);
  }
});

// multichaining
const IsAdmin = (req, res, next) => {
  if (req.session && req.session.adminId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized: Admin not logged in" });
  }
};

const IsSupervisor = (req, res, next) => {
  if (req.session && req.session.role === "supervisor") {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized: Member not logged in" });
  }
};

//member

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

app.get("/api/members", IsAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT member_id, full_name, email, phone, is_active, gender, date_of_birth 
      FROM public.members 
      ORDER BY member_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch members", details: err.message });
  }
});

app.get("/api/members/view-history/:id", IsAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM book_issue WHERE user_id = $1 ORDER BY issue_id DESC",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "issue Book not found" });
    }
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch member", details: err.message });
  }
});

app.patch("/api/members/toggle-status/:id", IsAdmin, async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  try {
    await pool.query(
      "UPDATE public.members SET is_active = $1 WHERE member_id = $2",
      [is_active, id],
    );
    res.status(200).json({ message: "Status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Update failed", details: err.message });
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

app.put("/api/books/:id", IsAdmin, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    const result = await pool.query(
      "UPDATE books SET quantity = quantity + $1 , available_stock = available_stock + $1 WHERE book_id = $2 RETURNING *",
      [quantity, id],
    );

    res
      .status(200)
      .json({ message: "Stock updated", updatedBook: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.get("/api/books", IsAdmin, async (req, res) => {
  try {
    // Exact columns requested from public.books
    const query = `
      SELECT book_id, title, isbn_number, category_name, author_name, 
             price, quantity, available_stock 
      FROM public.books 
      ORDER BY book_id DESC`;

    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch inventory" });
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

    const pre_Issue = await pool.query(
      "SELECT issue_id FROM public.book_issue where user_id = $1 and book_id = $2 and status = 'Issued'; ",
      [user_id, book_id],
    );

    if (pre_Issue.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "this Member has Already Issued this Book." });
    }

    const user = await pool.query(
      "SELECT member_id , full_name , is_active FROM public.members where member_id = $1 and is_active = true; ",
      [user_id],
    );
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid User ID or not Active" });
    }
    if(!user.rows[0].is_active){
      return res.status(400).json({ message: "User is not Active" });
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

// issue add

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
    await client.query("BEGIN"); // Start transaction

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
      status || "Issued",
      payment_method,
      amount,
    ]);

    const Transaction = await client.query(
      "INSERT INTO public.transactions( user_id, amount, transaction_type, payment_method, reference_id, created_at) VALUES ($1 , $2, $3, $4, $5, $6);",
      [
        user_id,
        amount,
        "receive",
        payment_method,
        issueResult.rows[0].issue_id,
        new Date(),
      ],
    );

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

    await client.query("COMMIT"); // Save changes

    res.status(201).json({
      message: "Book issued successfully",
      data: issueResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK"); // Undo changes if any step fails
    console.error("Issue Error:", error.message);
    res.status(500).json({
      error: "Failed to issue book",
      details: error.message,
    });
  } finally {
    client.release(); // Return connection to pool
  }
});

// issue book get

app.get("/api/issues", async (req, res) => {
  try {
    const showAll = req.query.all === "true";

    let queryText;
    if (showAll) {
      queryText = "SELECT * FROM book_issue ORDER BY issue_id DESC;";
    } else {
      queryText =
        "SELECT * FROM book_issue WHERE status = 'Issued' ORDER BY issue_id DESC;";
    }

    const result = await pool.query(queryText);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Database Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/Book/getDate/:id", IsAdmin, async (req, res) => {
  const { id } = req.params;
  console.log("Fetching Price requested by Admin...");
  try {
    const result = await pool.query(
      "SELECT price	FROM books WHERE book_id = $1;",
      [id],
    );
    res.status(200).json(result.rows[0].price);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

app.post("/api/issue/renew/:id", IsAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    book_id,
    book_name,
    user_id,
    user_name,
    issue_date,
    due_date,
    payment_method,
    amount,
  } = req.body.ReNewData;
  console.log(req.body);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "UPDATE book_issue SET status = 'Returned' , return_date = $1 WHERE issue_id = $2",
      [new Date(), id],
    );

    const insertQuery = `
      INSERT INTO book_issue (
        book_id, book_name, user_id, user_name, 
        issue_date, due_date, 
        status, payment_method, amount, "Renew_Issue_id"
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING issue_id;
    `;

    const values = [
      book_id,
      book_name,
      user_id,
      user_name,
      issue_date,
      due_date,
      "Issued",
      payment_method || "Cash",
      amount,
      id,
    ];

    await client.query(
      "INSERT INTO public.transactions( user_id, amount, transaction_type, payment_method, reference_id, created_at) VALUES ($1 , $2, $3, $4, $5, $6);",
      [user_id, amount, "receive", payment_method || "Cash", id, new Date()],
    );

    const result = await client.query(insertQuery, values);

    await client.query("COMMIT");

    res.status(200).json({
      message: "Book renewed successfully",
      newIssueId: result.rows[0].issue_id,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  } finally {
    client.release();
  }
});

app.post("/api/issue/return/:id", IsAdmin, async (req, res) => {
  const { id } = req.params;
  const { type, amount, user_id } = req.body.modalData;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const issueResult = await client.query(
      "SELECT book_id, user_id FROM book_issue WHERE issue_id = $1 AND status = 'Issued'",
      [id],
    );

    if (issueResult.rows.length === 0) {
      throw new Error("Invalid issue ID or book already returned");
    }

    const { book_id, user_id: db_user_id } = issueResult.rows[0];
    const targetUserId = user_id || db_user_id;

    await client.query(
      "UPDATE book_issue SET status = 'Returned', return_date = $2 WHERE issue_id = $1",
      [id, new Date()],
    );

    await client.query(
      "UPDATE books SET available_stock = available_stock + 1 WHERE book_id = $1",
      [book_id],
    );

    if (type === "OVERDUE") {
      await client.query(
        `INSERT INTO public.transactions 
        (user_id, amount, transaction_type, payment_method, reference_id, created_at) 
        VALUES ($1, $2, 'Penalty', 'Pending', $3, $4)`,
        [targetUserId, amount, id, new Date()],
      );
    } else if (type === "REFUND") {
      const refundAmount = -Math.abs(amount);

      await client.query(
        `INSERT INTO public.transactions 
        (user_id, amount, transaction_type, payment_method, reference_id, created_at) 
        VALUES ($1, $2, 'Refund', 'Wallet', $3, $4)`,
        [targetUserId, refundAmount, id, new Date()],
      );
    }
    // Note: If type is "ON_TIME", no transaction query is executed.

    await client.query("COMMIT");
    res.status(200).json({ message: `Book returned successfully (${type})` });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Return Error:", error.message);
    res
      .status(500)
      .json({ error: "Failed to process return", details: error.message });
  } finally {
    client.release();
  }
});

// transaction get

app.get("/api/Transaction", async (req, res) => {
  console.log("Fetching transactions requested by Admin...");
  try {
    const query = `
            SELECT *
            FROM public.transactions 
            ORDER BY created_at DESC;
        `;

    const result = await pool.query(query);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No transactions found" });
    }
    const getUserNames = async (transactions) => {
      const userIds = [...new Set(transactions.map((txn) => txn.user_id))];
      const userQuery = `
                SELECT member_id, full_name 
                FROM public.members 
                WHERE member_id = ANY($1);
            `;
      const userResult = await pool.query(userQuery, [userIds]);
      const userMap = {};
      userResult.rows.forEach((user) => {
        userMap[user.member_id] = user.full_name;
      });
      return transactions.map((txn) => ({
        ...txn,
        user_name: userMap[txn.user_id] || "Unknown User",
      }));
    };
    const transactionsWithNames = await getUserNames(result.rows);
    // Return results as JSON
    res.status(200).json(transactionsWithNames);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error while fetching transactions" });
  }
});

// dashboard stats

app.get("/api/admin/dashboard-stats", IsAdmin, async (req, res) => {
  try {
    const totalMembersResult = await pool.query(
      "SELECT COUNT(*) FROM members WHERE is_active = true",
    );
    const totalBooksResult = await pool.query("SELECT COUNT(*) FROM books");
    const totalIssuedBooksResult = await pool.query(
      "SELECT COUNT(*) FROM book_issue WHERE status = 'Issued'",
    );
    const totalRevenueResult = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total_revenue FROM transactions ",
    );
    const today = new Date().toLocaleDateString("en-CA"); // Outputs 'YYYY-MM-DD' correctly in local time

    const totalTodayReturn = await pool.query(
      "SELECT * FROM book_issue WHERE due_date <= $1 AND status = 'Issued'",
      [today],
    );

    console.log("Dashboard stats fetched successfully");
    // console.log(totalTodayReturn.rows);
    res.status(200).json({
      totalMembers: parseInt(totalMembersResult.rows[0].count, 10),
      totalBooks: parseInt(totalBooksResult.rows[0].count, 10),
      totalIssuedBooks: parseInt(totalIssuedBooksResult.rows[0].count, 10),
      totalRevenue: parseFloat(totalRevenueResult.rows[0].total_revenue),
      totalTodayReturn: totalTodayReturn.rows,
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch dashboard stats", details: err.message });
  }
});

app.get("/api/admin/profile", IsAdmin, (req, res) => {
  if (req.session.adminId) {
    return res.json({
      adminId: req.session.adminId,
      adminName: req.session.adminName,
      role: req.session.role,
      phone: req.session.phone,
      email: req.session.email,
    });
  }
  res.status(401).json({ loggedIn: false });
});

app.post("/api/admin/change-password", IsAdmin, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const adminId = req.session.adminId; // Assuming adminId is stored in session

  try {
    // 1. Fetch current admin details from DB
    const adminQuery = await pool.query(
      "SELECT password FROM admins WHERE admin_id = $1",
      [adminId]
    );

    if (adminQuery.rows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const currentHashedPassword = adminQuery.rows[0].password;

    // 2. Verify if the 'oldPassword' matches the one in DB
    const isMatch = await bcrypt.compare(oldPassword, currentHashedPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    // 3. Hash the new password
    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 4. Update the password in the database
    await pool.query(
      "UPDATE admins SET password = $1 WHERE admin_id = $2",
      [newHashedPassword, adminId]
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during password change" });
  }
});

app.get("/api/admin/Employees", IsSupervisor, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT admin_id, full_name, email, role, phone , is_active
      FROM public.admins 
      ORDER BY admin_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch employees", details: err.message });
  }
});

app.patch("/api/admin/employee/status/:id", async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  console.log("Updating employee status:", id, is_active);
  try {
    await pool.query(
      "UPDATE admins SET is_active = $1 WHERE admin_id = $2",
      [is_active, id]
    );
    res.status(200).json({ message: "Status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// admin auth

app.post("/api/admin/signup", IsSupervisor, async (req, res) => {
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

    if (!result.rows[0].is_active) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Save session
    req.session.adminId = admin.admin_id;
    req.session.role = admin.role;
    req.session.adminName = admin.full_name;
    req.session.phone = admin.phone;
    req.session.email = admin.email;

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
  if (req.session.userId || req.session.adminId) {
    return res.json({
      loggedIn: true,
      adminId: req.session.adminId,
      adminName: req.session.adminName,
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
