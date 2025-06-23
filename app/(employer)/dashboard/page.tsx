"use client";

import { Heading, Text } from "@aws-amplify/ui-react";
import Card from "@/components/Card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <Heading level={1}>Employer Dashboard</Heading>
        <Text>TODO: Overview metrics and quick links for jobs & applicants</Text>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="font-semibold">Total Applicants</p>
          <p className="text-2xl font-bold">42</p>
        </Card>
      </div>
    </div>
  );
}
