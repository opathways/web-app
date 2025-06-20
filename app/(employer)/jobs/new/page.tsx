"use client";

import { Heading } from '@aws-amplify/ui-react';

export default function NewJob() {
  return (
    <div>
      <Heading level={1}>Post New Job</Heading>
      <div className="mt-6">
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">TODO: Job Creation Form</h2>
          <p>Include fields for title, description, requirements, salary, and employment type</p>
        </div>
      </div>
    </div>
  );
}
