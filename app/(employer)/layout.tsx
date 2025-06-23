"use client";

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactDOM = require("react-dom");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const axe = require("@axe-core/react");
  axe(require("react"), ReactDOM, 1000); // 1-second debounce
}

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";
import SidebarNav from "@/components/SidebarNav";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkGroup = async () => {
      try {
        const { tokens } = await fetchAuthSession();
        const groups = tokens?.idToken?.payload["cognito:groups"] || [];
        if (Array.isArray(groups) && groups.includes("EMPLOYER")) {
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

  if (!authorized) return null;            // don't flash protected UI

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — hidden on < md */}
      <SidebarNav className="hidden md:block w-64 bg-white border-r border-gray-200" />

      {/* Main frame */}
      <div className="flex-1 flex flex-col">
        {/* (Optional topbar placeholder) */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
