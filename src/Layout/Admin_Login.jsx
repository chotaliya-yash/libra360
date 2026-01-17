import React, { useState, useEffect } from "react";
import {
  Box, Button, TextField, Typography, Container, Paper,
  InputAdornment, IconButton, Alert, CircularProgress, Avatar
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock, LibraryBooks } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Admin_Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin Login";
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/login",
        formData,
        { withCredentials: true } 
      );

      if (response.status === 200) {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          setError("Invalid password. Please try again.");
        } else if (status === 404) {
          setError("User not found.");
        } else {
          setError(err.response.data?.message || "Login failed.");
        }
      } else {
        setError("Server connection failed. Please try again later.");
      }
      setFormData({ ...formData, password: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
              <LibraryBooks fontSize="large" />
            </Avatar>
          </Box>

          <Typography variant="h5" fontWeight="700" color="primary" gutterBottom>
            Library Admin
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Please sign in to manage your library
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              variant="outlined"
              margin="normal"
              required
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              required
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: "bold", borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
            </Button>
          </form>

          <Typography variant="caption" display="block" sx={{ mt: 2, color: "gray" }}>
            Forgot password? Contact super admin.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Admin_Login;