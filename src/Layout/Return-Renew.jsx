import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";

// MUI Components & Icons
import { CircularProgress, Box } from "@mui/material";
import {
  Search as SearchIcon,
  SwapHoriz,
  History,
  Autorenew as AutorenewIcon,
} from "@mui/icons-material";

// Sub-components (The files we separated)
import ReturnModal from "../components/ReturnModal";
import RenewModal from "../components/RenewModal";

const Return_Renew = () => {
  // --- States ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog Control States
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalData, setModalData] = useState({
    message: "",
    type: "",
    amount: 0,
  });

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/issues", {
        withCredentials: true,
      });
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching issues:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Return & Renew Management";
    fetchData();
  }, [fetchData]);

  // --- Helper: Date Calculation ---
  const getDaysDiff = (dueDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);
    return Math.round((dueDate - today) / (1000 * 60 * 60 * 24));
  };

  // --- Handlers ---
  const handleOpenReturn = (issue) => {
    const diffDays = getDaysDiff(issue.due_date);
    let message = "";
    let type = "";
    let amount = 0;
    const perDay = issue.amount / issue.total_days || 0;

    if (diffDays > 0) {
      type = "REFUND";
      amount = Math.abs(diffDays) * perDay;
      message = `Early Return: ${diffDays} day(s) remaining.`;
    } else if (diffDays === 0) {
      type = "ON_TIME";
      message = "This book is due today.";
    } else {
      type = "OVERDUE";
      amount = Math.abs(diffDays) * perDay;
      message = `Overdue by ${Math.abs(diffDays)} day(s). Outstanding charges apply.`;
    }

    setSelectedIssue(issue);
    setModalData({ message, type, amount });
    setReturnModalOpen(true);
  };

  const handleOpenRenew = (issue) => {
    setSelectedIssue(issue);
    setRenewModalOpen(true);
  };
// return api
  const handleConfirmReturn = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/issue/return/${selectedIssue.issue_id}`,
        {modalData :modalData },
        { withCredentials: true },
      );
      setReturnModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to process return.");
    }
  };
// renew api
  const handleConfirmRenew = async (newData) => {
    try {
      await axios.post(
        `http://localhost:5000/api/issue/renew/${selectedIssue.issue_id}`,
        { ReNewData :newData },
        { withCredentials: true },
      );
      setRenewModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to process renewal.");
    }
  };

  // --- Memoized Search ---
  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.book_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [data, searchTerm]);

  return (
    <div className="container mt-4 mb-5">
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold text-dark d-flex align-items-center">
          <SwapHoriz className="me-2 text-primary" fontSize="large" />
          Return / Renew Book
        </h4>
      </div>

      {/* Search Section */}
      <div className="shadow-sm p-2 mb-4 bg-white rounded">
        <div className="input-group">
          <span className="input-group-text bg-transparent border-0">
            <SearchIcon className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-0 shadow-none"
            placeholder="Search by Member or Book Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Issue ID</th>
                <th>Member</th>
                <th>Book</th>
                <th>Timeline</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <CircularProgress size={30} />
                    <div className="mt-2 text-muted">Loading Records...</div>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((issue) => {
                  const diff = getDaysDiff(issue.due_date);
                  return (
                    <tr key={issue.issue_id}>
                      <td className="ps-4 text-muted small">
                        #{issue.issue_id}
                      </td>
                      <td>
                        <div className="fw-bold">{issue.user_name}</div>
                        <div className="small text-muted">
                          ID: {issue.user_id}
                        </div>
                      </td>
                      <td>
                        <div
                          className="fw-bold text-truncate"
                          style={{ maxWidth: "200px" }}
                        >
                          {issue.book_name}
                        </div>
                        <div className="small text-muted">
                          ID: {issue.book_id}
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          Issued:{" "}
                          {new Date(issue.issue_date).toLocaleDateString()}
                        </div>
                        <div className="small fw-bold">
                          Due: {new Date(issue.due_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${diff < 0 ? "bg-danger" : diff === 0 ? "bg-warning text-dark" : "bg-success"}`}
                        >
                          {diff < 0
                            ? `Overdue ${Math.abs(diff)}d`
                            : diff === 0
                              ? "Due Today"
                              : `Due in ${diff}d`}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="btn-group shadow-sm border rounded">
                          <button
                            className="btn btn-sm btn-white py-2"
                            onClick={() => handleOpenReturn(issue)}
                          >
                            <History
                              fontSize="small"
                              className="text-primary me-1"
                            />{" "}
                            Return
                          </button>
                          {new Date(issue.due_date).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0) && (
                            <button
                              className="btn btn-sm btn-white py-2"
                              onClick={() => {
                                setRenewModalOpen(issue);
                                handleOpenRenew(issue);
                              }}
                            >
                              <AutorenewIcon
                                fontSize="small"
                                className="text-success me-1"
                              />{" "}
                              Renew
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No records found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Externalized Dialogs */}
      <ReturnModal
        open={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        selectedIssue={selectedIssue}
        modalData={modalData}
        onConfirm={handleConfirmReturn}
      />

      <RenewModal
        open={renewModalOpen}
        onClose={() => setRenewModalOpen(false)}
        selectedIssue={selectedIssue}
        onConfirm={handleConfirmRenew}
      />
    </div>
  );
};

export default Return_Renew;
