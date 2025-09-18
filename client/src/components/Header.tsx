import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';
import './Header.css';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>Ticket Tango</h1>
        </Link>
        
        <nav className="nav">
          <Link to="/events" className="nav-link">Events</Link>
          
          {user ? (
            <div className="user-menu">
              <Link to="/my-bookings" className="nav-link">My Bookings</Link>
              <span className="username">Welcome, {user.username}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link register-link">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;