import sql from 'mssql';
import { DefaultAzureCredential } from '@azure/identity';
import { DatabaseFactory } from './database-factory';
import { DatabaseAdapter, DatabaseConnection } from './database-types';

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
let adapter: DatabaseAdapter | null = null;
let connection: DatabaseConnection | null = null;

export async function initializeDatabase(): Promise<void> {
  try {
    const dbType = DatabaseFactory.getDatabaseType();
    console.log(`Initializing ${dbType} database...`);
    
    adapter = DatabaseFactory.createAdapter(dbType);
    
    // Create tables if they don't exist
    await adapter.createTables();
    
    // Insert dummy data
    await adapter.insertDummyData();
    
    // For backwards compatibility, also initialize the connection
    connection = await adapter.connect();
    
    // If using MSSQL, also maintain the legacy pool for existing code
    if (dbType === 'mssql') {
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
    }
    
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

export function getConnection(): DatabaseConnection {
  if (!connection) {
    throw new Error('Database connection not initialized. Call initializeDatabase() first.');
  }
  return connection;
}

export function getAdapter(): DatabaseAdapter {
  if (!adapter) {
    throw new Error('Database adapter not initialized. Call initializeDatabase() first.');
  }
  return adapter;
}

export { sql };