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
  Badge,
  Card,
  Divider,
  Alert,
  Grid
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

type JobApplication = Schema["JobApplication"]["type"];
type JobListing = Schema["JobListing"]["type"];
type ApplicationStatus = "NEW" | "IN_REVIEW" | "HIRED" | "REJECTED";

export default function ApplicantProfile({ 
  params 
}: { 
  params: { id: string; applicantId: string } 
}) {
  const router = useRouter();
  const [applicant, setApplicant] = useState<JobApplication | null>(null);
  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  const fetchApplicantData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: applicantData } = await client.models.JobApplication.get({ 
        id: params.applicantId 
      });

      if (!applicantData) {
        setError("Applicant not found.");
        return;
      }

      if (applicantData.jobID !== params.id) {
        setError("Applicant does not belong to this job.");
        return;
      }

      setApplicant(applicantData);

      const { data: jobData } = await client.models.JobListing.get({ 
        id: params.id 
      });
      
      if (jobData) {
        setJob(jobData);
      }
    } catch (error) {
      console.error("Error fetching applicant data:", error);
      setError("Failed to load applicant details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicantData();
  }, [params.id, params.applicantId]);

  const updateApplicantStatus = async (newStatus: ApplicationStatus) => {
    if (!applicant) return;

    try {
      setStatusUpdateLoading(true);
      
      await client.models.JobApplication.update({
        id: applicant.id,
        status: newStatus
      });

      setApplicant(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      console.error("Error updating applicant status:", error);
      setError("Failed to update applicant status. Please try again.");
    } finally {
      setStatusUpdateLoading(false);
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Applicant Details</h1>
        <p className="text-gray-600">Loading applicant information...</p>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Applicant Details</h1>
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-6 mb-6">
          <p className="text-danger-600">{error || "Applicant not found."}</p>
        </div>
        <button
          className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-150"
          onClick={() => router.back()}
        >
          ← Back to Applicants List
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Applicant Details</h1>
          {job && (
            <p className="text-lg text-gray-600">
              {job.title}
            </p>
          )}
          <p className="text-sm text-gray-500">
            Application submitted {formatDate(applicant.appliedAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/jobs/${params.id}/applicants`}>
            <button className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-150">
              ← Back to Applicants List
            </button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-6">
          <p className="text-danger-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Full Name
                </p>
                <p className="text-base text-gray-800 mb-2">
                  {applicant.applicantName || "N/A"}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Email Address
                </p>
                <p className="text-base text-gray-800 mb-2">
                  {applicant.applicantEmail || "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Phone Number
                </p>
                <p className="text-base text-gray-800 mb-2">
                  {applicant.phoneNumber || "Not provided"}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Location
                </p>
                <p className="text-base text-gray-800 mb-2">
                  {applicant.location || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Materials</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Resume/CV
                </p>
                {applicant.resumeURL ? (
                  <a
                    className="text-primary hover:text-primary-600 text-base font-medium transition-colors duration-150"
                    href={applicant.resumeURL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Resume
                  </a>
                ) : (
                  <p className="text-base text-gray-500">
                    No resume uploaded
                  </p>
                )}
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Portfolio/Website
                </p>
                {applicant.portfolioURL ? (
                  <a
                    className="text-primary hover:text-primary-600 text-base font-medium transition-colors duration-150"
                    href={applicant.portfolioURL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Portfolio
                  </a>
                ) : (
                  <p className="text-base text-gray-500">
                    No portfolio provided
                  </p>
                )}
              </div>
            </div>

            {applicant.coverLetter && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Cover Letter
                </p>
                <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-auto">
                  <p className="text-sm whitespace-pre-wrap text-gray-800">
                    {applicant.coverLetter}
                  </p>
                </div>
              </div>
            )}
          </div>

          {applicant.experience && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Experience & Qualifications</h3>
              <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-auto">
                <p className="text-sm whitespace-pre-wrap text-gray-800">
                  {applicant.experience}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Status</h3>
            
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Current Status
              </p>
              {getStatusBadge(applicant.status as ApplicationStatus)}
            </div>

            <hr className="border-gray-200 mb-4" />

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Update Status
              </p>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                value={applicant.status || "NEW"}
                onChange={(e) => updateApplicantStatus(e.target.value as ApplicationStatus)}
                disabled={statusUpdateLoading}
              >
                <option value="NEW">New</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="HIRED">Hired</option>
                <option value="REJECTED">Rejected</option>
              </select>
              
              {statusUpdateLoading && (
                <p className="text-xs text-gray-500 mt-2">
                  Updating status...
                </p>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Timeline</h3>
            
            <div>
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                <p className="text-sm font-semibold text-gray-800">
                  Application Submitted
                </p>
              </div>
              <p className="text-xs text-gray-500 ml-4 mb-4">
                {formatDate(applicant.appliedAt)}
              </p>

              {applicant.status !== "NEW" && (
                <>
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 rounded-full bg-warning mr-2"></div>
                    <p className="text-sm font-semibold text-gray-800">
                      Status Updated
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 ml-4">
                    {formatDate(applicant.updatedAt)}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
