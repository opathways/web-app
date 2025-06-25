"use client";

import { Heading, View, Text } from "@aws-amplify/ui-react";

export default function JobDetail({ params }: { params: { id: string } }) {
  return (
    <View padding="1rem">
      <Heading level={1}>Job Details</Heading>
      <Text marginBottom="1rem" color="gray.600">
        View comprehensive details about this job posting and its performance metrics.
      </Text>
      
      <View 
        backgroundColor="gray.50" 
        padding="2rem" 
        borderRadius="0.5rem"
        textAlign="center"
        marginTop="2rem"
      >
        <Text fontSize="1.125rem" fontWeight="semibold" marginBottom="0.5rem">
          Job Details & Analytics
        </Text>
        <Text color="gray.600" marginBottom="1rem">
          This section will display detailed job information, application statistics, and management options.
        </Text>
        <Text fontSize="0.875rem" color="gray.500">
          Features will include: job description, requirements, application metrics, 
          links to view applicants, edit job posting, and performance analytics.
        </Text>
      </View>
    </View>
  );
}
