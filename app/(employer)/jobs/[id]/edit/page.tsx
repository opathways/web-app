"use client";

import { Heading, View, Text } from "@aws-amplify/ui-react";
import FormSection from "@/components/FormSection";

export default function EditJob({ params }: { params: { id: string } }) {
  return (
    <View padding="1rem">
      <Heading level={1}>Edit Job Posting</Heading>
      <Text marginBottom="1rem" color="gray.600">
        Update your job posting details to keep the listing current and accurate.
      </Text>
      
      <FormSection 
        title="Job Editing Form" 
        description="Modify the job details below to update your posting"
      >
        <Text color="gray.600" marginBottom="1rem">
          The job editing form will be implemented in the next development phase.
        </Text>
        <Text fontSize="0.875rem" color="gray.500">
          This will include pre-filled fields for job title, description, requirements, 
          salary range, location, employment type, and application instructions.
        </Text>
      </FormSection>
    </View>
  );
}
