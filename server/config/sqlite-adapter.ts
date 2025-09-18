import sqlite3 from 'sqlite3';
import { DatabaseConnection } from './database-types';
const { BaseDatabaseAdapter } = require('./base-database-adapter');

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

export class SQLiteAdapter extends BaseDatabaseAdapter {
  private dbPath: string;

  constructor(dbPath: string = './database.sqlite') {
    super();
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

  async insertUsers(connection: DatabaseConnection): Promise<void> {
    const users = this.getSampleUsers();
    for (const user of users) {
      await connection.query(
        'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
        [user.username, user.password, user.email]
      );
    }
  }

  async insertEvents(connection: DatabaseConnection): Promise<void> {
    const events = this.getSampleEvents();
    for (const event of events) {
      await connection.query(
        'INSERT INTO events (title, description, type, venue, event_date, price, available_tickets, total_tickets, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [event.title, event.description, event.type, event.venue, event.event_date, event.price, event.available_tickets, event.total_tickets, event.image_url]
      );
    }
  }

  isUsingSQLite(): boolean {
    return true;
  }

  getAdapterName(): string {
    return 'SQLite';
  }
}