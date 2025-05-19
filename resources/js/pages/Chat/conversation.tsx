import React, { useEffect, useRef, useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/header/Header';

type User = {
    id: number;
    name: string;
  };
  
  type Message = {
    id: number;
    sender_id: number;
    receiver_id: number;
    message: string | null;
    photo: string | null;
    created_at: string;
    sender: User;
  };
  
  type Conversation = {
    id: number;
    selleruser_id: number;
    buyeruser_id: number;
  };
  
  type Props = {
    seller: User;
    conversation: Conversation;
    messages: Message[];
    auth: {
      user: User;
      // You can include more attributes depending on what you need from auth
    };
}

export default function Conversation() {
    const { seller, conversation, messages, auth } = usePage<Props>().props;

  const [messageText, setMessageText] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  // Scroll on load and when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText && !photoFile) return;

    const formData = new FormData();
    formData.append('conversation_id', String(conversation.id));
    if (messageText) formData.append('message', messageText);
    if (photoFile) formData.append('photo', photoFile);

    Inertia.post(route('chat.send'), formData, {
      preserveScroll: true,
      onSuccess: () => {
        setMessageText('');
        setPhotoFile(null);
        scrollToBottom();
      },
    });
  };

  return (
    <main className="max-w-3xl mx-auto mt-10">
        <Header />
      <Card>
        <CardHeader className="bg-[#E95670] text-white">
          <CardTitle className="text-lg font-semibold px-6 py-4">Chat with {seller.name}</CardTitle>
        </CardHeader>

        <CardContent
          ref={chatBoxRef}
          className="px-6 py-4 h-[400px] overflow-y-auto bg-gray-50"
          id="chat-box"
        >
          {messages.map((msg) => {
            const isSender = msg.sender_id === auth.user.id;
            return (
              <div
                key={msg.id}
                className={`mb-4 ${isSender ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-lg ${
                    isSender ? 'bg-[#E95670] text-white' : 'bg-gray-200 text-gray-800'
                  } max-w-[70%] break-words`}
                >
                  {msg.photo && (
                    <img
                      src={msg.photo}
                      alt="Chat Photo"
                      className="rounded-lg max-w-[200px] mb-2 mx-auto"
                    />
                  )}
                  {msg.message && <p className="text-sm">{msg.message}</p>}
                  <p className="text-xs text-right mt-1 opacity-70">
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col px-6 py-4 bg-white border-t gap-2"
          encType="multipart/form-data"
        >
          <input type="hidden" name="conversation_id" value={conversation.id} />

          <Input
            type="text"
            name="message"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#E95670]"
          />

          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.length) {
                setPhotoFile(e.target.files[0]);
              } else {
                setPhotoFile(null);
              }
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E95670]"
          />

          <Button
            type="submit"
            className="bg-[#E95670] text-white rounded-full hover:bg-[#b3425e] transition mt-2 px-5 py-2"
          >
            Send
          </Button>
        </form>
      </Card>
    </main>
  );
}
