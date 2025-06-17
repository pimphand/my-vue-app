export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_publish: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  file: string | null;
  skus_count: number;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    created_at: string;
    updated_at: string;
  };
  skus: Array<{
    id: string;
    product_id: string;
    name: string;
    code: string;
    price: number | null;
    weight: number | null;
    width: number | null;
    height: number | null;
    depth: number | null;
    stock: number | null;
    is_publish: number;
    packaging: string;
    application: string | null;
    description: string | null;
    performance: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    total_order: number;
  }>;
}

export interface PaginatedResponse {
  data: Product[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
    from?: number;
  };
} 