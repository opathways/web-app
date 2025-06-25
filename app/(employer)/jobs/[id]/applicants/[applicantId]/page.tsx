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
      <View padding="1rem">
        <Heading level={1}>Applicant Details</Heading>
        <Text>Loading applicant information...</Text>
      </View>
    );
  }

  if (error || !applicant) {
    return (
      <View padding="1rem">
        <Heading level={1}>Applicant Details</Heading>
        <Alert variation="error" marginBottom="1rem">
          {error || "Applicant not found."}
        </Alert>
        <Button
          variation="link"
          onClick={() => router.back()}
        >
          ← Back to Applicants List
        </Button>
      </View>
    );
  }

  return (
    <View padding="1rem">
      <Flex direction="row" alignItems="center" justifyContent="space-between" marginBottom="1rem">
        <View>
          <Heading level={1}>Applicant Details</Heading>
          {job && (
            <Text color="gray.600" fontSize="1.125rem">
              {job.title}
            </Text>
          )}
          <Text color="gray.500" fontSize="0.875rem">
            Application submitted {formatDate(applicant.appliedAt)}
          </Text>
        </View>
        <Flex direction="row" gap="0.5rem">
          <Link href={`/jobs/${params.id}/applicants`}>
            <Button variation="link">
              ← Back to Applicants List
            </Button>
          </Link>
        </Flex>
      </Flex>

      {error && (
        <Alert variation="error" marginBottom="1rem">
          {error}
        </Alert>
      )}

      <Grid templateColumns="1fr 300px" gap="1.5rem">
        <View>
          <Card padding="1.5rem" marginBottom="1.5rem">
            <Heading level={3} marginBottom="1rem">Personal Information</Heading>
            
            <Grid templateColumns="1fr 1fr" gap="1rem" marginBottom="1rem">
              <View>
                <Text fontSize="0.875rem" fontWeight="semibold" color="gray.700">
                  Full Name
                </Text>
                <Text fontSize="1rem" marginBottom="0.5rem">
                  {applicant.applicantName || "N/A"}
                </Text>
              </View>
              
              <View>
                <Text fontSize="0.875rem" fontWeight="semibold" color="gray.700">
                  Email Address
                </Text>
                <Text fontSize="1rem" marginBottom="0.5rem">
                  {applicant.applicantEmail || "N/A"}
                </Text>
              </View>
            </Grid>

            <Grid templateColumns="1fr 1fr" gap="1rem">
              <View>
                <Text fontSize="0.875rem" fontWeight="semibold" color="gray.700">
                  Phone Number
                </Text>
                <Text fontSize="1rem" marginBottom="0.5rem">
                  {applicant.phoneNumber || "Not provided"}
                </Text>
              </View>
              
              <View>
                <Text fontSize="0.875rem" fontWeight="semibold" color="gray.700">
                  Location
                </Text>
                <Text fontSize="1rem" marginBottom="0.5rem">
                  {applicant.location || "Not provided"}
                </Text>
              </View>
            </Grid>
          </Card>

          <Card padding="1.5rem" marginBottom="1.5rem">
            <Heading level={3} marginBottom="1rem">Application Materials</Heading>
            
            <Grid templateColumns="1fr 1fr" gap="1rem" marginBottom="1rem">
              <View>
                <Text fontSize="0.875rem" fontWeight="semibold" color="gray.700">
                  Resume/CV
                </Text>
                {applicant.resumeURL ? (
                  <Button
                    variation="link"
                    as="a"
                    href={applicant.resumeURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    fontSize="1rem"
                    padding="0"
                  >
                    Download Resume
                  </Button>
                ) : (
                  <Text fontSize="1rem" color="gray.500">
                    No resume uploaded
                  </Text>
                )}
              </View>
              
              <View>
                <Text fontSize="0.875rem" fontWeight="semibold" color="gray.700">
                  Portfolio/Website
                </Text>
                {applicant.portfolioURL ? (
                  <Button
                    variation="link"
                    as="a"
                    href={applicant.portfolioURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    fontSize="1rem"
                    padding="0"
                  >
                    View Portfolio
                  </Button>
                ) : (
                  <Text fontSize="1rem" color="gray.500">
                    No portfolio provided
                  </Text>
                )}
              </View>
            </Grid>

            {applicant.coverLetter && (
              <View>
                <Text fontSize="0.875rem" fontWeight="semibold" color="gray.700" marginBottom="0.5rem">
                  Cover Letter
                </Text>
                <View 
                  backgroundColor="gray.50" 
                  padding="1rem" 
                  borderRadius="0.5rem"
                  maxHeight="200px"
                  overflow="auto"
                >
                  <Text fontSize="0.875rem" whiteSpace="pre-wrap">
                    {applicant.coverLetter}
                  </Text>
                </View>
              </View>
            )}
          </Card>

          {applicant.experience && (
            <Card padding="1.5rem" marginBottom="1.5rem">
              <Heading level={3} marginBottom="1rem">Experience & Qualifications</Heading>
              <View 
                backgroundColor="gray.50" 
                padding="1rem" 
                borderRadius="0.5rem"
                maxHeight="200px"
                overflow="auto"
              >
                <Text fontSize="0.875rem" whiteSpace="pre-wrap">
                  {applicant.experience}
                </Text>
              </View>
            </Card>
          )}
        </View>

        <View>
          <Card padding="1.5rem" marginBottom="1.5rem">
            <Heading level={3} marginBottom="1rem">Application Status</Heading>
            
            <View marginBottom="1rem">
              <Text fontSize="0.875rem" fontWeight="semibold" color="gray.700" marginBottom="0.5rem">
                Current Status
              </Text>
              <Badge 
                variation={getStatusBadgeVariation(applicant.status as ApplicationStatus)}
                fontSize="1rem"
                padding="0.5rem 1rem"
              >
                {applicant.status?.replace('_', ' ') || "NEW"}
              </Badge>
            </View>

            <Divider marginBottom="1rem" />

            <View>
              <Text fontSize="0.875rem" fontWeight="semibold" color="gray.700" marginBottom="0.5rem">
                Update Status
              </Text>
              <SelectField
                label=""
                value={applicant.status || "NEW"}
                onChange={(e) => updateApplicantStatus(e.target.value as ApplicationStatus)}
                isDisabled={statusUpdateLoading}
              >
                <option value="NEW">New</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="HIRED">Hired</option>
                <option value="REJECTED">Rejected</option>
              </SelectField>
              
              {statusUpdateLoading && (
                <Text fontSize="0.75rem" color="gray.500" marginTop="0.5rem">
                  Updating status...
                </Text>
              )}
            </View>
          </Card>

          <Card padding="1.5rem">
            <Heading level={3} marginBottom="1rem">Application Timeline</Heading>
            
            <View>
              <Flex direction="row" alignItems="center" marginBottom="0.5rem">
                <View 
                  width="8px" 
                  height="8px" 
                  borderRadius="50%" 
                  backgroundColor="blue.500" 
                  marginRight="0.5rem"
                />
                <Text fontSize="0.875rem" fontWeight="semibold">
                  Application Submitted
                </Text>
              </Flex>
              <Text fontSize="0.75rem" color="gray.500" marginLeft="1rem" marginBottom="1rem">
                {formatDate(applicant.appliedAt)}
              </Text>

              {applicant.status !== "NEW" && (
                <>
                  <Flex direction="row" alignItems="center" marginBottom="0.5rem">
                    <View 
                      width="8px" 
                      height="8px" 
                      borderRadius="50%" 
                      backgroundColor="orange.500" 
                      marginRight="0.5rem"
                    />
                    <Text fontSize="0.875rem" fontWeight="semibold">
                      Status Updated
                    </Text>
                  </Flex>
                  <Text fontSize="0.75rem" color="gray.500" marginLeft="1rem">
                    {formatDate(applicant.updatedAt)}
                  </Text>
                </>
              )}
            </View>
          </Card>
        </View>
      </Grid>
    </View>
  );
}
