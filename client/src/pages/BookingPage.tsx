import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { bookingService } from '../services/bookingService';
import { Event } from '../types';
import './BookingPage.css';

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      
      try {
        const eventData = await eventService.getEvent(parseInt(id));
        setEvent(eventData);
      } catch (error) {
        setError('Failed to load event details');
        console.error('Error loading event:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value));
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBooking(true);

    try {
      await bookingService.createBooking(parseInt(id!), quantity);
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="loading">Loading booking details...</div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="booking-page">
        <div className="error">
          <h2>Event Not Found</h2>
          <p>The event you are trying to book does not exist.</p>
          <Link to="/events" className="back-btn">Back to Events</Link>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const totalPrice = event.price * quantity;
  const maxQuantity = Math.min(event.available_tickets, 10); // Limit to max 10 tickets per booking

  if (success) {
    return (
      <div className="booking-page">
        <div className="success-message">
          <h2>🎉 Booking Successful!</h2>
          <p>Your tickets have been booked successfully.</p>
          <p>Redirecting to your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link> &gt; <Link to="/events">Events</Link> &gt; 
          <Link to={`/events/${event.id}`}>{event.title}</Link> &gt; Book Tickets
        </div>

        <div className="booking-container">
          <div className="event-summary">
            <h2>Booking Summary</h2>
            
            <div className="event-card">
              <img 
                src={event.image_url || '/placeholder-event.jpg'} 
                alt={event.title}
                className="event-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-event.jpg';
                }}
              />
              <div className="event-details">
                <h3>{event.title}</h3>
                <p className="event-type">{event.type}</p>
                <p className="event-venue">📍 {event.venue}</p>
                <p className="event-date">📅 {formatDate(event.event_date)}</p>
                <p className="event-price">💰 {formatPrice(event.price)} per ticket</p>
                <p className="availability">
                  🎫 {event.available_tickets} tickets available
                </p>
              </div>
            </div>
          </div>

          <div className="booking-form-section">
            <h2>Select Tickets</h2>
            
            <form onSubmit={handleBooking} className="booking-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="quantity">Number of Tickets:</label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={booking}
                  className="quantity-select"
                >
                  {Array.from({ length: maxQuantity }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      {num} ticket{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="price-breakdown">
                <div className="price-row">
                  <span>Ticket Price:</span>
                  <span>{formatPrice(event.price)}</span>
                </div>
                <div className="price-row">
                  <span>Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className="price-row subtotal">
                  <span>Subtotal:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="price-row">
                  <span>Service Fee:</span>
                  <span>Free</span>
                </div>
                <div className="price-row total">
                  <span>Total:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="booking-terms">
                <p>
                  <input type="checkbox" id="terms" required />
                  <label htmlFor="terms">
                    I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
                  </label>
                </p>
                <p className="note">
                  By booking, you confirm that all information is correct. 
                  Tickets are non-refundable and non-transferable.
                </p>
              </div>

              <div className="booking-actions">
                <Link to={`/events/${event.id}`} className="cancel-btn">
                  Cancel
                </Link>
                <button 
                  type="submit" 
                  className="confirm-booking-btn"
                  disabled={booking || event.available_tickets === 0}
                >
                  {booking ? 'Processing...' : `Confirm Booking - ${formatPrice(totalPrice)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;