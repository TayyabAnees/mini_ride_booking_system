import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupOptions from './components/SignupOptions';
import PassengerSignupForm from './passenger/PassengerSignupForm';
import DriverSignupForm from './driver/DriverSignupForm';
import PassengerPage from "./passenger/PassengerPage";
import DriverPage from "./driver/DriverPage";

export default function App() {
  return (
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-4">
          <Routes>
              <Route path="/driver" element={<DriverPage />} />
            <Route path="/" element={<SignupOptions />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup/passenger" element={<PassengerSignupForm />} />
            <Route path="/signup/driver" element={<DriverSignupForm />} />
              <Route path="/passenger" element={<PassengerPage />} />
          </Routes>
        </div>
      </Router>
  );
}
