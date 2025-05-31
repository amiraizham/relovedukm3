export type Product = {
    id: number;
    user_id: number; // optional if not returned by controller
    title: string;
    price: number;
    category: string;
    description: string;
    image?: string;
    status?: 'available' | 'sold';
    created_at: string;
    alreadyBooked?: boolean; 
    approvedBooking?: boolean;
    user: {
      name: string;
      avatar?: string;
      // Add other user fields if needed
    };
  };
  