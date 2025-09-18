import { DatabaseAdapter, DatabaseType } from './database-types';
import { SQLiteAdapter } from './sqlite-adapter';
import { MSSQLAdapter } from './mssql-adapter';

export class DatabaseFactory {
  static createAdapter(type: DatabaseType): DatabaseAdapter {
    switch (type) {
      case 'sqlite':
        return new SQLiteAdapter();
      case 'mssql':
        return new MSSQLAdapter();
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }

  static getDatabaseType(): DatabaseType {
    // Use SQLite for development unless explicitly configured for MSSQL
    if (process.env.NODE_ENV === 'production') {
      return 'mssql';
    }
    
    // Allow override via environment variable for development
    if (process.env.DB_TYPE === 'mssql') {
      return 'mssql';
    }
    
    return 'sqlite';
  }
}