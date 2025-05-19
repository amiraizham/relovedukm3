<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Events\MessageSent;
use Inertia\Inertia;


class ChatController extends Controller
{
    public function chatList()
    {
        $userId = Auth::id();

        $conversations = Conversation::where('selleruser_id', $userId)
            ->orWhere('buyeruser_id', $userId)
            ->with(['seller', 'buyer', 'messages' => function ($query) {
                $query->latest()->limit(1);
            }])
            ->latest()
            ->get();

        return Inertia::render('Chat/List', compact('conversations'));
    }

    public function chatWithUser($otherUserId)
    {
        $userId = Auth::id();

        $users = [$userId, $otherUserId];
        sort($users);

        $selleruser_id = $users[0];
        $buyeruser_id = $users[1];

        $conversation = Conversation::firstOrCreate([
            'selleruser_id' => $selleruser_id,
            'buyeruser_id' => $buyeruser_id,
        ]);

        Message::where('conversation_id', $conversation->id)
            ->where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = $conversation->messages()->with('sender')->latest()->take(50)->get()->reverse();

        $otherUser = User::findOrFail($otherUserId);

        return Inertia::render('Chat/Conversation', [
            'otherUser' => $otherUser,
            'conversation' => $conversation,
            'messages' => $messages,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }


    public function sendMessage(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'message' => 'nullable|string',
            'photo' => 'nullable|image|max:5120',
        ]);

        $conversation = Conversation::findOrFail($request->conversation_id);

        $senderId = Auth::id();
        // Identify receiver as the other user in the conversation
        $receiverId = $conversation->selleruser_id === $senderId
            ? $conversation->buyeruser_id
            : $conversation->selleruser_id;

        $message = new Message();
        $message->conversation_id = $conversation->id;
        $message->sender_id = $senderId;
        $message->receiver_id = $receiverId;
        $message->message = $request->input('message');

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $fileKey = 'chat_photos/' . time() . '-' . $file->getClientOriginalName();
            Storage::disk('s3')->put($fileKey, file_get_contents($file));
            $message->photo = 'https://' . config('filesystems.disks.s3.bucket') .
                '.s3.' . config('filesystems.disks.s3.region') .
                '.amazonaws.com/' . $fileKey;
        }

        $message->is_read = false;
        $message->save();

        broadcast(new MessageSent($message))->toOthers();

        return back();
    }
}
