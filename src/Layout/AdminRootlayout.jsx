import React, { useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
  LibraryBooks,
  Category,
  Person,
  SwapHoriz,
  History,
  Payments,
  GroupAdd,
} from "@mui/icons-material";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
const drawerWidth = 280;

export default function AdminRootlayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
    {
      text: "Book Management",
      icon: <LibraryBooks />,
      path: "/admin/bookmanagement",
    },
    { text: "Category/Genre", icon: <Category />, path: "/admin/Genre" },
    { text: "Author/Publisher", icon: <Person />, path: "/admin/Author" },
    { text: "Issue Book", icon: <SwapHoriz />, path: "/admin/issue-book" },
    { text: "Return/Renew", icon: <History />, path: "/admin/return-renew" },
    { text: "Transaction", icon: <Payments />, path: "/admin/Transaction" },
    {
      text: "Member Management",
      icon: <GroupAdd />,
      path: "/admin/membermanagement",
    },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          LIBRARY ADMIN
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Link
              to={item.path}
              style={{
                textDecoration: "none",
                color: "inherit",
                width: "100%",
              }}
            >
              <ListItemButton
                sx={{
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "0px 25px 25px 0px",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "black" }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: "14px" }}
                />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
        {localStorage.getItem("AdminRole") === "supervisor" && (
          <ListItem disablePadding>
            <Link
              to="/admin/add-employee"
              style={{
                textDecoration: "none",
                color: "inherit",
                width: "100%",
              }}
            >
              <ListItemButton
                sx={{
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "0px 25px 25px 0px",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "black" }}>
                  <GroupAdd />
                </ListItemIcon>
                <ListItemText
                  primary="Add Employee"
                  primaryTypographyProps={{ fontSize: "14px" }}
                />
              </ListItemButton>
            </Link>
          </ListItem>
        )}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* TOP APP BAR */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "white",
          color: "black",
          boxShadow: "none",
          borderBottom: "1px solid #ddd",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 600 }}
          >
            <Typography
              className="admin-navbar-title loraFont"
              fontSize={"30px"}
            >
              libra360°
            </Typography>
          </Typography>
          <Link
            to="/admin/profile"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                <span>{localStorage.getItem("AdminName")}</span>
              </Typography>
              <Avatar sx={{ bgcolor: "primary.main", width: 35, height: 35 }}>
                A
              </Avatar>
            </Box>
          </Link>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR DRAWER */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile View Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid #ddd",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box className="content" sx={{ flexGrow: 1, p: 3, mt: 6 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
