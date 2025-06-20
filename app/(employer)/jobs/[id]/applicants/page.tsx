"use client";

import { Heading, View, Text } from "@aws-amplify/ui-react";

export default function JobApplicants({ params }: { params: { id: string } }) {
  return (
    <View padding="1rem">
      <Heading level={1}>Job Applicants</Heading>
      <Text>TODO: Fetch applicants via GraphQL and list applications</Text>
    </View>
  );
}
