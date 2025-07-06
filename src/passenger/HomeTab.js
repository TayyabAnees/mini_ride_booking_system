import { useState } from 'react';
import MapPicker from './MapPicker';
import RideRequestModal from './RideRequestModal';
import axios from '../api';
import './HomeTab.css';

export default function HomeTab() {
    const [pickup, setPickup] = useState('');
    const [drop, setDrop] = useState('');
    const [rideType, setRideType] = useState('Bike');
    const [modalData, setModalData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));

    const handleSubmit = async () => {
        if (!pickup || !drop) {
            alert('Please enter both pickup and drop locations');
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.post('/request-ride', {
                pickupLocation: pickup,
                dropLocation: drop,
                rideType,
                passengerId: user.id,
            });
            console.log(res.data);
            setModalData(res.data);
        } catch (error) {
            console.error('Error requesting ride:', error);
            alert('Failed to request ride. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRideUpdate = (updatedRide) => {
        setModalData(prev => ({
            ...prev,
            ride: updatedRide
        }));
    };

    return (
        <div className="home-container">
            <div className="map-and-form-container">
                <div className="map-section">
                    <MapPicker setPickup={setPickup} setDrop={setDrop} />
                </div>

                <div className="form-section">
                    <div className="ride-type-selector">
                        <label htmlFor="rideType">Choose Your Ride Type</label>
                        <select 
                            id="rideType"
                            className="ride-type-select"
                            value={rideType} 
                            onChange={(e) => setRideType(e.target.value)}
                        >
                            <option value="Bike">🛵 Bike</option>
                            <option value="Car">🚗 Car</option>
                            <option value="Rickshaw">🛺 Rickshaw</option>
                        </select>
                    </div>

                    <button 
                        className="find-drivers-btn"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="loading-spinner"></div>
                                Finding Drivers...
                            </>
                        ) : (
                            '🚗 Find Drivers'
                        )}
                    </button>
                </div>
            </div>

            {modalData && (
                <div className="ride-request-section">
                    <RideRequestModal 
                        data={modalData} 
                        onRideUpdate={handleRideUpdate}
                    />
                </div>
            )}
        </div>
    );
}
