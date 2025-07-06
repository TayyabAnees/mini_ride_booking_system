import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CurrentRidesTab from './CurrentRidesTab';
import PastRidesTab from './PastRidesTab';
import './DriverPage.css';

export default function DriverPage() {
    const [activeTab, setActiveTab] = useState('current');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            navigate('/login');
            return;
        }
        setUser(userData);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="driver-page">
            <header className="driver-header">
                <div className="header-content">
                    <div className="header-left">
                        <div className="logo">
                            <span className="logo-icon">🚗</span>
                            <span className="logo-text">RideShare Driver</span>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span className="user-name">Welcome, {user.name}</span>
                            <span className="user-role">Driver</span>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="driver-main">
                <div className="tab-navigation">
                    <button 
                        className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
                        onClick={() => setActiveTab('current')}
                    >
                        🚗 Current Rides
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                        onClick={() => setActiveTab('past')}
                    >
                        📋 Past Rides
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        👤 Profile
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'current' && <CurrentRidesTab user={user} />}
                    {activeTab === 'past' && <PastRidesTab user={user} />}

                </div>
            </main>
        </div>
    );
} 