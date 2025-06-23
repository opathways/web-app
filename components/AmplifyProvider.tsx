"use client";

import React from "react";
import { Amplify } from "aws-amplify";
import { ReactNode, useEffect, useState } from "react";

interface AmplifyProviderProps {
  children: ReactNode;
}

export default function AmplifyProvider({ children }: AmplifyProviderProps) {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const configureAmplify = () => {
      try {
        if (typeof window !== 'undefined') {
          console.warn("Running in local development mode - Amplify auto-configuration");
        }
        setIsConfigured(true);
      } catch (error) {
        console.warn("Amplify configuration error:", error);
        setIsConfigured(true);
      }
    };
    
    configureAmplify();
  }, []);

  return isConfigured ? <>{children}</> : null;
}
