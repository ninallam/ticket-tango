import sqlite3 from 'sqlite3';
import { DatabaseAdapter, DatabaseConnection } from './database-types';

class SQLiteConnection implements DatabaseConnection {
  constructor(private db: sqlite3.Database) {}

  async query(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      // Handle SELECT queries
      if (sql.trim().toLowerCase().startsWith('select')) {
        this.db.all(sql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({ recordset: rows });
          }
        });
      } else {
        // Handle INSERT, UPDATE, DELETE queries
        this.db.run(sql, params, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ 
              recordset: [], 
              rowsAffected: [this.changes],
              lastInsertRowid: this.lastID
            });
          }
        });
      }
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export class SQLiteAdapter implements DatabaseAdapter {
  private dbPath: string;

  constructor(dbPath: string = './database.sqlite') {
    this.dbPath = dbPath;
  }

  async connect(): Promise<DatabaseConnection> {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Connected to SQLite database successfully');
          resolve(new SQLiteConnection(db));
        }
      });
    });
  }

  async createTables(): Promise<void> {
    const connection = await this.connect();
    
    try {
      // Users table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          email TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Events table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          type TEXT NOT NULL,
          venue TEXT NOT NULL,
          event_date DATETIME NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          available_tickets INTEGER NOT NULL,
          total_tickets INTEGER NOT NULL,
          image_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Bookings table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          event_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'confirmed',
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (event_id) REFERENCES events(id)
        )
      `);
      
      console.log('SQLite database tables created successfully');
    } finally {
      await connection.close();
    }
  }

  async insertDummyData(): Promise<void> {
    const connection = await this.connect();
    
    try {
      // Check if data already exists
      const userCount = await connection.query('SELECT COUNT(*) as count FROM users');
      if (userCount.recordset[0].count > 0) {
        console.log('Dummy data already exists, skipping insertion');
        return;
      }
      
      // Insert test users (passwords are hashed 'password123')
      const users = [
        ['testuser1', '$2a$10$sNapAUQLnhCfwC3Lz1WQkO3LhRPjEkcaokhx15AqDQa2Ul0jqN2p2', 'test1@example.com'],
        ['testuser2', '$2a$10$sNapAUQLnhCfwC3Lz1WQkO3LhRPjEkcaokhx15AqDQa2Ul0jqN2p2', 'test2@example.com'],
        ['admin', '$2a$10$sNapAUQLnhCfwC3Lz1WQkO3LhRPjEkcaokhx15AqDQa2Ul0jqN2p2', 'admin@example.com']
      ];
      
      for (const [username, password, email] of users) {
        await connection.query(
          'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
          [username, password, email]
        );
      }
      
      // Insert dummy events
      const events = [
        ['Rock Concert: The Thunder', 'An electrifying rock concert featuring local and international artists', 'concert', 'Madison Square Garden', '2024-03-15 19:00:00', 89.99, 500, 500, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'],
        ['Jazz Night Live', 'Smooth jazz evening with renowned musicians', 'concert', 'Blue Note Club', '2024-03-20 20:00:00', 65.00, 150, 150, 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800'],
        ['Classical Symphony', 'Beautiful classical music performed by the city orchestra', 'concert', 'Concert Hall', '2024-03-25 19:30:00', 75.50, 300, 300, 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800'],
        ['Web Development Workshop', 'Learn modern web development with React and Node.js', 'workshop', 'Tech Hub', '2024-03-18 10:00:00', 299.00, 30, 30, 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800'],
        ['Photography Masterclass', 'Master the art of photography with professional tips', 'workshop', 'Creative Studios', '2024-03-22 14:00:00', 199.00, 25, 25, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'],
        ['Digital Marketing Summit', 'Learn the latest digital marketing strategies', 'workshop', 'Business Center', '2024-03-28 09:00:00', 399.00, 50, 50, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'],
        ['Pop Concert: City Lights', 'Popular music concert with chart-topping hits', 'concert', 'Arena Stadium', '2024-04-05 18:00:00', 95.00, 800, 800, 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800'],
        ['Cooking Workshop: Italian Cuisine', 'Learn to cook authentic Italian dishes', 'workshop', 'Culinary Institute', '2024-04-10 11:00:00', 149.00, 20, 20, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800']
      ];
      
      for (const event of events) {
        await connection.query(
          'INSERT INTO events (title, description, type, venue, event_date, price, available_tickets, total_tickets, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          event
        );
      }
      
      console.log('SQLite dummy data inserted successfully');
    } finally {
      await connection.close();
    }
  }
}