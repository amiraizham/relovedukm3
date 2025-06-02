<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class CustomVerifyEmail extends Notification
{
    /**
     * Build the email verification notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Please verify your email address')
            ->line('Click the button below to verify your email address.')
            ->action('Verify Email', secure_url('/email/verify/' . $notifiable->id . '/' . $notifiable->verification_token));
    }
}
