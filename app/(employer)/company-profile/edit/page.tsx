"use client";

import { Heading, View, Text } from "@aws-amplify/ui-react";
import FormSection from "@/components/FormSection";

export default function EditCompanyProfile() {
  return (
    <View padding="1rem">
      <Heading level={1}>Edit Company Profile</Heading>
      <Text marginBottom="1rem" color="gray.600">
        Update your company information to keep your profile current and attract the best candidates.
      </Text>
      
      <FormSection title="Company Profile Form" description="Complete the form below to update your company profile">
        <Text color="gray.600">Company profile editing functionality will be implemented in the next development phase.</Text>
        <Text fontSize="0.875rem" color="gray.500" marginTop="0.5rem">
          This will include fields for company name, description, industry, location, website, and other relevant details.
        </Text>
      </FormSection>
    </View>
  );
}
