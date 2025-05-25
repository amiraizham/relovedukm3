<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingStatusMail extends Mailable
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
        $status = ucfirst($this->booking->status);
        $product = $this->booking->product;

        $statusColor = match ($this->booking->status) {
            'approved' => '#16a34a', // Tailwind green-600
            'rejected' => '#dc2626', // Tailwind red-600
            default => '#6b7280',     // Tailwind gray-500
        };

        return $this->subject("[RelovedUKM] Booking $status for {$product->product_name}")
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
                    Your booking has been <span style='color: {$statusColor};'>{$status}</span>
                    </h2>

                    <p style='color: #4b5563; font-size: 14px; margin: 0 0 8px 0;'>
                        <strong>Item:</strong> {$product->product_name}
                    </p>

                    <p style='color: #4b5563; font-size: 14px; margin: 0 0 24px 0;'>
                        Thank you for using <strong>RelovedUKM</strong>! You can view this update by logging into your account.
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
                        View Booking Status
                    </a>

                    <p style='margin-top: 24px; font-size: 12px; color: #9ca3af;'>
                        If you didn’t make this booking or believe it’s a mistake, please contact our support.
                    </p>
                </div>
            ");
    }
}
