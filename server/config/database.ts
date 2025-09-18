import sql from 'mssql';
import { DefaultAzureCredential } from '@azure/identity';

interface DatabaseConfig {
  server: string;
  database: string;
  authentication?: {
    type: 'azure-active-directory-msi-app-service';
  };
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
  };
}

let pool: sql.ConnectionPool | null = null;

export async function initializeDatabase(): Promise<void> {
  try {
    const config: DatabaseConfig | sql.config = process.env.NODE_ENV === 'production' 
      ? {
          server: process.env.DB_SERVER!,
          database: process.env.DB_NAME!,
          authentication: {
            type: 'azure-active-directory-msi-app-service'
          },
          options: {
            encrypt: true,
            trustServerCertificate: false,
          }
        }
      : {
          server: process.env.DB_SERVER || 'localhost',
          database: process.env.DB_NAME || 'tickettango',
          user: process.env.DB_USER || 'sa',
          password: process.env.DB_PASSWORD || 'YourPassword123!',
          options: {
            encrypt: process.env.NODE_ENV === 'production',
            trustServerCertificate: process.env.NODE_ENV !== 'production',
          }
        };

    pool = await sql.connect(config);
    console.log('Connected to database successfully');
    
    // Create tables if they don't exist
    await createTables();
    
    // Insert dummy data
    await insertDummyData();
    
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export function getPool(): sql.ConnectionPool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase() first.');
  }
  return pool;
}

async function createTables(): Promise<void> {
  const request = pool!.request();
  
  // Users table
  await request.query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
    CREATE TABLE users (
      id INT PRIMARY KEY IDENTITY(1,1),
      username NVARCHAR(50) UNIQUE NOT NULL,
      password NVARCHAR(255) NOT NULL,
      email NVARCHAR(100),
      created_at DATETIME DEFAULT GETDATE()
    )
  `);
  
  // Events table
  await request.query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='events' AND xtype='U')
    CREATE TABLE events (
      id INT PRIMARY KEY IDENTITY(1,1),
      title NVARCHAR(200) NOT NULL,
      description NVARCHAR(MAX),
      type NVARCHAR(50) NOT NULL, -- 'concert' or 'workshop'
      venue NVARCHAR(200) NOT NULL,
      event_date DATETIME NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      available_tickets INT NOT NULL,
      total_tickets INT NOT NULL,
      image_url NVARCHAR(500),
      created_at DATETIME DEFAULT GETDATE()
    )
  `);
  
  // Bookings table
  await request.query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='bookings' AND xtype='U')
    CREATE TABLE bookings (
      id INT PRIMARY KEY IDENTITY(1,1),
      user_id INT NOT NULL,
      event_id INT NOT NULL,
      quantity INT NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      booking_date DATETIME DEFAULT GETDATE(),
      status NVARCHAR(20) DEFAULT 'confirmed',
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (event_id) REFERENCES events(id)
    )
  `);
  
  console.log('Database tables created successfully');
}

async function insertDummyData(): Promise<void> {
  const request = pool!.request();
  
  // Check if data already exists
  const userCount = await request.query('SELECT COUNT(*) as count FROM users');
  if (userCount.recordset[0].count > 0) {
    console.log('Dummy data already exists, skipping insertion');
    return;
  }
  
  // Insert test users (passwords are hashed 'password123')
  await request.query(`
    INSERT INTO users (username, password, email) VALUES
    ('testuser1', '$2a$10$rQZ8kZEGELhq9.6H6BK.K.cXwsM5q8YsGQhqzgGKPzHVJkO.KJHyO', 'test1@example.com'),
    ('testuser2', '$2a$10$rQZ8kZEGELhq9.6H6BK.K.cXwsM5q8YsGQhqzgGKPzHVJkO.KJHyO', 'test2@example.com'),
    ('admin', '$2a$10$rQZ8kZEGELhq9.6H6BK.K.cXwsM5q8YsGQhqzgGKPzHVJkO.KJHyO', 'admin@example.com')
  `);
  
  // Insert dummy events
  await request.query(`
    INSERT INTO events (title, description, type, venue, event_date, price, available_tickets, total_tickets, image_url) VALUES
    ('Rock Concert: The Thunder', 'An electrifying rock concert featuring local and international artists', 'concert', 'Madison Square Garden', '2024-03-15 19:00:00', 89.99, 500, 500, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'),
    ('Jazz Night Live', 'Smooth jazz evening with renowned musicians', 'concert', 'Blue Note Club', '2024-03-20 20:00:00', 65.00, 150, 150, 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800'),
    ('Classical Symphony', 'Beautiful classical music performed by the city orchestra', 'concert', 'Concert Hall', '2024-03-25 19:30:00', 75.50, 300, 300, 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800'),
    ('Web Development Workshop', 'Learn modern web development with React and Node.js', 'workshop', 'Tech Hub', '2024-03-18 10:00:00', 299.00, 30, 30, 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800'),
    ('Photography Masterclass', 'Master the art of photography with professional tips', 'workshop', 'Creative Studios', '2024-03-22 14:00:00', 199.00, 25, 25, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'),
    ('Digital Marketing Summit', 'Learn the latest digital marketing strategies', 'workshop', 'Business Center', '2024-03-28 09:00:00', 399.00, 50, 50, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'),
    ('Pop Concert: City Lights', 'Popular music concert with chart-topping hits', 'concert', 'Arena Stadium', '2024-04-05 18:00:00', 95.00, 800, 800, 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800'),
    ('Cooking Workshop: Italian Cuisine', 'Learn to cook authentic Italian dishes', 'workshop', 'Culinary Institute', '2024-04-10 11:00:00', 149.00, 20, 20, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800')
  `);
  
  console.log('Dummy data inserted successfully');
}

export { sql };