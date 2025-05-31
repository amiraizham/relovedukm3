import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import Header from '@/components/header/Header';
import ChatList from '@/components/chat/ChatList';
import ChatConversation from '@/components/chat/ChatConversation';
import type { PageProps } from '@/types';
import type { Conversation, User, Message } from '@/types/Chat';
import { ArrowLeft } from 'lucide-react';

type ChatProps = PageProps<{
  conversations?: Conversation[];
  conversation?: Conversation;
  messages?: Message[];
  seller?: User;
  authUser: User;
  unreadChats: boolean;
}>;

export default function ChatPage() {
  const { conversations = [], authUser, unreadChats } = usePage<ChatProps>().props;
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

  const handleBack = () => setSelected(null);

  return (
    <>
      <Header unreadChats={unreadChats} />
      <main className="max-w-7xl mx-auto mt-4 px-4">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-5rem)]">

          {/* ✅ Mobile Chat List */}
          <div className={`col-span-12 md:hidden ${selected ? 'hidden' : ''}`}>
            <div className="bg-white rounded-xl shadow p-4 h-full flex flex-col overflow-hidden">
              <h2 className="text-lg font-semibold text-[#E95670] mb-4">Chats</h2>
              <ChatList
                conversations={conversations}
                selected={selected}
                authUserId={authUser.id}
                onSelect={handleSelect}
              />
            </div>
          </div>

          {/* ✅ Mobile Chat Conversation */}
          {selected && (
            <div className="col-span-12 md:hidden bg-white rounded-xl shadow p-4 flex flex-col h-full min-h-0">
              <div className="mb-2">
                <button
                  onClick={handleBack}
                  className="text-sm text-pink-600 flex items-center gap-1 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Chats
                </button>
              </div>
              <div className="flex-grow overflow-y-auto">
                <ChatConversation
                  selected={selected}
                  setSelected={setSelected}
                  authUser={authUser}
                />
              </div>
            </div>
          )}

          {/* ✅ Desktop Chat List */}
          <div className="hidden md:flex md:col-span-4 bg-white rounded-xl shadow p-4 flex-col h-full min-h-0 overflow-hidden">
            <h2 className="text-lg font-semibold text-[#E95670] mb-4">Chats</h2>
            <ChatList
              conversations={conversations}
              selected={selected}
              authUserId={authUser.id}
              onSelect={handleSelect}
            />
          </div>

          {/* ✅ Desktop Chat Conversation */}
          <div className="hidden md:flex md:col-span-8 bg-white rounded-xl shadow p-4 flex-col h-full min-h-0 overflow-hidden">
            <div className="flex-grow overflow-y-auto">
              <ChatConversation
                selected={selected}
                setSelected={setSelected}
                authUser={authUser}
              />
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
