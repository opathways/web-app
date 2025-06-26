"use client";

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactDOM = require("react-dom");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const axe = require("@axe-core/react");
  axe(require("react"), ReactDOM, 1000); // 1-second debounce
}

import React, { useState } from "react";
import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import SidebarNav from "@/components/SidebarNav";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — hidden on < md */}
      <SidebarNav className="hidden md:block w-64 bg-white border-r border-gray-200" />

      {/* Main frame */}
      <div className="flex-1 flex flex-col">
        {/* Header with logout button */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-end">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-white border border-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </button>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
