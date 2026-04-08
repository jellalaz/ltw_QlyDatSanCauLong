import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import AuthController from './controllers/AuthController';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './views/Home';
import Profile from './views/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  // Khởi tạo auth header khi app load
  useEffect(() => {
    AuthController.initializeAuthHeader();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
