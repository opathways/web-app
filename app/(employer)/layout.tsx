"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

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
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkGroup = async () => {
      try {
        const { tokens } = await fetchAuthSession();
        const groups = tokens?.idToken?.payload["cognito:groups"] || [];
        if (groups.includes("EMPLOYER")) {
          setAuthorized(true);
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      }
    };

    checkGroup();
  }, []);

  if (!authorized) return null;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
