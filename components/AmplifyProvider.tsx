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
    const configureAmplify = async () => {
      try {
        if (typeof window !== 'undefined') {
          try {
            const outputs = await import('@/amplify_outputs.json');
            Amplify.configure(outputs.default, { ssr: true });
          } catch (importError) {
            console.warn("amplify_outputs.json not found - running in development mode");
            Amplify.configure({}, { ssr: true });
          }
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
