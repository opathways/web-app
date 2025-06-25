"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface DashboardMetrics {
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

export default function DashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      
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
      
      setMetrics({
        totalJobs,
        activeJobs,
        totalApplicants,
        statusBreakdown,
        profileComplete,
        companyProfileExists
      });
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const handlePostNewJob = () => {
    router.push("/jobs/new");
  };

  const handleViewApplicants = () => {
    router.push("/jobs");
  };

  const handleEditProfile = () => {
    if (metrics?.companyProfileExists) {
      router.push("/company-profile/edit");
    } else {
      router.push("/company-profile/new");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employer Dashboard</h1>
            <p className="text-gray-600">Loading dashboard metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Employer Dashboard</h1>
          <p className="text-gray-600">Manage your job postings and track applications</p>
        </div>
        
        {/* Profile Completion Indicator */}
        {!metrics?.profileComplete && (
          <Card className="mb-8 border-l-4 border-l-warning bg-warning-50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center">
                  <span className="text-warning-600 text-lg">⚠️</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-warning-800 mb-1">
                  {metrics?.companyProfileExists ? "Complete your company profile" : "Create your company profile"}
                </h3>
                <p className="text-sm text-warning-700">
                  {metrics?.companyProfileExists 
                    ? "Add missing details to unlock all features and attract more candidates" 
                    : "Set up your company profile to start posting jobs and building your employer brand"}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {metrics?.totalJobs || 0}
            </div>
            <div className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              Total Jobs Posted
            </div>
          </Card>

          <Card className="text-center">
            <div className="text-4xl font-bold text-success mb-2">
              {metrics?.activeJobs || 0}
            </div>
            <div className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              Active Jobs
            </div>
          </Card>

          <Card className="text-center">
            <div className="text-4xl font-bold text-info mb-2">
              {metrics?.totalApplicants || 0}
            </div>
            <div className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-3">
              Total Applicants
            </div>
            {metrics && metrics.totalApplicants > 0 && (
              <div className="space-y-1 text-xs text-gray-600 border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                  <span>New:</span>
                  <span className="font-medium">{metrics.statusBreakdown.new}</span>
                </div>
                <div className="flex justify-between">
                  <span>In Review:</span>
                  <span className="font-medium">{metrics.statusBreakdown.inReview}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hired:</span>
                  <span className="font-medium text-success">{metrics.statusBreakdown.hired}</span>
                </div>
              </div>
            )}
          </Card>

          <Card className="text-center">
            <div className={`text-4xl font-bold mb-2 ${metrics?.profileComplete ? 'text-success' : 'text-warning'}`}>
              {metrics?.profileComplete ? "✓" : "!"}
            </div>
            <div className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-1">
              Company Profile
            </div>
            <div className={`text-xs font-medium ${metrics?.profileComplete ? 'text-success' : 'text-warning'}`}>
              {metrics?.profileComplete ? "Complete" : "Incomplete"}
            </div>
          </Card>
        </div>

        {/* Quick Action Buttons */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={handlePostNewJob}
              className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition-colors duration-200 shadow-sm"
            >
              <span className="mr-2">📝</span>
              Post a New Job
            </button>
            
            <button 
              onClick={handleViewApplicants}
              className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            >
              <span className="mr-2">👥</span>
              View Applicants
            </button>
            
            <button 
              onClick={handleEditProfile}
              className={`inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors duration-200 shadow-sm ${
                metrics?.profileComplete 
                  ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50' 
                  : 'bg-primary text-white hover:bg-primary-600'
              }`}
            >
              <span className="mr-2">{metrics?.companyProfileExists ? "✏️" : "🏢"}</span>
              {metrics?.companyProfileExists ? "Edit Profile" : "Create Profile"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
