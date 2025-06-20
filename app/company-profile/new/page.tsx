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
  name: string;
  description: string;
  location: string;
  website: string;
  size: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  location?: string;
  website?: string;
  size?: string;
}

export default function NewCompanyProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    location: '',
    website: '',
    size: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkExistingProfile() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        const companyResult = await client.models.Company.list({
          filter: { employerId: { eq: currentUser.userId } }
        });

        if (companyResult.data.length > 0) {
          router.push('/company-profile');
          return;
        }
      } catch (error) {
        console.error('Error checking existing profile:', error);
      } finally {
        setLoading(false);
      }
    }

    checkExistingProfile();
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      console.error('User not authenticated');
      return;
    }

    setSubmitting(true);

    try {
      const result = await client.models.Company.create({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
        website: formData.website.trim() || undefined,
        size: formData.size || undefined,
        employerId: user.userId,
      });

      if (result.data) {
        router.push('/company-profile');
      } else {
        console.error('Failed to create company profile');
        setErrors({ name: 'Failed to create company profile. Please try again.' });
      }
    } catch (error) {
      console.error('Error creating company profile:', error);
      setErrors({ name: 'An error occurred while creating your profile. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Company Profile</h1>
              <p className="mt-2 text-gray-600">
                Set up your company profile to start posting jobs
              </p>
            </div>
            <Link
              href="/dashboard"
              className="bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow sm:rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6 px-4 py-5 sm:p-6">
            {/* Company Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Company Name *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.name ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter your company name"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Company Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Company Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Describe your company, mission, and culture"
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., San Francisco, CA"
                />
                {errors.location && (
                  <p className="mt-2 text-sm text-red-600">{errors.location}</p>
                )}
              </div>
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <div className="mt-1">
                <input
                  type="url"
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.website ? 'border-red-300' : ''
                  }`}
                  placeholder="https://www.yourcompany.com"
                />
                {errors.website && (
                  <p className="mt-2 text-sm text-red-600">{errors.website}</p>
                )}
              </div>
            </div>

            {/* Company Size */}
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                Company Size
              </label>
              <div className="mt-1">
                <select
                  id="size"
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select company size</option>
                  <option value="1-10 employees">1-10 employees</option>
                  <option value="11-50 employees">11-50 employees</option>
                  <option value="51-100 employees">51-100 employees</option>
                  <option value="101-500 employees">101-500 employees</option>
                  <option value="501-1000 employees">501-1000 employees</option>
                  <option value="1000+ employees">1000+ employees</option>
                </select>
                {errors.size && (
                  <p className="mt-2 text-sm text-red-600">{errors.size}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Link
                href="/dashboard"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitting ? 'Creating Profile...' : 'Create Company Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Why create a company profile?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Your company profile helps job seekers learn about your organization and makes your job postings more attractive. 
                  Only the company name is required, but providing more details will help you attract better candidates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
