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
    <View padding="1rem">
      <Flex direction="row" alignItems="center" marginBottom="1rem">
        <Button 
          variation="link" 
          onClick={() => router.push("/jobs")}
          size="small"
        >
          ← Back to Jobs
        </Button>
      </Flex>

      <Flex direction="row" justifyContent="space-between" alignItems="flex-start" marginBottom="2rem">
        <View flex="1">
          <Flex direction="row" alignItems="center" gap="1rem" marginBottom="0.5rem">
            <Heading level={1}>{job.title}</Heading>
            <Badge variation={getStatusColor(job.status)}>
              {job.status}
            </Badge>
          </Flex>
          
          {job.company && (
            <Text color="gray.600" fontSize="1.125rem" marginBottom="0.5rem">
              {job.company.name}
              {job.company.location && ` • ${job.company.location}`}
            </Text>
          )}
          
          <Text color="gray.500" fontSize="0.875rem">
            Posted: {formatDate(job.postedAt)}
          </Text>
        </View>

        <Flex direction="row" gap="0.5rem">
          <Button
            variation="primary"
            onClick={() => router.push(`/jobs/${job.id}/edit`)}
            isDisabled={actionLoading}
          >
            Edit Job
          </Button>
          
          <Button
            variation={job.status === "ACTIVE" ? "destructive" : "primary"}
            onClick={handleStatusToggle}
            isLoading={actionLoading}
            loadingText="Updating..."
          >
            {job.status === "ACTIVE" ? "Close Job" : "Reopen Job"}
          </Button>
          
          <Button
            variation="destructive"
            onClick={handleDelete}
            isDisabled={actionLoading}
          >
            Delete
          </Button>
        </Flex>
      </Flex>

      {error && (
        <Alert variation="error" hasIcon marginBottom="1rem">
          <Text>{error}</Text>
        </Alert>
      )}

      <Flex direction="row" gap="2rem">
        <View flex="2">
          <Card padding="1.5rem" marginBottom="2rem">
            <Heading level={3} marginBottom="1rem">Job Description</Heading>
            <Text whiteSpace="pre-wrap">{job.description}</Text>
          </Card>
        </View>

        <View flex="1">
          <Card padding="1.5rem" marginBottom="2rem">
            <Heading level={3} marginBottom="1rem">Application Statistics</Heading>
            
            <Flex direction="column" gap="0.75rem">
              <Flex justifyContent="space-between">
                <Text fontWeight="semibold">Total Applications:</Text>
                <Text>{stats.total}</Text>
              </Flex>
              
              <Divider />
              
              <Flex justifyContent="space-between">
                <Text>New:</Text>
                <Badge variation="info">{stats.new}</Badge>
              </Flex>
              
              <Flex justifyContent="space-between">
                <Text>In Review:</Text>
                <Badge variation="warning">{stats.inReview}</Badge>
              </Flex>
              
              <Flex justifyContent="space-between">
                <Text>Hired:</Text>
                <Badge variation="success">{stats.hired}</Badge>
              </Flex>
              
              <Flex justifyContent="space-between">
                <Text>Rejected:</Text>
                <Badge variation="error">{stats.rejected}</Badge>
              </Flex>
            </Flex>

            {stats.total > 0 && (
              <Button
                variation="primary"
                width="100%"
                marginTop="1rem"
                onClick={() => router.push(`/jobs/${job.id}/applicants`)}
              >
                View All Applicants
              </Button>
            )}
          </Card>

          <Card padding="1.5rem">
            <Heading level={3} marginBottom="1rem">Quick Actions</Heading>
            
            <Flex direction="column" gap="0.75rem">
              <Button
                variation="primary"
                width="100%"
                onClick={() => router.push(`/jobs/${job.id}/edit`)}
                isDisabled={actionLoading}
              >
                Edit Job Details
              </Button>
              
              <Button
                variation={job.status === "ACTIVE" ? "destructive" : "primary"}
                width="100%"
                onClick={handleStatusToggle}
                isLoading={actionLoading}
                loadingText="Updating..."
              >
                {job.status === "ACTIVE" ? "Close Job" : "Reopen Job"}
              </Button>
              
              {stats.total > 0 && (
                <Button
                  variation="primary"
                  width="100%"
                  onClick={() => router.push(`/jobs/${job.id}/applicants`)}
                >
                  Manage Applicants ({stats.total})
                </Button>
              )}
            </Flex>
          </Card>
        </View>
      </Flex>
    </View>
  );
}
