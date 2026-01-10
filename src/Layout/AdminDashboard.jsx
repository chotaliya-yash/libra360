import React from "react";
// Material Icons Imports
import BookIcon from "@mui/icons-material/Book";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="container-fluid p-4" style={{ minHeight: "100vh" }}>
      {/* Page Heading */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h2 className="h4 mb-0 text-dark fw-bold">System Dashboard</h2>
        <button className="btn btn-primary btn-sm shadow-sm px-3">
          Generate Report
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="row">
        {/* Total Books */}
        <div className="col-md-3 mb-4">
          <div
            className="card shadow border-0"
            style={{ borderLeft: "4px solid #4e73df" }}
          >
            <div className="card-body py-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-primary fw-bold text-uppercase small mb-1">
                    Total Books
                  </div>
                  <div className="h4 mb-0 fw-bold">1,250</div>
                </div>
                <BookIcon sx={{ fontSize: 40, color: "#dddfeb" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Active Members */}
        <div className="col-md-3 mb-4">
          <div
            className="card shadow border-0"
            style={{ borderLeft: "4px solid #1cc88a" }}
          >
            <div className="card-body py-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-success fw-bold text-uppercase small mb-1">
                    Active Members
                  </div>
                  <div className="h4 mb-0 fw-bold">450</div>
                </div>
                <PeopleIcon sx={{ fontSize: 40, color: "#dddfeb" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Returns Today */}
        <div className="col-md-3 mb-4">
          <div
            className="card shadow border-0"
            style={{ borderLeft: "4px solid #f6c23e" }}
          >
            <div className="card-body py-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-warning fw-bold text-uppercase small mb-1">
                    Returns Today
                  </div>
                  <div className="h4 mb-0 fw-bold">12</div>
                </div>
                <AssignmentReturnIcon sx={{ fontSize: 40, color: "#dddfeb" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Fines */}
        <div className="col-md-3 mb-4">
          <div
            className="card shadow border-0"
            style={{ borderLeft: "4px solid #e74a3b" }}
          >
            <div className="card-body py-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-danger fw-bold text-uppercase small mb-1">
                    Pending Fines
                  </div>
                  <div className="h4 mb-0 fw-bold">₹ 2,400</div>
                </div>
                <CurrencyRupeeIcon sx={{ fontSize: 40, color: "#dddfeb" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="row mt-2">
        {/* Table: Today's Returns */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow border-0">
            <div className="card-header bg-white py-3">
              <h6 className="m-0 fw-bold text-primary">
                Pending Returns (Today)
              </h6>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Book Name</th>
                      <th>Member</th>
                      <th>Due Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Modern React 2026</td>
                      <td>Aakash Mehta</td>
                      <td>10 Jan 2026</td>
                      <td>
                        <span className="badge bg-success cursor-pointer">
                          Return Now
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Quick Actions */}
        <div className="col-lg-4">
          <div className="card shadow border-0 mb-4">
            <div className="card-header bg-white py-3">
              <h6 className="m-0 fw-bold text-primary">Quick Actions</h6>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <Link
                  to="/admin/add-book"
                  className="list-group-item list-group-item-action d-flex align-items-center"
                >
                  <AddCircleIcon className="me-3 text-primary" />
                  Add New Book
                </Link>
                <Link
                  to="/admin/register"
                  className="list-group-item list-group-item-action d-flex align-items-center"
                >
                  <PersonAddIcon className="me-3 text-success" /> Register
                  Student
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
