"use client";

import { Heading, View, Text } from "@aws-amplify/ui-react";
import FormSection from "@/components/FormSection";

export default function NewJob() {
  return (
    <View padding="1rem">
      <Heading level={1}>Post a New Job</Heading>
      <Text marginBottom="1rem" color="gray.600">
        Create a new job posting to attract qualified candidates to your organization.
      </Text>
      
      <FormSection 
        title="Job Posting Form" 
        description="Fill out the details below to create your job listing"
      >
        <Text color="gray.600" marginBottom="1rem">
          The job posting form will be implemented in the next development phase.
        </Text>
        <Text fontSize="0.875rem" color="gray.500">
          This will include fields for job title, description, requirements, salary range, 
          location, employment type, and application instructions.
        </Text>
      </FormSection>
    </View>
  );
}
