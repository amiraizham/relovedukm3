export type Product = {
    id: number;
    user_id?: number; // optional if not returned by controller
    title: string;
    price: number;
    category: string;
    image?: string;
    status?: 'available' | 'sold';
    created_at: string;
  };
  