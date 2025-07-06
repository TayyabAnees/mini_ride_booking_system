import { useState, useEffect } from 'react';
import axios from '../api';
import './PastRidesTab.css';

export default function PastRidesTab({ user }) {
    const [pastRides, setPastRides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, completed, cancelled

    useEffect(() => {
        fetchPastRides();
    }, []);

    const fetchPastRides = async () => {
        try {
            const response = await axios.get(`/rides/driver/${user.id}`);
            const completedRides = response.data.rides.filter(ride => 
                ['Completed', 'Cancelled'].includes(ride.status)
            );
            setPastRides(completedRides);
        } catch (error) {
            console.error('Error fetching past rides:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getFilteredRides = () => {
        switch (filter) {
            case 'completed':
                return pastRides.filter(ride => ride.status === 'Completed');
            case 'cancelled':
                return pastRides.filter(ride => ride.status === 'Cancelled');
            default:
                return pastRides;
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'status-badge completed';
            case 'cancelled':
                return 'status-badge cancelled';
            default:
                return 'status-badge';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRideTypeIcon = (rideType) => {
        switch (rideType) {
            case 'Bike':
                return '🛵';
            case 'Car':
                return '🚗';
            case 'Rickshaw':
                return '🛺';
            default:
                return '🚗';
        }
    };

    if (isLoading) {
        return (
            <div className="past-rides-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading past rides...</p>
                </div>
            </div>
        );
    }

    const filteredRides = getFilteredRides();

    return (
        <div className="past-rides-container">
            <div className="past-rides-header">
                <h2 className="section-title">📋 Past Rides</h2>
                <div className="filter-controls">
                    <button 
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({pastRides.length})
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completed ({pastRides.filter(ride => ride.status === 'Completed').length})
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                        onClick={() => setFilter('cancelled')}
                    >
                        Cancelled ({pastRides.filter(ride => ride.status === 'Cancelled').length})
                    </button>
                </div>
            </div>

            {filteredRides.length === 0 ? (
                <div className="no-rides">
                    <div className="no-rides-icon">📋</div>
                    <h3>No past rides found</h3>
                    <p>
                        {filter === 'all' 
                            ? "You haven't completed any rides yet." 
                            : filter === 'completed' 
                                ? "You haven't completed any rides yet."
                                : "You haven't cancelled any rides yet."
                        }
                    </p>
                </div>
            ) : (
                <div className="past-rides-list">
                    {filteredRides.map((ride, index) => (
                        <div key={ride.id} className="past-ride-card">
                            <div className="ride-header">
                                <div className="ride-info">
                                    <div className="ride-type-icon">
                                        {getRideTypeIcon(ride.rideType)}
                                    </div>
                                    <div className="ride-details">
                                        <div className="ride-type">{ride.rideType}</div>
                                        <div className="ride-date">{formatDate(ride.createdAt)}</div>
                                    </div>
                                </div>
                                <div className="ride-status">
                                    <span className={getStatusBadgeClass(ride.status)}>
                                        {ride.status}
                                    </span>
                                </div>
                            </div>

                            <div className="ride-locations">
                                <div className="location-item">
                                    <div className="location-icon pickup">📍</div>
                                    <div className="location-content">
                                        <div className="location-label">Pickup</div>
                                        <div className="location-address">{ride.pickupLocation}</div>
                                    </div>
                                </div>

                                <div className="location-item">
                                    <div className="location-icon drop">🎯</div>
                                    <div className="location-content">
                                        <div className="location-label">Destination</div>
                                        <div className="location-address">{ride.dropLocation}</div>
                                    </div>
                                </div>
                            </div>

                            {ride.passenger && (
                                <div className="passenger-info">
                                    <div className="passenger-icon">👤</div>
                                    <div className="passenger-details">
                                        <div className="passenger-label">Passenger</div>
                                        <div className="passenger-name">{ride.passenger.name}</div>
                                    </div>
                                </div>
                            )}

                            <div className="ride-footer">
                                <div className="ride-id">
                                    Ride ID: #{ride.id}
                                </div>
                                {ride.status === 'Completed' && (
                                    <div className="completion-info">
                                        ✅ Successfully completed
                                    </div>
                                )}
                                {ride.status === 'Cancelled' && (
                                    <div className="cancellation-info">
                                        ❌ Ride was cancelled
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