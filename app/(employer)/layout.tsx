"use client";
import { fetchAuthSession } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkGroup = async () => {
      try {
        const { tokens } = await fetchAuthSession();
        const rawGroups = tokens?.idToken?.payload["cognito:groups"];
        const groups = Array.isArray(rawGroups) ? rawGroups : [];

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
      {/* Sidebar Navigation */}
      <aside className="w-60 p-4 bg-gray-50"> 
        <nav>
          <ul className="space-y-2">
            <li><Link href="/dashboard">Dashboard</Link></li>
            <li><Link href="/company-profile">Company Profile</Link></li>
            <li><Link href="/jobs">Jobs</Link></li>
          </ul>
        </nav>
      </aside>
      {/* Main Content Area */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
