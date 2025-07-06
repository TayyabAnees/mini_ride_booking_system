import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

export default function LoginForm() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        
        if (!form.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        
        if (!form.password) {
            newErrors.password = 'Password is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.post('http://localhost:3000/login', form);
            // Save user info in localStorage
            localStorage.setItem('user', JSON.stringify(res.data.auth));
            if (res.data.userType === 'passenger') {
                navigate('/passenger');
            } else if (res.data.userType === 'driver') {
                console.log(res.data);
                navigate('/driver');
            } else {
                alert('Unknown user type');
            }
        } catch (err) {
            alert('Login failed: ' + err.response?.data?.error || err.message);
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
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">
                        🔐
                    </div>
                    <h2 className="login-title">Welcome Back</h2>
                    <p className="login-subtitle">Sign in to your account to continue</p>
                </div>

                <form className="login-form" onSubmit={(e) => e.preventDefault()}>
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
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                        />
                        {errors.password && <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.password}</div>}
                    </div>

                    <button 
                        className="login-button"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                Signing In...
                            </div>
                        ) : (
                            '🔐 Sign In'
                        )}
                    </button>
                </form>

                <div className="switch-link">
                    Don't have an account? <span onClick={() => navigate('/')}>Sign Up</span>
                </div>
            </div>
        </div>
    );
}
