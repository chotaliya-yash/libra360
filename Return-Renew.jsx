import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { SwapHoriz } from "@mui/icons-material";
import axios from "axios";
import { History } from "@mui/icons-material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
const Return_Renew = () => {
  const [loading, setLoading] = useState(false);
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/books", {
        withCredentials: true,
      });
      setData(res.data);
    } catch (err) {
      console.error("Error fetching books", err);
    }
    setLoading(false);
  };
  const [data, setData] = useState([
    {
      issue_id: "5",
      book_id: "5",
      book_name: "hads",
      user_id: "qwe",
      user_name: "erwerwe",
      issue_date: "2026-01-17",
      due_date: "2026-01-30",
    },
  ]);
  //   const [Option, setOption] = useState("Return");
  useEffect(() => {
    document.title = "Return Renew Book";
    window.scrollTo(0, 0);
    fetchData;
  }, []);

  const calculateStatus = (dueDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return { label: `Overdue ${Math.abs(diffDays)}d`, color: "bg-danger" };
    if (diffDays === 0)
      return { label: "Today", color: "bg-warning text-dark" };
    return { label: `Due in ${diffDays}d`, color: "bg-success" };
  };
  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold text-dark d-flex align-items-center">
          <SwapHoriz className="me-2 text-primary" fontSize="large" />
          Return Renew Book
        </h4>
      </div>
      <div className="shadow-sm p-2 mb-5 bg-body rounded d-flex">
        {/* <div className="input-group">
          <button
            className={`btn ${Option === "Return" ? "btn-primary" : "btn-light"}`}
            onClick={() => setOption("Return")}
          >
            Return
          </button>
          <button
            className={`btn ${Option === "Renew" ? "btn-primary" : "btn-light"}`}
            onClick={() => setOption("Renew")}
          >
            Renew
          </button>
        </div> */}
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <SearchIcon className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0 text-muted"
            placeholder="Search by Title or ISBN..."
            // onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">ID</th>
                <th>Member Info</th>
                <th>Book Rent</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    Loading Issue Book...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((issue) => (
                  <tr key={issue.issue_id}>
                    <td className="ps-4 text-muted small">#{issue.issue_id}</td>
                    {/* issue_id, book_id, book_name, user_id, user_name, issue_date, due_date, return_date, total_days, status, payment_method, amount,  */}
                    <td>
                      <div className="fw-bold">{issue.user_id}</div>
                      <div className="small text-muted">{issue.user_name}</div>
                    </td>
                    <td>
                      <div className="fw-bold">{issue.book_id}</div>
                      <div className="small text-muted">{issue.book_name}</div>
                    </td>
                    <td>
                      <div className="text-muted">
                        <strong>Issue date : </strong>
                        {new Date(issue.issue_date).toLocaleDateString()}
                      </div>
                      <div className="text-muted">
                        <strong>Due date : </strong>
                        {new Date(issue.due_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${calculateStatus(issue.due_date).color}`}
                      >
                        {calculateStatus(issue.due_date).label}
                      </span>
                    </td>
                    <td className="d-flex justify-content-end">
                      <div className="input-group">
                        <button className="btn">
                          <History /> Return
                        </button>
                        <button className="btn">
                          <snap>
                            <AutorenewIcon /> Renew
                          </snap>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No Issue Book found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Return_Renew;
