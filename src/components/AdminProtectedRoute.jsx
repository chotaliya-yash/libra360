import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { CircularProgress, Box } from "@mui/material";

const AdminProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/admin/me",
          { withCredentials: true }
        );

        if (res.data.loggedIn) {
          setIsAuth(true);
          localStorage.setItem("AdminRole", res.data.role);
          localStorage.setItem("AdminName", res.data.adminName);
        }
      } catch (error) {
        setIsAuth(false);
        console.error("Authentication check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
