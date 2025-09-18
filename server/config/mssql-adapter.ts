import sql from 'mssql';
import { DefaultAzureCredential } from '@azure/identity';
import { DatabaseConnection } from './database-types';
const { BaseDatabaseAdapter } = require('./base-database-adapter');

interface MSSQLDatabaseConfig {
  server: string;
  database: string;
  user?: string;
  password?: string;
  authentication?: {
    type: 'azure-active-directory-msi-app-service';
  };
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
  };
}

class MSSQLConnection implements DatabaseConnection {
  constructor(private pool: sql.ConnectionPool) {}

  async query(sqlQuery: string, params: any[] = []): Promise<any> {
    const request = this.pool.request();
    
    // Add parameters if provided
    if (params && params.length > 0) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param);
      });
      
      // Replace ? placeholders with @param0, @param1, etc.
      const parameterizedQuery = sqlQuery.replace(/\?/g, (match, offset) => {
        const paramIndex = sqlQuery.substring(0, offset).split('?').length - 1;
        return `@param${paramIndex}`;
      });
      
      return await request.query(parameterizedQuery);
    } else {
      return await request.query(sqlQuery);
    }
  }

  async close(): Promise<void> {
    await this.pool.close();
  }
}

export class MSSQLAdapter extends BaseDatabaseAdapter {
  private pool: sql.ConnectionPool | null = null;

  async connect(): Promise<DatabaseConnection> {
    if (!this.pool) {
      const config: MSSQLDatabaseConfig = process.env.NODE_ENV === 'production' 
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

      this.pool = await sql.connect(config);
      console.log('Connected to MSSQL database successfully');
    }
    
    return new MSSQLConnection(this.pool);
  }

  async insertUsers(connection: DatabaseConnection): Promise<void> {
    const users = this.getSampleUsers();
    const userValues = users.map(user => 
      `('${user.username}', '${user.password}', '${user.email}')`
    ).join(',\n      ');
    
    await connection.query(`
      INSERT INTO users (username, password, email) VALUES
      ${userValues}
    `);
  }

  async insertEvents(connection: DatabaseConnection): Promise<void> {
    const events = this.getSampleEvents();
    const eventValues = events.map(event => 
      `('${event.title}', '${event.description}', '${event.type}', '${event.venue}', '${event.event_date}', ${event.price}, ${event.available_tickets}, ${event.total_tickets}, '${event.image_url}')`
    ).join(',\n      ');
    
    await connection.query(`
      INSERT INTO events (title, description, type, venue, event_date, price, available_tickets, total_tickets, image_url) VALUES
      ${eventValues}
    `);
  }

  isUsingSQLite(): boolean {
    return false;
  }

  getAdapterName(): string {
    return 'MSSQL';
  }
}