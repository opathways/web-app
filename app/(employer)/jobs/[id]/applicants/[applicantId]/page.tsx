"use client";

import { Heading, View, Text } from "@aws-amplify/ui-react";
import FormSection from "@/components/FormSection";

export default function ApplicantProfile({ 
  params 
}: { 
  params: { id: string; applicantId: string } 
}) {
  return (
    <View padding="1rem">
      <Heading level={1}>Applicant Details</Heading>
      <Text marginBottom="1rem" color="gray.600">
        Review detailed information about this applicant and manage their application status.
      </Text>
      
      <FormSection 
        title="Applicant Information" 
        description="Complete applicant profile and application details"
      >
        <Text color="gray.600" marginBottom="1rem">
          The applicant details view will be implemented in the next development phase.
        </Text>
        <Text fontSize="0.875rem" color="gray.500">
          This will include: applicant profile, resume/CV, cover letter, application status management, 
          interview scheduling, notes, and communication history.
        </Text>
      </FormSection>
    </View>
  );
}
