import express from 'express';
import bcrypt from 'bcryptjs';
import { getPool } from '../config/database';
import { generateToken } from '../middleware/auth';

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const pool = getPool();
    const request = pool.request();

    // Check if user already exists
    const existingUser = await request
      .input('username', username)
      .query('SELECT id FROM users WHERE username = @username');

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await request
      .input('hashedPassword', hashedPassword)
      .input('email', email || null)
      .query(`
        INSERT INTO users (username, password, email) 
        OUTPUT INSERTED.id, INSERTED.username
        VALUES (@username, @hashedPassword, @email)
      `);

    const newUser = result.recordset[0];
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const pool = getPool();
    const request = pool.request();

    // Find user
    const result = await request
      .input('username', username)
      .query('SELECT id, username, password FROM users WHERE username = @username');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.recordset[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({ id: user.id, username: user.username });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token route
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(403).json({ valid: false, error: 'Invalid token' });
  }
});

export default router;