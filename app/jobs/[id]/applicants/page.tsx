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

interface ApplicantsPageProps {
  params: {
    id: string;
  };
}

export default function ApplicantsPage({ params }: ApplicantsPageProps) {
  const [user, setUser] = useState<any>(null);
  const [job, setJob] = useState<Schema["Job"]["type"] | null>(null);
  const [company, setCompany] = useState<Schema["Company"]["type"] | null>(null);
  const [applications, setApplications] = useState<Array<Schema["Application"]["type"]>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'NEW' | 'IN_REVIEW' | 'HIRED' | 'REJECTED'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const router = useRouter();

  useEffect(() => {
    async function loadApplicantsData() {
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

        const applicationsResult = await client.models.Application.list({
          filter: { jobId: { eq: params.id } }
        });
        setApplications(applicationsResult.data);
      } catch (error) {
        console.error('Error loading applicants data:', error);
        router.push('/jobs');
      } finally {
        setLoading(false);
      }
    }

    loadApplicantsData();
  }, [params.id, router]);

  const handleStatusUpdate = async (applicationId: string, newStatus: 'NEW' | 'IN_REVIEW' | 'HIRED' | 'REJECTED') => {
    try {
      const result = await client.models.Application.update({
        id: applicationId,
        status: newStatus,
      });

      if (result.data) {
        setApplications(prevApplications =>
          prevApplications.map(app =>
            app.id === applicationId ? { ...app, status: newStatus } : app
          )
        );
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const getFilteredApplications = () => {
    let filtered = applications;
    
    if (filter !== 'ALL') {
      filtered = applications.filter(app => app.status === filter);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.applicantName.localeCompare(b.applicantName);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          const dateA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
          const dateB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
          return dateB - dateA; // Most recent first
      }
    });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading applicants...</p>
        </div>
      </div>
    );
  }

  if (!job || !company) {
    return null; // Will redirect
  }

  const filteredApplications = getFilteredApplications();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
                      <span className="ml-4 text-gray-500">Applicants</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                Applicants for {job.title}
              </h1>
              <p className="mt-1 text-gray-600">
                {company.name} • {applications.length} total applications
              </p>
            </div>
            <Link
              href={`/jobs/${job.id}`}
              className="bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Job Details
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
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
                      {applications.filter(app => app.status === 'NEW').length}
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
                      {applications.filter(app => app.status === 'IN_REVIEW').length}
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
                      {applications.filter(app => app.status === 'HIRED').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div>
                  <label htmlFor="filter" className="block text-sm font-medium text-gray-700">
                    Filter by Status
                  </label>
                  <select
                    id="filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="ALL">All Applications ({applications.length})</option>
                    <option value="NEW">New ({applications.filter(app => app.status === 'NEW').length})</option>
                    <option value="IN_REVIEW">In Review ({applications.filter(app => app.status === 'IN_REVIEW').length})</option>
                    <option value="HIRED">Hired ({applications.filter(app => app.status === 'HIRED').length})</option>
                    <option value="REJECTED">Rejected ({applications.filter(app => app.status === 'REJECTED').length})</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
                    Sort by
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="date">Application Date</option>
                    <option value="name">Applicant Name</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Showing {filteredApplications.length} of {applications.length} applications
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filter === 'ALL' ? 'No applications yet' : `No ${filter.toLowerCase().replace('_', ' ')} applications`}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'ALL' 
                ? 'Applications will appear here when candidates apply to this job.'
                : `No applications match the ${filter.toLowerCase().replace('_', ' ')} status filter.`
              }
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <li key={application.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Link
                          href={`/jobs/${job.id}/applicants/${application.id}`}
                          className="text-sm font-medium text-blue-600 truncate hover:text-blue-500"
                        >
                          {application.applicantName}
                        </Link>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Recently'}
                        </span>
                        <div className="flex space-x-1">
                          {application.status === 'NEW' && (
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'IN_REVIEW')}
                              className="text-blue-600 hover:text-blue-500 text-xs font-medium"
                            >
                              Review
                            </button>
                          )}
                          {(application.status === 'NEW' || application.status === 'IN_REVIEW') && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(application.id, 'HIRED')}
                                className="text-green-600 hover:text-green-500 text-xs font-medium"
                              >
                                Hire
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                                className="text-red-600 hover:text-red-500 text-xs font-medium"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="text-sm text-gray-500">
                          {application.applicantEmail}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Link
                          href={`/jobs/${job.id}/applicants/${application.id}`}
                          className="text-blue-600 hover:text-blue-500 font-medium"
                        >
                          View Details →
                        </Link>
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
