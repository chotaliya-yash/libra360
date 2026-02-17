import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  Divider,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/member/me", {
          withCredentials: true,
        });

        if (res.data.loggedIn) {
          setUser(res.data.user);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/member/logout",
        {},
        { withCredentials: true },
      );
      localStorage.clear();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
        <Avatar
          sx={{
            margin: "0 auto",
            bgcolor: "primary.main",
            mb: 2,
          }}
        >
          {user?.memberName?.charAt(0) || "U"}
        </Avatar>

        <Typography variant="h4" gutterBottom>{user?.memberName}</Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ textAlign: "left", mb: 3 }}>
          <Typography variant="body1">
            <strong>Email:</strong> {user?.email}
          </Typography>
          <Typography variant="body1">
            <strong>Phone:</strong> {user?.phone || "N/A"}
          </Typography>
          <Typography variant="body1">
            <strong>Member ID:</strong> {user?.memberId}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="error"
          fullWidth
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Paper>
    </Container>
  );
};

export default UserProfile;
