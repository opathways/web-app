export interface DashboardMetrics {
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
}

export type ApplicationStatus = 'NEW' | 'IN_REVIEW' | 'HIRED' | 'REJECTED';
export type JobStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';
