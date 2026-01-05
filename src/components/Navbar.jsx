import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={{
      boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
    }}>
      <div className="navbar container">
        <h1 className="navbar-title loraFont">libra360°</h1>
        <div className="links">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
