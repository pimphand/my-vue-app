export interface OrderItem {
  id: string;
  brand: string;
  name: string;
  quantity: number;
  total: number;
  price: number;
  returns: number;
  discount?: number;
  is_percentage?: boolean;
}

export interface Payment {
  id: string;
  method: string;
  date: string;
  amount: string;
  remaining: string;
  customer: string;
  collector: string;
  admin: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: {
    name: string;
    display_name: string;
  };
}

export interface Order {
  id: number;
  sales: {
    id: number;
    name: string;
    email: string;
    role: {
      name: string;
      display_name: string;
    };
  };
  customer: {
    id: string;
    name: string;
    phone: string;
    address: string;
    store_name: string;
    store_address: string | null;
    city: string;
    state: string;
    store_photo: string;
    owner_photo: string;
  };
  shipper: {
    id: number;
    name: string;
    email: string;
    role: {
      name: string;
      display_name: string;
    };
  } | null;
  collector: {
    id: number;
    name: string;
    email: string;
    role: {
      name: string;
      display_name: string;
    };
  } | null;
  items: OrderItem[];
  payments: Payment[];
  quantity: number;
  total_price: number;
  status: string;
  paid: number;
  remaining: number;
  shipped_at: string | null;
  note: string | null;
  file: string | null;
  bukti_pengiriman: string | null;
  created_at: string;
  updated_at: string;
  discount?: number;
  is_percentage?: boolean;
  type_discount?: boolean;
}

export interface PaginatedResponse {
  data: Order[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
    from?: number;
  };
} 