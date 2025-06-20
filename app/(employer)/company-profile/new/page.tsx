"use client";

import { Heading } from '@aws-amplify/ui-react';

export default function NewCompanyProfile() {
  return (
    <div>
      <Heading level={1}>Create Company Profile</Heading>
      <div className="mt-6">
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">TODO: Company Profile Creation Form</h2>
          <p>Include fields for company name, description, industry, location, and contact details</p>
        </div>
      </div>
    </div>
  );
}
