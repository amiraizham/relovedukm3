<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    public function build()
    {
        $link = route('login') . '?redirect=' . urlencode(route('notifications.index'));
        $product = $this->booking->product;
        $buyer = $this->booking->buyer;

        return $this->subject('[RelovedUKM] New Booking Request for ' . $product->product_name)
            ->html("
                <div style='
                    font-family: system-ui, sans-serif;
                    background-color: #f8fafc;
                    padding: 32px;
                    border-radius: 12px;
                    max-width: 560px;
                    margin: auto;
                    border: 1px solid #e2e8f0;
                '>
                    <h2 style='color: #111827; font-size: 20px; font-weight: 600; margin-bottom: 16px;'>
                        Someone is interested in your item! Please Approve or Reject this item within 2 hours for a seamless process.
                    </h2>

                    <p style='color: #4b5563; font-size: 14px; margin: 0 0 8px 0;'>
                        <strong>Item:</strong> {$product->product_name}
                    </p>

                    <p style='color: #4b5563; font-size: 14px; margin: 0 0 16px 0;'>
                        <strong>Buyer:</strong> {$buyer->name} ({$buyer->email})
                    </p>

                    <p style='color: #374151; font-size: 14px; margin-bottom: 24px;'>
                        Please log in to RelovedUKM to approve or reject this booking request.
                    </p>

                    <a href='{$link}' style='
                        display: inline-block;
                        padding: 12px 20px;
                        background-color: #ec4899;
                        color: white;
                        font-size: 14px;
                        font-weight: 500;
                        text-decoration: none;
                        border-radius: 8px;
                    '>
                        Login to RelovedUKM
                    </a>

                    <p style='margin-top: 24px; font-size: 12px; color: #9ca3af;'>
                        If you have questions or need help, please contact our support.
                    </p>
                </div>
            ");
    }
}
