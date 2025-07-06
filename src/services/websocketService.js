class WebSocketService {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.listeners = new Map();
        this.userId = null;
        this.userType = null;
    }

    connect(userId, userType) {
        return new Promise((resolve, reject) => {
            try {
                this.userId = userId;
                this.userType = userType;
                
                this.ws = new WebSocket(`ws://localhost:3000`);

                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    
                    // Subscribe to updates
                    this.ws.send(JSON.stringify({
                        type: 'subscribe',
                        userId: userId,
                        userType: userType
                    }));
                    
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('WebSocket message received:', data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.isConnected = false;
                    this.attemptReconnect();
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };

            } catch (error) {
                console.error('Error creating WebSocket connection:', error);
                reject(error);
            }
        });
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId && this.userType) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect(this.userId, this.userType).catch(error => {
                    console.error('Reconnection failed:', error);
                });
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    handleMessage(data) {
        if (data.type === 'ride_update') {
            const updateType = data.data.type;
            const rideData = data.data;
            
            console.log(`Handling ride update: ${updateType}`, rideData);
            
            // Notify specific event listeners
            if (this.listeners.has(updateType)) {
                this.listeners.get(updateType).forEach(callback => {
                    try {
                        callback(rideData);
                    } catch (error) {
                        console.error(`Error in ${updateType} listener:`, error);
                    }
                });
            }
            
            // Also notify general ride update listeners
            if (this.listeners.has('ride_update')) {
                this.listeners.get('ride_update').forEach(callback => {
                    try {
                        callback(rideData);
                    } catch (error) {
                        console.error('Error in ride_update listener:', error);
                    }
                });
            }
        }
    }

    addListener(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push(callback);
        console.log(`Added listener for ${eventType}`);
    }

    removeListener(eventType, callback) {
        if (this.listeners.has(eventType)) {
            const callbacks = this.listeners.get(eventType);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
                console.log(`Removed listener for ${eventType}`);
            }
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
        this.listeners.clear();
        this.userId = null;
        this.userType = null;
        console.log('WebSocket disconnected');
    }

    getConnectionStatus() {
        return this.isConnected;
    }
}

// Create a singleton instance
const websocketService = new WebSocketService();
export default websocketService; 