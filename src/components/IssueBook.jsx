import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const IssueBook = () => {
    const navigate = useNavigate();
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        user_id: '',
        book_id: '',
        issue_date: today,
        due_date: '',
        status: 'Issued'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation: Ensure Due Date is not before today
        if (formData.due_date < today) {
            alert("Return date cannot be earlier than today!");
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/book-issue', formData, { withCredentials: true });
            alert("Book issued successfully!");
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || "Error: Check IDs or verify book stock availability.");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm border-0">
                        {/* Header */}
                        <div className="card-header bg-primary text-white py-3 d-flex align-items-center justify-content-between">
                            <h5 className="mb-0">
                                <AssignmentIcon className="me-2" /> Issue Book (Manual Entry)
                            </h5>
                            <button className="btn btn-sm btn-light" onClick={() => navigate(-1)}>
                                <ArrowBackIcon fontSize="small" /> Back
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                {/* Member ID Input */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Member ID / User ID</label>
                                    <input 
                                        type="number" 
                                        name="user_id" 
                                        className="form-control" 
                                        placeholder="e.g. 101" 
                                        required 
                                        onChange={handleChange} 
                                    />
                                    <div className="form-text">Enter the registered unique Member ID.</div>
                                </div>

                                {/* Book ID Input */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Book ID</label>
                                    <input 
                                        type="number" 
                                        name="book_id" 
                                        className="form-control" 
                                        placeholder="e.g. 505" 
                                        required 
                                        onChange={handleChange} 
                                    />
                                    <div className="form-text">Enter the unique Book ID from inventory.</div>
                                </div>

                                <div className="row">
                                    {/* Issue Date (Read Only - Default Today) */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Issue Date</label>
                                        <input 
                                            type="date" 
                                            name="issue_date" 
                                            className="form-control bg-light" 
                                            value={formData.issue_date} 
                                            readOnly 
                                        />
                                    </div>

                                    {/* Due Date (Restricted to Today or later) */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Due Date</label>
                                        <input 
                                            type="date" 
                                            name="due_date" 
                                            className="form-control" 
                                            min={today} // Prevents selection of past dates
                                            required 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>

                                {/* Form Action */}
                                <div className="mt-4 pt-3 border-top text-end">
                                    <button type="submit" className="btn btn-primary px-5 py-2 fw-bold">
                                        <SaveIcon className="me-2" /> Confirm Issue
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

export default IssueBook;