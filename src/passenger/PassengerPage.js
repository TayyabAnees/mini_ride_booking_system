import { useState } from 'react';
import PassengerLayout from './PassengerLayout';
import HomeTab from './HomeTab';
import PastRidesTab from './PastRidesTab';

export default function PassengerPage() {
    const [activeTab, setActiveTab] = useState('home');

    return (
        <PassengerLayout>
            <div className="tabs">
                <button 
                    className={activeTab === 'home' ? 'active' : ''} 
                    onClick={() => setActiveTab('home')}
                >
                    🏠 Home
                </button>
                <button 
                    className={activeTab === 'past' ? 'active' : ''} 
                    onClick={() => setActiveTab('past')}
                >
                    📋 Past Rides
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'home' && <HomeTab />}
                {activeTab === 'past' && <PastRidesTab />}
            </div>
        </PassengerLayout>
    );
}
