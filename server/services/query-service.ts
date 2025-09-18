import { getConnection, getPool } from '../config/database';
import { DatabaseFactory } from '../config/database-factory';

export class QueryService {
  static async query(sql: string, params: any[] = []): Promise<any> {
    const dbType = DatabaseFactory.getDatabaseType();
    
    if (dbType === 'sqlite') {
      const connection = getConnection();
      return await connection.query(sql, params);
    } else {
      // For MSSQL, convert ? placeholders to @param format
      const pool = getPool();
      const request = pool.request();
      
      if (params && params.length > 0) {
        params.forEach((param, index) => {
          request.input(`param${index}`, param);
        });
        
        // Replace ? placeholders with @param0, @param1, etc.
        const parameterizedQuery = sql.replace(/\?/g, (match, offset) => {
          const paramIndex = sql.substring(0, offset).split('?').length - 1;
          return `@param${paramIndex}`;
        });
        
        return await request.query(parameterizedQuery);
      } else {
        return await request.query(sql);
      }
    }
  }

  // Helper method for MSSQL-style queries (using @named parameters)
  static async queryWithNamedParams(sql: string, params: { [key: string]: any } = {}): Promise<any> {
    const dbType = DatabaseFactory.getDatabaseType();
    
    if (dbType === 'sqlite') {
      // Convert named parameters to positional ones for SQLite
      // We need to match the order they appear in the SQL
      let sqliteQuery = sql;
      const paramValues: any[] = [];
      
      // Find all @parameter references in order
      const paramMatches = sql.match(/@\w+/g) || [];
      const usedParams = new Set();
      
      paramMatches.forEach(match => {
        const paramName = match.substring(1); // Remove @ prefix
        if (!usedParams.has(paramName) && params.hasOwnProperty(paramName)) {
          paramValues.push(params[paramName]);
          usedParams.add(paramName);
        }
      });
      
      // Replace @param with ? for SQLite
      Object.keys(params).forEach((key) => {
        sqliteQuery = sqliteQuery.replace(new RegExp(`@${key}`, 'g'), '?');
      });
      
      // console.log('SQLite Query:', sqliteQuery);
      // console.log('SQLite Params:', paramValues);
      
      const connection = getConnection();
      return await connection.query(sqliteQuery, paramValues);
    } else {
      // For MSSQL, use the pool directly with named parameters
      const pool = getPool();
      const request = pool.request();
      
      // Add all parameters
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });
      
      return await request.query(sql);
    }
  }

  // Helper method to handle database-specific syntax differences
  static adaptQuery(sqliteQuery: string, mssqlQuery: string): string {
    const dbType = DatabaseFactory.getDatabaseType();
    return dbType === 'sqlite' ? sqliteQuery : mssqlQuery;
  }
}