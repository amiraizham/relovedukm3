<?php

namespace App\Mail;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ProductApprovalMail extends Mailable
{
    use Queueable, SerializesModels;

    public $product;

    /**
     * Create a new message instance.
     *
     * @param Product $product
     * @return void
     */
    public function __construct(Product $product)
    {
        $this->product = $product;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $product = $this->product;
        return $this->subject('New Product Submitted for Approval')
            ->html("
                <div style='font-family: system-ui, sans-serif; background-color: #f8fafc; padding: 32px; border-radius: 12px; max-width: 560px; margin: auto; border: 1px solid #e2e8f0;'>
                    <h2 style='color: #111827; font-size: 20px; font-weight: 600; margin-bottom: 16px;'>A new product has been submitted for approval!</h2>
    
                    <p style='color: #4b5563; font-size: 14px; margin: 0 0 8px 0;'><strong>Product Name:</strong> {$product->product_name}</p>
                    <p style='color: #4b5563; font-size: 14px; margin: 0 0 8px 0;'><strong>Description:</strong> {$product->product_desc}</p>
                    <p style='color: #4b5563; font-size: 14px; margin: 0 0 8px 0;'><strong>Price:</strong> RM {$product->product_price}</p>
                    <p style='color: #4b5563; font-size: 14px; margin: 0 0 8px 0;'><strong>Category:</strong> {$product->product_category}</p>
    
                    <p style='color: #4b5563; font-size: 14px; margin: 24px 0;'>Please log in and review this product submission.</p>
    
                    <a href='" . route('login') . "' style='
                        display: inline-block;
                        padding: 12px 20px;
                        background-color: #2563eb;
                        color: white;
                        font-size: 14px;
                        font-weight: 500;
                        text-decoration: none;
                        border-radius: 8px;
                        margin-right: 8px;
                    '>Login to Admin Panel</a>
    
                    <p style='margin-top: 24px; font-size: 12px; color: #9ca3af;'>Thank you for your attention. If you have any questions, please contact support.</p>
                </div>
            ");
    }
}
