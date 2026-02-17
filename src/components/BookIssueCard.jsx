import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
} from "@mui/material";
import BookIcon from "@mui/icons-material/MenuBook";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const BookIssueCard = ({ item, index }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "borrowed":
        return "primary";
      case "returned":
        return "success";
      case "overdue":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Card
      key={index}
      sx={{
        width: "300px",
        m: 2,
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "0.3s",
        "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.15)" },
      }}
    >
      <CardContent>
        {/* Book Name Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
          <BookIcon sx={{ color: "primary.main", mr: 1 }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
          >
            {item.book_name || "Untitled Book"}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Details Section */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex" }}>
            <Typography variant="body2" color="text.secondary">
              Issue Date:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {new Date(item.issue_date).toLocaleDateString()}
            </Typography>
          </Box>

          <Box sx={{ display: "flex" }}>
            <Typography variant="body2" color="text.secondary">
              Due Date:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {new Date(item.due_date).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        {/* Status Chip */}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Chip
            label={item.status || "Unknown"}
            color={getStatusColor(item.status)}
            size="small"
            sx={{ fontWeight: "bold", textTransform: "uppercase", px: 1 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default BookIssueCard;
