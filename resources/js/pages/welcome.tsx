import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header/Header';

export default function Welcome({ auth }: any) {
  return (
    <>

    <Header />
      <Head title="Welcome" />
      <div className="min-h-screen bg-gradient-to-br from-[#f7f0fa] to-[#ffe3ec] flex flex-col items-center justify-center px-6 py-12">
        {/* Logo and Heading */}
        <div className="mb-10 text-center">
          <img src="/logo/relovedukm.svg" alt="RelovedUKM" className="mx-auto h-16 mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to RelovedUKM</h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            A sustainable secondhand marketplace just for UKM students. Sell, buy, and support a greener campus!
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
          <Card>
            <CardHeader>
              <CardTitle>Verified UKM Students</CardTitle>
              <CardDescription>Every buyer and seller is part of the UKM family. No outsiders.</CardDescription>
            </CardHeader>
            <CardContent>
              <img src="/icons/verify.svg" alt="Verified" className="w-14 h-14 mx-auto" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eco-Friendly Shopping</CardTitle>
              <CardDescription>Give items a second life. Help reduce waste and carbon footprint.</CardDescription>
            </CardHeader>
            <CardContent>
              <img src="/icons/recycle.svg" alt="Eco" className="w-14 h-14 mx-auto" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Easy Listings</CardTitle>
              <CardDescription>Snap, describe, and post. Your item is ready to be sold.</CardDescription>
            </CardHeader>
            <CardContent>
              <img src="/icons/listing.svg" alt="List Item" className="w-14 h-14 mx-auto" />
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          {auth.user ? (
            <Link href={route('dashboard')}>
              <Button className="text-white bg-[#E95670] hover:bg-[#c0445c]">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href={route('login')}>
                <Button variant="outline">Log In</Button>
              </Link>
              <Link href={route('register')}>
                <Button className="bg-[#E95670] text-white hover:bg-[#c0445c]">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-sm text-muted-foreground text-center">
          Built with Laravel + Inertia.js | &copy; {new Date().getFullYear()} RelovedUKM
        </footer>
      </div>
    </>
  );
}
