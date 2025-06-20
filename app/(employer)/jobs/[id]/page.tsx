"use client";

import { Heading, View, Text } from "@aws-amplify/ui-react";

export default function JobDetail({ params }: { params: { id: string } }) {
  return (
    <View padding="1rem">
      <Heading level={1}>Job Details</Heading>
      <Text>TODO: Display job details and stats</Text>
      <Text>TODO: Link to Applicants and Edit</Text>
    </View>
  );
}
