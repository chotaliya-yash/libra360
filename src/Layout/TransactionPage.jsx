import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const TransactionPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch transactions from your Express API
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/Transaction");
      setTransactions(res.data);
    } catch (err) {
      console.error("Error fetching transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter by Transaction ID or Category
  const filteredTxn = transactions.filter(
    (txn) =>
      txn.transaction_id.toString().includes(searchTerm) ||
      txn.transaction_type.toLowerCase().includes(searchTerm.toLowerCase()) || 
      txn.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4 mb-5">
      {/* Header Section */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold text-dark d-flex align-items-center">
          <ReceiptLongIcon className="me-2 text-success" fontSize="large" />
          Financial Ledger & Penalties
        </h4>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            <ArrowBackIcon fontSize="small" /> Back
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-primary border-4">
            <div className="card-body">
              <h6 className="text-muted small text-uppercase">Total Revenue</h6>
              <h3 className="fw-bold">
                ₹
                {transactions
                  .reduce((acc, curr) => acc + parseFloat(curr.amount), 0)
                  .toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <div className="input-group w-100">
                <span className="input-group-text bg-white border-end-0">
                  <SearchIcon className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search by Transaction ID or Type (Penalty, Payment)..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-nowrap">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Txn ID</th>
                  <th>User ID</th>
                  <th>Type & Reference</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      Processing Ledger...
                    </td>
                  </tr>
                ) : filteredTxn.length > 0 ? (
                  filteredTxn.map((txn) => (
                    <tr key={txn.transaction_id}>
                      <td className="ps-4 font-mono small text-muted">
                        #TXN-{txn.transaction_id}
                      </td>
                      <td>
                        <div>
                          <span className="badge bg-light text-dark">
                            Id: {txn.user_id}
                          </span>
                        </div>
                        <div>
                          <span className="badge bg-light text-dark">
                            name: {txn.user_name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div
                          className="fw-bold"
                          style={{ textTransform: "capitalize" }}
                        >
                          {txn.transaction_type}
                        </div>
                        <div className="small text-muted">
                          Ref ID: {txn.reference_id || "N/A"}
                        </div>
                      </td>
                      <td
                        className={`fw-bold ${txn.amount >= 0 ? "text-success" : "text-danger"}`}
                      >
                        {txn.amount >= 0 ? "+" : "-"} ₹
                        {Math.abs(txn.amount).toFixed(2)}
                      </td>
                      <td>{txn.payment_method || "---"}</td>
                      <td className="small">
                        {new Date(txn.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;
