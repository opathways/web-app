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

export default function JobsPage() {
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<Schema["Company"]["type"] | null>(null);
  const [jobs, setJobs] = useState<Array<Schema["Job"]["type"]>>([]);
  const [applications, setApplications] = useState<Array<Schema["Application"]["type"]>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'DRAFT'>('ALL');
  const router = useRouter();

  useEffect(() => {
    async function loadJobsData() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        const companyResult = await client.models.Company.list({
          filter: { employerId: { eq: currentUser.userId } }
        });

        if (companyResult.data.length === 0) {
          router.push('/company-profile/new');
          return;
        }

        const companyData = companyResult.data[0];
        setCompany(companyData);

        const jobsResult = await client.models.Job.list({
          filter: { companyId: { eq: companyData.id } }
        });
        setJobs(jobsResult.data);

        const allApplications: Schema["Application"]["type"][] = [];
        for (const job of jobsResult.data) {
          const appResult = await client.models.Application.list({
            filter: { jobId: { eq: job.id } }
          });
          allApplications.push(...appResult.data);
        }
        setApplications(allApplications);
      } catch (error) {
        console.error('Error loading jobs data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadJobsData();
  }, [router]);

  const handleStatusChange = async (jobId: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      const result = await client.models.Job.update({
        id: jobId,
        status: newStatus,
      });

      if (result.data) {
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.id === jobId ? { ...job, status: newStatus } : job
          )
        );
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const getFilteredJobs = () => {
    if (filter === 'ALL') return jobs;
    return jobs.filter(job => job.status === filter);
  };

  const getApplicationCount = (jobId: string) => {
    return applications.filter(app => app.jobId === jobId).length;
  };

  const getNewApplicationCount = (jobId: string) => {
    return applications.filter(app => app.jobId === jobId && app.status === 'NEW').length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your job postings...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return null; // Will redirect to company profile creation
  }

  const filteredJobs = getFilteredJobs();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
              <p className="mt-2 text-gray-600">
                Manage your job listings and track applications
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/dashboard"
                className="bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back to Dashboard
              </Link>
              <Link
                href="/jobs/new"
                className="bg-blue-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
              >
                Post New Job
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Jobs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {jobs.length}
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
                      Active Jobs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {jobs.filter(job => job.status === 'ACTIVE').length}
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
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 01-15 0V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      New Applications
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {applications.filter(app => app.status === 'NEW').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="sm:hidden">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="ALL">All Jobs</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-8">
              {[
                { key: 'ALL', label: 'All Jobs', count: jobs.length },
                { key: 'ACTIVE', label: 'Active', count: jobs.filter(j => j.status === 'ACTIVE').length },
                { key: 'INACTIVE', label: 'Inactive', count: jobs.filter(j => j.status === 'INACTIVE').length },
                { key: 'DRAFT', label: 'Draft', count: jobs.filter(j => j.status === 'DRAFT').length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filter === 'ALL' ? 'No job postings' : `No ${filter.toLowerCase()} jobs`}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'ALL' 
                ? 'Get started by creating your first job posting.'
                : `You don't have any ${filter.toLowerCase()} job postings yet.`
              }
            </p>
            <div className="mt-6">
              <Link
                href="/jobs/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Post New Job
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <li key={job.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Link href={`/jobs/${job.id}`} className="text-sm font-medium text-blue-600 truncate hover:text-blue-500">
                          {job.title}
                        </Link>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          job.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex space-x-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getApplicationCount(job.id)} applications
                        </span>
                        {getNewApplicationCount(job.id) > 0 && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {getNewApplicationCount(job.id)} new
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="text-sm text-gray-500 truncate">
                          {job.description?.substring(0, 150)}...
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <div className="flex space-x-2">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="text-blue-600 hover:text-blue-500 font-medium"
                          >
                            View
                          </Link>
                          <Link
                            href={`/jobs/${job.id}/edit`}
                            className="text-gray-600 hover:text-gray-500 font-medium"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/jobs/${job.id}/applicants`}
                            className="text-green-600 hover:text-green-500 font-medium"
                          >
                            Applicants
                          </Link>
                          {job.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleStatusChange(job.id, 'INACTIVE')}
                              className="text-red-600 hover:text-red-500 font-medium"
                            >
                              Close
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(job.id, 'ACTIVE')}
                              className="text-green-600 hover:text-green-500 font-medium"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
