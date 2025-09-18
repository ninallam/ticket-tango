import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { Event, EventsResponse } from '../types';
import './EventsPage.css';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'concert' | 'workshop'>('all');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 12,
    offset: 0,
    hasMore: false
  });

  const loadEvents = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter,
        limit: pagination.limit,
        offset: reset ? 0 : pagination.offset
      };

      const response: EventsResponse = await eventService.getEvents(params);
      
      if (reset) {
        setEvents(response.events);
      } else {
        setEvents(prev => [...prev, ...response.events]);
      }
      
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter, pagination.limit, pagination.offset]);

  useEffect(() => {
    loadEvents(true);
  }, [searchTerm, typeFilter, loadEvents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvents(true);
  };

  const loadMore = () => {
    setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
    loadEvents(false);
  };

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
    <div className="events-page">
      <div className="container">
        <div className="page-header">
          <h1>All Events</h1>
          <p>Discover amazing concerts and workshops</p>
        </div>

        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search events, venues, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">Search</button>
          </form>

          <div className="type-filters">
            <button
              className={`filter-btn ${typeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTypeFilter('all')}
            >
              All Events
            </button>
            <button
              className={`filter-btn ${typeFilter === 'concert' ? 'active' : ''}`}
              onClick={() => setTypeFilter('concert')}
            >
              Concerts
            </button>
            <button
              className={`filter-btn ${typeFilter === 'workshop' ? 'active' : ''}`}
              onClick={() => setTypeFilter('workshop')}
            >
              Workshops
            </button>
          </div>
        </div>

        {loading && events.length === 0 ? (
          <div className="loading">Loading events...</div>
        ) : (
          <>
            <div className="events-grid">
              {events.map(event => (
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
                    <div className="availability">
                      {event.available_tickets > 0 ? (
                        <span className="available">{event.available_tickets} tickets left</span>
                      ) : (
                        <span className="sold-out">Sold Out</span>
                      )}
                    </div>
                  </div>
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p className="event-venue">{event.venue}</p>
                    <p className="event-date">{formatDate(event.event_date)}</p>
                    <p className="event-description">{event.description.substring(0, 100)}...</p>
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

            {events.length === 0 && !loading && (
              <div className="no-events">
                <h3>No events found</h3>
                <p>Try adjusting your search terms or filters.</p>
              </div>
            )}

            {pagination.hasMore && (
              <div className="load-more-section">
                <button 
                  onClick={loadMore} 
                  className="load-more-btn"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Events'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventsPage;