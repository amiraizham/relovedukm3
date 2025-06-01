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
use Illuminate\Support\Facades\Log;


class ChatController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $conversations = Conversation::with([
            'seller',
            'buyer',
            'messages' => function ($q) {
                $q->latest()->limit(1); // ✅ Fetch only the latest message
            }
        ])
            ->where('selleruser_id', $userId)
            ->orWhere('buyeruser_id', $userId)
            ->latest()
            ->get();

        $hasUnreadChats = Message::where('receiver_id', $userId)
            ->where('is_read', false)
            ->exists();

        return Inertia::render('ChatPage', [
            'conversations' => $conversations,
            'authUser' => Auth::user(),
            'unreadChats' => $hasUnreadChats,
        ]);
    }

    public function start($selleruser_id)
    {
        $buyeruser_id = Auth::id();

        if ($buyeruser_id == $selleruser_id) {
            abort(403, 'You cannot chat with yourself.');
        }

        // Create conversation if not exists
        $conversation = Conversation::firstOrCreate([
            'selleruser_id' => min($selleruser_id, $buyeruser_id),
            'buyeruser_id' => max($selleruser_id, $buyeruser_id),
        ]);

        // Load all user's conversations
        $conversations = Conversation::where('selleruser_id', $buyeruser_id)
            ->orWhere('buyeruser_id', $buyeruser_id)
            ->with([
                'seller',
                'buyer',
                'messages' => function ($q) {
                    $q->latest()->limit(1);
                }
            ])
            ->latest()
            ->get();

        return Inertia::render('ChatPage', [
            'conversations' => $conversations,
            'authUser' => Auth::user(),
            // ❌ no 'conversation'
            // ❌ no 'messages'
        ]);
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'conversation_id' => 'nullable|exists:conversations,id',
            'selleruser_id' => 'required|exists:users,id',
            'message' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        $senderId = Auth::id();
        $receiverId = $request->selleruser_id;

        $conversation = Conversation::firstOrCreate(
            [
                ['selleruser_id', min($senderId, $receiverId)],
                ['buyeruser_id', max($senderId, $receiverId)],
            ]
        );

        $message = new Message();
        $message->conversation_id = $conversation->id;
        $message->sender_id = $senderId;
        $message->receiver_id = $receiverId;
        $message->message = $request->input('message');

        if ($request->hasFile('photo')) {
            try {
                $file = $request->file('photo');
                $fileKey = 'chat_photos/' . time() . '-' . $file->getClientOriginalName();

                $uploaded = Storage::disk('s3')->put($fileKey, fopen($file->getPathname(), 'r+'));

                if (!$uploaded) {
                    return back()->with('error', 'Image upload failed.');
                }

                $imageUrl = 'https://' . config('filesystems.disks.s3.bucket') .
                    '.s3.' . config('filesystems.disks.s3.region') . '.amazonaws.com/' . $fileKey;

                $message->photo = $imageUrl;
            } catch (\Exception $e) {
                Log::error('Chat image upload failed', ['error' => $e->getMessage()]);
                return back()->with('error', 'Upload error: ' . $e->getMessage());
            }
        }

        $message->is_read = false;
        $message->save();

        // broadcast(new MessageSent($message))->toOthers();

        return to_route('chat.seller', ['selleruser_id' => $receiverId]);
    }



    public function showConversation($id)
    {
        $conversation = Conversation::with(['seller', 'buyer', 'messages.sender'])->findOrFail($id);

        // ✅ Mark unread messages as read
        Message::where('conversation_id', $id)
            ->where('receiver_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return Inertia::render('ChatPage', [
            'conversation' => $conversation,
            'messages' => $conversation->messages,
            'authUser' => Auth::user(),
        ]);
    }



    public function destroy($id)
    {
        $userId = Auth::id();

        $conversation = Conversation::findOrFail($id);

        // Only allow deletion if the user is part of the conversation
        if ($conversation->selleruser_id !== $userId && $conversation->buyeruser_id !== $userId) {
            abort(403, 'Unauthorized');
        }

        // Delete all messages first (if cascading isn't set in DB)
        $conversation->messages()->delete();

        // Then delete the conversation
        $conversation->delete();

        return redirect()->route('chat.index')->with('success', 'Conversation deleted.');
    }
}
