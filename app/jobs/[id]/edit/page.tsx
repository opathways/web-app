"use client";

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Schema } from '@/amplify/data/resource';
import outputs from '@/amplify_outputs.json';

Amplify.configure(outputs);

const client = generateClient<Schema>();

interface FormData {
  title: string;
  description: string;
  requirements: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
}

interface FormErrors {
  title?: string;
  description?: string;
  requirements?: string;
  status?: string;
}

interface EditJobPageProps {
  params: {
    id: string;
  };
}

export default function EditJobPage({ params }: EditJobPageProps) {
  const [user, setUser] = useState<any>(null);
  const [job, setJob] = useState<Schema["Job"]["type"] | null>(null);
  const [company, setCompany] = useState<Schema["Company"]["type"] | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    requirements: '',
    status: 'DRAFT',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function loadJobData() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        const jobResult = await client.models.Job.get({ id: params.id });
        if (!jobResult.data) {
          router.push('/jobs');
          return;
        }

        const jobData = jobResult.data;
        setJob(jobData);

        const companyResult = await client.models.Company.get({ id: jobData.companyId });
        if (!companyResult.data) {
          router.push('/jobs');
          return;
        }

        const companyData = companyResult.data;
        setCompany(companyData);

        if (companyData.employerId !== currentUser.userId) {
          router.push('/jobs');
          return;
        }

        setFormData({
          title: jobData.title || '',
          description: jobData.description || '',
          requirements: jobData.requirements || '',
          status: jobData.status || 'DRAFT',
        });
      } catch (error) {
        console.error('Error loading job data:', error);
        router.push('/jobs');
      } finally {
        setLoading(false);
      }
    }

    loadJobData();
  }, [params.id, router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!job) {
      console.error('No job data to update');
      return;
    }

    setSubmitting(true);

    try {
      const result = await client.models.Job.update({
        id: job.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        requirements: formData.requirements.trim() || undefined,
        status: formData.status,
      });

      if (result.data) {
        setSuccessMessage('Job posting updated successfully');
        setJob(result.data);
      } else {
        console.error('Failed to update job posting');
        setErrors({ title: 'Failed to update job posting. Please try again.' });
      }
    } catch (error) {
      console.error('Error updating job posting:', error);
      setErrors({ title: 'An error occurred while updating your job posting. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job || !company) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <Link href="/dashboard" className="text-gray-400 hover:text-gray-500">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <Link href="/jobs" className="ml-4 text-gray-400 hover:text-gray-500">
                        Jobs
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <Link href={`/jobs/${job.id}`} className="ml-4 text-gray-400 hover:text-gray-500">
                        {job.title}
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-500">Edit</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">Edit Job Posting</h1>
              <p className="mt-1 text-gray-600">Update your job posting details</p>
            </div>
            <Link
              href={`/jobs/${job.id}`}
              className="bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow sm:rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6 px-4 py-5 sm:p-6">
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Job Title *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.title ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., Senior Software Engineer"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Job Description *
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  rows={8}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.description ? 'border-red-300' : ''
                  }`}
                  placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Provide a detailed description of the role, responsibilities, and company culture.
              </p>
            </div>

            {/* Requirements */}
            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                Requirements & Qualifications
              </label>
              <div className="mt-1">
                <textarea
                  id="requirements"
                  rows={6}
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="List the required skills, experience, education, and qualifications..."
                />
                {errors.requirements && (
                  <p className="mt-2 text-sm text-red-600">{errors.requirements}</p>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                List required skills, experience level, education, and any specific qualifications.
              </p>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Publication Status
              </label>
              <div className="mt-1">
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as any)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="DRAFT">Draft - Save without publishing</option>
                  <option value="ACTIVE">Active - Visible to applicants</option>
                  <option value="INACTIVE">Inactive - Not visible to applicants</option>
                </select>
                {errors.status && (
                  <p className="mt-2 text-sm text-red-600">{errors.status}</p>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Choose "Active" to make the job visible to applicants, "Inactive" to hide it, or "Draft" to save changes without publishing.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Link
                href={`/jobs/${job.id}`}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="mt-6 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Preview
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>This is how your updated job posting will appear to job seekers.</p>
            </div>
            <div className="mt-5 border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900">
                    {formData.title || 'Job Title'}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{company.name}</p>
                  {company.location && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                      <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {company.location}
                    </p>
                  )}
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  formData.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  formData.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {formData.status}
                </span>
              </div>
              
              {formData.description && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-900">Description</h5>
                  <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                    {formData.description}
                  </p>
                </div>
              )}
              
              {formData.requirements && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-900">Requirements</h5>
                  <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                    {formData.requirements}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change History Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Important Notes
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Changes to job postings are immediately visible to applicants</li>
                  <li>Existing applications will remain associated with this job</li>
                  <li>Changing status to "Inactive" will hide the job from new applicants</li>
                  <li>You can always reactivate an inactive job posting later</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
