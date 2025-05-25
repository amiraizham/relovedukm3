import { FormEventHandler, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import GuestLayout from '@/layouts/GuestLayout';
import Header from '@/components/header/Header';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('register'), {
      onSuccess: () => toast.success('Registration successful!'),
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <>
      <Header />
      <Head title="Register" />

      <div className="w-screen h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-pink-700">Create Account</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Register your RelovedUKM account
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                required
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password_confirmation">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showConfirm ? 'text' : 'password'}
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-sm text-red-500 mt-1">{errors.password_confirmation}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Link
                href={route('login')}
                className="text-sm text-pink-600 hover:underline"
              >
                Already registered?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={processing}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white"
            >
              {processing ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
