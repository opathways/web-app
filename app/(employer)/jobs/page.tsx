"use client";

import { Heading, Button } from '@aws-amplify/ui-react';

export default function Jobs() {
  return (
    <div>
      <Heading level={1}>My Jobs</Heading>
      <div className="mt-6">
        <div className="mb-4">
          <Button variation="primary">
            <a href="/jobs/new">Post New Job</a>
          </Button>
        </div>
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">TODO: Job Listings Table</h2>
          <p>Display all job postings with status, applicant counts, and quick actions</p>
          <p>Include filtering by status and search functionality</p>
        </div>
      </div>
    </div>
  );
}
