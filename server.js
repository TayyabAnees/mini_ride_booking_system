const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
let users = [
    { id: 1, name: 'John Passenger', email: 'passenger@test.com', password: '123456', type: 'passenger' },
    { id: 2, name: 'Mike Driver', email: 'driver@test.com', password: '123456', type: 'driver', ride_type: 'Car' }
];

let rides = [];
let rideIdCounter = 1;

// WebSocket connections storage
const connections = new Map(); // userId -> WebSocket

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'subscribe') {
                // Store connection with user info
                connections.set(data.userId, {
                    ws: ws,
                    userType: data.userType
                });
                console.log(`User ${data.userId} (${data.userType}) subscribed`);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    });

    ws.on('close', () => {
        // Remove connection when user disconnects
        for (const [userId, connection] of connections.entries()) {
            if (connection.ws === ws) {
                connections.delete(userId);
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    });
});

// Broadcast function to send updates to relevant users
function broadcastToUser(userId, data) {
    const connection = connections.get(userId);
    if (connection && connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(data));
    }
}

function broadcastToDrivers(data) {
    for (const [userId, connection] of connections.entries()) {
        if (connection.userType === 'driver' && connection.ws.readyState === WebSocket.OPEN) {
            connection.ws.send(JSON.stringify(data));
        }
    }
}

// Authentication endpoints
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        res.json({
            auth: user,
            userType: user.type
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/register/passenger', (req, res) => {
    const { name, email, password } = req.body;
    
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email already exists' });
    }
    
    const newUser = {
        id: users.length + 1,
        name,
        email,
        password,
        type: 'passenger'
    };
    
    users.push(newUser);
    res.json({ message: 'Passenger registered successfully', user: newUser });
});

app.post('/register/driver', (req, res) => {
    const { name, email, password, ride_type } = req.body;
    
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email already exists' });
    }
    
    const newUser = {
        id: users.length + 1,
        name,
        email,
        password,
        type: 'driver',
        ride_type
    };
    
    users.push(newUser);
    res.json({ message: 'Driver registered successfully', user: newUser });
});

// Ride endpoints
app.post('/request-ride', (req, res) => {
    const { pickupLocation, dropLocation, rideType, passengerId } = req.body;
    
    const passenger = users.find(u => u.id === passengerId);
    if (!passenger) {
        return res.status(404).json({ error: 'Passenger not found' });
    }
    
    const newRide = {
        id: rideIdCounter++,
        pickupLocation,
        dropLocation,
        rideType,
        passengerId,
        passenger: { id: passenger.id, name: passenger.name },
        status: 'Pending',
        createdAt: new Date().toISOString()
    };
    
    rides.push(newRide);
    
    // Broadcast new ride request to all drivers
    broadcastToDrivers({
        type: 'ride_update',
        data: {
            type: 'new_ride_request',
            ride: newRide
        }
    });
    
    res.json({
        ride: newRide,
        message: 'Ride request created successfully'
    });
});

app.post('/accept-ride/:rideId', (req, res) => {
    const { rideId } = req.params;
    const { driverId } = req.body;
    
    const ride = rides.find(r => r.id === parseInt(rideId));
    if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
    }
    
    const driver = users.find(u => u.id === driverId);
    if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
    }
    
    ride.status = 'Accepted';
    ride.driverId = driverId;
    ride.driver = { id: driver.id, name: driver.name };
    ride.acceptedAt = new Date().toISOString();
    
    // Broadcast ride accepted to passenger
    broadcastToUser(ride.passengerId, {
        type: 'ride_update',
        data: {
            type: 'ride_accepted',
            ride: ride
        }
    });
    
    // Broadcast to all drivers to remove this ride from their list
    broadcastToDrivers({
        type: 'ride_update',
        data: {
            type: 'ride_accepted',
            ride: ride
        }
    });
    
    res.json({ message: 'Ride accepted successfully', ride });
});

app.post('/start-ride/:rideId', (req, res) => {
    const { rideId } = req.params;
    
    const ride = rides.find(r => r.id === parseInt(rideId));
    if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
    }
    
    ride.status = 'In Progress';
    ride.startedAt = new Date().toISOString();
    
    // Broadcast ride started to passenger
    broadcastToUser(ride.passengerId, {
        type: 'ride_update',
        data: {
            type: 'ride_started',
            ride: ride
        }
    });
    
    // Broadcast to driver
    broadcastToUser(ride.driverId, {
        type: 'ride_update',
        data: {
            type: 'ride_started',
            ride: ride
        }
    });
    
    res.json({ message: 'Ride started successfully', ride });
});

app.post('/complete-ride/:rideId', (req, res) => {
    const { rideId } = req.params;
    
    const ride = rides.find(r => r.id === parseInt(rideId));
    if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
    }
    
    ride.status = 'Completed';
    ride.completedAt = new Date().toISOString();
    
    // Broadcast ride completed to passenger
    broadcastToUser(ride.passengerId, {
        type: 'ride_update',
        data: {
            type: 'ride_completed',
            ride: ride
        }
    });
    
    // Broadcast to driver
    broadcastToUser(ride.driverId, {
        type: 'ride_update',
        data: {
            type: 'ride_completed',
            ride: ride
        }
    });
    
    res.json({ message: 'Ride completed successfully', ride });
});

app.post('/cancel-ride/:rideId', (req, res) => {
    const { rideId } = req.params;
    const { cancelledBy } = req.body;
    
    const ride = rides.find(r => r.id === parseInt(rideId));
    if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
    }
    
    ride.status = 'Cancelled';
    ride.cancelledAt = new Date().toISOString();
    ride.cancelledBy = cancelledBy;
    
    // Broadcast ride cancelled to passenger
    broadcastToUser(ride.passengerId, {
        type: 'ride_update',
        data: {
            type: 'ride_cancelled',
            ride: ride
        }
    });
    
    // Broadcast to driver if exists
    if (ride.driverId) {
        broadcastToUser(ride.driverId, {
            type: 'ride_update',
            data: {
                type: 'ride_cancelled',
                ride: ride
            }
        });
    }
    
    // Broadcast to all drivers to remove this ride from their list
    broadcastToDrivers({
        type: 'ride_update',
        data: {
            type: 'ride_cancelled',
            ride: ride
        }
    });
    
    res.json({ message: 'Ride cancelled successfully', ride });
});

// Get rides for passenger
app.get('/rides/passenger/:passengerId', (req, res) => {
    const { passengerId } = req.params;
    const passengerRides = rides.filter(r => r.passengerId === parseInt(passengerId));
    res.json({ rides: passengerRides });
});

// Get rides for driver
app.get('/rides/driver/:driverId', (req, res) => {
    const { driverId } = req.params;
    const driverRides = rides.filter(r => r.driverId === parseInt(driverId));
    res.json({ rides: driverRides });
});

// Get available drivers for a ride type
app.get('/available-drivers/:rideType', (req, res) => {
    const { rideType } = req.params;
    const availableDrivers = users.filter(u => 
        u.type === 'driver' && 
        u.ride_type === rideType &&
        !rides.some(r => r.driverId === u.id && ['Accepted', 'In Progress'].includes(r.status))
    );
    
    res.json({ drivers: availableDrivers });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server ready`);
}); 