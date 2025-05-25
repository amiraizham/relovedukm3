import React from 'react';
import { usePage } from '@inertiajs/react';
import Header from '@/components/header/Header';
import ChatList from '@/components/chat/ChatList';
import ChatConversation from '@/components/chat/ChatConversation';
import type { PageProps } from '@/types';
import type { Conversation, User, Message } from '@/types/Chat';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

type ChatProps = PageProps<{
    conversations?: Conversation[];
    conversation?: Conversation;
    messages?: Message[];
    seller?: User;
    authUser: User;
    unreadChats: boolean; // ✅ Add this
  }>;
  
  export default function ChatPage() {
    const { conversations = [], authUser, unreadChats} = usePage<ChatProps>().props;
    const [selected, setSelected] = useState<Conversation | null>(null);
    
    
    const handleSelect = (conv: Conversation) => {
        router.get(`/chat/conversation/${conv.id}`, {}, {
          preserveState: true,
          preserveScroll: true,
          only: ['conversation', 'messages'],
          onSuccess: (page) => {
            const data = page.props as any;
            if (data.conversation) {
              setSelected(data.conversation);
            }
          }
        });
      };
  
    return (
      <>
        <Header unreadChats={unreadChats} />
        <main className="max-w-7xl mx-auto mt-8 px-4">
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-6rem)]">
  
            <div className="col-span-12 md:col-span-4 lg:col-span-4 bg-white rounded-xl shadow p-4 flex flex-col h-full min-h-0 overflow-hidden">
              <h2 className="text-lg font-semibold text-[#E95670] mb-4">Chats</h2>
              <ChatList
                conversations={conversations}
                selected={selected}
                authUserId={authUser.id}
                onSelect={handleSelect}
              />
            </div>
  
            <div className="col-span-12 md:col-span-8 lg:col-span-8 bg-white rounded-xl shadow p-4 flex flex-col h-full min-h-0 overflow-hidden">
            <ChatConversation
                selected={selected}
                setSelected={setSelected}
                authUser={authUser}
            />
            </div>

  
          </div>
        </main>
      </>
    );
  }
  