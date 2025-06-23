"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify, Hub } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    const unsub = Hub.listen("auth", ({ payload }: any) => {
      if (payload.event === "signedIn") {
        router.replace("/dashboard");
      }
    });
    return () => unsub();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Authenticator />
    </div>
  );
}
