import { Heading, View, Text } from "@aws-amplify/ui-react";
import Card from "@/components/Card";
import { getEmployerDashboardStats } from "@/utils/dashboardStats";
import { runWithAmplifyServerContext } from "@/utils/amplifyServerUtils";
import { fetchAuthSession } from "aws-amplify/auth/server";

export default async function DashboardPage() {
  const userId = await runWithAmplifyServerContext({
    nextServerContext: null,
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        return session.tokens?.idToken?.payload?.sub || null;
      } catch (error) {
        console.error("Error getting user session:", error);
        return null;
      }
    },
  });

  if (!userId) {
    return (
      <View padding="1rem">
        <Heading level={1}>Employer Dashboard</Heading>
        <Text>Unable to load dashboard data. Please try logging in again.</Text>
      </View>
    );
  }

  const stats = await getEmployerDashboardStats(userId as string);

  return (
    <View padding="1rem">
      <Heading level={1}>Employer Dashboard</Heading>
      <Text>Dashboard data loaded successfully</Text>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Card>
          <p className="font-semibold">Total Jobs</p>
          <p className="text-2xl">{stats.totalJobs}</p>
        </Card>
        
        <Card>
          <p className="font-semibold">Active Jobs</p>
          <p className="text-2xl">{stats.activeJobs}</p>
        </Card>
        
        <Card>
          <p className="font-semibold">Total Applicants</p>
          <p className="text-2xl">{stats.totalApplicants}</p>
        </Card>
        
        <Card>
          <p className="font-semibold">New Applications</p>
          <p className="text-2xl">{stats.applicantStatusCounts.NEW}</p>
        </Card>
      </div>

      {/* Temporary debug output */}
      <details className="mt-8">
        <summary className="cursor-pointer font-semibold">Debug: Raw Stats Data</summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
          {JSON.stringify(stats, null, 2)}
        </pre>
      </details>
    </View>
  );
}
