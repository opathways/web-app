"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { 
  Heading, 
  View, 
  Text, 
  TextField, 
  TextAreaField, 
  SelectField, 
  Button, 
  Flex,
  Alert
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import FormSection from "@/components/FormSection";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface JobFormData {
  title: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "CLOSED";
}

export default function EditJob({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    status: "DRAFT"
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [jobData, setJobData] = useState<any>(null);

  useEffect(() => {
    fetchJobData();
  }, [params.id]);

  const fetchJobData = async () => {
    try {
      setFetchLoading(true);
      setError(null);
      
      const { data: job } = await client.models.JobListing.get({ id: params.id });
      
      if (job) {
        setJobData(job);
        setFormData({
          title: job.title || "",
          description: job.description || "",
          status: job.status || "DRAFT"
        });
      } else {
        setError("Job not found. It may have been deleted or you don't have permission to edit it.");
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      setError("Failed to load job data. Please try again.");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError("Job title is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Job description is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      await client.models.JobListing.update({
        id: params.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status
      });
      
      setSuccess(true);
      setTimeout(() => {
        router.push(`/jobs/${params.id}`);
      }, 2000);
    } catch (error) {
      console.error("Error updating job:", error);
      setError("Failed to update job posting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/jobs/${params.id}`);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await client.models.JobListing.delete({ id: params.id });
      router.push("/jobs");
    } catch (error) {
      console.error("Error deleting job:", error);
      setError("Failed to delete job posting. Please try again.");
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading job data...</p>
        </div>
      </div>
    );
  }

  if (error && !jobData) {
    return (
      <div className="p-4">
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
          <div className="flex items-center">
            <span className="text-danger text-2xl mr-3">❌</span>
            <div>
              <h3 className="text-lg font-semibold text-danger-700 mb-1">Error Loading Job</h3>
              <p className="text-danger-600">{error}</p>
            </div>
          </div>
          <button 
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 mt-4"
            onClick={() => router.push("/jobs")}
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <View padding="1rem">
        <Alert variation="success" hasIcon>
          <Heading level={4}>Job Updated Successfully!</Heading>
          <Text>Your job posting has been updated. Redirecting to job details...</Text>
        </Alert>
      </View>
    );
  }

  return (
    <View padding="1rem">
      <Heading level={1}>Edit Job Posting</Heading>
      <Text marginBottom="1rem" color="gray.600">
        Update your job posting details to keep the listing current and accurate.
      </Text>

      {error && (
        <Alert variation="error" hasIcon marginBottom="1rem">
          <Text>{error}</Text>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <FormSection 
          title="Job Information" 
          description="Edit the job details"
        >
          <TextField
            label="Job Title"
            placeholder="e.g. Senior Software Engineer"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            required
            isDisabled={loading}
          />

          <TextAreaField
            label="Job Description"
            placeholder="Describe the role, responsibilities, and what makes this position exciting..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={8}
            required
            isDisabled={loading}
          />
        </FormSection>

        <FormSection 
          title="Job Status" 
          description="Control the visibility and status of your job posting"
        >
          <SelectField
            label="Status"
            value={formData.status}
            onChange={(e) => handleInputChange("status", e.target.value as "DRAFT" | "ACTIVE" | "CLOSED")}
            isDisabled={loading}
          >
            <option value="DRAFT">Draft (Not visible to candidates)</option>
            <option value="ACTIVE">Active (Accepting applications)</option>
            <option value="CLOSED">Closed (No longer accepting applications)</option>
          </SelectField>
        </FormSection>

        <Flex direction="row" gap="1rem" marginTop="2rem" wrap="wrap">
          <Button
            type="submit"
            variation="primary"
            size="large"
            isLoading={loading}
            loadingText="Updating Job..."
          >
            Update Job
          </Button>

          <Button
            type="button"
            variation="link"
            size="large"
            onClick={handleCancel}
            isDisabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variation="destructive"
            size="large"
            onClick={handleDelete}
            isDisabled={loading}
          >
            Delete Job
          </Button>
        </Flex>
      </form>
    </View>
  );
}
