import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const BookManagement = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch books matching your specific columns
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/books", {
        withCredentials: true,
      });
      setBooks(res.data);
    } catch (err) {
      console.error("Error fetching books", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Filter books based on title or ISBN
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn_number.includes(searchTerm)
  );

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await axios.delete(`http://localhost:5000/api/books/${id}`, {
          withCredentials: true,
        });
        fetchBooks();
      } catch (err) {
        console.log(err);
        alert("Error deleting book.");
      }
    }
  };

  return (
    <div className="container mt-4 mb-5">
      {/* Header Section */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold text-dark d-flex align-items-center">
          <MenuBookIcon className="me-2 text-primary" fontSize="large" />
          Book Inventory Management
        </h4>
        <div className="d-flex gap-2">
          <button className="btn btn-primary d-flex align-items-center" onClick={() => navigate("/admin/add-book")}>
            <AddIcon className="me-1" /> Add New Book
          </button>
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            <ArrowBackIcon fontSize="small" /> Back
          </button>
        </div>
      </div>

      {/* Search and Stats Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <SearchIcon className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search by Title or ISBN..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end mt-3 mt-md-0">
              <span className="me-3">Total Titles: <strong>{books.length}</strong></span>
              <span>Available Stock: <strong>{books.reduce((acc, curr) => acc + curr.available_stock, 0)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-nowrap">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">ID</th>
                  <th>Title & ISBN</th>
                  <th>Author / Category</th>
                  <th>Price</th>
                  <th>Stock Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-5">Loading Inventory...</td></tr>
                ) : filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                    <tr key={book.book_id}>
                      <td className="ps-4 text-muted small">#{book.book_id}</td>
                      <td>
                        <div className="fw-bold text-dark">{book.title}</div>
                        <div className="small text-muted">ISBN: {book.isbn_number}</div>
                      </td>
                      <td>
                        <div className="small"><strong>Auth:</strong> {book.author_name}</div>
                        <div className="small text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>{book.category_name}</div>
                      </td>
                      <td className="fw-medium text-success">₹{book.price}</td>
                      <td>
                        <div className="progress mb-1" style={{ height: '6px', width: '100px' }}>
                          <div 
                            className={`progress-bar ${book.available_stock > 0 ? 'bg-success' : 'bg-danger'}`} 
                            style={{ width: `${(book.available_stock / book.quantity) * 100}%` }}
                          ></div>
                        </div>
                        <span className="small text-muted">{book.available_stock} / {book.quantity} available</span>
                      </td>
                      <td className="text-center">
                        <button 
                          className="btn btn-outline-danger btn-sm border-0" 
                          onClick={() => handleDelete(book.book_id)}
                        >
                          <DeleteOutlineIcon />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">No books found matching your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookManagement;