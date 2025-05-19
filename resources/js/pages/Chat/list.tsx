import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import type { Conversation, Message, User } from '@/types'; // Define your types properly
import dayjs from 'dayjs';

type ChatListProps = {
  conversations: Array<{
    id: number;
    user1_id: number;
    user2_id: number;
    user1: User;
    user2: User;
    messages: Message[];
  }>;
  authUserId: number;
};

export default function ChatList() {
  const { conversations, authUserId } = usePage<ChatListProps>().props;

  if (!conversations.length) {
    return (
      <main className="max-w-3xl mx-auto mt-10">
        <p className="text-gray-500 text-center">You have no active conversations.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-pink-600 mb-6">My Conversations</h2>

      {conversations.map((conv) => {
        // Determine the "other" user in the conversation
        const otherUser = conv.user1_id === authUserId ? conv.user2 : conv.user1;
        const lastMessage = conv.messages.length > 0 ? conv.messages[0] : null;

        // Determine if there are unread messages for the logged-in user
        const hasUnread =
          lastMessage &&
          lastMessage.receiver_id === authUserId &&
          !lastMessage.is_read;

        return (
          <Link
            key={conv.id}
            href={`/chat/${otherUser.id}`} // Adjust to your route for conversation
            className="block p-4 mb-3 bg-white rounded-lg shadow hover:bg-gray-100 transition"
          >
            <div className="flex justify-between items-center">
              {/* Left Side: User name and last message */}
              <div>
                <p className="font-semibold text-gray-800">{otherUser.name}</p>
                <p className="text-sm text-gray-600">
                  {lastMessage?.message ?? 'No messages yet'}
                </p>
              </div>

              {/* Right Side: Timestamp and unread indicator */}
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
  );
}
