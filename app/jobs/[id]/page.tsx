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

interface JobDetailsPageProps {
  params: {
    id: string;
  };
}

export default function JobDetailsPage({ params }: JobDetailsPageProps) {
  const [user, setUser] = useState<any>(null);
  const [job, setJob] = useState<Schema["Job"]["type"] | null>(null);
  const [company, setCompany] = useState<Schema["Company"]["type"] | null>(null);
  const [applications, setApplications] = useState<Array<Schema["Application"]["type"]>>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadJobDetails() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        const jobResult = await client.models.Job.get({ id: params.id });
        if (!jobResult.data) {
          router.push('/jobs');
          return;
        }

        setJob(jobResult.data);

        const companyResult = await client.models.Company.get({ id: jobResult.data.companyId });
        if (companyResult.data) {
          setCompany(companyResult.data);
          
          if (companyResult.data.employerId !== currentUser.userId) {
            router.push('/jobs');
            return;
          }
        }

        const applicationsResult = await client.models.Application.list({
          filter: { jobId: { eq: params.id } }
        });
        setApplications(applicationsResult.data);
      } catch (error) {
        console.error('Error loading job details:', error);
        router.push('/jobs');
      } finally {
        setLoading(false);
      }
    }

    loadJobDetails();
  }, [params.id, router]);

  const handleStatusChange = async (newStatus: 'ACTIVE' | 'INACTIVE') => {
    if (!job) return;

    setUpdating(true);
    try {
      const result = await client.models.Job.update({
        id: job.id,
        status: newStatus,
      });

      if (result.data) {
        setJob(result.data);
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!job) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete this job posting? This action cannot be undone and will also delete all associated applications.'
    );
    
    if (!confirmed) return;

    setUpdating(true);
    try {
      for (const application of applications) {
        await client.models.Application.delete({ id: application.id });
      }
      
      await client.models.Job.delete({ id: job.id });
      
      router.push('/jobs');
    } catch (error) {
      console.error('Error deleting job:', error);
      setUpdating(false);
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

  const activeApplications = applications.filter(app => app.status !== 'REJECTED');
  const newApplications = applications.filter(app => app.status === 'NEW');
  const inReviewApplications = applications.filter(app => app.status === 'IN_REVIEW');
  const hiredApplications = applications.filter(app => app.status === 'HIRED');

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
                      <span className="ml-4 text-gray-500">Job Details</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="mt-1 text-gray-600">{company.name}</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/jobs/${job.id}/edit`}
                className="bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit Job
              </Link>
              <Link
                href={`/jobs/${job.id}/applicants`}
                className="bg-blue-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
              >
                View Applicants ({applications.length})
              </Link>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`mb-6 rounded-lg p-4 ${
          job.status === 'ACTIVE' ? 'bg-green-50 border border-green-200' :
          job.status === 'INACTIVE' ? 'bg-red-50 border border-red-200' :
          'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                job.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                job.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {job.status}
              </span>
              <span className={`ml-3 text-sm ${
                job.status === 'ACTIVE' ? 'text-green-800' :
                job.status === 'INACTIVE' ? 'text-red-800' :
                'text-gray-800'
              }`}>
                {job.status === 'ACTIVE' ? 'This job is currently accepting applications' :
                 job.status === 'INACTIVE' ? 'This job is not accepting new applications' :
                 'This job is saved as a draft'}
              </span>
            </div>
            <div className="flex space-x-2">
              {job.status === 'ACTIVE' ? (
                <button
                  onClick={() => handleStatusChange('INACTIVE')}
                  disabled={updating}
                  className="bg-red-100 px-3 py-1 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 disabled:opacity-50"
                >
                  {updating ? 'Closing...' : 'Close Job'}
                </button>
              ) : (
                <button
                  onClick={() => handleStatusChange('ACTIVE')}
                  disabled={updating}
                  className="bg-green-100 px-3 py-1 rounded-md text-sm font-medium text-green-800 hover:bg-green-200 disabled:opacity-50"
                >
                  {updating ? 'Activating...' : 'Activate Job'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Application Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Applications
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {applications.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 01-15 0V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      New Applications
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {newApplications.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      In Review
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {inReviewApplications.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Hired
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {hiredApplications.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Details Card */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Job Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Complete job posting information
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Job Title</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {job.title}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Company</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {company.name}
                  {company.location && (
                    <span className="text-gray-500 ml-2">• {company.location}</span>
                  )}
                </dd>
              </div>

              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    job.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    job.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                </dd>
              </div>

              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">
                  {job.description}
                </dd>
              </div>

              {job.requirements && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Requirements</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">
                    {job.requirements}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Recent Applications */}
        {applications.length > 0 && (
          <div className="bg-white shadow sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Applications
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Latest applications for this position
                  </p>
                </div>
                <Link
                  href={`/jobs/${job.id}/applicants`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all applications →
                </Link>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {applications.slice(0, 5).map((application) => (
                  <li key={application.id}>
                    <Link
                      href={`/jobs/${job.id}/applicants/${application.id}`}
                      className="block hover:bg-gray-50"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {application.applicantName}
                            </p>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              application.status === 'NEW' ? 'bg-yellow-100 text-yellow-800' :
                              application.status === 'IN_REVIEW' ? 'bg-blue-100 text-blue-800' :
                              application.status === 'HIRED' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {application.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Recently'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="text-sm text-gray-500">
                              {application.applicantEmail}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleDeleteJob}
            disabled={updating}
            className="bg-red-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {updating ? 'Deleting...' : 'Delete Job'}
          </button>
          
          <div className="flex space-x-3">
            <Link
              href={`/jobs/${job.id}/edit`}
              className="bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit Job
            </Link>
            <Link
              href={`/jobs/${job.id}/applicants`}
              className="bg-blue-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
            >
              Manage Applicants
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
