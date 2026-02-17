import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chip } from "@mui/material";
const MyBook = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:3000/Books", {
          withCredentials: true,
        });

        setBooks(res.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        Loading your library...
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen container mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        My Book Issues
      </h2>
      <hr className="mb-8" />

      <div className="d-flex flex-wrap gap-2 align-items-start justify-content-start align-self-start">
        {books && books.length > 0 ? (
          books.map((book, index) => (
            <div
              key={book.issue_id || index}
              style={{
                width: "250px",
                backgroundColor: "wheat",
                padding: "20px",
                margin: "20px",
                borderRadius: "15px",
              }}
            >
              {/* Top: Index & Badge */}
              <div className="flex justify-between items-center mb-3">
                <Chip
                  label={book.status}
                  color={
                    book.status === "Pending"
                      ? "error"
                      : book.status === "Returned"
                        ? "success"
                        : book.status === "Issued"
                          ? "warning"
                          : "default"
                  }
                  size="small"
                  sx={{ fontWeight: "bold", fontSize: "10px" }}
                />
              </div>

              <div className="mb-4">
                <h3 className="text-md font-bold text-gray-900 leading-tight mb-1">
                  {book.book_name}
                </h3>
                <p className="text-xs text-gray-500">Book ID: {book.book_id}</p>
              </div>

              <div className="space-y-2 border-t border-gray-50 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Issued:</span>
                  <span className="font-medium">
                    {new Date(book.issue_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Due:</span>
                  <span className="font-medium text-red-500">
                    {new Date(book.due_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800 me-3">
                  ₹{book.amount}
                </span>
                <button className="btn btn-light">Details</button>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full p-10 text-center text-gray-500">
            No books found in your library
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBook;
