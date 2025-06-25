import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { runWithAmplifyServerContext } from "./amplifyServerUtils";

export interface DashboardStats {
  companyProfile: Schema["CompanyProfile"]["type"] | null;
  totalJobs: number;
  activeJobs: number;
  totalApplicants: number;
  applicantStatusCounts: {
    NEW: number;
    IN_REVIEW: number;
    HIRED: number;
    REJECTED: number;
  };
}

export async function getEmployerDashboardStats(userId: string): Promise<DashboardStats> {
  return await runWithAmplifyServerContext({
    nextServerContext: null,
    operation: async (contextSpec) => {
      const client = generateClient<Schema>({
        authMode: 'userPool'
      });
      
      const stats: DashboardStats = {
        companyProfile: null,
        totalJobs: 0,
        activeJobs: 0,
        totalApplicants: 0,
        applicantStatusCounts: {
          NEW: 0,
          IN_REVIEW: 0,
          HIRED: 0,
          REJECTED: 0,
        },
      };

      try {
        const companyProfileResponse = await client.models.CompanyProfile.list({
          filter: { owner: { eq: userId } },
        });
        stats.companyProfile = companyProfileResponse.data[0] || null;

        const jobListingsResponse = await client.models.JobListing.list({
          filter: { owner: { eq: userId } },
        });
        const jobListings = jobListingsResponse.data;
        
        stats.totalJobs = jobListings.length;
        stats.activeJobs = jobListings.filter(job => job.status === "ACTIVE").length;

        const jobIds = jobListings.map(job => job.id);
        if (jobIds.length > 0) {
          const allApplications = [];
          for (const jobId of jobIds) {
            const applicationsResponse = await client.models.JobApplication.list({
              filter: { jobID: { eq: jobId } },
            });
            allApplications.push(...applicationsResponse.data);
          }
          
          stats.totalApplicants = allApplications.length;
          
          allApplications.forEach(application => {
            if (application.status) {
              stats.applicantStatusCounts[application.status as keyof typeof stats.applicantStatusCounts]++;
            }
          });
        }

        return stats;
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return stats; // Return default stats on error
      }
    },
  });
}
