"use client";

import { Heading } from '@aws-amplify/ui-react';

export default function Dashboard() {
  return (
    <div>
      <Heading level={1}>Employer Dashboard</Heading>
      <div className="mt-6 space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">TODO: Company Status Overview</h2>
          <p>Show company profile completion status and recent activity</p>
        </div>
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">TODO: Job Postings Summary</h2>
          <p>Display active jobs, pending applicants, and quick actions</p>
        </div>
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">TODO: Recent Applicant Activity</h2>
          <p>Show new applications and status updates requiring attention</p>
        </div>
      </div>
    </div>
  );
}
