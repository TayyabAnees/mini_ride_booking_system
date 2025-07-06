import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './PassengerSignupForm.css';

export default function PassengerSignupForm() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        type: 'passenger'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        
        if (!form.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!form.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        
        if (!form.password) {
            newErrors.password = 'Password is required';
        } else if (form.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await axios.post('http://localhost:3000/register/passenger', form);
            alert('Passenger registered successfully!');
            navigate('/login');
        } catch (err) {
            alert('Signup failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setForm({ ...form, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="signup-header">
                    <div className="signup-icon">
                        👤
                    </div>
                    <h2 className="signup-title">Join as Passenger</h2>
                    <p className="signup-subtitle">Create your account to start booking rides</p>
                </div>

                <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            className="form-input"
                            placeholder="Enter your full name"
                            value={form.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                        {errors.name && <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.name}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="Enter your email address"
                            value={form.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                        {errors.email && <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.email}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="Create a secure password"
                            value={form.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                        />
                        {errors.password && <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.password}</div>}
                    </div>

                    <button 
                        className="signup-button"
                        onClick={handleSignup}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                Creating Account...
                            </div>
                        ) : (
                            '🚗 Create Account'
                        )}
                    </button>
                </form>

                <div className="switch-link">
                    <span onClick={() => navigate(-1)}>← Back to Login</span>
                </div>
            </div>
        </div>
    );
}
