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

  const getStatusBadge = (status: ApplicationStatus) => {
    const statusConfig = {
      NEW: { className: "bg-info-100 text-info-700", text: "NEW" },
      IN_REVIEW: { className: "bg-warning-100 text-warning-700", text: "IN REVIEW" },
      HIRED: { className: "bg-success-100 text-success-700", text: "HIRED" },
      REJECTED: { className: "bg-danger-100 text-danger-700", text: "REJECTED" }
    };
    
    const config = statusConfig[status] || statusConfig.NEW;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Job Applicants</h1>
        <p className="text-gray-600">Loading applicants...</p>
      </div>
    );
  }

  return (
    <View padding="1rem">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Job Applicants</h1>
          {jobTitle && (
            <p className="text-lg text-gray-600">
              {jobTitle}
            </p>
          )}
          <p className="text-sm text-gray-500">
            {filteredApplicants.length} applicant{filteredApplicants.length !== 1 ? 's' : ''}
            {statusFilter !== "ALL" && ` (${statusFilter.toLowerCase().replace('_', ' ')})`}
          </p>
        </div>
        <button
          className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-150"
          onClick={() => router.back()}
        >
          ← Back to Job Details
        </button>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-6">
          <p className="text-danger-600">{error}</p>
        </div>
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
        <div className="bg-info-50 border border-info-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="font-semibold text-gray-800">
              {selectedApplicants.size} applicant{selectedApplicants.size !== 1 ? 's' : ''} selected
            </p>
            <button
              className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
              onClick={() => handleBulkStatusUpdate("IN_REVIEW")}
              disabled={bulkUpdateLoading}
            >
              {bulkUpdateLoading ? "Updating..." : "Mark as In Review"}
            </button>
            <button
              className="bg-primary text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              onClick={() => handleBulkStatusUpdate("HIRED")}
              disabled={bulkUpdateLoading}
            >
              {bulkUpdateLoading ? "Updating..." : "Mark as Hired"}
            </button>
            <button
              className="bg-danger text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-danger-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 disabled:opacity-50"
              onClick={() => handleBulkStatusUpdate("REJECTED")}
              disabled={bulkUpdateLoading}
            >
              {bulkUpdateLoading ? "Updating..." : "Mark as Rejected"}
            </button>
          </div>
        </div>
      )}

      {filteredApplicants.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No Applicants Found
          </h3>
          <p className="text-gray-600">
            {statusFilter === "ALL" 
              ? "No one has applied to this job yet." 
              : `No applicants with status "${statusFilter.toLowerCase().replace('_', ' ')}" found.`}
          </p>
        </div>
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
                    <span className="font-semibold text-primary hover:text-primary-600 transition-colors duration-150">
                      {applicant.applicantName || "N/A"}
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-800">
                    {applicant.applicantEmail || "N/A"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-800">
                    {formatDate(applicant.appliedAt)}
                  </span>
                </TableCell>
                <TableCell>
                  {getStatusBadge(applicant.status as ApplicationStatus)}
                </TableCell>
                <TableCell>
                  {applicant.resumeURL ? (
                    <a
                      className="text-primary hover:text-primary-600 text-sm font-medium transition-colors duration-150"
                      href={applicant.resumeURL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">No resume</span>
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
