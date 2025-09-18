export interface User {
  id: number;
  username: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  type: 'concert' | 'workshop';
  venue: string;
  event_date: string;
  price: number;
  available_tickets: number;
  total_tickets: number;
  image_url?: string;
  created_at: string;
}

export interface Booking {
  id: number;
  quantity: number;
  total_amount: number;
  booking_date: string;
  status: string;
  event_title: string;
  venue: string;
  event_date: string;
  type: 'concert' | 'workshop';
  image_url?: string;
  unit_price?: number;
  event_description?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface EventsResponse {
  events: Event[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}