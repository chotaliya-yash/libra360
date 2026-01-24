import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from '@mui/icons-material/History';
import { CircularProgress, Box, Chip } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

const IssueHistory = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch All Issues (History)
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      // Note: You might need a specific endpoint like /api/issues/history 
      // or a query param to get all records including 'Returned' status.
      const res = await axios.get("http://localhost:5000/api/issues?all=true", {
        withCredentials: true,
      });
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Complete Issue History";
    fetchHistory();
  }, [fetchHistory]);

  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.book_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.issue_id.toString().includes(searchTerm)
    );
  }, [data, searchTerm]);

  return (
    <div className="container mt-4 mb-5">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold text-dark d-flex align-items-center">
          <HistoryIcon className="me-2 text-secondary" fontSize="large" />
          Complete Issue History
        </h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
          <ArrowBackIcon fontSize="small" /> Back
        </button>
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
            placeholder="Search by ID, Member, or Book..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* History Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">ID</th>
                <th>Member</th>
                <th>Book Details</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <CircularProgress size={30} />
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((issue) => (
                  <tr key={issue.issue_id}>
                    <td className="ps-4 text-muted small">#{issue.issue_id}</td>
                    <td>
                      <div className="fw-bold">{issue.user_name}</div>
                      <div className="small text-muted">UID: {issue.user_id}</div>
                    </td>
                    <td>
                      <div className="fw-bold text-truncate" style={{ maxWidth: "250px" }}>
                        {issue.book_name}
                      </div>
                      <div className="small text-muted">BID: {issue.book_id}</div>
                    </td>
                    <td>{new Date(issue.issue_date).toLocaleDateString()}</td>
                    <td>{new Date(issue.due_date).toLocaleDateString()}</td>
                    <td>
                      {issue.return_date 
                        ? new Date(issue.return_date).toLocaleDateString() 
                        : <span className="text-muted italic">Not Returned</span>}
                    </td>
                    <td className="text-center">
                      <Chip 
                        label={issue.status} 
                        size="small"
                        color={issue.status === 'Returned' ? 'success' : 'primary'}
                        variant={issue.status === 'Returned' ? 'outlined' : 'filled'}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-5">No history records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IssueHistory;