import { generateClient } from "aws-amplify/data";
import { Heading, View, Text, Button, Flex } from "@aws-amplify/ui-react";
import Card from "@/components/Card";
import type { Schema } from "@/amplify/data/resource";
import { runWithAmplifyServerContext } from "@/utils/amplifyServerUtils";
import ClientDashboard from "./ClientDashboard";

export interface DashboardMetrics {
  totalJobs: number;
  activeJobs: number;
  totalApplicants: number;
  statusBreakdown: {
    new: number;
    inReview: number;
    hired: number;
    rejected: number;
  };
  profileComplete: boolean;
  companyProfileExists: boolean;
}

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  return await runWithAmplifyServerContext({
    operation: async () => {
      const client = generateClient<Schema>({
        authMode: "userPool"
      });
      
      try {
        const { data: companyProfiles } = await client.models.CompanyProfile.list();
        const companyProfile = companyProfiles?.[0];
        
        const { data: jobListings } = await client.models.JobListing.list();
        
        const { data: jobApplications } = await client.models.JobApplication.list();
        
        const totalJobs = jobListings?.length || 0;
        const activeJobs = jobListings?.filter(job => job.status === "ACTIVE")?.length || 0;
        const totalApplicants = jobApplications?.length || 0;
        
        const statusBreakdown = {
          new: jobApplications?.filter(app => app.status === "NEW")?.length || 0,
          inReview: jobApplications?.filter(app => app.status === "IN_REVIEW")?.length || 0,
          hired: jobApplications?.filter(app => app.status === "HIRED")?.length || 0,
          rejected: jobApplications?.filter(app => app.status === "REJECTED")?.length || 0,
        };
        
        const companyProfileExists = !!companyProfile;
        const profileComplete = companyProfileExists && 
          !!companyProfile.name && 
          !!companyProfile.description && 
          !!companyProfile.industry && 
          !!companyProfile.location;
        
        return {
          totalJobs,
          activeJobs,
          totalApplicants,
          statusBreakdown,
          profileComplete,
          companyProfileExists
        };
      } catch (error) {
        console.error("Error fetching dashboard metrics:", error);
        return {
          totalJobs: 0,
          activeJobs: 0,
          totalApplicants: 0,
          statusBreakdown: {
            new: 0,
            inReview: 0,
            hired: 0,
            rejected: 0,
          },
          profileComplete: false,
          companyProfileExists: false
        };
      }
    }
  });
}

export default async function DashboardPage() {
  const metrics = await fetchDashboardMetrics();

  return (
    <View padding="1rem">
      <Heading level={1}>Employer Dashboard</Heading>
      
      {/* Profile Completion Indicator */}
      {!metrics.profileComplete && (
        <Card className="mb-6 border-l-4 border-l-yellow-500 bg-yellow-50">
          <Flex direction="row" alignItems="center" gap="0.5rem">
            <Text fontSize="1.25rem">⚠️</Text>
            <View>
              <Text fontWeight="semibold" color="orange.700">
                {metrics.companyProfileExists ? "Complete your company profile" : "Create your company profile"}
              </Text>
              <Text fontSize="0.875rem" color="orange.600">
                {metrics.companyProfileExists 
                  ? "Add missing details to unlock all features" 
                  : "Set up your company profile to start posting jobs"}
              </Text>
            </View>
          </Flex>
        </Card>
      )}

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <Text fontSize="2rem" fontWeight="bold" color="primary">
              {metrics.totalJobs}
            </Text>
            <Text fontWeight="semibold" color="gray.700">
              Total Jobs Posted
            </Text>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <Text fontSize="2rem" fontWeight="bold" color="green.600">
              {metrics.activeJobs}
            </Text>
            <Text fontWeight="semibold" color="gray.700">
              Active Jobs
            </Text>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <Text fontSize="2rem" fontWeight="bold" color="blue.600">
              {metrics.totalApplicants}
            </Text>
            <Text fontWeight="semibold" color="gray.700">
              Total Applicants
            </Text>
            {metrics.totalApplicants > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <div>New: {metrics.statusBreakdown.new}</div>
                <div>In Review: {metrics.statusBreakdown.inReview}</div>
                <div>Hired: {metrics.statusBreakdown.hired}</div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <Text fontSize="1.5rem" fontWeight="bold" color={metrics.profileComplete ? "green.600" : "orange.600"}>
              {metrics.profileComplete ? "✓" : "!"}
            </Text>
            <Text fontWeight="semibold" color="gray.700">
              Company Profile
            </Text>
            <Text fontSize="0.875rem" color="gray.600">
              {metrics.profileComplete ? "Complete" : "Incomplete"}
            </Text>
          </div>
        </Card>
      </div>

      {/* Client-side Interactive Components */}
      <ClientDashboard metrics={metrics} />
    </View>
  );
}
