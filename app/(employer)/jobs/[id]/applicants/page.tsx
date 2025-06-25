"use client";

import { Heading, View, Text } from "@aws-amplify/ui-react";

export default function JobApplicants({ params }: { params: { id: string } }) {
  return (
    <View padding="1rem">
      <Heading level={1}>Job Applicants</Heading>
      <Text marginBottom="1rem" color="gray.600">
        Review and manage all applicants for this job posting.
      </Text>
      
      <View 
        backgroundColor="gray.50" 
        padding="2rem" 
        borderRadius="0.5rem"
        textAlign="center"
        marginTop="2rem"
      >
        <Text fontSize="1.125rem" fontWeight="semibold" marginBottom="0.5rem">
          Applicant Management
        </Text>
        <Text color="gray.600" marginBottom="1rem">
          This section will display all job applications with filtering and management capabilities.
        </Text>
        <Text fontSize="0.875rem" color="gray.500">
          Features will include: applicant list with status filtering, application review, 
          status updates, communication tools, and bulk operations.
        </Text>
      </View>
    </View>
  );
}
