import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import Header from '@/components/header/Header';

export default function Welcome({ auth }: any) {
  return (
    <>
      <Header />
      <Head title="Welcome" />

      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-rose-100 via-violet-100 to-pink-100 flex flex-col items-center justify-center px-6 py-10 text-center">

        {/* Logo */}
        <img
          src="/relovedlogoukm.svg"
          alt="RelovedUKM Logo"
          className="h-36 w-auto mb-4"
        />


        {/* Hero Text */}
        <main className="flex flex-col items-center text-center mx-auto mb-6">
        <h1 className="text-md sm:text-xl font-bold tracking-tight leading-tight mb-2 text-pink-700 opacity-0 animate-fadeInUp">
          A marketplace for students,
          <br />
          <i className="font-serif font-medium text-gray-700">by students.</i>
        </h1>

        </main>

        {/* Curved Image Section */}
        {/* Curved Image Section - hidden on mobile */}
        <section className="hidden sm:flex relative mt-2 w-full max-w-5xl h-[320px] mb-6 items-center justify-center">
          {[
            "/img03.jpg",
            "/img01.jpg",
            "/img02.jpg",
            "/img05.jpg",
            "/img04.jpg",
            "/img06.jpg",
            "/img07.jpg",
          ].map((src, i, arr) => {
            const center = Math.floor(arr.length / 2);
            const offset = i - center;
            const angle = offset * 5;
            const translateX = offset * 150;

            return (
              <img
                key={i}
                src={src}
                alt={`Art ${i + 1}`}
                className="absolute w-64 h-64 object-cover rounded-xl shadow-lg transition duration-300 hover:scale-105"
                style={{
                  transform: `translateX(${translateX}px) rotate(${angle}deg)`,
                  zIndex: `${5 - Math.abs(offset)}`,
                }}
              />
            );
          })}
        </section>


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
            <Link href={route('register')} className="w-full">
            <Button className="w-40 bg-pink-600 hover:bg-white hover:text-pink-600 text-white font-extrabold transition">
              Join Us Now!
            </Button>
          </Link>

            </>
          )}
        </div>
      </div>
    </>
  );
}
