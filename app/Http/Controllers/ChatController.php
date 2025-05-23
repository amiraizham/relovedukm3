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
    public function index()
    {
        $userId = Auth::id();

        $conversations = Conversation::where('selleruser_id', $userId)
            ->orWhere('buyeruser_id', $userId)
            ->with(['seller', 'buyer', 'messages' => function ($query) {
                $query->latest()->limit(1);
            }])
            ->latest()
            ->get();

        return Inertia::render('Chat/list', compact('conversations'));
    }

    public function start($selleruser_id)
    {
        $buyeruser_id = Auth::id();

        if ($buyeruser_id == $selleruser_id) {
            abort(403, 'You cannot chat with yourself.');
        }

        // Check if a conversation already exists in either direction
        $conversation = Conversation::where(function ($query) use ($selleruser_id, $buyeruser_id) {
            $query->where('selleruser_id', $selleruser_id)
                ->where('buyeruser_id', $buyeruser_id);
        })->orWhere(function ($query) use ($selleruser_id, $buyeruser_id) {
            $query->where('selleruser_id', $buyeruser_id)
                ->where('buyeruser_id', $selleruser_id);
        })->first();

        // If not found, create it
        if (!$conversation) {
            $conversation = Conversation::create([
                'selleruser_id' => $selleruser_id,
                'buyeruser_id' => $buyeruser_id,
            ]);
        }

        $messages = $conversation->messages()->with('sender')->orderBy('created_at')->get();

        // Get the "other user" (who you're chatting with)
        $seller = User::findOrFail(
            $conversation->selleruser_id === $buyeruser_id
                ? $conversation->buyeruser_id
                : $conversation->selleruser_id
        );

        return Inertia::render('Chat/conversation', [
            'conversation' => $conversation,
            'seller' => $seller,
            'messages' => $messages,
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
