"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { 
  Heading, 
  View, 
  Text, 
  Button, 
  Flex,
  Badge,
  Card,
  Divider,
  Alert,
  Loader
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface JobWithDetails {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "CLOSED";
  postedAt: string;
  companyID: string;
  company?: {
    name: string;
    location?: string;
  };
  applications?: Array<{
    id: string;
    status: "NEW" | "IN_REVIEW" | "HIRED" | "REJECTED";
    appliedAt: string;
  }>;
}

export default function JobDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<JobWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [params.id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: jobData } = await client.models.JobListing.get({ id: params.id });
      
      if (!jobData) {
        setError("Job not found");
        return;
      }

      const [companyData, applicationsData] = await Promise.all([
        client.models.CompanyProfile.get({ id: jobData.companyID }),
        client.models.JobApplication.list({
          filter: { jobID: { eq: params.id } }
        })
      ]);

      const jobWithDetails: JobWithDetails = {
        id: jobData.id,
        title: jobData.title,
        description: jobData.description,
        status: jobData.status as "DRAFT" | "ACTIVE" | "CLOSED",
        postedAt: jobData.postedAt || "",
        companyID: jobData.companyID,
        company: companyData.data ? {
          name: companyData.data.name,
          location: companyData.data.location || undefined
        } : undefined,
        applications: applicationsData.data?.map(app => ({
          id: app.id,
          status: app.status as "NEW" | "IN_REVIEW" | "HIRED" | "REJECTED",
          appliedAt: app.appliedAt || ""
        })) || []
      };

      setJob(jobWithDetails);
    } catch (error) {
      console.error("Error fetching job details:", error);
      setError("Failed to load job details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!job) return;

    setActionLoading(true);
    try {
      const newStatus = job.status === "ACTIVE" ? "CLOSED" : "ACTIVE";
      
      await client.models.JobListing.update({
        id: job.id,
        status: newStatus
      });

      setJob(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      console.error("Error updating job status:", error);
      setError("Failed to update job status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    
    const confirmed = window.confirm(
      "Are you sure you want to delete this job posting? This action cannot be undone."
    );
    
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await client.models.JobListing.delete({ id: job.id });
      router.push("/jobs");
    } catch (error) {
      console.error("Error deleting job:", error);
      setError("Failed to delete job. Please try again.");
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { className: "bg-success-100 text-success-700", text: "ACTIVE" },
      DRAFT: { className: "bg-warning-100 text-warning-700", text: "DRAFT" },
      CLOSED: { className: "bg-danger-100 text-danger-700", text: "CLOSED" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  const getApplicationStats = () => {
    if (!job?.applications) return { total: 0, new: 0, inReview: 0, hired: 0, rejected: 0 };
    
    return job.applications.reduce((stats, app) => {
      stats.total++;
      switch (app.status) {
        case "NEW": stats.new++; break;
        case "IN_REVIEW": stats.inReview++; break;
        case "HIRED": stats.hired++; break;
        case "REJECTED": stats.rejected++; break;
      }
      return stats;
    }, { total: 0, new: 0, inReview: 0, hired: 0, rejected: 0 });
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-4">
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
          <div className="flex items-center">
            <span className="text-danger text-2xl mr-3">❌</span>
            <p className="text-danger-600">{error || "Job not found"}</p>
          </div>
        </div>
        <button 
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 mt-4"
          onClick={() => router.push("/jobs")}
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  const stats = getApplicationStats();

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <button 
          className="text-primary hover:text-primary-600 font-medium"
          onClick={() => router.push("/jobs")}
        >
          ← Back to Jobs
        </button>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
            {getStatusBadge(job.status)}
          </div>
          
          {job.company && (
            <p className="text-gray-600 text-lg mb-2">
              {job.company.name}
              {job.company.location && ` • ${job.company.location}`}
            </p>
          )}
          
          <p className="text-gray-500 text-sm">
            Posted: {formatDate(job.postedAt)}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => router.push(`/jobs/${job.id}/edit`)}
            disabled={actionLoading}
          >
            Edit Job
          </button>
          
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              job.status === "ACTIVE" 
                ? "bg-danger text-white hover:bg-danger-600 focus:ring-danger" 
                : "bg-primary text-white hover:bg-primary-600 focus:ring-primary"
            }`}
            onClick={handleStatusToggle}
            disabled={actionLoading}
          >
            {actionLoading ? "Updating..." : (job.status === "ACTIVE" ? "Close Job" : "Reopen Job")}
          </button>
          
          <button
            className="bg-danger text-white px-4 py-2 rounded-lg font-medium hover:bg-danger-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDelete}
            disabled={actionLoading}
          >
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <span className="text-danger text-xl mr-3">❌</span>
            <p className="text-danger-600">{error}</p>
          </div>
        </div>
      )}

      <div className="flex gap-8">
        <div className="flex-[2]">
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Job Description</h3>
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{job.description}</p>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Application Statistics</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total Applications:</span>
                <span className="text-gray-800">{stats.total}</span>
              </div>
              
              <hr className="border-gray-200" />
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-info-100 text-info-700">
                  {stats.new}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">In Review:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-700">
                  {stats.inReview}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hired:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-700">
                  {stats.hired}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rejected:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-700">
                  {stats.rejected}
                </span>
              </div>
            </div>

            {stats.total > 0 && (
              <button
                className="w-full bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 mt-4"
                onClick={() => router.push(`/jobs/${job.id}/applicants`)}
              >
                View All Applicants
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button
                className="w-full bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => router.push(`/jobs/${job.id}/edit`)}
                disabled={actionLoading}
              >
                Edit Job Details
              </button>
              
              <button
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  job.status === "ACTIVE" 
                    ? "bg-danger text-white hover:bg-danger-600 focus:ring-danger" 
                    : "bg-primary text-white hover:bg-primary-600 focus:ring-primary"
                }`}
                onClick={handleStatusToggle}
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : (job.status === "ACTIVE" ? "Close Job" : "Reopen Job")}
              </button>
              
              {stats.total > 0 && (
                <button
                  className="w-full bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={() => router.push(`/jobs/${job.id}/applicants`)}
                >
                  Manage Applicants ({stats.total})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
