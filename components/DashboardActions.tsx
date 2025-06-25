"use client";

import React from "react";
import { Button, Flex } from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";

interface DashboardActionsProps {
  companyProfileExists: boolean;
  profileComplete: boolean;
}

export default function DashboardActions({ companyProfileExists, profileComplete }: DashboardActionsProps) {
  const router = useRouter();

  const handlePostNewJob = () => {
    router.push("/jobs/new");
  };

  const handleViewApplicants = () => {
    router.push("/jobs");
  };

  const handleEditProfile = () => {
    if (companyProfileExists) {
      router.push("/company-profile/edit");
    } else {
      router.push("/company-profile/new");
    }
  };

  return (
    <Flex direction="row" gap="1rem" wrap="wrap">
      <Button 
        variation="primary" 
        size="large"
        onClick={handlePostNewJob}
      >
        📝 Post a New Job
      </Button>
      
      <Button 
        size="large"
        onClick={handleViewApplicants}
      >
        👥 View Applicants
      </Button>
      
      <Button 
        variation={profileComplete ? "link" : "primary"} 
        size="large"
        onClick={handleEditProfile}
      >
        {companyProfileExists ? "✏️ Edit Profile" : "🏢 Create Profile"}
      </Button>
    </Flex>
  );
}
