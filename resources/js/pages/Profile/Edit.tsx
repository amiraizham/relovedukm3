import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Edit({
    mustVerifyEmail,
    status,
    auth,
}: PageProps<{ mustVerifyEmail: boolean; status?: string; auth: { user: { id: number } } }>) {
    const userId = auth.user.id;

    return (
        <>
            <Header />
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">

                  {/* Back Button */}
                  <Link href={route("profile.show", { id: userId })} className="inline-block mb-6 hover:text-pink-700">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Back to Profile
                    </Button>
                  </Link>

                  <Card className="max-w-xl mx-auto">
                    <CardHeader>
                      <CardTitle>Update Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                      />
                    </CardContent>
                  </Card>

                  <Card className="max-w-xl mx-auto">
                    <CardHeader>
                      <CardTitle>Update Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <UpdatePasswordForm />
                    </CardContent>
                  </Card>

                  <Card className="max-w-xl mx-auto">
                    <CardHeader>
                      <CardTitle>Delete Account</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DeleteUserForm />
                    </CardContent>
                  </Card>

                </div>
            </div>
        </>
    );
}
