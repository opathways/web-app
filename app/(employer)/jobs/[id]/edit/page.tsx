"use client";

import { Heading, View, Text } from "@aws-amplify/ui-react";

export default function EditJob({ params }: { params: { id: string } }) {
  return (
    <View padding="1rem">
      <Heading level={1}>Edit Job Posting</Heading>
      <Text>TODO: Render Job Edit Form (prefill with current job data)</Text>
    </View>
  );
}
