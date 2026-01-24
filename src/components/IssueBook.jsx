import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn"; 

const IssueBook = () => {
  useEffect(() => {
    document.title = "Issue Book";
  })
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  // Step 1: Verification State
  const [isVerified, setIsVerified] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    book_id: "",
    issue_date: today,
    due_date: "",
  });
  // Step 2: Final Submission State
  const [finalFormData, setFinalFormData] = useState({
    user_id: "",
    user_name: "",
    book_id: "",
    book_name: "",
    issue_date: today,
    due_date: "",
    payment_method: "Cash",
    amount: "",
    status: "Issued",
  });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFinalChange = (e) => {
    setFinalFormData({ ...finalFormData, [e.target.name]: e.target.value });
  };

  // Step 1: Verify IDs and fetch Names
  const handleVerify = async (e) => {
    e.preventDefault();

    if (formData.due_date <= today) {
      alert("Return date cannot be earlier than today!");
      return;
    }
    console.log(formData);   
    try {
      const res = await axios.post(
        "http://localhost:5000/api/book-issue/verifyDetails",
        formData,
        { withCredentials: true },
      );

      if (res.status === 200) {
        setFinalFormData({
          ...finalFormData,
          user_id: res.data.user_id,
          user_name: res.data.user_name,
          book_id: res.data.book_id,
          book_name: res.data.book_name,
          issue_date: formData.issue_date,
          due_date: formData.due_date,
          amount: res.data.amount,
          price: res.data.price,
        });
        setIsVerified(true);
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error: Check IDs or verify book stock availability.",
      );
      setIsVerified(false);
    }
  };

  // Step 2: Final Submit to DB
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/book-issue/add",
        finalFormData,
        { withCredentials: true },
      );
      if (res.status === 201) {
        alert("Book Issued Successfully!");
      }
      navigate("/admin/issue-book");
    } catch (err) {
      console.error(err);
      alert("Failed to complete issue process.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white py-3 d-flex align-items-center justify-content-between">
              <h5 className="mb-0">
                <AssignmentIcon className="me-2" /> Issue Book Management
              </h5>
              <button
                className="btn btn-sm btn-light"
                onClick={() => navigate(-1)}
              >
                <ArrowBackIcon fontSize="small" /> Back
              </button>
            </div>

            <div className="card-body p-4">
              {/* PHASE 1: Verification Form */}
              <form
                onSubmit={handleVerify}
                className={isVerified ? "opacity-50" : ""}
              >
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Member ID</label>
                    <input
                      type="number"
                      name="user_id"
                      className="form-control"
                      onChange={handleChange}
                      disabled={isVerified}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Book ID</label>
                    <input
                      type="number"
                      name="book_id"
                      className="form-control"
                      onChange={handleChange}
                      disabled={isVerified}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Issue Date</label>
                    <input
                      type="date"
                      className="form-control bg-light"
                      value={formData.issue_date}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Due Date</label>
                    <input
                      type="date"
                      name="due_date"
                      className="form-control"
                      min={today}
                      onChange={handleChange}
                      disabled={isVerified}
                      required
                    />
                  </div>
                </div>
                {!isVerified && (
                  <button
                    type="submit"
                    className="btn btn-primary w-100 fw-bold"
                  >
                    <VerifiedUserIcon className="me-2" /> Verify Member & Book
                  </button>
                )}
              </form>

              {/* PHASE 2: Confirmation & Payment (Visible only after verification) */}
              {isVerified && (
                <div className="mt-4 pt-4 border-top animate__animated animate__fadeIn">
                  <div className="alert alert-success">
                    <p className="mb-1">
                      <strong>Member:</strong> {finalFormData.user_name} (ID:{" "}
                      {finalFormData.user_id})
                    </p>
                    <p className="mb-1">
                      <strong>Book:</strong> {finalFormData.book_name} (ID:{" "}
                      {finalFormData.book_id})
                    </p>
                    <p className="mb-0">
                      <strong>Per Date Rental:</strong> {finalFormData.price} *{" "}
                      {Math.ceil(
                        (new Date(formData.due_date) -
                          new Date(formData.issue_date)) /
                          (1000 * 60 * 60 * 24),
                      )} Day
                    </p>
                  </div>

                  <form onSubmit={handleFinalSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          Payment Method
                        </label>
                        <select
                          name="payment_method"
                          className="form-select"
                          onChange={handleFinalChange}
                          required
                        >
                          <option value="Cash">Cash</option>
                          <option value="UPI">UPI</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Amount (₹)</label>
                        <input
                          type="number"
                          name="amount"
                          className="form-control"
                          value={finalFormData.amount}
                          onChange={handleFinalChange}
                          disabled="true"
                          required
                        />
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary w-100"
                        onClick={() => setIsVerified(false)}
                      >
                        Edit Details
                      </button>
                      <button
                        type="submit"
                        className="btn btn-success w-100 fw-bold"
                      >
                        <AssignmentTurnedInIcon className="me-2" /> Complete
                        Issue
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueBook;
