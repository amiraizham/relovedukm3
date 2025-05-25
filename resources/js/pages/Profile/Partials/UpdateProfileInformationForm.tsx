import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import PrimaryButton from '@/components/PrimaryButton';
import TextInput from '@/components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useEffect, useState } from 'react';

function getInitials(name: string): string {
    const parts = name.trim().split(' ');
    const first = parts[0]?.[0] || '';
    const second = parts[1]?.[0] || '';
    return (first + second).toUpperCase();
  }
  
  function getMatricFromEmail(email: string): string | null {
    const match = email.match(/^([a-zA-Z]\d{6})@siswa\.ukm\.edu\.my$/);
    return match ? match[1].toUpperCase() : null;
  }
  

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;
    const matricNumber = getMatricFromEmail(user.email);

    const [initial] = useState({
        name: user.name,
        email: user.email,
        bio: user.bio || '',
    });

    const {
        data,
        setData,
        patch,
        errors,
        processing,
        recentlySuccessful,
      } = useForm<{
        name?: string;
        email?: string;
        bio?: string;
        avatar?: File | null;
      }>({
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        avatar: null,
      });
      

    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar ?? null);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        console.log('Submitting form data:', data);
        patch(route('profile.update'), {
         
            preserveScroll: true,
            onSuccess: () => {
                router.visit(route('profile.show', { id: user.id }));
              },
              
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6" >
                  {/* Static Initials Avatar Display */}
                <div>
                    <div className="mt-2">
                    <div className="w-24 h-24 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 text-xl font-semibold border">
                        {getInitials(user.name)}
                    </div>
                    </div>
                </div>

                <div>
                <InputLabel htmlFor="matricnum" value="Matric Number" />
                <TextInput
                    id="matricnum"
                    className="mt-1 block w-full bg-gray-100 cursor-not-allowed"
                    value={matricNumber ?? 'N/A'}
                    disabled
                />
                </div>


                {/* Name Input */}
                <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name ?? ''}
                        onChange={(e) => setData('name', e.target.value)}
                        isFocused
                        autoComplete="name"
                        />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                {/* Email Input */}
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full bg-gray-100 cursor-not-allowed"
                        defaultValue={initial.email}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value !== initial.email) {
                                setData('email', value);
                            } else {
                                setData('email', undefined);
                            }
                        }}
                        autoComplete="username"
                        disabled
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {/* Email Verification */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div>
                <InputLabel htmlFor="bio" value="Bio" />
                <textarea
                id="bio"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={data.bio ?? ''}
                onChange={(e) => setData('bio', e.target.value)}
                rows={3}
                />
                <InputError className="mt-2" message={errors.bio} />
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-4">
                <PrimaryButton
                disabled={
                    processing ||
                    (
                    (data.name === undefined || data.name === initial.name) &&
                    (data.bio === undefined || data.bio === initial.bio)
                    )
                }
                >
                Save
                </PrimaryButton>


                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
