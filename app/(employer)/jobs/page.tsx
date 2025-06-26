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
      ACTIVE: { variation: "success" as const, text: "Active" },
      CLOSED: { variation: "error" as const, text: "Closed" },
      DRAFT: { variation: "warning" as const, text: "Draft" }
    };
    
    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <Badge variation={config.variation} size="small">
        {config.text}
      </Badge>
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
      <View padding="1rem">
        <Heading level={1}>Job Listings</Heading>
        <Text>Loading job listings...</Text>
      </View>
    );
  }

  return (
    <View padding="1rem">
      <Flex direction="row" justifyContent="space-between" alignItems="center" marginBottom="1.5rem">
        <View>
          <Heading level={1}>Job Listings</Heading>
          <Text color="gray.600">
            Manage all your job postings in one place. {jobs.length} total jobs.
          </Text>
        </View>
        <Button 
          variation="primary" 
          size="large"
          onClick={() => router.push("/jobs/new")}
        >
          + Post New Job
        </Button>
      </Flex>

      {error && (
        <View 
          backgroundColor="red.50" 
          padding="1rem" 
          borderRadius="0.5rem" 
          marginBottom="1rem"
          border="1px solid"
          borderColor="red.200"
        >
          <Text color="red.700">{error}</Text>
        </View>
      )}

      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <Flex direction="row" gap="1rem" wrap="wrap" alignItems="end">
          <View flex="1" minWidth="250px">
            <SearchField
              label="Search jobs"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm("")}
            />
          </View>
          
          <View minWidth="150px">
            <SelectField
              label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="DRAFT">Draft</option>
            </SelectField>
          </View>
          
          <View minWidth="150px">
            <SelectField
              label="Sort by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="applications">Most Applications</option>
            </SelectField>
          </View>
        </Flex>
      </Card>

      {/* Job Listings */}
      {filteredJobs.length === 0 ? (
        <Card>
          <View textAlign="center" padding="2rem">
            <Text fontSize="1.125rem" fontWeight="semibold" marginBottom="0.5rem">
              {jobs.length === 0 ? "No jobs posted yet" : "No jobs match your filters"}
            </Text>
            <Text color="gray.600" marginBottom="1rem">
              {jobs.length === 0 
                ? "Get started by posting your first job listing." 
                : "Try adjusting your search or filter criteria."}
            </Text>
            {jobs.length === 0 && (
              <Button 
                variation="primary"
                onClick={() => router.push("/jobs/new")}
              >
                Post Your First Job
              </Button>
            )}
          </View>
        </Card>
      ) : (
        <View>
          {filteredJobs.map((job) => (
            <Card key={job.id} className="mb-4">
              <Flex direction="row" justifyContent="space-between" alignItems="start" gap="1rem">
                <View flex="1">
                  <Flex direction="row" alignItems="center" gap="0.75rem" marginBottom="0.5rem">
                    <Heading level={3} margin="0">
                      {job.title}
                    </Heading>
                    {getStatusBadge(job.status as JobStatus)}
                  </Flex>
                  
                  <Text color="gray.600" marginBottom="0.75rem" lineHeight="1.5">
                    {getJobSummary(job.description)}
                  </Text>
                  
                  <Flex direction="row" gap="1.5rem" alignItems="center" marginBottom="1rem">
                    <Text fontSize="0.875rem" color="gray.500">
                      Posted: {formatDate(job.postedAt)}
                    </Text>
                    <Text fontSize="0.875rem" color="gray.500">
                      Applications: {job.applicationCount}
                    </Text>
                  </Flex>
                </View>
                
                <Flex direction="column" gap="0.5rem" minWidth="200px">
                  <Button
                    size="small"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
                    View Details
                  </Button>
                  
                  <Button
                    variation="link"
                    size="small"
                    onClick={() => router.push(`/jobs/${job.id}/edit`)}
                  >
                    Edit Job
                  </Button>
                  
                  {job.status !== "DRAFT" && (
                    <Button
                      variation="link"
                      size="small"
                      onClick={() => handleStatusToggle(job.id, job.status as JobStatus)}
                    >
                      {job.status === "ACTIVE" ? "Close Job" : "Reopen Job"}
                    </Button>
                  )}
                  
                  {job.applicationCount > 0 && (
                    <Button
                      variation="link"
                      size="small"
                      onClick={() => router.push(`/jobs/${job.id}/applicants`)}
                    >
                      View Applicants ({job.applicationCount})
                    </Button>
                  )}
                </Flex>
              </Flex>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}
