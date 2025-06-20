"use client";

import { Heading, View, Text } from "@aws-amplify/ui-react";

export default function ApplicantProfile({ 
  params 
}: { 
  params: { id: string; applicantId: string } 
}) {
  return (
    <View padding="1rem">
      <Heading level={1}>Applicant Details</Heading>
      <Text>TODO: Show full application details and actions (change status, add notes)</Text>
    </View>
  );
}
