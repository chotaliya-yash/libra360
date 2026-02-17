import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
const Navbar = () => {
  const [isAuth, setIsAuth] = useState(false);
  useState(() => {
    const loggedIn = localStorage.getItem("loginCheck");
    setIsAuth(loggedIn);
  }, [100]);
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/member/logout",
        {},
        {
          withCredentials: true,
        },
      );

      localStorage.removeItem("loginCheck");
      localStorage.removeItem("memberName");

      setIsAuth(false);

      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  return (
    <nav
      style={{
        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
      }}
    >
      <div className="navbar container">
        <h1 className="navbar-title loraFont gradient-text">libra360°</h1>
        <div className="links">
          <Link to="/">Home</Link>
          {isAuth ? (
            <>
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
                style={{ cursor: "pointer" }}
              >
                Logout
              </Link>
              <Link to="/mybook"> My Book</Link>
              <Link to="/profile">Profile</Link>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
