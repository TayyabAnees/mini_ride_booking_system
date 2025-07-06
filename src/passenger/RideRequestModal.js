import { useState, useEffect } from 'react';
import axios from '../api';
import websocketService from '../services/websocketService';
import './RideRequestModal.css';

export default function RideRequestModal({ data, onRideUpdate }) {
    const [rideData, setRideData] = useState(data);
    const [isLoading, setIsLoading] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [showDrivers, setShowDrivers] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        // Start timer
        const timer = setInterval(() => {
            setTimeElapsed(prev => prev + 1);
        }, 1000);

        // Connect to WebSocket for real-time updates
        if (user) {
            websocketService.connect(user.id, 'passenger').then(() => {
                console.log('Passenger WebSocket connected successfully');
                
                // Listen for ride updates
                websocketService.addListener('ride_accepted', handleRideAccepted);
                websocketService.addListener('ride_started', handleRideStarted);
                websocketService.addListener('ride_completed', handleRideCompleted);
                websocketService.addListener('ride_cancelled', handleRideCancelled);
                websocketService.addListener('ride_updated', handleRideUpdated);
            }).catch(error => {
                console.error('Failed to connect to WebSocket:', error);
            });
        }

        // Fetch available drivers
        fetchAvailableDrivers();

        return () => {
            clearInterval(timer);
            websocketService.removeListener('ride_accepted', handleRideAccepted);
            websocketService.removeListener('ride_started', handleRideStarted);
            websocketService.removeListener('ride_completed', handleRideCompleted);
            websocketService.removeListener('ride_cancelled', handleRideCancelled);
            websocketService.removeListener('ride_updated', handleRideUpdated);
        };
    }, []);

    const fetchAvailableDrivers = async () => {
        try {
            const response = await axios.get(`/available-drivers/${rideData.ride.rideType}`);
            setAvailableDrivers(response.data.drivers);
        } catch (error) {
            console.error('Error fetching available drivers:', error);
        }
    };

    const handleRideAccepted = (updateData) => {
        if (updateData.ride.id === rideData.ride.id) {
            setRideData(prev => ({
                ...prev,
                ride: updateData.ride
            }));
            if (onRideUpdate) {
                onRideUpdate(updateData.ride);
            }
        }
    };

    const handleRideStarted = (updateData) => {
        if (updateData.ride.id === rideData.ride.id) {
            setRideData(prev => ({
                ...prev,
                ride: updateData.ride
            }));
            if (onRideUpdate) {
                onRideUpdate(updateData.ride);
            }
        }
    };

    const handleRideCompleted = (updateData) => {
        if (updateData.ride.id === rideData.ride.id) {
            setRideData(prev => ({
                ...prev,
                ride: updateData.ride
            }));
            if (onRideUpdate) {
                onRideUpdate(updateData.ride);
            }
        }
    };

    const handleRideCancelled = (updateData) => {
        if (updateData.ride.id === rideData.ride.id) {
            setRideData(prev => ({
                ...prev,
                ride: updateData.ride
            }));
            if (onRideUpdate) {
                onRideUpdate(updateData.ride);
            }
        }
    };

    const handleRideUpdated = (updateData) => {
        if (updateData.ride.id === rideData.ride.id) {
            setRideData(prev => ({
                ...prev,
                ride: updateData.ride
            }));
            if (onRideUpdate) {
                onRideUpdate(updateData.ride);
            }
        }
    };

    const handleCancelRide = async () => {


        setIsLoading(true);
        try {
            await axios.post(`/cancel-ride/${rideData.ride.id}`, {
                cancelledBy: 'passenger'
            });
            
            setRideData(prev => ({
                ...prev,
                ride: { ...prev.ride, status: 'Cancelled' }
            }));
            
            if (onRideUpdate) {
                onRideUpdate({ ...rideData.ride, status: 'Cancelled' });
            }
        } catch (error) {
            console.error('Error cancelling ride:', error);
            alert('Failed to cancel ride. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'requested':
                return 'status-badge requested';
            case 'accepted':
                return 'status-badge accepted';
            case 'in progress':
                return 'status-badge in-progress';
            case 'completed':
                return 'status-badge completed';
            case 'cancelled':
                return 'status-badge cancelled';
            default:
                return 'status-badge requested';
        }
    };

    const getStatusMessage = (status) => {
        switch (status?.toLowerCase()) {
            case 'requested':
                return 'Looking for drivers...';
            case 'accepted':
                return 'Driver is on the way!';
            case 'in progress':
                return 'Ride in progress';
            case 'completed':
                return 'Ride completed';
            case 'cancelled':
                return 'Ride cancelled';
            default:
                return 'Processing your request...';
        }
    };

    return (
        <div className="ride-request-modal">
            <div className="ride-request-header">
                <div className="ride-request-icon">
                    {rideData.ride.status === 'In Progress' ? '🚗' : 
                     rideData.ride.status === 'Completed' ? '✅' : 
                     rideData.ride.status === 'Cancelled' ? '❌' : '🚗'}
                </div>
                <div>
                    <h3 className="ride-request-title">Ride Request</h3>
                    <p className="ride-request-subtitle">{getStatusMessage(rideData.ride.status)}</p>
                    {rideData.ride.status === 'Requested' && (
                        <div className="ride-timer">
                            ⏱️ {formatTime(timeElapsed)}
                        </div>
                    )}
                </div>
            </div>

            <div className="ride-details">
                <div className="ride-detail-item">
                    <div className="ride-detail-icon">📍</div>
                    <div className="ride-detail-content">
                        <div className="ride-detail-label">Pickup Location</div>
                        <p className="ride-detail-value">{rideData.ride.pickupLocation}</p>
                    </div>
                </div>

                <div className="ride-detail-item">
                    <div className="ride-detail-icon">🎯</div>
                    <div className="ride-detail-content">
                        <div className="ride-detail-label">Destination</div>
                        <p className="ride-detail-value">{rideData.ride.dropLocation}</p>
                    </div>
                </div>

                <div className="ride-detail-item">
                    <div className="ride-detail-icon">🚗</div>
                    <div className="ride-detail-content">
                        <div className="ride-detail-label">Ride Type</div>
                        <p className="ride-detail-value">{rideData.ride.rideType}</p>
                    </div>
                </div>

                <div className="ride-detail-item">
                    <div className="ride-detail-icon">📊</div>
                    <div className="ride-detail-content">
                        <div className="ride-detail-label">Status</div>
                        <span className={getStatusBadgeClass(rideData.ride.status)}>
                            {rideData.ride.status || 'Requested'}
                        </span>
                    </div>
                </div>

                {rideData.ride.driver && (
                    <div className="ride-detail-item">
                        <div className="ride-detail-icon">👤</div>
                        <div className="ride-detail-content">
                            <div className="ride-detail-label">Driver</div>
                            <p className="ride-detail-value">{rideData.ride.driver.user?.name || 'Driver Assigned'}</p>
                        </div>
                    </div>
                )}

                {rideData.ride.status === 'Requested' && availableDrivers.length > 0 && (
                    <div className="ride-detail-item">
                        <div className="ride-detail-icon">👥</div>
                        <div className="ride-detail-content">
                            <div className="ride-detail-label">Available Drivers</div>
                            <button 
                                className="show-drivers-btn"
                                onClick={() => setShowDrivers(!showDrivers)}
                            >
                                {showDrivers ? 'Hide' : 'Show'} {availableDrivers.length} drivers
                            </button>
                            
                            {showDrivers && (
                                <div className="drivers-list">
                                    {availableDrivers.map((driver, index) => (
                                        <div key={driver.id} className="driver-item">
                                            <div className="driver-info">
                                                <span className="driver-name">{driver.user?.name || 'Driver'}</span>
                                                <span className="driver-type">{driver.ride_type}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {rideData.ride.status === 'Requested' && (
                <div className="ride-actions">
                    <button 
                        className="cancel-ride-btn"
                        onClick={handleCancelRide}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Cancelling...' : '❌ Cancel Ride'}
                    </button>
                </div>
            )}

            {rideData.ride.status === 'Accepted' && (
                <div className="ride-actions">
                    <div className="driver-arrival-info">
                        🚗 Your driver is on the way!
                    </div>
                </div>
            )}

            {rideData.ride.status === 'In Progress' && (
                <div className="ride-actions">
                    <div className="ride-progress-info">
                        🚗 Ride in progress...
                    </div>
                </div>
            )}

            {rideData.ride.status === 'Completed' && (
                <div className="ride-actions">
                    <div className="ride-completed-info">
                        ✅ Ride completed successfully!
                    </div>
                </div>
            )}

            {rideData.ride.status === 'Cancelled' && (
                <div className="ride-actions">
                    <div className="ride-cancelled-info">
                        ❌ Ride was cancelled
                    </div>
                </div>
            )}
        </div>
    );
}
