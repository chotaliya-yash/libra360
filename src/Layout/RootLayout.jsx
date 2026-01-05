import React from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
const RootLayout = () => {
  return (
    <div className="root-layout">
      <Navbar />
      <div>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default RootLayout;
