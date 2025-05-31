import React from 'react';
import { usePage } from '@inertiajs/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PageProps } from '@/types';
import Header from '@/components/header/Header';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

type Booking = {
    id: number;
    status: string;
    product: {
      product_id: number;
      product_name: string;
      product_price: string; // or number, depending on your API cast
    };
    seller?: { id: number; name: string };
    buyer?: { id: number; name: string };
    has_review?: boolean;
  };
  
  type Product = {
    product_id: number;
    product_name: string;
    product_price: string;
    rejection_reason?: string; // ✅ add this line
  };
  

export default function Notifications() {
    const { 
        buyerNotifications, 
        sellerNotifications, 
        rejectedProducts, 
        authUserId, 
        hasNewRequests, 
        hasBookingUpdates,
        hasNewRejected,
      } = usePage<
        PageProps<{
          buyerNotifications: Booking[];
          sellerNotifications: Booking[];
          rejectedProducts: Product[];
          authUserId: number;
          hasNewRequests: boolean;
          hasBookingUpdates: boolean;
        hasNewRejected: boolean;  

        }>
      >().props;

      const [selectedTab, setSelectedTab] = React.useState('buyer');

        const [rejectedViewed, setRejectedViewed] = React.useState(false);

        React.useEffect(() => {
        if (selectedTab === 'rejected') {
            setRejectedViewed(true);
        }
        }, [selectedTab]);

        const showRejectedDot = hasNewRejected && !rejectedViewed;

      
const { csrf_token } = usePage().props;

  const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={
      [
        "inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all",
        "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:bg-pink-600 data-[state=active]:text-white data-[state=active]:shadow",
        "data-[state=inactive]:text-muted-foreground",
        className
      ].filter(Boolean).join(' ')
    }
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName
const hasRejectedProducts = rejectedProducts.length > 0;


  return (
    <>
      <Header />
    <div className="max-w-6xl mx-auto py-10">

    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
    <TabsList className="grid w-full grid-cols-3 bg-muted">

        <TabsTrigger value="buyer">
        <span className="relative inline-flex items-center">
            My Bookings
            {hasBookingUpdates && (
            <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
        </span>
        </TabsTrigger>

        <TabsTrigger value="seller">
        <span className="relative inline-flex items-center">
            Booking Requests
            {hasNewRequests && (
            <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
        </span>
        </TabsTrigger>

        <TabsTrigger value="rejected">
        <span className="relative inline-flex items-center">
            Rejected Products
            {showRejectedDot && (

            <>
                <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-red-500" />
            </>
            )}
        </span>
        </TabsTrigger>
        </TabsList>

        {/* Buyer Notifications */}
        <TabsContent value="buyer">
          <Card className="p-6">
            {buyerNotifications.length === 0 ? (
              <p className="text-muted-foreground italic">You have not made a booking yet.</p>
            ) : (
              <div className="space-y-4">
                {buyerNotifications.map((b) => (
                <div key={`buyer-${b.id}`} className="border-b py-4 flex justify-between items-center">
                    <div>
                    <p className="font-medium">{b.product.product_name || 'Unnamed Product'}</p>
                    <p className="text-sm text-muted-foreground">
                        RM {parseFloat(b.product.product_price).toFixed(2)}
                    </p>
                    <p className="text-sm">
                        Status:{' '}
                        <span className={
                        b.status === 'pending' ? 'text-yellow-600' :
                        b.status === 'approved' ? 'text-green-600' :
                        b.status === 'rejected' ? 'text-red-600' :
                        b.status === 'sold' ? 'text-orange-600' : ''
                        }>
                        {b.status}
                        </span>
                    </p>
                    </div>

                    <div className="flex gap-2">
                    {b.status === 'approved' && (
                        <Button
                        variant="default"
                        className="bg-pink-600 hover:bg-pink-700 text-white"
                        size="sm"
                        onClick={() => window.location.href = `/chat/${b.seller?.id}`}
                        >
                        Chat Seller
                        </Button>
                    )}
                    {b.status === 'sold' && (
                    b.has_review ? (
                        <Button
                        variant="default"       
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        size="sm"
                        onClick={() => window.location.href = `/review/view/${b.product.product_id}`}
                        >
                        See Review
                        </Button>
                    ) : (
                        <Button
                        variant="default"
                        className="bg-pink-600 hover:bg-pink-700 text-white"
                        size="sm"
                        onClick={() => window.location.href = `/review/create/${b.product.product_id}`}
                        >
                        Leave a Review
                        </Button>
                    )
                )}
                    </div>
                </div>
                ))}

              </div>
            )}
          </Card>
        </TabsContent>

        {/* Seller Notifications */}
        <TabsContent value="seller">
          <Card className="p-6">
            {sellerNotifications.length === 0 ? (
              <p className="text-muted-foreground italic">No booking requests found.</p>
            ) : (
              <div className="space-y-4">
                {sellerNotifications.map((b, index) => (
                  <div key={`seller-${b.id}`} className="border-b py-4 flex justify-between items-center">
                    <div>
                    <p className="font-medium">{b.product?.product_name || 'Unnamed Product'}</p>
                    <p className="text-sm text-muted-foreground">Buyer: {b.buyer?.name || 'Unknown'}</p>
                    <p className="text-sm">RM {parseFloat(b.product.product_price).toFixed(2)}
                    </p>

                      <p className="text-sm">
                        Status:{' '}
                        <span className={
                          b.status === 'pending' ? 'text-yellow-600' :
                          b.status === 'approved' ? 'text-green-600' :
                          b.status === 'rejected' ? 'text-red-600' : ''
                        }>
                          {b.status}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                    {b.status === 'pending' ? (
                    <div className="flex gap-2">
                        <Button
                        onClick={() =>
                            router.post(`/notifications/${b.id}/approved`, {}, {
                            onSuccess: () => toast.success('Booking approved!'),
                            onError: () => toast.error('Failed to approve booking.'),
                            })
                        }
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                        >
                        Approve
                        </Button>

                        <Button
                        onClick={() =>
                            router.post(`/notifications/${b.id}/rejected`, {}, {
                            onSuccess: () => toast.success('Booking rejected.'),
                            onError: () => toast.error('Failed to reject booking.'),
                            })
                        }
                        className="bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                        >
                        Reject
                        </Button>
                    </div>
                    ) : b.status === 'approved' ? (
                    <Button
                        onClick={() =>
                        router.post(`/bookings/${b.id}/sold`, {}, {
                            onSuccess: () => toast.success('Marked as sold!'),
                            onError: () => toast.error('Failed to mark as sold.'),
                        })
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                    >
                        Mark as Sold
                    </Button>
                    ) : b.status === 'sold' && b.has_review ? (
                        <Button
                        onClick={() => window.location.href = `/review/view/${b.product.product_id}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        size="sm"
                        >
                        See Review
                        </Button>
                    ) : (
                        <span className="text-muted-foreground text-sm">No actions</span>
                    )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Rejected Products */}
        <TabsContent value="rejected">
        <Card className="p-6">
            <p className="text-md">List of products that were rejected by admin due to the system's guidelines.</p>
            {rejectedProducts.length === 0 ? (
            <p className="text-muted-foreground italic">No rejected products found.</p>
            ) : (
            <div className="space-y-4">
                {rejectedProducts.map((p) => (
                <div key={`rejected-${p.product_id}`} className="border-b py-4 space-y-1">
                    <p className="font-medium">{p.product_name}</p>
                    <p className="text-sm">RM {parseFloat(p.product_price).toFixed(2)}</p>
                    <p className="text-sm text-red-600">❌ Rejected by Admin</p>
                    <p className="text-sm text-muted-foreground">
                    Reason: {p.rejection_reason || 'Not specified'}
                    </p>                
                    </div>
                ))}
            </div>
            )}
        </Card>
        </TabsContent>

      </Tabs>
    </div>
    </>
  );
}
