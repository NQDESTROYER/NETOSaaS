export interface Branch {
  id: string;
  name: string;
  address?: string;
  manager_name?: string;
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
  stock: number;
  sale_price: number;
  cost_price: number;
  branch_id: string;
}

export interface Sale {
  id: string;
  total_amount: number;
  created_at: string;
  customer_name?: string;
}
