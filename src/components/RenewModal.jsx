import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import axios from "axios";

const RenewModal = ({ open, onClose, selectedIssue, onConfirm }) => {
  const [step, setStep] = useState(1);
  const [newDate, setNewDate] = useState("");
  const [payDay, setPayDay] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amount, setAmount] = useState(0);
  const [TotalDays, setTotalDays] = useState(0);
  const handleClose = () => {
    setStep(1);
    setNewDate("");
    setPaymentMethod("Cash");
    onClose();
  };

  const ReNewData = () => {
    return {
      book_id: selectedIssue.book_id,
      book_name: selectedIssue.book_name,
      user_id: selectedIssue.user_id,
      user_name: selectedIssue.user_name,
      issue_date: new Date(),
      due_date: newDate,
      total_days: TotalDays,
      payment_method: paymentMethod,
      amount: amount,
      Renew_Issue_id: selectedIssue.issue_id,
    };
  };

  const handleNext = async () => {
    // 1. Calculate days locally
    const daysCalculated =
      Math.ceil(
        (new Date(newDate).setHours(0, 0, 0, 0) -
          new Date(selectedIssue.issue_date).setHours(0, 0, 0, 0)) /
          86400000,
      )-1 || 1;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/Book/getDate/${selectedIssue.book_id}`,
        { withCredentials: true },
      );

      const pricePerDay = response.data; 

      const newAmount = pricePerDay * daysCalculated;

      setTotalDays(daysCalculated);
      setPayDay(pricePerDay);
      setAmount(newAmount); 
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to fetch price data";
      alert(errorMsg);
    }
    setStep(2);
  };
  const handleBack = () => setStep(1);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle className="fw-bold">
        {step === 1 ? "Renew Book" : "Payment Method"}
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Book: <strong>{selectedIssue?.book_name}</strong>
        </Typography>

        {step === 1 ? (
          /* STEP 1: DATE SELECTION */
          <Box sx={{ mt: 2 }}>
            <label className="form-label fw-bold">New Due Date</label>
            <input
              type="date"
              className="form-control"
              min={new Date().toISOString().split("T")[0]}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ mt: 1, display: "block" }}
            >
              Select the extended deadline for this return.
            </Typography>
          </Box>
        ) : (
          /* STEP 2: PAYMENT SELECTION */
          <Box sx={{ mt: 1 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Choose how you want to pay the amount of ₹{amount.toFixed(2)}:
              today :{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              <br />
              next due date :{" "}
              {new Date(newDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              <br />
              per Day Rent : {payDay}
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  value="Cash"
                  control={<Radio />}
                  label="Cash"
                />
                <FormControlLabel
                  value="UPI"
                  control={<Radio />}
                  label="UPI"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>

        {step === 1 ? (
          <Button
            variant="contained"
            color="primary"
            disabled={!newDate}
            onClick={handleNext}
            disableElevation
          >
            Next: Payment
          </Button>
        ) : (
          <>
            <Button onClick={handleBack} color="primary">
              Back
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => onConfirm(ReNewData())}
              disableElevation
            >
              Confirm Renew
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RenewModal;
