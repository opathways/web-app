"use client";

import { Heading, View, Text } from "@aws-amplify/ui-react";
import FormSection from "@/components/FormSection";

export default function EditCompanyProfile() {
  return (
    <View padding="1rem">
      <Heading level={1}>Edit Company Profile</Heading>
      <Text>TODO: Render Company Profile Edit Form</Text>
      
      <FormSection title="Demo" description="Section description">
        <Text>Field A</Text>
        <Text>Field B</Text>
      </FormSection>
    </View>
  );
}
