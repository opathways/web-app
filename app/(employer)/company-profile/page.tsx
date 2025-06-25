"use client";

import { Heading, View, Text } from "@aws-amplify/ui-react";

export default function CompanyProfile() {
  return (
    <View padding="1rem">
      <Heading level={1}>Company Profile</Heading>
      <Text marginBottom="1rem" color="gray.600">
        View your company profile information and details.
      </Text>
      
      <View 
        backgroundColor="gray.50" 
        padding="2rem" 
        borderRadius="0.5rem"
        textAlign="center"
        marginTop="2rem"
      >
        <Text fontSize="1.125rem" fontWeight="semibold" marginBottom="0.5rem">
          Company Profile Display
        </Text>
        <Text color="gray.600" marginBottom="1rem">
          This section will display your company information in a read-only format.
        </Text>
        <Text fontSize="0.875rem" color="gray.500">
          Features will include: company details, contact information, industry classification, and profile completion status.
        </Text>
      </View>
    </View>
  );
}
