export interface DatabaseConnection {
  query(sql: string, params?: any[]): Promise<any>;
  close(): Promise<void>;
}

export interface DatabaseAdapter {
  connect(): Promise<DatabaseConnection>;
  createTables(): Promise<void>;
  insertDummyData(): Promise<void>;
}

export type DatabaseType = 'sqlite' | 'mssql';

export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  created_at: Date;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  type: string;
  venue: string;
  event_date: Date;
  price: number;
  available_tickets: number;
  total_tickets: number;
  image_url: string;
  created_at: Date;
}

export interface Booking {
  id: number;
  user_id: number;
  event_id: number;
  quantity: number;
  total_amount: number;
  booking_date: Date;
  status: string;
}