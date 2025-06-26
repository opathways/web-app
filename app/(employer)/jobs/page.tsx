"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { useRouter } from "next/navigation";
import { 
  Heading, 
  View, 
  Text, 
  Button, 
  Flex, 
  SearchField, 
  SelectField,
  Badge,
  Divider
} from "@aws-amplify/ui-react";
import Card from "@/components/Card";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

type JobListing = Schema["JobListing"]["type"];
type JobStatus = "DRAFT" | "ACTIVE" | "CLOSED";

interface JobWithApplicationCount extends JobListing {
  applicationCount: number;
}

export default function Jobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobWithApplicationCount[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobWithApplicationCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("newest");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: jobListings } = await client.models.JobListing.list();
      const { data: applications } = await client.models.JobApplication.list();
      
      const jobsWithCounts: JobWithApplicationCount[] = (jobListings || []).map(job => {
        const applicationCount = applications?.filter(app => app.jobID === job.id)?.length || 0;
        return {
          ...job,
          applicationCount
        };
      });
      
      setJobs(jobsWithCounts);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load job listings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    let filtered = [...jobs];
    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower)
      );
    }
    
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(job => job.status === statusFilter);
    }
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.postedAt || 0).getTime() - new Date(a.postedAt || 0).getTime();
        case "oldest":
          return new Date(a.postedAt || 0).getTime() - new Date(b.postedAt || 0).getTime();
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "applications":
          return b.applicationCount - a.applicationCount;
        default:
          return 0;
      }
    });
    
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter, sortBy]);

  const handleStatusToggle = async (jobId: string, currentStatus: JobStatus) => {
    try {
      const newStatus: JobStatus = currentStatus === "ACTIVE" ? "CLOSED" : "ACTIVE";
      
      await client.models.JobListing.update({
        id: jobId,
        status: newStatus
      });
      
      await fetchJobs();
    } catch (err) {
      console.error("Error updating job status:", err);
      setError("Failed to update job status. Please try again.");
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    const statusConfig = {
      ACTIVE: { className: "bg-success-100 text-success-700", text: "Active" },
      CLOSED: { className: "bg-danger-100 text-danger-700", text: "Closed" },
      DRAFT: { className: "bg-warning-100 text-warning-700", text: "Draft" }
    };
    
    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const getJobSummary = (description: string | null | undefined) => {
    if (!description) return "No description";
    return description.length > 150 
      ? description.substring(0, 150) + "..." 
      : description;
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Job Listings</h1>
        <p className="text-gray-600">Loading job listings...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Job Listings</h1>
          <p className="text-gray-600">
            Manage all your job postings in one place. {jobs.length} total jobs.
          </p>
        </div>
        <button 
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={() => router.push("/jobs/new")}
        >
          + Post New Job
        </button>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-4">
          <p className="text-danger-600">{error}</p>
        </div>
      )}

      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[250px]">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search jobs
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="min-w-[150px]">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
          
          <div className="min-w-[150px]">
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="applications">Most Applications</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Job Listings */}
      {filteredJobs.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {jobs.length === 0 ? "No jobs posted yet" : "No jobs match your filters"}
            </h3>
            <p className="text-gray-600 mb-4">
              {jobs.length === 0 
                ? "Get started by posting your first job listing." 
                : "Try adjusting your search or filter criteria."}
            </p>
            {jobs.length === 0 && (
              <button 
                className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={() => router.push("/jobs/new")}
              >
                Post Your First Job
              </button>
            )}
          </div>
        </Card>
      ) : (
        <div>
          {filteredJobs.map((job) => (
            <Card key={job.id} className="mb-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800 m-0">
                      {job.title}
                    </h3>
                    {getStatusBadge(job.status as JobStatus)}
                  </div>
                  
                  <p className="text-gray-600 mb-3 leading-relaxed">
                    {getJobSummary(job.description)}
                  </p>
                  
                  <div className="flex gap-6 items-center mb-4">
                    <span className="text-sm text-gray-500">
                      Posted: {formatDate(job.postedAt)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Applications: {job.applicationCount}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
                    View Details
                  </button>
                  
                  <button
                    className="px-4 py-2 text-primary hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    onClick={() => router.push(`/jobs/${job.id}/edit`)}
                  >
                    Edit Job
                  </button>
                  
                  {job.status !== "DRAFT" && (
                    <button
                      className="px-4 py-2 text-primary hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      onClick={() => handleStatusToggle(job.id, job.status as JobStatus)}
                    >
                      {job.status === "ACTIVE" ? "Close Job" : "Reopen Job"}
                    </button>
                  )}
                  
                  {job.applicationCount > 0 && (
                    <button
                      className="px-4 py-2 text-primary hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      onClick={() => router.push(`/jobs/${job.id}/applicants`)}
                    >
                      View Applicants ({job.applicationCount})
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
