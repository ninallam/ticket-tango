import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types';
import './MyBookingsPage.css';

const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const bookingsData = await bookingService.getMyBookings();
        setBookings(bookingsData);
      } catch (error) {
        setError('Failed to load your bookings');
        console.error('Error loading bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBookingDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isEventPast = (dateString: string) => {
    return new Date(dateString) <= new Date();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'cancelled':
        return 'status-cancelled';
      case 'refunded':
        return 'status-refunded';
      default:
        return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="my-bookings-page">
        <div className="loading">Loading your bookings...</div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="container">
        <div className="page-header">
          <h1>My Bookings</h1>
          <p>Manage your ticket bookings</p>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {bookings.length === 0 && !loading && !error ? (
          <div className="no-bookings">
            <h3>No bookings found</h3>
            <p>You haven't booked any tickets yet.</p>
            <Link to="/events" className="browse-events-btn">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(booking => {
              const isPast = isEventPast(booking.event_date);
              
              return (
                <div key={booking.id} className={`booking-card ${isPast ? 'past-event' : ''}`}>
                  <div className="booking-image">
                    <img 
                      src={booking.image_url || '/placeholder-event.jpg'} 
                      alt={booking.event_title}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-event.jpg';
                      }}
                    />
                    <div className="event-type-badge">{booking.type}</div>
                    {isPast && <div className="past-event-overlay">Past Event</div>}
                  </div>

                  <div className="booking-details">
                    <div className="booking-header">
                      <h3 className="event-title">{booking.event_title}</h3>
                      <span className={`booking-status ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="booking-info">
                      <div className="info-row">
                        <span className="info-label">📍 Venue:</span>
                        <span className="info-value">{booking.venue}</span>
                      </div>
                      
                      <div className="info-row">
                        <span className="info-label">📅 Event Date:</span>
                        <span className="info-value">{formatDate(booking.event_date)}</span>
                      </div>
                      
                      <div className="info-row">
                        <span className="info-label">🎫 Tickets:</span>
                        <span className="info-value">{booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}</span>
                      </div>
                      
                      <div className="info-row">
                        <span className="info-label">💰 Total Paid:</span>
                        <span className="info-value price">{formatPrice(booking.total_amount)}</span>
                      </div>
                      
                      <div className="info-row">
                        <span className="info-label">📋 Booked On:</span>
                        <span className="info-value">{formatBookingDate(booking.booking_date)}</span>
                      </div>
                    </div>

                    <div className="booking-actions">
                      <div className="booking-id">
                        Booking ID: #{booking.id}
                      </div>
                      
                      {!isPast && (
                        <div className="action-buttons">
                          <button className="view-details-btn">
                            View Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {bookings.length > 0 && (
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-number">{bookings.length}</span>
                <span className="stat-label">Total Bookings</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {bookings.filter(b => !isEventPast(b.event_date)).length}
                </span>
                <span className="stat-label">Upcoming Events</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {formatPrice(bookings.reduce((sum, b) => sum + b.total_amount, 0))}
                </span>
                <span className="stat-label">Total Spent</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;