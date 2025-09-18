// Shared database schema definitions and sample data

const TABLE_SCHEMAS = [
  {
    name: 'users',
    sqliteSQL: `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    mssqlSQL: `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
      CREATE TABLE users (
        id INT PRIMARY KEY IDENTITY(1,1),
        username NVARCHAR(50) UNIQUE NOT NULL,
        password NVARCHAR(255) NOT NULL,
        email NVARCHAR(100),
        created_at DATETIME DEFAULT GETDATE()
      )
    `
  },
  {
    name: 'events',
    sqliteSQL: `
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
    `,
    mssqlSQL: `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='events' AND xtype='U')
      CREATE TABLE events (
        id INT PRIMARY KEY IDENTITY(1,1),
        title NVARCHAR(200) NOT NULL,
        description NVARCHAR(MAX),
        type NVARCHAR(50) NOT NULL,
        venue NVARCHAR(200) NOT NULL,
        event_date DATETIME NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        available_tickets INT NOT NULL,
        total_tickets INT NOT NULL,
        image_url NVARCHAR(500),
        created_at DATETIME DEFAULT GETDATE()
      )
    `
  },
  {
    name: 'bookings',
    sqliteSQL: `
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
    `,
    mssqlSQL: `
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
    `
  }
];

// Shared sample data
const SAMPLE_USERS = [
  {
    username: 'testuser1',
    password: '$2a$10$sNapAUQLnhCfwC3Lz1WQkO3LhRPjEkcaokhx15AqDQa2Ul0jqN2p2', // password123
    email: 'test1@example.com'
  },
  {
    username: 'testuser2',
    password: '$2a$10$sNapAUQLnhCfwC3Lz1WQkO3LhRPjEkcaokhx15AqDQa2Ul0jqN2p2', // password123
    email: 'test2@example.com'
  },
  {
    username: 'admin',
    password: '$2a$10$sNapAUQLnhCfwC3Lz1WQkO3LhRPjEkcaokhx15AqDQa2Ul0jqN2p2', // password123
    email: 'admin@example.com'
  }
];

const SAMPLE_EVENTS = [
  {
    title: 'Rock Concert: The Thunder',
    description: 'An electrifying rock concert featuring local and international artists',
    type: 'concert',
    venue: 'Madison Square Garden',
    event_date: '2024-03-15 19:00:00',
    price: 89.99,
    available_tickets: 500,
    total_tickets: 500,
    image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
  },
  {
    title: 'Jazz Night Live',
    description: 'Smooth jazz evening with renowned musicians',
    type: 'concert',
    venue: 'Blue Note Club',
    event_date: '2024-03-20 20:00:00',
    price: 65.00,
    available_tickets: 150,
    total_tickets: 150,
    image_url: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800'
  },
  {
    title: 'Classical Symphony',
    description: 'Beautiful classical music performed by the city orchestra',
    type: 'concert',
    venue: 'Concert Hall',
    event_date: '2024-03-25 19:30:00',
    price: 75.50,
    available_tickets: 300,
    total_tickets: 300,
    image_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800'
  },
  {
    title: 'Web Development Workshop',
    description: 'Learn modern web development with React and Node.js',
    type: 'workshop',
    venue: 'Tech Hub',
    event_date: '2024-03-18 10:00:00',
    price: 299.00,
    available_tickets: 30,
    total_tickets: 30,
    image_url: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800'
  },
  {
    title: 'Photography Masterclass',
    description: 'Master the art of photography with professional tips',
    type: 'workshop',
    venue: 'Creative Studios',
    event_date: '2024-03-22 14:00:00',
    price: 199.00,
    available_tickets: 25,
    total_tickets: 25,
    image_url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'
  },
  {
    title: 'Digital Marketing Summit',
    description: 'Learn the latest digital marketing strategies',
    type: 'workshop',
    venue: 'Business Center',
    event_date: '2024-03-28 09:00:00',
    price: 399.00,
    available_tickets: 50,
    total_tickets: 50,
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'
  },
  {
    title: 'Pop Concert: City Lights',
    description: 'Popular music concert with chart-topping hits',
    type: 'concert',
    venue: 'Arena Stadium',
    event_date: '2024-04-05 18:00:00',
    price: 95.00,
    available_tickets: 800,
    total_tickets: 800,
    image_url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800'
  },
  {
    title: 'Cooking Workshop: Italian Cuisine',
    description: 'Learn to cook authentic Italian dishes',
    type: 'workshop',
    venue: 'Culinary Institute',
    event_date: '2024-04-10 11:00:00',
    price: 149.00,
    available_tickets: 20,
    total_tickets: 20,
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'
  }
];

module.exports = { TABLE_SCHEMAS, SAMPLE_USERS, SAMPLE_EVENTS };