import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Box, Typography, Paper, CircularProgress, 
  Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Divider, Avatar, Stack 
} from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // States for Password Change
  const [open, setOpen] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/profile', {
          withCredentials: true 
        });
        setData(response.data);
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChangePassword = async () => {
    try {
      await axios.post('http://localhost:5000/api/admin/change-password', passwords, {
        withCredentials: true
      });
      alert("Password updated successfully!");
      setOpen(false);
      setPasswords({ oldPassword: "", newPassword: "" });
    } catch (error) {
      alert(error.response?.data?.message || "Error updating password");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/admin/logout', {}, { withCredentials: true });
      localStorage.removeItem("adminName"); // Clear your stored name
      navigate('/admin/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 550, borderRadius: 3, boxShadow: 4 }}>
        
        {/* Header with Avatar */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
            <PersonIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {data?.adminName || "Admin Profile"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your personal information and security
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 3 }} />
        
        {data ? (
          <Box sx={{ mb: 4 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Admin ID</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>#{data.adminId}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Email Address</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{data.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{data.phone || "Not Provided"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Designated Role</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                  {data.role}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button 
                variant="contained" 
                startIcon={<LockIcon />}
                onClick={() => setOpen(true)}
                fullWidth
              >
                Change Password
              </Button>
              <Button 
                variant="outlined" 
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                fullWidth
              >
                Logout
              </Button>
            </Stack>
          </Box>
        ) : (
          <Typography color="error" textAlign="center">
            Failed to load profile data. Please try again.
          </Typography>
        )}
      </Paper>

      {/* Change Password Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Security Update</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
            Ensure your new password is secure and not used elsewhere.
          </Typography>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            margin="normal"
            value={passwords.oldPassword}
            onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={handleChangePassword} 
            variant="contained" 
            disabled={!passwords.oldPassword || !passwords.newPassword}
          >
            Save New Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProfile;