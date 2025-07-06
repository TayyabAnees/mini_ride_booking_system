import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPicker.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const pickupIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiM2NjdFRUEiLz4KPHBhdGggZD0iTTEyIDZDNi40OCA2IDIgMTAuNDggMiAxNkMyIDIxLjUyIDYuNDggMjYgMTIgMjZDMzIuNTIgMjYgMjIgMjEuNTIgMjIgMTZDMjIgMTAuNDggMTcuNTIgNiAxMiA2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEyIDEwQzE0LjIwOTEgMTAgMTYgMTEuNzkwOSAxNiAxNEMxNiAxNi4yMDkxIDE0LjIwOTEgMTggMTIgMThDOS43OTA5IDE4IDggMTYuMjA5MSA4IDE0QzggMTEuNzkwOSA5Ljc5MDkgMTAgMTIgMTBaIiBmaWxsPSIjNjY3RUVBIi8+Cjwvc3ZnPgo=',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const dropIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiMxMEI5ODEiLz4KPHBhdGggZD0iTTEyIDZDNi40OCA2IDIgMTAuNDggMiAxNkMyIDIxLjUyIDYuNDggMjYgMTIgMjZDMzIuNTIgMjYgMjIgMjEuNTIgMjIgMTZDMjIgMTAuNDggMTcuNTIgNiAxMiA2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEyIDEwQzE0LjIwOTEgMTAgMTYgMTEuNzkwOSAxNiAxNEMxNiAxNi4yMDkxIDE0LjIwOTEgMTggMTIgMThDOS43OTA5IDE4IDggMTYuMjA5MSA4IDE0QzggMTEuNzkwOSA5Ljc5MDkgMTAgMTIgMTBaIiBmaWxsPSIjMTBCOTgxIi8+Cjwvc3ZnPgo=',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng);
        },
    });
    return null;
}

export default function MapPicker({ setPickup, setDrop }) {
    const [pickupLocation, setPickupLocation] = useState(null);
    const [dropLocation, setDropLocation] = useState(null);
    const [pickupAddress, setPickupAddress] = useState('');
    const [dropAddress, setDropAddress] = useState('');
    const [activeMarker, setActiveMarker] = useState('pickup'); // 'pickup' or 'drop'
    const [center, setCenter] = useState([51.505, -0.09]); // Default to London
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef(null);

    // Get user's current location on component mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCenter([latitude, longitude]);
                },
                (error) => {
                    console.log('Error getting location:', error);
                    // Keep default center
                }
            );
        }
    }, []);

    const handleMapClick = async (latlng) => {
        const address = await reverseGeocode(latlng);
        
        if (activeMarker === 'pickup') {
            setPickupLocation(latlng);
            setPickupAddress(address);
            setPickup(address);
            setActiveMarker('drop');
        } else {
            setDropLocation(latlng);
            setDropAddress(address);
            setDrop(address);
            setActiveMarker('pickup');
        }
    };

    const clearMarkers = () => {
        setPickupLocation(null);
        setDropLocation(null);
        setPickupAddress('');
        setDropAddress('');
        setPickup('');
        setDrop('');
        setActiveMarker('pickup');
    };

    const searchAddress = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://corsproxy.io/?https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching address:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setShowSearchResults(true);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for search
        searchTimeoutRef.current = setTimeout(() => {
            searchAddress(query);
        }, 500);
    };

    const handleSearchResultClick = async (result) => {
        const latlng = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
        const address = result.display_name;
        
        if (activeMarker === 'pickup') {
            setPickupLocation(latlng);
            setPickupAddress(address);
            setPickup(address);
            setActiveMarker('drop');
        } else {
            setDropLocation(latlng);
            setDropAddress(address);
            setDrop(address);
            setActiveMarker('pickup');
        }

        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
        setCenter([latlng.lat, latlng.lng]);
    };

    const reverseGeocode = async (latlng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            return data.display_name;
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            return `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
        }
    };

    const handleMarkerClick = async (latlng, type) => {
        const address = await reverseGeocode(latlng);
        if (type === 'pickup') {
            setPickupAddress(address);
            setPickup(address);
        } else {
            setDropAddress(address);
            setDrop(address);
        }
    };

    return (
        <div className="map-picker">
            <div className="map-instructions">
                <div className="instruction-text">
                    {activeMarker === 'pickup' 
                        ? '📍 Click on the map to set pickup location' 
                        : '🎯 Click on the map to set drop location'
                    }
                </div>
                <button className="clear-markers-btn" onClick={clearMarkers}>
                    🗑️ Clear All
                </button>
            </div>

            <div className="search-container">
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="🔍 Search for an address..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => setShowSearchResults(true)}
                    />
                    {isSearching && <div className="search-spinner"></div>}
                </div>
                
                {showSearchResults && searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map((result, index) => (
                            <div
                                key={index}
                                className="search-result-item"
                                onClick={() => handleSearchResultClick(result)}
                            >
                                <div className="search-result-icon">
                                    {activeMarker === 'pickup' ? '📍' : '🎯'}
                                </div>
                                <div className="search-result-text">
                                    <div className="search-result-title">{result.display_name.split(',')[0]}</div>
                                    <div className="search-result-subtitle">{result.display_name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="map-container">
                <MapContainer 
                    center={center} 
                    zoom={13} 
                    style={{ height: '400px', width: '100%', borderRadius: '12px' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    <MapClickHandler onMapClick={handleMapClick} />
                    
                    {pickupLocation && (
                        <Marker 
                            position={pickupLocation} 
                            icon={pickupIcon}
                            eventHandlers={{
                                click: () => handleMarkerClick(pickupLocation, 'pickup')
                            }}
                        >
                            <Popup>
                                <div>
                                    <strong>Pickup Location</strong><br />
                                    {pickupAddress || `${pickupLocation.lat.toFixed(6)}, ${pickupLocation.lng.toFixed(6)}`}
                                </div>
                            </Popup>
                        </Marker>
                    )}
                    
                    {dropLocation && (
                        <Marker 
                            position={dropLocation} 
                            icon={dropIcon}
                            eventHandlers={{
                                click: () => handleMarkerClick(dropLocation, 'drop')
                            }}
                        >
                            <Popup>
                                <div>
                                    <strong>Drop Location</strong><br />
                                    {dropAddress || `${dropLocation.lat.toFixed(6)}, ${dropLocation.lng.toFixed(6)}`}
                                </div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            <div className="location-display">
                {pickupAddress && (
                    <div className="location-item pickup">
                        <div className="location-icon">📍</div>
                        <div className="location-content">
                            <div className="location-label">Pickup</div>
                            <div className="location-address">{pickupAddress}</div>
                        </div>
                    </div>
                )}
                
                {dropAddress && (
                    <div className="location-item drop">
                        <div className="location-icon">🎯</div>
                        <div className="location-content">
                            <div className="location-label">Destination</div>
                            <div className="location-address">{dropAddress}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
