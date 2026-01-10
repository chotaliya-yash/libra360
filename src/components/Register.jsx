import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

const RegisterUser = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        gender: '',
        date_of_birth: '',
        home_address: '',
        is_active: true // ડિફોલ્ટ એક્ટિવ
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // બેકએન્ડ API કોલ
            await axios.post('http://localhost:5000/api/admin/signup', formData, { withCredentials: true });
            alert("નવા સભ્યની નોંધણી સફળતાપૂર્વક થઈ ગઈ છે!");
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || "નોંધણીમાં ભૂલ આવી છે.");
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
                            <button className="btn btn-sm btn-outline-light" onClick={() => navigate(-1)}>
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
                                        <input type="text" name="full_name" className="form-control shadow-none" placeholder="Enter member's full name" required onChange={handleChange} />
                                    </div>

                                    {/* Email & Phone */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Email Address</label>
                                        <input type="email" name="email" className="form-control shadow-none" placeholder="member@email.com" required onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Phone Number</label>
                                        <input type="text" name="phone" className="form-control shadow-none" placeholder="+91 XXXXX XXXXX" required onChange={handleChange} />
                                    </div>

                                    {/* Password & DOB */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Password</label>
                                        <input type="password" name="password" className="form-control shadow-none" placeholder="Create a secure password" required onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Date of Birth</label>
                                        <input type="date" name="date_of_birth" className="form-control shadow-none" required onChange={handleChange} />
                                    </div>

                                    {/* Gender Selection */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Gender</label>
                                        <select name="gender" className="form-select shadow-none" required onChange={handleChange}>
                                            <option value="">Choose Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    {/* Address */}
                                    <div className="col-md-12">
                                        <label className="form-label fw-semibold">Home Address</label>
                                        <textarea name="home_address" className="form-control shadow-none" rows="3" placeholder="Enter permanent residence address" required onChange={handleChange}></textarea>
                                    </div>
                                </div>

                                {/* Submit Actions */}
                                <div className="mt-4 border-top pt-3 d-flex justify-content-end gap-2">
                                    <button type="reset" className="btn btn-outline-secondary px-4">Reset</button>
                                    <button type="submit" className="btn btn-dark px-5">
                                        <SaveIcon className="me-2" /> Save Member Details
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterUser;