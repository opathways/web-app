"use client";

import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import outputs from '@/amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(outputs);

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Employer Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your job postings and applications
          </p>
        </div>
        
        <Authenticator
          signUpAttributes={['email']}
          initialState="signIn"
          components={{
            Header() {
              return (
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Access Your Dashboard
                  </h3>
                </div>
              );
            },
          }}
        >
          {({ signOut, user }) => {
            useEffect(() => {
              if (user) {
                router.push('/dashboard');
              }
            }, [user, router]);

            return (
              <div className="text-center">
                <p className="text-green-600 mb-4">
                  Successfully signed in! Redirecting to dashboard...
                </p>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign out
                </button>
              </div>
            );
          }}
        </Authenticator>
      </div>
    </div>
  );
}
