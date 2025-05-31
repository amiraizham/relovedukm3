import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import Header from '@/components/header/Header';

export default function Welcome({ auth }: any) {
  return (
    <>
      <Header />
      <Head title="Welcome" />

      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#f7f0fa] to-[#f6e5eb] flex flex-col items-center justify-center px-6 py-12 text-center">

      <h1 className="text-3xl font-bold text-pink-700 mb-4">
          Welcome to
        </h1>

        {/* Logo */}
        <img
          src="/relovedlogoukm.svg"
          alt="RelovedUKM Logo"
          className="h-24 w-auto mb-6"
        />

        {/* Description */}
        <p className="text-sm text-muted-foreground max-w-xs mb-8">
          A sustainable secondhand marketplace exclusively for UKM students.
          Buy, sell, and support a greener campus community.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
          {auth.user ? (
            <Link href={route('dashboard')} className="w-full">
              <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href={route('login')} className="w-full">
                <Button
                  variant="outline"
                  className="w-full bg-white text-pink-600 hover:bg-pink-600 hover:text-white transition"
                >
                  Log In
                </Button>
              </Link>
              <Link href={route('register')} className="w-full">
                <Button className="w-full bg-pink-600 hover:bg-white hover:text-pink-600 text-white">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
