import { useNavigate } from 'react-router-dom';
import './SignupOptions.css';

export default function SignupOptions() {
    const navigate = useNavigate();

    return (
        <div className="signup-options-container">
            <div className="signup-options-card">
                <div className="signup-options-header">
                    <div className="signup-options-icon">
                        🚗
                    </div>
                    <h2 className="signup-options-title">Join RideMate</h2>
                    <p className="signup-options-subtitle">Choose how you want to use our platform</p>
                </div>

                <div className="signup-options-buttons">
                    <button 
                        className="signup-option-button"
                        onClick={() => navigate('/signup/passenger')}
                    >
                        👤 Passenger
                    </button>
                    <button 
                        className="signup-option-button driver"
                        onClick={() => navigate('/signup/driver')}
                    >
                        🚗 Driver
                    </button>
                </div>

                <div className="switch-link">
                    Already have an account? <span onClick={() => navigate('/login')}>Login</span>
                </div>
            </div>
        </div>
    );
}
