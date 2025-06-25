import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

export type DashboardMetrics = {
  totalJobs: number;
  activeJobs: number;
  totalApplicants: number;
  statusBreakdown: {
    NEW: number;
    IN_REVIEW: number;
    HIRED: number;
    REJECTED: number;
  };
  profileComplete: boolean;
};

export async function fetchDashboardMetrics(contextSpec: any): Promise<DashboardMetrics> {
  const client = generateClient<Schema>({ authMode: 'userPool' });
  
  try {
    const jobListingsResponse = await client.models.JobListing.list(contextSpec, {
      authMode: 'userPool'
    });
    
    const jobListings = jobListingsResponse.data || [];
    const totalJobs = jobListings.length;
    const activeJobs = jobListings.filter(job => job.status === 'ACTIVE').length;
    
    const applicationPromises = jobListings.map(job => 
      client.models.JobApplication.list(contextSpec, {
        filter: { jobID: { eq: job.id } },
        authMode: 'userPool'
      })
    );
    
    const applicationResponses = await Promise.all(applicationPromises);
    const allApplications = applicationResponses.flatMap(response => response.data || []);
    
    const totalApplicants = allApplications.length;
    const statusBreakdown = allApplications.reduce((acc, app) => {
      acc[app.status as keyof typeof acc] = (acc[app.status as keyof typeof acc] || 0) + 1;
      return acc;
    }, { NEW: 0, IN_REVIEW: 0, HIRED: 0, REJECTED: 0 });
    
    const companyProfileResponse = await client.models.CompanyProfile.list(contextSpec, {
      authMode: 'userPool'
    });
    
    const companyProfile = companyProfileResponse.data?.[0];
    const profileComplete = !!(companyProfile?.name && companyProfile?.description && companyProfile?.industry);
    
    return {
      totalJobs,
      activeJobs,
      totalApplicants,
      statusBreakdown,
      profileComplete
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return {
      totalJobs: 0,
      activeJobs: 0,
      totalApplicants: 0,
      statusBreakdown: { NEW: 0, IN_REVIEW: 0, HIRED: 0, REJECTED: 0 },
      profileComplete: false
    };
  }
}
