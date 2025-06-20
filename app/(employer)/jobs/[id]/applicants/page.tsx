"use client";

import { Heading } from '@aws-amplify/ui-react';

export default function JobApplicants({ params }: { params: { id: string } }) {
  return (
    <div>
      <Heading level={1}>Job Applicants</Heading>
      <div className="mt-6">
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">TODO: Applicants List</h2>
          <p>Display all applicants for job ID: {params.id}</p>
          <p>Show status progression (NEW → REVIEW → HIRED/REJECTED)</p>
          <p>Include filtering by status and bulk actions</p>
        </div>
      </div>
    </div>
  );
}
