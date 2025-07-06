# Mini Ride Booking System

A real-time ride booking application built with React.js frontend and Node.js backend with WebSocket support for live updates.

## 🚀 Features

### For Passengers
- **User Registration & Authentication**: Secure signup and login system
- **Interactive Map**: Pickup and drop-off location selection using Leaflet maps
- **Ride Request**: Request rides with different vehicle types (Car, Bike, etc.)
- **Real-time Updates**: Live ride status updates via WebSocket
- **Ride History**: View past and current rides
- **Ride Cancellation**: Cancel rides before acceptance

### For Drivers
- **Driver Registration**: Sign up as a driver with vehicle type specification
- **Live Ride Requests**: Real-time notifications for new ride requests
- **Ride Management**: Accept, start, and complete rides
- **Ride History**: Track all completed and current rides
- **Status Updates**: Update ride status in real-time

### Technical Features
- **Real-time Communication**: WebSocket-based live updates
- **Responsive Design**: Modern UI with CSS animations
- **State Management**: React hooks for efficient state handling
- **Error Handling**: Comprehensive error boundaries and validation
- **Cross-platform**: Works on desktop and mobile devices

## 🛠️ Technology Stack

### Frontend
- **React.js 19.1.0** - UI framework
- **React Router DOM 7.6.3** - Client-side routing
- **Axios 1.10.0** - HTTP client for API calls
- **Leaflet 1.9.4** - Interactive maps
- **React Leaflet 5.0.0** - React wrapper for Leaflet

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **WebSocket (ws)** - Real-time communication
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mini_ride_booking_system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

The backend dependencies need to be installed separately. Create a `package.json` for the backend:

```bash
# Create backend directory and package.json
mkdir backend
cd backend
npm init -y
```

Install backend dependencies:

```bash
npm install express cors ws
```

### 4. Project Structure Setup

Your project should have the following structure:

```
mini_ride_booking_system/
├── backend/
│   ├── package.json
│   └── server.js
├── public/
├── src/
│   ├── components/
│   ├── driver/
│   ├── passenger/
│   ├── services/
│   └── ...
├── package.json
└── README.md
```

### 5. Start the Backend Server

```bash
cd backend
node server.js
```

The server will start on `http://localhost:3000`

### 6. Start the Frontend Application

In a new terminal window:

```bash
npm start
```

The React application will start on `http://localhost:3001`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory for any environment-specific configurations:

```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
```

### Server Configuration

The server runs on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=4000 node server.js
```

## 📚 API Documentation

### Authentication Endpoints

#### POST /login
Authenticate a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "auth": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "type": "passenger"
  },
  "userType": "passenger"
}
```

#### POST /register/passenger
Register a new passenger.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /register/driver
Register a new driver.

**Request Body:**
```json
{
  "name": "Mike Driver",
  "email": "mike@example.com",
  "password": "password123",
  "ride_type": "Car"
}
```

### Ride Management Endpoints

#### POST /request-ride
Create a new ride request.

**Request Body:**
```json
{
  "pickupLocation": "123 Main St",
  "dropLocation": "456 Oak Ave",
  "rideType": "Car",
  "passengerId": 1
}
```

#### POST /accept-ride/:rideId
Accept a ride request.

**Request Body:**
```json
{
  "driverId": 2
}
```

#### POST /start-ride/:rideId
Start an accepted ride.

#### POST /complete-ride/:rideId
Complete a ride.

#### POST /cancel-ride/:rideId
Cancel a ride.

**Request Body:**
```json
{
  "cancelledBy": "passenger"
}
```

### Data Retrieval Endpoints

#### GET /rides/passenger/:passengerId
Get all rides for a passenger.

#### GET /rides/driver/:driverId
Get all rides for a driver.

#### GET /available-drivers/:rideType
Get available drivers for a specific ride type.

## 🔌 WebSocket Events

### Client to Server

#### Subscribe to Updates
```json
{
  "type": "subscribe",
  "userId": 1,
  "userType": "passenger"
}
```

### Server to Client

#### Ride Updates
```json
{
  "type": "ride_update",
  "data": {
    "type": "new_ride_request|ride_accepted|ride_started|ride_completed|ride_cancelled",
    "ride": {
      "id": 1,
      "pickupLocation": "123 Main St",
      "dropLocation": "456 Oak Ave",
      "status": "Pending",
      "passenger": { "id": 1, "name": "John Doe" },
      "driver": { "id": 2, "name": "Mike Driver" }
    }
  }
}
```

## 🏗️ Architecture Overview

### Frontend Architecture

```
src/
├── components/          # Shared components
│   ├── LoginForm.js     # Authentication form
│   └── SignupOptions.js # Registration options
├── passenger/           # Passenger-specific components
│   ├── PassengerPage.js # Main passenger dashboard
│   ├── MapPicker.js     # Location selection
│   └── RideRequestModal.js # Ride booking modal
├── driver/              # Driver-specific components
│   ├── DriverPage.js    # Main driver dashboard
│   ├── CurrentRidesTab.js # Active rides management
│   └── PastRidesTab.js  # Ride history
└── services/
    └── websocketService.js # WebSocket communication
```

### Backend Architecture

```
server.js
├── Express App Setup
├── WebSocket Server
├── In-memory Data Storage
├── Authentication Routes
├── Ride Management Routes
└── Real-time Broadcasting
```

### Data Flow

1. **User Authentication**: Users register/login through the frontend
2. **Ride Request**: Passengers create ride requests via the map interface
3. **Real-time Notifications**: WebSocket broadcasts new requests to available drivers
4. **Ride Acceptance**: Drivers accept rides, triggering status updates
5. **Ride Progress**: Real-time updates for ride start/completion
6. **History Tracking**: All ride data stored for future reference

## 🧪 Testing

### Frontend Testing
```bash
npm test
```

### Manual Testing Scenarios

1. **User Registration Flow**
   - Register as passenger
   - Register as driver
   - Verify email validation

2. **Ride Booking Flow**
   - Login as passenger
   - Select pickup/drop-off locations
   - Request ride
   - Verify driver notification

3. **Driver Acceptance Flow**
   - Login as driver
   - Receive ride request notification
   - Accept ride
   - Update ride status

4. **Real-time Updates**
   - Verify WebSocket connections
   - Test ride status updates
   - Check connection recovery

## 🚨 Error Handling

### Frontend Error Handling
- Form validation with real-time feedback
- API error handling with user-friendly messages
- WebSocket connection error recovery
- React Error Boundaries for component-level errors

### Backend Error Handling
- Input validation and sanitization
- Proper HTTP status codes
- WebSocket error handling
- Graceful error responses

## 🔒 Security Considerations

### Current Implementation
- Basic input validation
- CORS configuration
- Password validation

### Production Recommendations
- Implement JWT authentication
- Add password hashing (bcrypt)
- Use HTTPS/WSS
- Add rate limiting
- Implement proper session management
- Add input sanitization
- Use environment variables for sensitive data

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process using port 3000
   npx kill-port 3000
   ```

2. **WebSocket Connection Failed**
   - Ensure backend server is running
   - Check firewall settings
   - Verify WebSocket URL configuration

3. **Map Not Loading**
   - Check internet connection
   - Verify Leaflet CSS is loaded
   - Check browser console for errors

4. **Real-time Updates Not Working**
   - Verify WebSocket connection status
   - Check browser console for connection errors
   - Ensure user is properly subscribed

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG=true npm start
```

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Note**: This is a demo application with in-memory storage. For production use, implement a proper database and additional security measures.
