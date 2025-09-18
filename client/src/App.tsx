import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import { authService } from './services/api';
import { User } from './types';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getStoredToken();
      const storedUser = authService.getStoredUser();
      
      if (token && storedUser) {
        try {
          const verification = await authService.verifyToken();
          if (verification.valid) {
            setUser(storedUser);
          } else {
            authService.logout();
          }
        } catch (error) {
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLogin = (user: User, token: string) => {
    authService.storeAuth(token, user);
    setUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Header user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/register" 
              element={
                user ? <Navigate to="/" replace /> : <RegisterPage onLogin={handleLogin} />
              } 
            />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route 
              path="/events/:id/book" 
              element={
                user ? <BookingPage /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/my-bookings" 
              element={
                user ? <MyBookingsPage /> : <Navigate to="/login" replace />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
