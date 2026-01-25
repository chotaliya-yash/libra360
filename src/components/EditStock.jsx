import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  TextField,
  Box,
  Stack,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": { padding: theme.spacing(3) },
  "& .MuiDialogActions-root": { padding: theme.spacing(2) },
}));

const PreviewBox = styled(Box)(({ theme, isNegative }) => ({
  padding: theme.spacing(2),
  backgroundColor: isNegative
    ? "rgba(244, 67, 54, 0.08)"
    : "rgba(76, 175, 80, 0.08)",
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${isNegative ? theme.palette.error.light : theme.palette.success.light}`,
  textAlign: "center",
  marginTop: theme.spacing(2),
}));

export default function EditStock({ open, handleClose, book, handleUpdate }) {
  const [adjustment, setAdjustment] = useState("");

  // Logic Calculations
  const currentStock = book?.quantity || 0;
  const adjValue = parseInt(adjustment, 10) || 0;
  const newTotal = currentStock + adjValue;

  // Validation: Prevent stock from going below 0
  const isInvalid = adjustment !== "" && newTotal < 0;
  const canSubmit =
    adjustment !== "" && adjustment !== "-" && adjValue !== 0 && !isInvalid;

  const onConfirm = () => {
    handleUpdate(adjValue, book);
  };

  return (
    <BootstrapDialog onClose={handleClose} open={open} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, fontWeight: "bold" }}>
        Adjust Stock Level
      </DialogTitle>

      <IconButton
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {book?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current Stock: <strong>{currentStock}</strong>
          </Typography>
        </Box>

        <TextField
          label="Adjustment Amount"
          type="number"
          fullWidth
          variant="outlined"
          value={adjustment}
          placeholder="e.g. 5 or -5"
          onChange={(e) => setAdjustment(e.target.value)}
          error={isInvalid}
          helperText={
            isInvalid
              ? `Cannot reduce below 0. Max reduction: -${currentStock}`
              : "Enter positive to add, negative to remove"
          }
        />

        <PreviewBox isNegative={adjValue < 0}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 1 }}
          >
            CALCULATION PREVIEW
          </Typography>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="h6">{currentStock}</Typography>
            <Typography variant="h6" color="text.secondary">
              {adjValue >= 0 ? "+" : ""}
              {adjValue || 0}
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: isInvalid ? "error.main" : "primary.main",
              }}
            >
              {newTotal}
            </Typography>
          </Stack>
          <Typography
            variant="caption"
            sx={{ mt: 1, display: "block", fontWeight: "bold" }}
          >
            New Total Quantity
          </Typography>
        </PreviewBox>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={adjValue < 0 ? "error" : "success"}
          disabled={!canSubmit}
        >
          Update to {newTotal}
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
}
