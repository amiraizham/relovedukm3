import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import GuestLayout from '@/layouts/GuestLayout';
import Header from '@/components/header/Header';

export default function Login({
  status,
  canResetPassword,
}: {
  status?: string;
  canResetPassword: boolean;
}) {
  const { data, setData, post, processing, errors, reset } = useForm<{
    email: string;
    password: string;
    remember: boolean;
  }>({
    email: '',
    password: '',
    remember: false,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <>
    <Header />
      <Head title="Log in" />

      <div className="w-screen h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-pink-700">Welcome Back</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Login to your RelovedUKM account
            </p>
          </div>

          {status && (
            <div className="text-center text-sm font-medium text-green-600">
              {status}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <Label htmlFor="email">Siswa Email</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                autoComplete="username"
                onChange={(e) => setData('email', e.target.value)}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={data.password}
                autoComplete="current-password"
                onChange={(e) => setData('password', e.target.value)}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={data.remember}
                  onCheckedChange={(checked) => setData('remember', Boolean(checked))}
                />
                <label htmlFor="remember" className="text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              {canResetPassword && (
                <Link
                  href={route('password.request')}
                  className="text-sm text-pink-600 hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>

            <Button
              type="submit"
              disabled={processing}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white"
            >
              {processing ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
