import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const MemberManagement = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/members", {
        withCredentials: true,
      });
      setMembers(res.data);
    } catch (err) {
      console.error("Error fetching members", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/members/toggle-status/${id}`,
        { is_active: !currentStatus },
        { withCredentials: true }
      );
      fetchMembers(); // Refresh list
    } catch (err) {
    console.log(err)
      alert("Failed to update member status.");
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4 mb-5">
      {/* Header Area */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold text-dark d-flex align-items-center">
          <PeopleIcon className="me-2 text-primary" fontSize="large" />
          Member Management
        </h4>
        <div className="d-flex gap-2">
          <button className="btn btn-primary btn-sm px-3" onClick={() => navigate("/admin/register")}>
            <PersonAddIcon className="me-1" /> Add Member
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            <ArrowBackIcon fontSize="small" /> Back
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body py-2">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-0">
              <SearchIcon className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-0 shadow-none"
              placeholder="Search by name or email..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Member Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">ID</th>
                <th>Member Info</th>
                <th>Contact</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5">Loading Members...</td></tr>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.member_id}>
                    <td className="ps-4 text-muted small">#{member.member_id}</td>
                    <td>
                      <div className="fw-bold">{member.full_name}</div>
                      <div className="small text-muted">{member.gender} | {new Date(member.date_of_birth).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div className="small"><strong>Email:</strong> {member.email}</div>
                      <div className="small"><strong>Phone:</strong> {member.phone}</div>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${member.is_active ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                        {member.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-center">
                      <button 
                        className={`btn btn-sm border-0 ${member.is_active ? "text-danger" : "text-success"}`}
                        onClick={() => handleToggleStatus(member.member_id, member.is_active)}
                        title={member.is_active ? "Deactivate Member" : "Activate Member"}
                      >
                        {member.is_active ? <ToggleOnIcon fontSize="large" /> : <ToggleOffIcon fontSize="large" />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted">No members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberManagement;