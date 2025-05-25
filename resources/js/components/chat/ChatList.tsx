import React from 'react';
import type { Conversation, User, Message } from '@/types/Chat';

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  const first = parts[0]?.[0] || '';
  const second = parts[1]?.[0] || '';
  return (first + second).toUpperCase();
}

type Props = {
  conversations: Conversation[];
  selected: Conversation | null;
  authUserId: number;
  onSelect: (conv: Conversation) => void;
};

export default function ChatList({ conversations = [], selected, authUserId, onSelect }: Props) {
  if (!Array.isArray(conversations)) {
    return (
      <div className="w-full border rounded-lg bg-white p-4 h-[600px] flex items-center justify-center text-gray-400 text-sm">
        No chat list yet.
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="w-full border rounded-lg bg-white p-4 h-[600px] flex items-center justify-center text-gray-400 text-sm">
        No chat list yet.
      </div>
    );
  }

  return (
    <div className="w-full border rounded-lg bg-white p-4 h-[600px] overflow-y-auto">
      {conversations.map((conv) => {
        const user = conv.selleruser_id === authUserId ? conv.buyer : conv.seller;
        const last = conv.messages?.[0];
        const hasUnread =
        last &&
        last.receiver_id === authUserId &&
        !last.is_read;
        

        return (
          <div
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`flex items-center gap-3 cursor-pointer p-3 mb-3 rounded-lg transition ${
              selected?.id === conv.id ? 'bg-pink-50' : 'hover:bg-gray-100'
            }`}
          >
            {/* Avatar */}
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="h-9 w-9 flex items-center justify-center rounded-full border border-pink-900 text-sm font-semibold bg-white text-pink-600">
                {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">{user?.name}</span>

                {/* 🔴 Unread dot */}
                {hasUnread && (
                  <span className="relative w-4 h-2">
                    <span className="absolute inline-flex h-2 w-2 rounded-full bg-red-500 opacity-75 animate-ping"></span>
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {last?.message || 'No messages yet'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

