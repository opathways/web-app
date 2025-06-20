"use client";

import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

Amplify.configure(outputs);

export default function Login() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center">
     <Authenticator>
  {({ signOut, user }) => {
    useEffect(() => {
      if (user) {
        router.push('/dashboard');
      }
    }, [user]);

    return <div className="text-sm text-gray-500">Redirecting...</div>;
  }}
</Authenticator>
    </div>
  );
}
