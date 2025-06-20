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

export default function CompanyProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<Schema["Company"]["type"] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadCompanyProfile() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        const companyResult = await client.models.Company.list({
          filter: { employerId: { eq: currentUser.userId } }
        });

        if (companyResult.data.length > 0) {
          setCompany(companyResult.data[0]);
        } else {
          router.push('/company-profile/new');
          return;
        }
      } catch (error) {
        console.error('Error loading company profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCompanyProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your company profile...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return null; // Will redirect to /new
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
              <p className="mt-2 text-gray-600">
                This is how your company appears to job seekers
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
                href="/company-profile/edit"
                className="bg-blue-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Company Profile Card */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {company.name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Company information and details
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {company.name}
                </dd>
              </div>
              
              {company.description && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {company.description}
                  </dd>
                </div>
              )}

              {company.location && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {company.location}
                  </dd>
                </div>
              )}

              {company.website && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Website</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-500"
                    >
                      {company.website}
                    </a>
                  </dd>
                </div>
              )}

              {company.size && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Company Size</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {company.size}
                  </dd>
                </div>
              )}

              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Profile Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Complete
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Profile Completion Status */}
        <div className="mt-6 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Profile Completion
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Your company profile is complete and visible to job seekers.</p>
            </div>
            <div className="mt-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">Profile completion</div>
                    <div className="text-gray-900 font-medium">100%</div>
                  </div>
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-center space-x-4">
          <Link
            href="/jobs"
            className="bg-blue-600 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white hover:bg-blue-700"
          >
            View Job Postings
          </Link>
          <Link
            href="/jobs/new"
            className="bg-green-600 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white hover:bg-green-700"
          >
            Post New Job
          </Link>
        </div>
      </div>
    </div>
  );
}
