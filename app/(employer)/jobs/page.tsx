"use client";

import { Heading, View, Text } from "@aws-amplify/ui-react";

export default function Jobs() {
  return (
    <View padding="1rem">
      <Heading level={1}>Job Listings</Heading>
      <Text marginBottom="1rem" color="gray.600">
        Manage all your job postings in one place. View, edit, and track the performance of your listings.
      </Text>
      
      <View 
        backgroundColor="gray.50" 
        padding="2rem" 
        borderRadius="0.5rem"
        textAlign="center"
        marginTop="2rem"
      >
        <Text fontSize="1.125rem" fontWeight="semibold" marginBottom="0.5rem">
          Job Listings Management
        </Text>
        <Text color="gray.600" marginBottom="1rem">
          This section will display all your job postings with filtering, search, and management capabilities.
        </Text>
        <Text fontSize="0.875rem" color="gray.500">
          Features will include: job status management, applicant tracking, posting analytics, and bulk operations.
        </Text>
      </View>
    </View>
  );
}
