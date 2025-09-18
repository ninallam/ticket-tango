import express from 'express';
import { QueryService } from '../services/query-service';

const router = express.Router();

// Get all events with search and filter
router.get('/', async (req, res) => {
  try {
    const { search, type, limit = '20', offset = '0' } = req.query;
    
    let query = `
      SELECT id, title, description, type, venue, event_date, price, 
             available_tickets, total_tickets, image_url, created_at
      FROM events 
      WHERE 1=1
    `;
    
    const params: { [key: string]: any } = {
      offset: parseInt(offset as string),
      limit: parseInt(limit as string)
    };
    
    if (search) {
      query += ` AND (title LIKE @search OR description LIKE @search OR venue LIKE @search)`;
      params.search = `%${search}%`;
    }
    
    if (type && (type === 'concert' || type === 'workshop')) {
      query += ` AND type = @type`;
      params.type = type;
    }
    
    // Use database-specific pagination syntax
    const paginationClause = QueryService.adaptQuery(
      ` ORDER BY event_date ASC LIMIT @limit OFFSET @offset`,
      ` ORDER BY event_date ASC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`
    );
    
    query += paginationClause;
    
    const result = await QueryService.queryWithNamedParams(query, params);
    
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM events WHERE 1=1`;
    const countParams: { [key: string]: any } = {};
    
    if (search) {
      countQuery += ` AND (title LIKE @search OR description LIKE @search OR venue LIKE @search)`;
      countParams.search = `%${search}%`;
    }
    
    if (type && (type === 'concert' || type === 'workshop')) {
      countQuery += ` AND type = @type`;
      countParams.type = type;
    }
    
    const countResult = await QueryService.queryWithNamedParams(countQuery, countParams);
    const total = countResult.recordset[0].total || countResult.recordset[0].count;
    
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
    
    const result = await QueryService.queryWithNamedParams(`
      SELECT id, title, description, type, venue, event_date, price, 
             available_tickets, total_tickets, image_url, created_at
      FROM events 
      WHERE id = @id
    `, { id: parseInt(id) });
    
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
    // Use database-specific query for getting top records
    const query = QueryService.adaptQuery(
      `SELECT id, title, description, type, venue, event_date, price, 
             available_tickets, total_tickets, image_url
      FROM events 
      WHERE event_date > datetime('now') AND available_tickets > 0
      ORDER BY event_date ASC
      LIMIT 6`,
      `SELECT TOP 6 id, title, description, type, venue, event_date, price, 
             available_tickets, total_tickets, image_url
      FROM events 
      WHERE event_date > GETDATE() AND available_tickets > 0
      ORDER BY event_date ASC`
    );
    
    const result = await QueryService.query(query);
    
    res.json(result.recordset);
    
  } catch (error) {
    console.error('Error fetching featured events:', error);
    res.status(500).json({ error: 'Failed to fetch featured events' });
  }
});

export default router;