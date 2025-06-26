"use client";

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function LoginContent() {
  const router = useRouter();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

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

  useEffect(() => {
    const handleAuthStateChange = async () => {
      if (authStatus === "authenticated") {
        try {
          const { tokens } = await fetchAuthSession();
          const groups = tokens?.idToken?.payload["cognito:groups"] || [];
          if (Array.isArray(groups) && groups.includes("EMPLOYER")) {
            router.replace("/dashboard");
          } else if (tokens?.accessToken) {
            router.replace("/access-denied");
          }
        } catch (error) {
          console.error("Error checking auth after sign in:", error);
        }
      }
    };

    handleAuthStateChange();
  }, [authStatus, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Authenticator />
    </div>
  );
}

export default function Login() {
  return (
    <Authenticator.Provider>
      <LoginContent />
    </Authenticator.Provider>
  );
}
