"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Heading, View, Text, Button, Flex } from "@aws-amplify/ui-react";
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
      <View padding="1rem">
        <Heading level={1}>Employer Dashboard</Heading>
        <Text>Loading dashboard metrics...</Text>
      </View>
    );
  }

  return (
    <View padding="1rem">
      <Heading level={1}>Employer Dashboard</Heading>
      
      {/* Profile Completion Indicator */}
      {!metrics?.profileComplete && (
        <Card className="mb-6 border-l-4 border-l-warning bg-warning-50">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-warning-700">
                {metrics?.companyProfileExists ? "Complete your company profile" : "Create your company profile"}
              </h3>
              <p className="text-sm text-warning-600">
                {metrics?.companyProfileExists 
                  ? "Add missing details to unlock all features" 
                  : "Set up your company profile to start posting jobs"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {metrics?.totalJobs || 0}
            </div>
            <div className="font-semibold text-gray-700">
              Total Jobs Posted
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-success mb-2">
              {metrics?.activeJobs || 0}
            </div>
            <div className="font-semibold text-gray-700">
              Active Jobs
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-info mb-2">
              {metrics?.totalApplicants || 0}
            </div>
            <div className="font-semibold text-gray-700">
              Total Applicants
            </div>
            {metrics && metrics.totalApplicants > 0 && (
              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <div>New: {metrics.statusBreakdown.new}</div>
                <div>In Review: {metrics.statusBreakdown.inReview}</div>
                <div>Hired: {metrics.statusBreakdown.hired}</div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${metrics?.profileComplete ? 'text-success' : 'text-warning'}`}>
              {metrics?.profileComplete ? "✓" : "!"}
            </div>
            <div className="font-semibold text-gray-700">
              Company Profile
            </div>
            <div className="text-sm text-gray-600">
              {metrics?.profileComplete ? "Complete" : "Incomplete"}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Action Buttons */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button 
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={handlePostNewJob}
          >
            📝 Post a New Job
          </button>
          
          <button 
            className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            onClick={handleViewApplicants}
          >
            👥 View Applicants
          </button>
          
          <button 
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              metrics?.profileComplete 
                ? "text-primary hover:text-primary-600 focus:ring-primary" 
                : "bg-primary text-white hover:bg-primary-600 focus:ring-primary"
            }`}
            onClick={handleEditProfile}
          >
            {metrics?.companyProfileExists ? "✏️ Edit Profile" : "🏢 Create Profile"}
          </button>
        </div>
      </Card>
    </View>
  );
}
