import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './DriverSignupForm.css';

export default function DriverSignupForm() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        type: 'driver',
        ride_type: 'Bike'
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
            await axios.post('http://localhost:3000/register/driver', form);
            alert('Driver registered successfully!');
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
        <div className="driver-signup-container">
            <div className="driver-signup-card">
                <div className="driver-signup-header">
                    <div className="driver-signup-icon">
                        🚗
                    </div>
                    <h2 className="driver-signup-title">Join as Driver</h2>
                    <p className="driver-signup-subtitle">Start earning by providing rides</p>
                </div>

                <form className="driver-signup-form" onSubmit={(e) => e.preventDefault()}>
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

                    <div className="form-group">
                        <label htmlFor="ride_type">Vehicle Type</label>
                        <select
                            id="ride_type"
                            className="ride-type-select"
                            value={form.ride_type}
                            onChange={(e) => handleInputChange('ride_type', e.target.value)}
                        >
                            <option value="Bike">🛵 Bike</option>
                            <option value="Car">🚗 Car</option>
                            <option value="Rickshaw">🛺 Rickshaw</option>
                        </select>
                    </div>

                    <button 
                        className="driver-signup-button"
                        onClick={handleSignup}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                Creating Account...
                            </div>
                        ) : (
                            '🚗 Create Driver Account'
                        )}
                    </button>
                </form>

                <div className="switch-link">
                    <span onClick={() => navigate(-1)}>← Back to Signup Options</span>
                </div>
            </div>
        </div>
    );
}
