"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { 
  Heading, 
  View, 
  Text, 
  Button, 
  Flex, 
  SelectField, 
  CheckboxField,
  Badge,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

type JobApplication = Schema["JobApplication"]["type"];
type ApplicationStatus = "NEW" | "IN_REVIEW" | "HIRED" | "REJECTED";

interface ApplicantWithSelection extends JobApplication {
  selected?: boolean;
}

export default function JobApplicants({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [applicants, setApplicants] = useState<ApplicantWithSelection[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<ApplicantWithSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set());
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);
  const [jobTitle, setJobTitle] = useState<string>("");

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: jobData } = await client.models.JobListing.get({ id: params.id });
      if (jobData) {
        setJobTitle(jobData.title || "");
      }

      const { data: applications } = await client.models.JobApplication.list({
        filter: { jobID: { eq: params.id } }
      });

      const applicantsWithSelection = (applications || []).map(app => ({
        ...app,
        selected: false
      }));

      setApplicants(applicantsWithSelection);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      setError("Failed to load applicants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...applicants];

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.appliedAt || 0).getTime();
      const dateB = new Date(b.appliedAt || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredApplicants(filtered);
  };

  useEffect(() => {
    fetchApplicants();
  }, [params.id]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applicants, statusFilter, sortOrder]);

  const updateApplicantStatus = async (applicantId: string, newStatus: ApplicationStatus) => {
    try {
      await client.models.JobApplication.update({
        id: applicantId,
        status: newStatus
      });

      setApplicants(prev => prev.map(app => 
        app.id === applicantId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error("Error updating applicant status:", error);
      setError("Failed to update applicant status. Please try again.");
    }
  };

  const handleBulkStatusUpdate = async (newStatus: ApplicationStatus) => {
    if (selectedApplicants.size === 0) return;

    try {
      setBulkUpdateLoading(true);
      
      const updatePromises = Array.from(selectedApplicants).map(applicantId =>
        client.models.JobApplication.update({
          id: applicantId,
          status: newStatus
        })
      );

      await Promise.all(updatePromises);

      setApplicants(prev => prev.map(app => 
        selectedApplicants.has(app.id) ? { ...app, status: newStatus } : app
      ));

      setSelectedApplicants(new Set());
    } catch (error) {
      console.error("Error updating applicant statuses:", error);
      setError("Failed to update applicant statuses. Please try again.");
    } finally {
      setBulkUpdateLoading(false);
    }
  };

  const toggleApplicantSelection = (applicantId: string) => {
    setSelectedApplicants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(applicantId)) {
        newSet.delete(applicantId);
      } else {
        newSet.add(applicantId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedApplicants.size === filteredApplicants.length) {
      setSelectedApplicants(new Set());
    } else {
      setSelectedApplicants(new Set(filteredApplicants.map(app => app.id)));
    }
  };

  const getStatusBadgeVariation = (status: ApplicationStatus) => {
    switch (status) {
      case "NEW": return "info";
      case "IN_REVIEW": return "warning";
      case "HIRED": return "success";
      case "REJECTED": return "error";
      default: return "info";
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <View padding="1rem">
        <Heading level={1}>Job Applicants</Heading>
        <Text>Loading applicants...</Text>
      </View>
    );
  }

  return (
    <View padding="1rem">
      <Flex direction="row" alignItems="center" justifyContent="space-between" marginBottom="1rem">
        <View>
          <Heading level={1}>Job Applicants</Heading>
          {jobTitle && (
            <Text color="gray.600" fontSize="1.125rem">
              {jobTitle}
            </Text>
          )}
          <Text color="gray.500" fontSize="0.875rem">
            {filteredApplicants.length} applicant{filteredApplicants.length !== 1 ? 's' : ''}
            {statusFilter !== "ALL" && ` (${statusFilter.toLowerCase().replace('_', ' ')})`}
          </Text>
        </View>
        <Button
          variation="link"
          onClick={() => router.back()}
        >
          ← Back to Job Details
        </Button>
      </Flex>

      {error && (
        <Alert variation="error" marginBottom="1rem">
          {error}
        </Alert>
      )}

      <Flex direction="row" gap="1rem" marginBottom="1rem" wrap="wrap">
        <SelectField
          label="Filter by Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">New</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="HIRED">Hired</option>
          <option value="REJECTED">Rejected</option>
        </SelectField>

        <SelectField
          label="Sort by Date"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </SelectField>
      </Flex>

      {selectedApplicants.size > 0 && (
        <View 
          backgroundColor="blue.50" 
          padding="1rem" 
          borderRadius="0.5rem" 
          marginBottom="1rem"
        >
          <Flex direction="row" alignItems="center" gap="1rem" wrap="wrap">
            <Text fontWeight="semibold">
              {selectedApplicants.size} applicant{selectedApplicants.size !== 1 ? 's' : ''} selected
            </Text>
            <Button
              size="small"
              onClick={() => handleBulkStatusUpdate("IN_REVIEW")}
              isLoading={bulkUpdateLoading}
            >
              Mark as In Review
            </Button>
            <Button
              size="small"
              variation="primary"
              onClick={() => handleBulkStatusUpdate("HIRED")}
              isLoading={bulkUpdateLoading}
            >
              Mark as Hired
            </Button>
            <Button
              size="small"
              variation="destructive"
              onClick={() => handleBulkStatusUpdate("REJECTED")}
              isLoading={bulkUpdateLoading}
            >
              Mark as Rejected
            </Button>
          </Flex>
        </View>
      )}

      {filteredApplicants.length === 0 ? (
        <View 
          backgroundColor="gray.50" 
          padding="2rem" 
          borderRadius="0.5rem"
          textAlign="center"
        >
          <Text fontSize="1.125rem" fontWeight="semibold" marginBottom="0.5rem">
            No Applicants Found
          </Text>
          <Text color="gray.600">
            {statusFilter === "ALL" 
              ? "No one has applied to this job yet." 
              : `No applicants with status "${statusFilter.toLowerCase().replace('_', ' ')}" found.`}
          </Text>
        </View>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <CheckboxField
                  label=""
                  checked={selectedApplicants.size === filteredApplicants.length && filteredApplicants.length > 0}
                  onChange={toggleSelectAll}
                  name="selectAll"
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Resume</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApplicants.map((applicant) => (
              <TableRow key={applicant.id}>
                <TableCell>
                  <CheckboxField
                    label=""
                    checked={selectedApplicants.has(applicant.id)}
                    onChange={() => toggleApplicantSelection(applicant.id)}
                    name={`select-${applicant.id}`}
                  />
                </TableCell>
                <TableCell>
                  <Link 
                    href={`/jobs/${params.id}/applicants/${applicant.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Text fontWeight="semibold" color="blue.600">
                      {applicant.applicantName || "N/A"}
                    </Text>
                  </Link>
                </TableCell>
                <TableCell>
                  <Text fontSize="0.875rem">
                    {applicant.applicantEmail || "N/A"}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text fontSize="0.875rem">
                    {formatDate(applicant.appliedAt)}
                  </Text>
                </TableCell>
                <TableCell>
                  <Badge variation={getStatusBadgeVariation(applicant.status as ApplicationStatus)}>
                    {applicant.status?.replace('_', ' ') || "NEW"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {applicant.resumeURL ? (
                    <Button
                      size="small"
                      variation="link"
                      as="a"
                      href={applicant.resumeURL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </Button>
                  ) : (
                    <Text fontSize="0.875rem" color="gray.500">No resume</Text>
                  )}
                </TableCell>
                <TableCell>
                  <SelectField
                    label=""
                    value={applicant.status || "NEW"}
                    onChange={(e) => updateApplicantStatus(applicant.id, e.target.value as ApplicationStatus)}
                    size="small"
                  >
                    <option value="NEW">New</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="HIRED">Hired</option>
                    <option value="REJECTED">Rejected</option>
                  </SelectField>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </View>
  );
}
