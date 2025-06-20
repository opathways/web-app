"use client";

import { Heading } from '@aws-amplify/ui-react';

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Heading level={1}>Access Denied</Heading>
        <p className="mt-4">You need EMPLOYER access to view this page.</p>
      </div>
    </div>
  );
}
