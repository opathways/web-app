import { Heading, View, Text } from "@aws-amplify/ui-react";
import Card from "@/components/Card";
import { runWithAmplifyServerContext } from "@/utils/amplifyServerUtils";
import { fetchDashboardMetrics } from "@/graphql/custom/dashboardStats";
import type { DashboardMetrics } from "@/types/dashboardMetrics";

export default async function DashboardPage() {
  let metrics: DashboardMetrics;
  
  try {
    metrics = await runWithAmplifyServerContext({
      nextServerContext: { cookies: () => Promise.resolve(new Map()) },
      operation: async (contextSpec) => {
        return await fetchDashboardMetrics(contextSpec);
      }
    });
  } catch (error) {
    console.error('Failed to fetch dashboard metrics:', error);
    metrics = {
      totalJobs: 0,
      activeJobs: 0,
      totalApplicants: 0,
      statusBreakdown: { NEW: 0, IN_REVIEW: 0, HIRED: 0, REJECTED: 0 },
      profileComplete: false
    };
  }

  return (
    <View padding="1rem">
      <Heading level={1}>Employer Dashboard</Heading>
      <Text>Overview metrics and quick links for jobs & applicants</Text>
      
      <div className="mt-4">
        <Card>
          <h3 className="font-semibold mb-2">Dashboard Metrics</h3>
          <pre className="text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify(metrics, null, 2)}
          </pre>
        </Card>
      </div>
    </View>
  );
}
