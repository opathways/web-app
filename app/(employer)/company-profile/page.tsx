"use client";

import { Heading, Button } from '@aws-amplify/ui-react';

export default function CompanyProfile() {
  return (
    <div>
      <Heading level={1}>Company Profile</Heading>
      <div className="mt-6">
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">TODO: Display Company Information</h2>
          <p>Show company details, description, and contact information</p>
        </div>
        <div className="mt-4">
          <Button variation="primary">
            <a href="/company-profile/edit">Edit Profile</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
