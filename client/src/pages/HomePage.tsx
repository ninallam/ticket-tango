import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { Event } from '../types';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedEvents = async () => {
      try {
        const events = await eventService.getFeaturedEvents();
        setFeaturedEvents(events);
      } catch (error) {
        console.error('Failed to load featured events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedEvents();
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

  return (
    <div className="homepage">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Ticket Tango</h1>
          <p>Discover amazing concerts and workshops. Book your tickets today!</p>
          <Link to="/events" className="cta-button">
            Explore Events
          </Link>
        </div>
      </section>

      <section className="featured-events">
        <div className="container">
          <h2>Featured Events</h2>
          
          {loading ? (
            <div className="loading">Loading featured events...</div>
          ) : (
            <div className="events-grid">
              {featuredEvents.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-image">
                    <img 
                      src={event.image_url || '/placeholder-event.jpg'} 
                      alt={event.title}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-event.jpg';
                      }}
                    />
                    <div className="event-type">{event.type}</div>
                  </div>
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p className="event-venue">{event.venue}</p>
                    <p className="event-date">{formatDate(event.event_date)}</p>
                    <div className="event-footer">
                      <span className="event-price">{formatPrice(event.price)}</span>
                      <Link to={`/events/${event.id}`} className="view-btn">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && featuredEvents.length === 0 && (
            <p className="no-events">No featured events available at the moment.</p>
          )}
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose Ticket Tango?</h2>
          <div className="features-grid">
            <div className="feature">
              <h3>🎵 Concerts</h3>
              <p>From rock to jazz, discover amazing live music performances</p>
            </div>
            <div className="feature">
              <h3>🎓 Workshops</h3>
              <p>Learn new skills with hands-on workshops and masterclasses</p>
            </div>
            <div className="feature">
              <h3>🎫 Easy Booking</h3>
              <p>Simple and secure ticket booking process</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;