import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Paper,
  Stack,
  InputAdornment,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LockIcon from "@mui/icons-material/Lock";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import axios from "axios";

const AdminAddEmployee = () => {
  const [EmployeeData, setEmployeeData] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "employee",
    phone: "",
  });

  useEffect(() => {
    document.title = "Employee Management";
    const getEmployeeData = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/admin/Employees",
          {
            withCredentials: true,
          },
        );
        setEmployeeData(res.data);
      } catch (err) {
        console.error("Error fetching employee data:", err);
      }
    };
    getEmployeeData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/admin/signup", formData, {
        withCredentials: true,
      });
      alert("Employee account created successfully!");
      setFormData({
        full_name: "",
        email: "",
        password: "",
        role: "employee",
        phone: "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Error creating user");
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/employee/status/${adminId}`,
        { is_active: !currentStatus },
        { withCredentials: true },
      );

      setEmployeeData((prevData) =>
        prevData.map((emp) =>
          emp.admin_id === adminId
            ? { ...emp, is_active: !currentStatus }
            : emp,
        ),
      );
    } catch (err) {
      console.error("Toggle failed:", err);
      alert("Could not update status. Check if server is running.");
    }
  };

  return (
    // Changed to column to stack Paper components up and down
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 4,
        gap: 4,
      }}
    >
      {/* Top Paper: Registration Form */}
      <Paper
        sx={{
          p: 4,
          maxWidth: 800,
          width: "100%",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 3, fontWeight: "bold", color: "primary.main" }}
        >
          Create New Employee Account
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Full Name"
                name="full_name"
                fullWidth
                required
                value={formData.full_name}
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                label="Email Address"
                name="email"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Phone Number"
                name="phone"
                fullWidth
                required
                value={formData.phone}
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                label="Initial Password"
                name="password"
                type="password"
                fullWidth
                required
                value={formData.password}
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>

            <TextField
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="supervisor">Supervisor</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
            </TextField>

            <Button
              variant="contained"
              type="submit"
              size="large"
              sx={{ py: 1.5, fontWeight: "bold" }}
            >
              Create Account
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Bottom Paper: Employee Table */}
      <Paper
        sx={{
          width: "100%",
          maxWidth: 1000,
          borderRadius: 2,
          boxShadow: 3,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2, bgcolor: "grey.100" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Registered Employees
          </Typography>
        </Box>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 text-nowrap">
            <thead className="table-light">
              <tr>
                <th className="ps-4">ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th className="text-center">Account Status</th>
              </tr>
            </thead>
            <tbody>
              {EmployeeData && EmployeeData.length > 0 ? (
                EmployeeData.map((employee) => (
                  <tr key={employee.admin_id}>
                    <td className="ps-4">#{employee.admin_id}</td>
                    <td>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {employee.full_name}
                      </Typography>
                    </td>
                    <td>{employee.email}</td>
                    <td>{employee.phone || "N/A"}</td>
                    <td>
                      <span className="badge bg-light text-dark border text-capitalize">
                        {employee.role}
                      </span>
                    </td>
                    <td className="text-center">
                      <div>
                        <button
                          className={`btn btn-sm border-0 ${employee.is_active ? "text-success" : "text-danger"}`}
                          onClick={() =>
                            handleToggleStatus(
                              employee.admin_id,
                              employee.is_active,
                            )
                          }
                        >
                          {employee.is_active ? (
                            <ToggleOnIcon fontSize="large" />
                          ) : (
                            <ToggleOffIcon fontSize="large" />
                          )}
                        </button>
                        <spam>
                          {employee.is_active ? " Active" : " Inactive"}
                        </spam>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Paper>
    </Box>
  );
};

export default AdminAddEmployee;
