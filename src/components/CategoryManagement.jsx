import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CategoryIcon from "@mui/icons-material/Category";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const CategoryManagement = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories", {
        withCredentials: true,
      });
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  useEffect(() => {
    document.title = "Category Management";
    fetchCategories();
  }, []);

  // Handle adding a new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlreadyExists(false); // Reset error state on submit

    try {
      const res = await axios.post(
        "http://localhost:5000/api/categories/add",
        { category_name: categoryName },
        { withCredentials: true }
      );

      if (res.status === 201) {
        setCategoryName("");
        fetchCategories();
        setSuccessMessage("Category added successfully!");
        setTimeout(() => {
          setSuccessMessage();
        }, 5000);
      }
    } catch (err) {
      // Axios stores the response status in err.response.status
      if (err.response && err.response.status === 409) {
        setAlreadyExists(true);
      } else {
        alert("Failed to add category. Check server logs.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`http://localhost:5000/api/categories/${id}`, {
          withCredentials: true,
        });
        fetchCategories();
      } catch (err) {
        alert(
          "Cannot delete category. It might be linked to existing books.",
          err
        );
      }
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold text-dark d-flex align-items-center">
          <CategoryIcon className="me-2 text-primary" fontSize="large" />
          Genre & Category Management
        </h4>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon className="me-1" fontSize="small" /> Back to Dashboard
        </button>
      </div>

      <div className="row g-4">
        {/* Form for Adding Category */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold py-3">
              Add New Genre
            </div>
            <div className="card-body">
              <form onSubmit={handleAddCategory}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted text-uppercase">
                    Genre Name
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      alreadyExists ? "is-invalid" : ""
                    }`}
                    placeholder="e.g. Science Fiction"
                    value={categoryName}
                    required
                    onChange={(e) => {
                      setCategoryName(e.target.value);
                      if (alreadyExists) setAlreadyExists(false); // Clear error while typing
                    }}
                  />
                  {/* Visual feedback for the user */}
                  {alreadyExists && (
                    <div className="invalid-feedback">
                      This category already exists.
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-bold py-2"
                  disabled={loading}
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      <AddCircleIcon className="me-2" /> Save Genre
                    </>
                  )}
                </button>

                {successMessage && (
                  <h6 className="mt-2 text-success">{successMessage}</h6>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* List Table */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold py-3 d-flex justify-content-between align-items-center">
              <span>Available Genres</span>
              <span className="badge bg-primary rounded-pill">
                {categories.length} Total
              </span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">ID</th>
                      <th>Genre Name</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <tr key={cat.category_id}>
                          <td className="ps-4 text-muted small">
                            #{cat.category_id}
                          </td>
                          <td className="fw-medium text-dark">
                            {cat.category_name}
                          </td>
                          <td className="text-end pe-4">
                            <button
                              className="btn btn-outline-danger btn-sm border-0"
                              onClick={() => handleDelete(cat.category_id)}
                            >
                              <DeleteSweepIcon />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-5 text-muted">
                          No categories found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
