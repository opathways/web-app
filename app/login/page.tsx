"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";



export default function Login() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { tokens } = await fetchAuthSession();
        const groups = tokens?.idToken?.payload["cognito:groups"] || [];
        if (Array.isArray(groups) && groups.includes("EMPLOYER")) {
          router.replace("/dashboard");
        } else if (tokens?.accessToken) {
          router.replace("/access-denied");
        }
      } catch (error) {
        console.log("User not authenticated");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Authenticator />
    </div>
  );
}
