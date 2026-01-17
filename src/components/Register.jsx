import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

const Register = () => {
  useEffect(() => {
    document.title = "Register New Member - Libra360";
  }, []);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    home_address: "",
    is_active: true,
  });
  const [successMessage, setSuccessMessage] = useState(false);
  const [ErrorMessage, setErrorMessage] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length > 10) {
      setTimeout(() => {
        setErrorMessage("Phone number cannot exceed 10 digits");
      }, 1000);
      return;
    }
    if (formData.phone.length < 10) {
      setTimeout(() => {
        setErrorMessage("Phone number must be 10 digits long");
      }, 1000);
      return;
    }

    if (formData.password.length < 6) {
      setTimeout(() => {
        setErrorMessage("Password must be at least 6 characters long");
      }, 1000);
      return;
    }

    if (!formData.email.includes("@")) {
      setTimeout(() => {
        setErrorMessage("Please enter a valid email address");
      }, 1000);
      return;
    }

    if (!formData.full_name.match(/^[a-zA-Z\s]+$/)) {
      setTimeout(() => {
        setErrorMessage("Full name can only contain letters and spaces");
      }, 1000);
      return;
    }
    if (formData.home_address.length < 10) {
      setTimeout(() => {
        setErrorMessage("Home address must be at least 10 characters long");
      }, 1000);
      return;
    }
    if (formData.date_of_birth >= new Date().toISOString().split("T")[0]) {
      setTimeout(() => {
        setErrorMessage("Please enter a valid date of birth");
      }, 1000);
      return;
    }
    try {
      await axios
        .post("http://localhost:5000/api/admin/Register-member", formData, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.status === 201) {
            setSuccessMessage({
              message: "Member registered successfully!",
              name: res.data.member.full_name,
              id: res.data.member.member_id,
            });
            setTimeout(() => {
              setSuccessMessage("");
              setErrorMessage(false);
            }, 10000);
          }
          if (res.status === 409) {
            setErrorMessage("Email already registered");
            setTimeout(() => {
              setErrorMessage("");
              setSuccessMessage(false);
            }, 2000);
          }
          if (res.status === 401) {
            setErrorMessage("Invalid credentials");
            navigate("/admin/login");
            return;
          }
        });
    } catch (err) {
      if (err.response?.status === 409) {
        setErrorMessage("Email already registered");
        setTimeout(() => {
          setErrorMessage("");
        }, 2000);
        return;
      }
      if (err.response?.status === 401) {
        setTimeout(() => {
          setErrorMessage("Invalid credentials");
        }, 2000);
        navigate("/admin/login");
        return;
      }
      alert(err.response?.data?.message || "Error registering member");
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card shadow-sm border-0">
            {/* Header */}
            <div className="card-header bg-dark text-white py-3 d-flex align-items-center justify-content-between">
              <h5 className="mb-0">
                <PersonAddAlt1Icon className="me-2" /> Register New Member
              </h5>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={() => navigate(-1)}
              >
                <ArrowBackIcon fontSize="small" /> Back to Dashboard
              </button>
            </div>

            {/* Form Body */}
            <div className="card-body p-4 bg-white">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  {/* Full Name */}
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      className="form-control shadow-none"
                      placeholder="Enter member's full name"
                      required
                      onChange={handleChange}
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control shadow-none"
                      placeholder="member@email.com"
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control shadow-none"
                      placeholder="+91 XXXXX XXXXX"
                      required
                      onChange={handleChange}
                    />
                  </div>

                  {/* Password & DOB */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control shadow-none"
                      placeholder="Create a secure password"
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      className="form-control shadow-none"
                      required
                      onChange={handleChange}
                    />
                  </div>

                  {/* Gender Selection */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Gender</label>
                    <select
                      name="gender"
                      className="form-select shadow-none"
                      required
                      onChange={handleChange}
                    >
                      <option value="">Choose Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">
                      Home Address
                    </label>
                    <textarea
                      name="home_address"
                      className="form-control shadow-none"
                      rows="3"
                      placeholder="Enter permanent residence address"
                      required
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="mt-4 border-top pt-3 d-flex justify-content-between gap-2">
                  <div>
                    {successMessage && (
                      <div className="alert alert-success" role="alert">
                        Member "{successMessage.name}" registered successfully!
                        <br />
                        Member ID: #
                        {successMessage.id.toString().padStart(4, "0")} 
                      </div>
                    )}
                    {ErrorMessage && (
                      <div className="alert alert-danger" role="alert">
                        {ErrorMessage}
                      </div>
                    )}
                  </div>
                  <div>
                    <button
                      type="reset"
                      className="btn btn-outline-secondary px-4"
                    >
                      Reset
                    </button>
                    <button type="submit" className="btn btn-dark px-5">
                      <SaveIcon className="me-2" /> Save Member Details
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
