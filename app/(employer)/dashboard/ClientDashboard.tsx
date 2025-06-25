"use client";

import { useRouter } from "next/navigation";
import { Button, Flex, Heading } from "@aws-amplify/ui-react";
import Card from "@/components/Card";
import type { DashboardMetrics } from "./page";

interface ClientDashboardProps {
  metrics: DashboardMetrics;
}

export default function ClientDashboard({ metrics }: ClientDashboardProps) {
  const router = useRouter();

  const handlePostNewJob = () => {
    router.push("/jobs/new");
  };

  const handleViewApplicants = () => {
    router.push("/jobs");
  };

  const handleEditProfile = () => {
    if (metrics.companyProfileExists) {
      router.push("/company-profile/edit");
    } else {
      router.push("/company-profile/new");
    }
  };

  return (
    <Card>
      <Heading level={3} marginBottom="1rem">Quick Actions</Heading>
      <Flex direction="row" gap="1rem" wrap="wrap">
        <Button 
          variation="primary" 
          size="large"
          onClick={handlePostNewJob}
        >
          📝 Post a New Job
        </Button>
        
        <Button 
          variation="default" 
          size="large"
          onClick={handleViewApplicants}
        >
          👥 View Applicants
        </Button>
        
        <Button 
          variation={metrics.profileComplete ? "default" : "primary"} 
          size="large"
          onClick={handleEditProfile}
        >
          {metrics.companyProfileExists ? "✏️ Edit Profile" : "🏢 Create Profile"}
        </Button>
      </Flex>
    </Card>
  );
}
