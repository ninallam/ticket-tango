import express from 'express';
import { getPool } from '../config/database';

const router = express.Router();

// Get all events with search and filter
router.get('/', async (req, res) => {
  try {
    const { search, type, limit = '20', offset = '0' } = req.query;
    
    const pool = getPool();
    const request = pool.request();
    
    let query = `
      SELECT id, title, description, type, venue, event_date, price, 
             available_tickets, total_tickets, image_url, created_at
      FROM events 
      WHERE 1=1
    `;
    
    if (search) {
      query += ` AND (title LIKE @search OR description LIKE @search OR venue LIKE @search)`;
      request.input('search', `%${search}%`);
    }
    
    if (type && (type === 'concert' || type === 'workshop')) {
      query += ` AND type = @type`;
      request.input('type', type);
    }
    
    query += ` ORDER BY event_date ASC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    
    request.input('offset', parseInt(offset as string));
    request.input('limit', parseInt(limit as string));
    
    const result = await request.query(query);
    
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM events WHERE 1=1`;
    const countRequest = pool.request();
    
    if (search) {
      countQuery += ` AND (title LIKE @search OR description LIKE @search OR venue LIKE @search)`;
      countRequest.input('search', `%${search}%`);
    }
    
    if (type && (type === 'concert' || type === 'workshop')) {
      countQuery += ` AND type = @type`;
      countRequest.input('type', type);
    }
    
    const countResult = await countRequest.query(countQuery);
    const total = countResult.recordset[0].total;
    
    res.json({
      events: result.recordset,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: parseInt(offset as string) + parseInt(limit as string) < total
      }
    });
    
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = getPool();
    const request = pool.request();
    
    const result = await request
      .input('id', parseInt(id))
      .query(`
        SELECT id, title, description, type, venue, event_date, price, 
               available_tickets, total_tickets, image_url, created_at
        FROM events 
        WHERE id = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(result.recordset[0]);
    
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Get featured events (upcoming, popular)
router.get('/featured/upcoming', async (req, res) => {
  try {
    const pool = getPool();
    const request = pool.request();
    
    const result = await request.query(`
      SELECT TOP 6 id, title, description, type, venue, event_date, price, 
             available_tickets, total_tickets, image_url
      FROM events 
      WHERE event_date > GETDATE() AND available_tickets > 0
      ORDER BY event_date ASC
    `);
    
    res.json(result.recordset);
    
  } catch (error) {
    console.error('Error fetching featured events:', error);
    res.status(500).json({ error: 'Failed to fetch featured events' });
  }
});

export default router;