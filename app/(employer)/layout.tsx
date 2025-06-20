"use client";
import { fetchAuthSession } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  return <>{children}</>;
}
