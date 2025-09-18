import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { authService } from '../services/api';
import { Event } from '../types';
import './EventDetailPage.css';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const isEventPast = (dateString: string) => {
    return new Date(dateString) <= new Date();
  };

  const handleBookNow = () => {
    const user = authService.getStoredUser();
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/events/${id}/book`);
  };

  if (loading) {
    return (
      <div className="event-detail-page">
        <div className="loading">Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail-page">
        <div className="error">
          <h2>Event Not Found</h2>
          <p>{error || 'The event you are looking for does not exist.'}</p>
          <Link to="/events" className="back-btn">Back to Events</Link>
        </div>
      </div>
    );
  }

  const isPast = isEventPast(event.event_date);
  const isSoldOut = event.available_tickets <= 0;

  return (
    <div className="event-detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link> &gt; <Link to="/events">Events</Link> &gt; {event.title}
        </div>

        <div className="event-detail">
          <div className="event-image-section">
            <img 
              src={event.image_url || '/placeholder-event.jpg'} 
              alt={event.title}
              className="event-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-event.jpg';
              }}
            />
            <div className="event-type-badge">{event.type}</div>
          </div>

          <div className="event-info-section">
            <h1 className="event-title">{event.title}</h1>
            
            <div className="event-meta">
              <div className="meta-item">
                <span className="meta-label">📅 Date & Time:</span>
                <span className="meta-value">{formatDate(event.event_date)}</span>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">📍 Venue:</span>
                <span className="meta-value">{event.venue}</span>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">💰 Price:</span>
                <span className="meta-value price">{formatPrice(event.price)}</span>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">🎫 Availability:</span>
                <span className={`meta-value ${isSoldOut ? 'sold-out' : 'available'}`}>
                  {isSoldOut ? 'Sold Out' : `${event.available_tickets} of ${event.total_tickets} tickets available`}
                </span>
              </div>
            </div>

            <div className="event-description">
              <h3>About This Event</h3>
              <p>{event.description}</p>
            </div>

            <div className="booking-section">
              {isPast ? (
                <div className="past-event-notice">
                  <p>This event has already taken place.</p>
                </div>
              ) : isSoldOut ? (
                <div className="sold-out-notice">
                  <p>Sorry, this event is sold out.</p>
                </div>
              ) : (
                <button 
                  onClick={handleBookNow}
                  className="book-now-btn"
                >
                  Book Tickets Now
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="additional-info">
          <div className="info-section">
            <h3>Event Details</h3>
            <ul>
              <li><strong>Type:</strong> {event.type === 'concert' ? 'Concert' : 'Workshop'}</li>
              <li><strong>Duration:</strong> {event.type === 'concert' ? '2-3 hours' : '4-6 hours'}</li>
              <li><strong>Age Requirement:</strong> All ages welcome</li>
              <li><strong>Parking:</strong> Available on-site</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>Terms & Conditions</h3>
            <ul>
              <li>Tickets are non-refundable</li>
              <li>Please arrive 30 minutes before start time</li>
              <li>Valid ID required for entry</li>
              <li>No outside food or beverages allowed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;