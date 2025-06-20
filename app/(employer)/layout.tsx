"use client";

import { useAuthenticator } from '@aws-amplify/ui-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(outputs);

function Sidebar() {
  return (
    <nav className="w-64 bg-gray-100 h-screen p-4">
      <div className="space-y-2">
        <a href="/dashboard" className="block p-2 hover:bg-gray-200 rounded">
          Dashboard
        </a>
        <a href="/company-profile" className="block p-2 hover:bg-gray-200 rounded">
          Company Profile
        </a>
        <a href="/jobs" className="block p-2 hover:bg-gray-200 rounded">
          Jobs
        </a>
      </div>
    </nav>
  );
}

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuthenticator();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const groups = user.signInUserSession?.accessToken?.payload['cognito:groups'] || [];
    if (!groups.includes('EMPLOYER')) {
      router.push('/access-denied');
      return;
    }
  }, [user, router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="mb-4">
          <button onClick={signOut} className="bg-red-500 text-white px-4 py-2 rounded">
            Sign Out
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
