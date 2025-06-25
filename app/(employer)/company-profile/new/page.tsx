"use client";

import { Heading, View, Text } from "@aws-amplify/ui-react";
import FormSection from "@/components/FormSection";

export default function NewCompanyProfile() {
  return (
    <View padding="1rem">
      <Heading level={1}>Create Company Profile</Heading>
      <Text marginBottom="1rem" color="gray.600">
        Set up your company profile to start posting jobs and attracting candidates.
      </Text>
      
      <FormSection 
        title="Company Profile Creation" 
        description="Complete the form below to create your company profile"
      >
        <Text color="gray.600" marginBottom="1rem">
          The company profile creation form will be implemented in the next development phase.
        </Text>
        <Text fontSize="0.875rem" color="gray.500">
          This will include fields for company name, description, industry, location, website, 
          logo upload, and other essential company information.
        </Text>
      </FormSection>
    </View>
  );
}
