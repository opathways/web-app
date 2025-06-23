"use client";

import { Heading, View, Text, Button } from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";

export default function AccessDenied() {
  const router = useRouter();

  return (
    <View className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Heading level={1}>Access Denied</Heading>
        <Text>You need EMPLOYER privileges to access this application.</Text>
        <Button onClick={() => router.push("/login")}>Back to Login</Button>
      </div>
    </View>
  );
}
