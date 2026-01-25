import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const ReturnModal = ({ open, onClose, selectedIssue, modalData, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="fw-bold">Return Confirmation</DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Book Title: <strong>{selectedIssue?.book_name}</strong>
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mt: 2,
            color: modalData.type === "OVERDUE" ? "error.main" : "text.primary",
            fontWeight: modalData.type === "OVERDUE" ? "bold" : "normal",
          }}
        >
          {modalData.message}
          {modalData.type === "OVERDUE" && ` Total Fine: ₹${modalData.amount.toFixed(
          2)}`}
        </Typography>

        {modalData.type === "REFUND" && (
          <Typography
            variant="body1"
            sx={{ mt: 1, color: "success.main", fontWeight: "medium" }}
          >
            Total Refund: ₹{modalData.amount.toFixed(2)}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="text" color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={modalData.type === "OVERDUE" ? "error" : "primary"}
          disableElevation
        >
          Confirm Return
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReturnModal;