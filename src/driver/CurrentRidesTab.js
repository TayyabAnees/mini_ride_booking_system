import { useState, useEffect } from 'react';
import axios from '../api';
import websocketService from '../services/websocketService';
import './CurrentRidesTab.css';

export default function CurrentRidesTab({ user }) {
    const [rideRequests, setRideRequests] = useState([]);
    const [currentRide, setCurrentRide] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect to WebSocket for real-time updates
        websocketService.connect(user.id, 'driver').then(() => {
            setIsConnected(true);
            console.log('Driver WebSocket connected successfully');
            
            // Listen for new ride requests
            websocketService.addListener('new_ride_request', handleNewRideRequest);
            websocketService.addListener('ride_accepted', handleRideAccepted);
            websocketService.addListener('ride_started', handleRideStarted);
            websocketService.addListener('ride_completed', handleRideCompleted);
            websocketService.addListener('ride_cancelled', handleRideCancelled);
        }).catch(error => {
            console.error('Failed to connect to WebSocket:', error);
            setIsConnected(false);
        });

        // Fetch current ride if driver has one
        fetchCurrentRide();
        
        // Fetch available ride requests
        fetchRideRequests();

        return () => {
            websocketService.removeListener('new_ride_request', handleNewRideRequest);
            websocketService.removeListener('ride_accepted', handleRideAccepted);
            websocketService.removeListener('ride_started', handleRideStarted);
            websocketService.removeListener('ride_completed', handleRideCompleted);
            websocketService.removeListener('ride_cancelled', handleRideCancelled);
        };
    }, []);

    // Update connection status periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setIsConnected(websocketService.getConnectionStatus());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const fetchCurrentRide = async () => {
        try {
            const response = await axios.get(`/rides/driver/${user.id}`);
            const activeRide = response.data.rides.find(ride => 
                ['Accepted', 'In Progress'].includes(ride.status)
            );
            if (activeRide) {
                setCurrentRide(activeRide);
            }
        } catch (error) {
            console.error('Error fetching current ride:', error);
        }
    };

    const fetchRideRequests = async () => {
        try {
            // This would typically come from a different endpoint
            // For now, we'll simulate it with WebSocket updates
            setRideRequests([]);
        } catch (error) {
            console.error('Error fetching ride requests:', error);
        }
    };

    const handleNewRideRequest = (data) => {
        // Only show requests that match the driver's ride type
        if (data.ride.rideType === user.ride_type) {
            setRideRequests(prev => {
                const exists = prev.find(req => req.ride.id === data.ride.id);
                if (!exists) {
                    return [...prev, data];
                }
                return prev;
            });
        }
    };

    const handleRideAccepted = (data) => {
        if (data.ride.driverId === user.id) {
            setCurrentRide(data.ride);
            setRideRequests(prev => prev.filter(req => req.ride.id !== data.ride.id));
        }
    };

    const handleRideStarted = (data) => {
        if (data.ride.driverId === user.id) {
            setCurrentRide(data.ride);
        }
    };

    const handleRideCompleted = (data) => {
        if (data.ride.driverId === user.id) {
            setCurrentRide(null);
        }
    };

    const handleRideCancelled = (data) => {
        if (data.ride.driverId === user.id) {
            setCurrentRide(null);
        }
        // Remove from requests if it was cancelled
        setRideRequests(prev => prev.filter(req => req.ride.id !== data.ride.id));
    };

    const handleAcceptRide = async (rideRequest) => {
        setIsLoading(true);
        try {
            await axios.post(`/accept-ride/${rideRequest.ride.id}`, {
                driverId: user.id
            });
            
            setCurrentRide(rideRequest.ride);
            setRideRequests(prev => prev.filter(req => req.ride.id !== rideRequest.ride.id));
        } catch (error) {
            console.error('Error accepting ride:', error);
            alert('Failed to accept ride. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectRide = async (rideRequest) => {
        setRideRequests(prev => prev.filter(req => req.ride.id !== rideRequest.ride.id));
    };

    const handleStartRide = async () => {
        if (!currentRide) return;
        
        setIsLoading(true);
        try {
            await axios.post(`/start-ride/${currentRide.id}`);
            // The WebSocket will handle the update
        } catch (error) {
            console.error('Error starting ride:', error);
            alert('Failed to start ride. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteRide = async () => {
        if (!currentRide) return;
        
        setIsLoading(true);
        try {
            await axios.post(`/complete-ride/${currentRide.id}`);
            // The WebSocket will handle the update
        } catch (error) {
            console.error('Error completing ride:', error);
            alert('Failed to complete ride. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelRide = async () => {
        if (!currentRide) return;
        setIsLoading(true);
        try {
            await axios.post(`/cancel-ride/${currentRide.id}`, {
                cancelledBy: 'driver'
            });
            // The WebSocket will handle the update
        } catch (error) {
            console.error('Error cancelling ride:', error);
            alert('Failed to cancel ride. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="current-rides-container">
            <div className="connection-status">
                <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                    {isConnected ? '🟢' : '🔴'} {isConnected ? 'Connected' : 'Disconnected'}
                </div>
            </div>

            {currentRide ? (
                <div className="current-ride-section">
                    <h2 className="section-title">🚗 Current Ride</h2>
                    <div className="current-ride-card">
                        <div className="ride-header">
                            <div className="ride-status">
                                <span className={`status-badge ${currentRide.status.toLowerCase().replace(' ', '-')}`}>
                                    {currentRide.status}
                                </span>
                            </div>
                            <div className="ride-type">
                                {currentRide.rideType}
                            </div>
                        </div>

                        <div className="ride-details">
                            <div className="ride-detail-item">
                                <div className="detail-icon">📍</div>
                                <div className="detail-content">
                                    <div className="detail-label">Pickup</div>
                                    <div className="detail-value">{currentRide.pickupLocation}</div>
                                </div>
                            </div>

                            <div className="ride-detail-item">
                                <div className="detail-icon">🎯</div>
                                <div className="detail-content">
                                    <div className="detail-label">Destination</div>
                                    <div className="detail-value">{currentRide.dropLocation}</div>
                                </div>
                            </div>

                            {currentRide.passenger && (
                                <div className="ride-detail-item">
                                    <div className="detail-icon">👤</div>
                                    <div className="detail-content">
                                        <div className="detail-label">Passenger</div>
                                        <div className="detail-value">{currentRide.passenger.name}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="ride-actions">
                            {currentRide.status === 'Accepted' && (
                                <button 
                                    className="action-btn start-btn"
                                    onClick={handleStartRide}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Starting...' : '🚗 Start Ride'}
                                </button>
                            )}

                            {currentRide.status === 'In Progress' && (
                                <button 
                                    className="action-btn complete-btn"
                                    onClick={handleCompleteRide}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Completing...' : '✅ Complete Ride'}
                                </button>
                            )}

                            <button 
                                className="action-btn cancel-btn"
                                onClick={handleCancelRide}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Cancelling...' : '❌ Cancel Ride'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="ride-requests-section">
                    <h2 className="section-title">📋 Available Ride Requests</h2>
                    
                    {rideRequests.length === 0 ? (
                        <div className="no-requests">
                            <div className="no-requests-icon">🚗</div>
                            <h3>No ride requests available</h3>
                            <p>New ride requests will appear here in real-time</p>
                        </div>
                    ) : (
                        <div className="ride-requests-list">
                            {rideRequests.map((request, index) => (
                                <div key={request.ride.id} className="ride-request-card">
                                    <div className="request-header">
                                        <div className="request-type">{request.ride.rideType}</div>
                                        <div className="request-time">Just now</div>
                                    </div>

                                    <div className="request-details">
                                        <div className="request-detail-item">
                                            <div className="detail-icon">📍</div>
                                            <div className="detail-content">
                                                <div className="detail-label">Pickup</div>
                                                <div className="detail-value">{request.ride.pickupLocation}</div>
                                            </div>
                                        </div>

                                        <div className="request-detail-item">
                                            <div className="detail-icon">🎯</div>
                                            <div className="detail-content">
                                                <div className="detail-label">Destination</div>
                                                <div className="detail-value">{request.ride.dropLocation}</div>
                                            </div>
                                        </div>

                                        {request.ride.passenger && (
                                            <div className="request-detail-item">
                                                <div className="detail-icon">👤</div>
                                                <div className="detail-content">
                                                    <div className="detail-label">Passenger</div>
                                                    <div className="detail-value">{request.ride.passenger.name}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="request-actions">
                                        <button 
                                            className="action-btn accept-btn"
                                            onClick={() => handleAcceptRide(request)}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Accepting...' : '✅ Accept'}
                                        </button>
                                        <button 
                                            className="action-btn reject-btn"
                                            onClick={() => handleRejectRide(request)}
                                            disabled={isLoading}
                                        >
                                            ❌ Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 