"use client";

import { Heading } from '@aws-amplify/ui-react';

export default function EditJob({ params }: { params: { id: string } }) {
  return (
    <div>
      <Heading level={1}>Edit Job</Heading>
      <div className="mt-6">
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">TODO: Job Edit Form</h2>
          <p>Allow modification of job details for job ID: {params.id}</p>
        </div>
      </div>
    </div>
  );
}
