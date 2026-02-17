import React from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import { Box } from "@mui/material";
const RootLayout = () => {
  return (
    <div className="root-layout">
      <Navbar />
      <div style={{minHeight : "80vh" , paddingTop: "20px"}}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default RootLayout;
