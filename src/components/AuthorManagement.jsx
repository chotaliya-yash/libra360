import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const AuthorManagement = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [authorName, setAuthorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch all authors
  const fetchAuthors = async () => {
    try {
      // alert("Fetching authors...");
      await axios
        .get("http://localhost:5000/api/authors", {
          withCredentials: true,
        })
        .then((res) => {
          setAuthors(res.data);
        });
    } catch (err) {
      console.error("Error fetching authors", err);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  // Handle adding a new author
  const handleAddAuthor = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlreadyExists(false);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/authors/add",
        { author_name: authorName },
        { withCredentials: true }
      );

      if (res.status === 201) {
        setAuthorName("");
        fetchAuthors();
        setSuccessMessage("Author added successfully!");
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setAlreadyExists(true);
      } else {
        alert("Failed to add author. Check server logs.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting an author
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this author?")) {
      try {
        await axios.delete(`http://localhost:5000/api/authors/${id}`, {
          withCredentials: true,
        });
        fetchAuthors();
      } catch (err) {
        alert(
          "Cannot delete author. They might be linked to existing books.",
          err
        );
      }
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold text-dark d-flex align-items-center">
          <PersonIcon className="me-2 text-primary" fontSize="large" />
          Author Management
        </h4>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon className="me-1" fontSize="small" /> Back to Dashboard
        </button>
      </div>

      <div className="row g-4">
        {/* Form for Adding Author */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold py-3">
              Add New Author
            </div>
            <div className="card-body">
              <form onSubmit={handleAddAuthor}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted text-uppercase">
                    Author Name
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      alreadyExists ? "is-invalid" : ""
                    }`}
                    placeholder="e.g. J.K. Rowling"
                    value={authorName}
                    required
                    onChange={(e) => {
                      setAuthorName(e.target.value);
                      if (alreadyExists) setAlreadyExists(false);
                    }}
                  />
                  {alreadyExists && (
                    <div className="invalid-feedback">
                      This author already exists in our records.
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
                      <AddCircleIcon className="me-2" /> Save Author
                    </>
                  )}
                </button>

                {successMessage && (
                  <h6 className="mt-2 text-success text-center">
                    {successMessage}
                  </h6>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Author List Table */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold py-3 d-flex justify-content-between align-items-center">
              <span>Registered Authors</span>
              <span className="badge bg-primary rounded-pill">
                {authors.length} Total
              </span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">ID</th>
                      <th>Author Name</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {authors.length > 0 ? (
                      authors.map((auth) => (
                        <tr key={auth.author_id}>
                          <td className="ps-4 text-muted small">
                            #{auth.author_id}
                          </td>
                          <td className="fw-medium text-dark">
                            {auth.author_name}
                          </td>
                          <td className="text-end pe-4">
                            <button
                              className="btn btn-outline-danger btn-sm border-0"
                              title="Delete Author"
                              onClick={() => handleDelete(auth.author_id)}
                            >
                              <DeleteSweepIcon />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-5 text-muted">
                          No authors found.
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

export default AuthorManagement;
