import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/header/Header";

export default function HelpPage() {
  return (
    <>
    <Header />
    <div className="max-w-3xl mx-auto p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-pink-700">
            Help & Support
          </CardTitle>
          <p className="text-sm text-gray-600">
            Need help using RelovedUKM? Find answers below or reach out to us.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">How do I sell an item?</h2>
            <p>
              Click on the <strong>“Sell” or "+"</strong> button in your dashboard. Fill in the details and upload an image.
              Your product will be reviewed and approved by an admin.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">How to book an item?</h2>
            <p>
            On any product details page, click <strong>“Book Item”</strong> and your booking is valid for 2 hours. 
            After 2 hours, if you haven’t confirmed with the seller, the item will be available for others to book.
            Once you book, the seller will receive a notification and can confirm/reject your booking. If there's no response from the seller after 2 hours, the booking will be automatically cancelled.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Can I chat with the seller?</h2>
            <p>
              Yes, click the <strong>“Chat”</strong> button to send a direct message to the seller.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Why is my product not showing?</h2>
            <p>
              All listings are reviewed by admins. Your product will appear once it’s approved.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">How can I edit or delete my product?</h2>
            <p>
              Go to your <strong>profile</strong> and click <strong>⋮</strong>, select your product, and choose “Edit” or “Delete”.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">How to Make a Payment</h2>
            <p>
              All payments are made <strong>directly to the seller</strong>. RelovedUKM does not collect or handle any payments.
              Please confirm the payment method with the seller via chat before proceeding.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
              <li>Use trusted payment methods (e.g., online transfer with proof).</li>
              <li>Always request confirmation from the seller before paying.</li>
              <li>Do not share sensitive information like bank PIN or OTP.</li>
              <li>If anything seems suspicious, report the user immediately.</li>
            </ul>
            <p className="mt-2 text-red-600 font-semibold">
              ⚠️ This direct payment approach is to encourage safe, transparent transactions. Be alert and cautious to avoid scams.
            </p>
          </section>

          <div className="border-t pt-4">
            <p>
              Still have questions? Reach out to us at{" "}
              <a
                href="mailto:relovedukm@gmail.com"
                className="text-pink-700 underline hover:text-pink-900"
              >
                relovedukm@gmail.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
