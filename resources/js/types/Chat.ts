// types/Chat.ts

export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  
  export type Message = {
    is_read: any;
    id: number;
    sender_id: number;
    receiver_id: number;
    message: string | null;
    photo: string | null;
    created_at: string;
    sender: User;
  };
  
  export type Conversation = {
    id: number;
    selleruser_id: number;
    buyeruser_id: number;
    seller?: User;
    buyer?: User;
    messages: Message[];
  };
  