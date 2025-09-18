import express from 'express';
import { QueryService } from '../services/query-service';
import { DatabaseFactory } from '../config/database-factory';
import { getPool, sql } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create a new booking
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  const dbType = DatabaseFactory.getDatabaseType();
  
  if (dbType === 'mssql') {
    // Use transactions for MSSQL
    const transaction = new sql.Transaction(getPool());
    
    try {
      const { eventId, quantity } = req.body;
      const userId = req.user!.id;

      if (!eventId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Valid event ID and quantity are required' });
      }

      await transaction.begin();

      // Check if event exists and has enough tickets
      const eventResult = await transaction.request()
        .input('eventId', eventId)
        .query(`
          SELECT id, title, price, available_tickets, event_date
          FROM events 
          WHERE id = @eventId
        `);

      if (eventResult.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Event not found' });
      }

      const event = eventResult.recordset[0];

      if (event.available_tickets < quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'Not enough tickets available',
          available: event.available_tickets
        });
      }

      // Check if event is in the future
      if (new Date(event.event_date) <= new Date()) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Cannot book tickets for past events' });
      }

      const totalAmount = event.price * quantity;

      // Create booking
      const bookingResult = await transaction.request()
        .input('userId', userId)
        .input('eventId', eventId)
        .input('quantity', quantity)
        .input('totalAmount', totalAmount)
        .query(`
          INSERT INTO bookings (user_id, event_id, quantity, total_amount)
          OUTPUT INSERTED.id, INSERTED.booking_date, INSERTED.status
          VALUES (@userId, @eventId, @quantity, @totalAmount)
        `);

      // Update available tickets
      await transaction.request()
        .input('eventId', eventId)
        .input('quantity', quantity)
        .query(`
          UPDATE events 
          SET available_tickets = available_tickets - @quantity
          WHERE id = @eventId
        `);

      await transaction.commit();

      const booking = bookingResult.recordset[0];

      res.status(201).json({
        message: 'Booking created successfully',
        booking: {
          id: booking.id,
          eventId,
          eventTitle: event.title,
          quantity,
          totalAmount,
          bookingDate: booking.booking_date,
          status: booking.status
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Booking error:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  } else {
    // SQLite version without transactions
    try {
      const { eventId, quantity } = req.body;
      const userId = req.user!.id;

      if (!eventId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Valid event ID and quantity are required' });
      }

      // Check if event exists and has enough tickets
      const eventResult = await QueryService.queryWithNamedParams(`
        SELECT id, title, price, available_tickets, event_date
        FROM events 
        WHERE id = @eventId
      `, { eventId });

      if (eventResult.recordset.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const event = eventResult.recordset[0];

      if (event.available_tickets < quantity) {
        return res.status(400).json({ 
          error: 'Not enough tickets available',
          available: event.available_tickets
        });
      }

      // Check if event is in the future
      if (new Date(event.event_date) <= new Date()) {
        return res.status(400).json({ error: 'Cannot book tickets for past events' });
      }

      const totalAmount = event.price * quantity;

      // Create booking
      await QueryService.queryWithNamedParams(`
        INSERT INTO bookings (user_id, event_id, quantity, total_amount)
        VALUES (@userId, @eventId, @quantity, @totalAmount)
      `, { userId, eventId, quantity, totalAmount });

      // Update available tickets
      await QueryService.queryWithNamedParams(`
        UPDATE events 
        SET available_tickets = available_tickets - @quantity
        WHERE id = @eventId
      `, { eventId, quantity });

      // Get the created booking
      const bookingResult = await QueryService.queryWithNamedParams(`
        SELECT id, booking_date, status
        FROM bookings 
        WHERE user_id = @userId AND event_id = @eventId
        ORDER BY booking_date DESC
        LIMIT 1
      `, { userId, eventId });

      const booking = bookingResult.recordset[0];

      res.status(201).json({
        message: 'Booking created successfully',
        booking: {
          id: booking.id,
          eventId,
          eventTitle: event.title,
          quantity,
          totalAmount,
          bookingDate: booking.booking_date,
          status: booking.status
        }
      });

    } catch (error) {
      console.error('Booking error:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  }
});

// Get user's bookings
router.get('/my-bookings', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    const result = await QueryService.queryWithNamedParams(`
      SELECT 
        b.id,
        b.quantity,
        b.total_amount,
        b.booking_date,
        b.status,
        e.title as event_title,
        e.venue,
        e.event_date,
        e.type,
        e.image_url
      FROM bookings b
      INNER JOIN events e ON b.event_id = e.id
      WHERE b.user_id = @userId
      ORDER BY b.booking_date DESC
    `, { userId });
    
    res.json(result.recordset);
    
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get booking by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const result = await QueryService.queryWithNamedParams(`
      SELECT 
        b.id,
        b.quantity,
        b.total_amount,
        b.booking_date,
        b.status,
        e.title as event_title,
        e.description as event_description,
        e.venue,
        e.event_date,
        e.type,
        e.image_url,
        e.price as unit_price
      FROM bookings b
      INNER JOIN events e ON b.event_id = e.id
      WHERE b.id = @id AND b.user_id = @userId
    `, { id: parseInt(id), userId });
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(result.recordset[0]);
    
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

export default router;