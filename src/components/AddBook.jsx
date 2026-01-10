import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BookIcon from '@mui/icons-material/Book';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AddBook = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        isbn_number: '',
        category_id: '',
        author_id: '',
        price: '',
        quantity: ''
    });
    const [successMessage, setSuccessMessage] = useState(false);
    const [ErrorMessage, setErrorMessage] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const catRes = await axios.get('http://localhost:5000/api/categories');
                const authRes = await axios.get('http://localhost:5000/api/authors');
                setCategories(catRes.data);
                setAuthors(authRes.data);
            } catch (err) {
                console.error("Error loading categories or authors", err);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // available_stock પણ અહીં quantity જેટલો જ સેટ થશે શરૂઆતમાં
            const dataToSend = { ...formData, available_stock: formData.quantity };
            await axios.post('http://localhost:5000/api/books/add', dataToSend, { withCredentials: true });
            alert("Book added successfully!");
            setTimeout(()=>{
                setSuccessMessage(true);
            }, 5000);
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || "Error adding book");
            setErrorMessage(err.response?.data?.message || "Error adding book");
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow border-0">
                <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between">
                    <h5 className="mb-0"><BookIcon className="me-2" /> Add New Book</h5>
                    <button className="btn btn-sm btn-light" onClick={() => navigate(-1)}>
                        <ArrowBackIcon fontSize="small" /> Back
                    </button>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            {/* Title */}
                            {successMessage && (
                                <div className="alert alert-success" role="alert">
                                    Book added successfully!
                                </div>
                            )}
                            {ErrorMessage && (
                                <div className="alert alert-danger" role="alert">
                                    {ErrorMessage}
                                </div>
                            )}
                            <div className="col-md-8 mb-3">
                                <label className="form-label fw-bold">Book Title</label>
                                <input type="text" name="title" className="form-control" placeholder="Enter book title" required onChange={handleChange} />
                            </div>

                            {/* ISBN Number */}
                            <div className="col-md-4 mb-3">
                                <label className="form-label fw-bold">ISBN Number</label>
                                <input type="text" name="isbn_number" className="form-control" placeholder="e.g. 978-3-16-148410-0" required onChange={handleChange} />
                            </div>

                            {/* Author Dropdown */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Author</label>
                                <select name="author_id" className="form-select" required onChange={handleChange}>
                                    <option value="">Select Author</option>
                                    {authors.map(auth => (
                                        <option key={auth.author_id} value={auth.author_id}>{auth.author_name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Category Dropdown */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Category</label>
                                <select name="category_id" className="form-select" required onChange={handleChange}>
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Price (₹)</label>
                                <input type="number" step="0.01" name="price" className="form-control" placeholder="0.00" required onChange={handleChange} />
                            </div>

                            {/* Quantity */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Quantity</label>
                                <input type="number" name="quantity" className="form-control" placeholder="Total copies" required onChange={handleChange} />
                            </div>
                        </div>

                        <div className="mt-4 border-top pt-3 text-end">
                            <button type="reset" className="btn btn-outline-secondary me-2 px-4">Clear</button>
                            <button type="submit" className="btn btn-primary px-4">
                                <SaveIcon className="me-2" /> Save Book
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddBook;