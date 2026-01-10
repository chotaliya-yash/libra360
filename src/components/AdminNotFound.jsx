import React from "react";

const AdminNotFound = () => {
  return (
    <div
      className="Container w-100 d-flex flex-column justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <h2>404 Admin Page not Found</h2>
      <br />

      <button
        onClick={() => (window.location.href = "/admin/dashboard")}
        className="btn btn-warning align-items-center "
      >
        Go To Admin Dashboard
      </button>
    </div>
  );
}
export default AdminNotFound;