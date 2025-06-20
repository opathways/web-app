"use client";

import { Heading, Button } from '@aws-amplify/ui-react';

export default function JobDetail({ params }: { params: { id: string } }) {
  return (
    <div>
      <Heading level={1}>Job Details</Heading>
      <div className="mt-6">
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">TODO: Job Information Display</h2>
          <p>Show job details, status, and application statistics for job ID: {params.id}</p>
        </div>
        <div className="mt-4 space-x-2">
          <Button variation="primary">
            <a href={`/jobs/${params.id}/edit`}>Edit Job</a>
          </Button>
          <Button>
            <a href={`/jobs/${params.id}/applicants`}>View Applicants</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
