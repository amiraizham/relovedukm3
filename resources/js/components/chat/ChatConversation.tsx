import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { router } from "@inertiajs/react";
import { toast } from 'sonner';
import type { Conversation, User } from '@/types/Chat';

type Props = {
  selected: Conversation | null;
  setSelected: React.Dispatch<React.SetStateAction<Conversation | null>>;
  authUser: User;
};

export default function ChatConversation({ selected, setSelected, authUser }: Props) {
  const [msg, setMsg] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const sellerId =
    selected?.selleruser_id === authUser.id
      ? selected?.buyeruser_id
      : selected?.selleruser_id;

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [selected]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg && !photo) return;

    const formData = new FormData();
    if (selected) {
      formData.append('conversation_id', selected.id.toString());
    }
    if (sellerId) {
      formData.append('selleruser_id', sellerId.toString());
    }
    if (msg) formData.append('message', msg);
    if (photo) formData.append('photo', photo);

    router.post(route('chat.send'), formData, {
      preserveScroll: true,
      onSuccess: () => {
        setMsg('');
        setPhoto(null);
        toast.success('Message sent!');

        // Refresh selected conversation
        router.visit(`/chat/conversation/${selected?.id}`, {
          preserveScroll: true,
          preserveState: true,
          only: ['conversation', 'messages'],
          onSuccess: (page) => {
            const data = page.props as any;
            if (data.conversation) {
              setSelected(data.conversation);
            }
          },
        });
      },
    });
  };

  if (!selected) {
    return (
      <div className="flex-1 border rounded-xl bg-background flex items-center justify-center text-muted-foreground text-sm italic h-[600px]">
        Select a conversation to start chatting.
      </div>
    );
  }

  const other = selected.selleruser_id === authUser.id ? selected.buyer : selected.seller;

  return (
    <div className="flex-1 flex flex-col h-[600px] bg-white rounded-xl shadow-sm">
      {/* Header with delete menu */}
      <div className="bg-pink-700 text-white px-6 py-4 rounded-t-xl font-semibold text-base flex items-center justify-between">
        Chat with {other?.name}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-white hover:text-gray-200">
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 bg-white shadow-lg rounded-md" align="end">
            <DropdownMenuItem
              className="text-red-600 font-medium cursor-pointer"
              onClick={() => {
                if (confirm("Are you sure you want to delete this conversation?")) {
                  router.delete(`/chat/${selected?.id}/delete`, {
                    onSuccess: () => {
                      toast.success('Chat deleted successfully!');
                      router.reload({ only: ["conversations"] });
                      setSelected(null);
                    },
                    onError: () => {
                      toast.error('Failed to delete chat.');
                    },
                  });
                }
              }}
            >
              Delete Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
{/* Scrollable Message Area */}
<div className="flex-1 min-h-0 overflow-hidden">
  <div
    ref={chatRef}
    className="h-full overflow-y-auto px-6 py-4 space-y-4 bg-muted"
  >
    {selected.messages.map((m) => {
      const isMe = m.sender_id === authUser.id;
      return (
        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`rounded-2xl px-4 py-3 max-w-[70%] shadow-sm text-sm ${
              isMe
                ? 'bg-pink-600 text-white rounded-br-none'
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
            }`}
          >
            {m.photo && (
              <img
                src={m.photo}
                alt="Sent"
                className="mb-2 rounded-lg max-w-[200px] border"
              />
            )}
            {m.message && <p>{m.message}</p>}
            <p className="text-[11px] text-right opacity-60 mt-1">
              {new Date(m.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      );
    })}
  </div>
</div>


      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-4 border-t bg-white rounded-b-xl">
        <div className="flex items-center gap-2">
          <Input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Type your message..."
            className="text-sm flex-1"
          />
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="hidden"
            />
            <div className="p-2 hover:bg-gray-100 rounded-md">
              <ImagePlus className="w-5 h-5 text-pink-600" />
            </div>
          </label>
          <Button
            type="submit"
            className="bg-pink-700 text-white px-4 hover:bg-pink-900"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
