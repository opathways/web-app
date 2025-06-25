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
  requirements: string;
  location: string;
  salaryRange: string;
  employmentType: string;
  applicationInstructions: string;
  status: "DRAFT" | "ACTIVE";
}

export default function NewJob() {
  const router = useRouter();
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salaryRange: "",
    employmentType: "",
    applicationInstructions: "",
    status: "DRAFT"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<any>(null);

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const { data: profiles } = await client.models.CompanyProfile.list();
      if (profiles && profiles.length > 0) {
        setCompanyProfile(profiles[0]);
      }
    } catch (error) {
      console.error("Error fetching company profile:", error);
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
    if (!companyProfile) {
      setError("Company profile is required to post jobs. Please create your company profile first.");
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
      const jobData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        postedAt: new Date().toISOString(),
        companyID: companyProfile.id,
        owner: companyProfile.owner
      };

      await client.models.JobListing.create(jobData);
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/jobs");
      }, 2000);
    } catch (error) {
      console.error("Error creating job:", error);
      setError("Failed to create job posting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      setError("Job title is required to save draft");
      return;
    }

    const draftData = { ...formData, status: "DRAFT" as const };
    setFormData(draftData);
    await handleSubmit(new Event('submit') as any);
  };

  const handleCancel = () => {
    router.push("/jobs");
  };

  if (success) {
    return (
      <View padding="1rem">
        <Alert variation="success" hasIcon>
          <Heading level={4}>Job Posted Successfully!</Heading>
          <Text>Your job posting has been created. Redirecting to job listings...</Text>
        </Alert>
      </View>
    );
  }

  return (
    <View padding="1rem">
      <Heading level={1}>Post a New Job</Heading>
      <Text marginBottom="1rem" color="gray.600">
        Create a new job posting to attract qualified candidates to your organization.
      </Text>

      {!companyProfile && (
        <Alert variation="warning" hasIcon marginBottom="1rem">
          <Text>
            You need to create a company profile before posting jobs.{" "}
            <Button 
              variation="link" 
              onClick={() => router.push("/company-profile/new")}
              size="small"
            >
              Create Company Profile
            </Button>
          </Text>
        </Alert>
      )}

      {error && (
        <Alert variation="error" hasIcon marginBottom="1rem">
          <Text>{error}</Text>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <FormSection 
          title="Basic Information" 
          description="Essential details about the job position"
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
            rows={6}
            required
            isDisabled={loading}
          />

          <TextAreaField
            label="Requirements & Qualifications"
            placeholder="List the required skills, experience, education, and qualifications..."
            value={formData.requirements}
            onChange={(e) => handleInputChange("requirements", e.target.value)}
            rows={4}
            isDisabled={loading}
          />
        </FormSection>

        <FormSection 
          title="Job Details" 
          description="Additional information about the position"
        >
          <TextField
            label="Location"
            placeholder="e.g. San Francisco, CA or Remote"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            isDisabled={loading}
          />

          <TextField
            label="Salary Range"
            placeholder="e.g. $80,000 - $120,000 per year"
            value={formData.salaryRange}
            onChange={(e) => handleInputChange("salaryRange", e.target.value)}
            isDisabled={loading}
          />

          <SelectField
            label="Employment Type"
            value={formData.employmentType}
            onChange={(e) => handleInputChange("employmentType", e.target.value)}
            isDisabled={loading}
          >
            <option value="">Select employment type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Temporary">Temporary</option>
            <option value="Internship">Internship</option>
          </SelectField>

          <TextAreaField
            label="Application Instructions"
            placeholder="How should candidates apply? Include any specific requirements or steps..."
            value={formData.applicationInstructions}
            onChange={(e) => handleInputChange("applicationInstructions", e.target.value)}
            rows={3}
            isDisabled={loading}
          />
        </FormSection>

        <FormSection 
          title="Publishing Options" 
          description="Choose how to publish your job posting"
        >
          <SelectField
            label="Status"
            value={formData.status}
            onChange={(e) => handleInputChange("status", e.target.value as "DRAFT" | "ACTIVE")}
            isDisabled={loading}
          >
            <option value="DRAFT">Save as Draft</option>
            <option value="ACTIVE">Publish Immediately</option>
          </SelectField>
        </FormSection>

        <Flex direction="row" gap="1rem" marginTop="2rem">
          <Button
            type="submit"
            variation="primary"
            size="large"
            isLoading={loading}
            loadingText="Creating Job..."
            isDisabled={!companyProfile}
          >
            {formData.status === "ACTIVE" ? "Publish Job" : "Save Draft"}
          </Button>

          <Button
            type="button"
            variation="default"
            size="large"
            onClick={handleSaveDraft}
            isDisabled={loading || !companyProfile}
          >
            Save as Draft
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
        </Flex>
      </form>
    </View>
  );
}
