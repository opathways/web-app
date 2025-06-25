"use client";

import { Heading, View, Text } from "@aws-amplify/ui-react";
import Card from "@/components/Card";

export default function DashboardPage() {
  return (
    <View padding="1rem">
      <Heading level={1}>Employer Dashboard</Heading>
      <Text>TODO: Overview metrics and quick links for jobs & applicants</Text>
      
      <Card>
        <p className="font-semibold">Total Applicants</p>
        <p>42</p>
      </Card>
    </View>
  );
}
