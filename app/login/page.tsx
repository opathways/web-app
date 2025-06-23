"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

Amplify.configure(outputs);

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await Amplify.Auth.currentSession();
        const groups = session.getAccessToken().decodePayload()["cognito:groups"] || [];
        if (groups.includes("EMPLOYER")) {
          router.replace("/dashboard");
        }
      } catch {
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
