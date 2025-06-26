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
      <div className="p-4">
        <div className="bg-success-50 border border-success-200 rounded-lg p-6">
          <div className="flex items-center">
            <span className="text-success text-2xl mr-3">✅</span>
            <div>
              <h3 className="text-lg font-semibold text-success-700 mb-1">Job Posted Successfully!</h3>
              <p className="text-success-600">Your job posting has been created. Redirecting to job listings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Post a New Job</h1>
      <p className="text-gray-600 mb-6">
        Create a new job posting to attract qualified candidates to your organization.
      </p>

      {!companyProfile && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-warning text-xl mr-3">⚠️</span>
            <p className="text-warning-700">
              You need to create a company profile before posting jobs.{" "}
              <button 
                className="text-primary hover:text-primary-600 underline font-medium"
                onClick={() => router.push("/company-profile/new")}
              >
                Create Company Profile
              </button>
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-danger text-xl mr-3">❌</span>
            <p className="text-danger-600">{error}</p>
          </div>
        </div>
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

        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !companyProfile}
          >
            {loading ? "Creating Job..." : (formData.status === "ACTIVE" ? "Publish Job" : "Save Draft")}
          </button>

          <button
            type="button"
            className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSaveDraft}
            disabled={loading || !companyProfile}
          >
            Save as Draft
          </button>

          <button
            type="button"
            className="text-gray-600 hover:text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </View>
  );
}
