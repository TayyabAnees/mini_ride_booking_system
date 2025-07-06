import { useEffect, useState } from 'react';
import axios from '../api';
import './PastRidesTab.css';

export default function PastRidesTab() {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        axios.get(`/rides/passenger/${user.id}`)
            .then(res => {
                setRides(res.data.rides);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching rides:', error);
                setLoading(false);
            });
    }, []);

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'status-badge pending';
            case 'confirmed':
                return 'status-badge confirmed';
            case 'completed':
                return 'status-badge completed';
            case 'cancelled':
                return 'status-badge cancelled';
            default:
                return 'status-badge pending';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="past-rides-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    Loading your ride history...
                </div>
            </div>
        );
    }

    return (
        <div className="past-rides-container">
            <div className="past-rides-header">
                <div className="past-rides-icon">
                    📋
                </div>
                <div>
                    <h3 className="past-rides-title">Your Past Rides</h3>
                    <p className="past-rides-subtitle">Track your ride history and status</p>
                </div>
            </div>

            {rides.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        🚗
                    </div>
                    <h4 className="empty-state-title">No rides yet</h4>
                    <p className="empty-state-subtitle">
                        Your completed rides will appear here once you start booking
                    </p>
                </div>
            ) : (
                <div className="rides-list">
                    {rides.map(ride => (
                        <div key={ride.id} className="ride-card">
                            <div className="ride-header">
                                <div className="ride-info">
                                    <div className="ride-date">
                                        {formatDate(ride.createdAt || ride.date)}
                                    </div>
                                    <div className="ride-locations">
                                        <div className="location-item">
                                            <div className="location-icon">📍</div>
                                            <div className="location-text">{ride.pickupLocation}</div>
                                        </div>
                                        <div className="location-item">
                                            <div className="location-icon">🎯</div>
                                            <div className="location-text">{ride.dropLocation}</div>
                                        </div>
                                    </div>
                                </div>
                                <span className={getStatusBadgeClass(ride.status)}>
                                    {ride.status || 'Pending'}
                                </span>
                            </div>

                            <div className="ride-details">
                                <div className="ride-detail">
                                    <div className="ride-detail-icon">👤</div>
                                    <div className="ride-detail-content">
                                        <div className="ride-detail-label">Driver</div>
                                        <p className="ride-detail-value">
                                            {ride.driver?.name || 'Not Assigned'}
                                        </p>
                                    </div>
                                </div>

                                <div className="ride-detail">
                                    <div className="ride-detail-icon">🚗</div>
                                    <div className="ride-detail-content">
                                        <div className="ride-detail-label">Vehicle Type</div>
                                        <p className="ride-detail-value">
                                            {ride.rideType || 'Standard'}
                                        </p>
                                    </div>
                                </div>

                                {ride.fare && (
                                    <div className="ride-detail">
                                        <div className="ride-detail-icon">💰</div>
                                        <div className="ride-detail-content">
                                            <div className="ride-detail-label">Fare</div>
                                            <p className="ride-detail-value">
                                                ${ride.fare}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {ride.duration && (
                                    <div className="ride-detail">
                                        <div className="ride-detail-icon">⏱️</div>
                                        <div className="ride-detail-content">
                                            <div className="ride-detail-label">Duration</div>
                                            <p className="ride-detail-value">
                                                {ride.duration}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
