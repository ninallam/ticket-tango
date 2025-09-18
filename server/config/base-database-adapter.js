const { DatabaseAdapter, DatabaseConnection } = require('./database-types');
const { TABLE_SCHEMAS, SAMPLE_USERS, SAMPLE_EVENTS } = require('./database-schema');

class BaseDatabaseAdapter {
  async createTables() {
    const connection = await this.connect();
    
    try {
      for (const schema of TABLE_SCHEMAS) {
        const sql = this.getSchemaSQL(schema.name);
        await connection.query(sql);
      }
      
      console.log(`${this.getAdapterName()} database tables created successfully`);
    } finally {
      await connection.close();
    }
  }

  async insertDummyData() {
    const connection = await this.connect();
    
    try {
      // Check if data already exists
      const userCount = await connection.query('SELECT COUNT(*) as count FROM users');
      const count = userCount.recordset[0].count || userCount.recordset[0]['COUNT(*)'];
      
      if (count > 0) {
        console.log('Dummy data already exists, skipping insertion');
        return;
      }
      
      // Insert users and events using shared data
      await this.insertUsers(connection);
      await this.insertEvents(connection);
      
      console.log(`${this.getAdapterName()} dummy data inserted successfully`);
    } finally {
      await connection.close();
    }
  }

  getSampleUsers() {
    return SAMPLE_USERS;
  }

  getSampleEvents() {
    return SAMPLE_EVENTS;
  }

  getSchemaSQL(tableName) {
    const schema = TABLE_SCHEMAS.find(s => s.name === tableName);
    if (!schema) {
      throw new Error(`Schema not found for table: ${tableName}`);
    }
    return this.isUsingSQLite() ? schema.sqliteSQL : schema.mssqlSQL;
  }

  // Abstract methods that must be implemented by subclasses
  async connect() {
    throw new Error('connect() method must be implemented by subclass');
  }

  async insertUsers(connection) {
    throw new Error('insertUsers() method must be implemented by subclass');
  }

  async insertEvents(connection) {
    throw new Error('insertEvents() method must be implemented by subclass');
  }

  isUsingSQLite() {
    throw new Error('isUsingSQLite() method must be implemented by subclass');
  }

  getAdapterName() {
    throw new Error('getAdapterName() method must be implemented by subclass');
  }
}

module.exports = { BaseDatabaseAdapter };