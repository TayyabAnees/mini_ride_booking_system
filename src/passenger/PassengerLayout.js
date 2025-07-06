import { useNavigate } from 'react-router-dom';
import './PassengerLayout.css'; // make sure to import CSS

export default function PassengerLayout({ children }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="passenger-container">
            <header className="passenger-header">
                <div className="passenger-brand">RideMate</div>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </header>

            <main className="passenger-main">
                {children}
            </main>
        </div>
    );
}
