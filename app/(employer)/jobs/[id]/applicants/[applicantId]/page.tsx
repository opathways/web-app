"use client";

import { Heading } from '@aws-amplify/ui-react';

export default function ApplicantProfile({ 
  params 
}: { 
  params: { id: string; applicantId: string } 
}) {
  return (
    <div>
      <Heading level={1}>Applicant Profile</Heading>
      <div className="mt-6">
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">TODO: Applicant Details</h2>
          <p>Show full application details for applicant ID: {params.applicantId}</p>
          <p>Job ID: {params.id}</p>
          <p>Include status management, resume/portfolio, and communication history</p>
        </div>
      </div>
    </div>
  );
}
