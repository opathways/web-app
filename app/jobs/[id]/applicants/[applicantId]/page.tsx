"use client";

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import { getCurrentUser } from 'aws-amplify/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Schema } from '@/amplify/data/resource';
import outputs from '@/amplify_outputs.json';

Amplify.configure(outputs);

const client = generateClient<Schema>();

interface ApplicantProfilePageProps {
  params: {
    id: string;
    applicantId: string;
  };
}

export default function ApplicantProfilePage({ params }: ApplicantProfilePageProps) {
  const [user, setUser] = useState<any>(null);
  const [job, setJob] = useState<Schema["Job"]["type"] | null>(null);
  const [company, setCompany] = useState<Schema["Company"]["type"] | null>(null);
  const [application, setApplication] = useState<Schema["Application"]["type"] | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function loadApplicantData() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        const applicationResult = await client.models.Application.get({ id: params.applicantId });
        if (!applicationResult.data) {
          router.push(`/jobs/${params.id}/applicants`);
          return;
        }

        const applicationData = applicationResult.data;
        setApplication(applicationData);

        if (applicationData.jobId !== params.id) {
          router.push(`/jobs/${params.id}/applicants`);
          return;
        }

        const jobResult = await client.models.Job.get({ id: params.id });
        if (!jobResult.data) {
          router.push('/jobs');
          return;
        }

        setJob(jobResult.data);

        const companyResult = await client.models.Company.get({ id: jobResult.data.companyId });
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
      } catch (error) {
        console.error('Error loading applicant data:', error);
        router.push(`/jobs/${params.id}/applicants`);
      } finally {
        setLoading(false);
      }
    }

    loadApplicantData();
  }, [params.id, params.applicantId, router]);

  const handleStatusUpdate = async (newStatus: 'NEW' | 'IN_REVIEW' | 'HIRED' | 'REJECTED') => {
    if (!application) return;

    setUpdating(true);
    try {
      const result = await client.models.Application.update({
        id: application.id,
        status: newStatus,
      });

      if (result.data) {
        setApplication(result.data);
        setSuccessMessage(`Application status updated to ${newStatus.replace('_', ' ').toLowerCase()}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'HIRED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextActions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'NEW':
        return [
          { status: 'IN_REVIEW', label: 'Move to Review', color: 'blue' },
          { status: 'HIRED', label: 'Hire Candidate', color: 'green' },
          { status: 'REJECTED', label: 'Reject Application', color: 'red' },
        ];
      case 'IN_REVIEW':
        return [
          { status: 'HIRED', label: 'Hire Candidate', color: 'green' },
          { status: 'REJECTED', label: 'Reject Application', color: 'red' },
          { status: 'NEW', label: 'Move Back to New', color: 'gray' },
        ];
      case 'HIRED':
        return [
          { status: 'IN_REVIEW', label: 'Move Back to Review', color: 'blue' },
        ];
      case 'REJECTED':
        return [
          { status: 'IN_REVIEW', label: 'Reconsider Application', color: 'blue' },
          { status: 'NEW', label: 'Move Back to New', color: 'gray' },
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading applicant details...</p>
        </div>
      </div>
    );
  }

  if (!job || !company || !application) {
    return null; // Will redirect
  }

  const nextActions = getNextActions(application.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
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
                      <Link href={`/jobs/${job.id}/applicants`} className="ml-4 text-gray-400 hover:text-gray-500">
                        Applicants
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-500">{application.applicantName}</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                {application.applicantName}
              </h1>
              <p className="mt-1 text-gray-600">
                Application for {job.title} at {company.name}
              </p>
            </div>
            <Link
              href={`/jobs/${job.id}/applicants`}
              className="bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Applicants
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

        {/* Status and Actions */}
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                  {application.status.replace('_', ' ')}
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  Applied on {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Recently'}
                </span>
              </div>
              <div className="flex space-x-2">
                {nextActions.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => handleStatusUpdate(action.status as any)}
                    disabled={updating}
                    className={`px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 ${
                      action.color === 'green' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                      action.color === 'blue' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                      action.color === 'red' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                      'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {updating ? 'Updating...' : action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Applicant Details */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Applicant Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Contact details and application information
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {application.applicantName}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <a
                    href={`mailto:${application.applicantEmail}`}
                    className="text-blue-600 hover:text-blue-500"
                  >
                    {application.applicantEmail}
                  </a>
                </dd>
              </div>

              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Application Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {application.status.replace('_', ' ')}
                  </span>
                </dd>
              </div>

              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Application Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Recently'}
                </dd>
              </div>

              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Position Applied For</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <Link href={`/jobs/${job.id}`} className="text-blue-600 hover:text-blue-500">
                    {job.title}
                  </Link>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Resume */}
        {application.resume && (
          <div className="bg-white shadow sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Resume
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Applicant's resume and qualifications
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">
                  {application.resume}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Cover Letter */}
        {application.coverLetter && (
          <div className="bg-white shadow sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Cover Letter
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Personal message from the applicant
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="prose max-w-none">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Internal Notes */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Internal Notes
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Add private notes about this candidate (not visible to the applicant)
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="notes" className="sr-only">
                  Internal Notes
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Add your notes about this candidate's qualifications, interview feedback, or other relevant information..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
