import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Header from '@/components/header/Header';
import { Card } from '@/components/ui/card';
import type { PageProps } from '@/types';
import type { User } from '@/types';
import dayjs from 'dayjs';

type Message = {
  id: number;
  message: string | null;
  photo: string | null;
  sender_id: number;
  receiver_id: number;
  created_at: string;
  is_read: boolean;
};

type Conversation = {
  id: number;
  selleruser_id: number;
  buyeruser_id: number;
  seller: User;
  buyer: User;
  messages: Message[];
};

type ChatListProps = PageProps<{
  conversations: Conversation[];
}>;

export default function ChatList() {
  const {
    conversations,
    auth: { user: authUser },
  } = usePage<ChatListProps>().props;

  const authUserId = authUser.id;

  if (!conversations.length) {
    return (
      <>
        <Header />
        <main className="max-w-3xl mx-auto mt-10">
          <Card className="p-6 text-center">
            <p className="text-gray-500 text-base">You have not started a chat yet.</p>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto mt-10">
        <h2 className="text-2xl font-bold text-pink-600 mb-6">My Conversations</h2>

        {conversations.map((conv) => {
          const otherUser =
            conv.selleruser_id === authUserId ? conv.buyer : conv.seller;

          if (!otherUser) return null;

          const lastMessage = conv.messages.length > 0 ? conv.messages[0] : null;
          const hasUnread =
            lastMessage &&
            lastMessage.receiver_id === authUserId &&
            !lastMessage.is_read;

          return (
            <Link
              key={conv.id}
              href={`/chat/${otherUser.id}`}
              className="block p-4 mb-3 bg-white rounded-lg shadow hover:bg-gray-100 transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{otherUser.name}</p>
                  <p className="text-sm text-gray-600">
                    {lastMessage?.message ?? 'No messages yet'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {lastMessage ? dayjs(lastMessage.created_at).fromNow() : ''}
                  </span>
                  {hasUnread && (
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full" />
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </main>
    </>
  );
}
