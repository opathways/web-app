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

export default function EditCompanyProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<Schema["Company"]["type"] | null>(null);
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
  const [successMessage, setSuccessMessage] = useState('');
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
          const companyData = companyResult.data[0];
          setCompany(companyData);
          setFormData({
            name: companyData.name || '',
            description: companyData.description || '',
            location: companyData.location || '',
            website: companyData.website || '',
            size: companyData.size || '',
          });
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
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!company) {
      console.error('No company profile to update');
      return;
    }

    setSubmitting(true);

    try {
      const result = await client.models.Company.update({
        id: company.id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
        website: formData.website.trim() || undefined,
        size: formData.size || undefined,
      });

      if (result.data) {
        setSuccessMessage('Company profile updated successfully');
        setCompany(result.data);
      } else {
        console.error('Failed to update company profile');
        setErrors({ name: 'Failed to update company profile. Please try again.' });
      }
    } catch (error) {
      console.error('Error updating company profile:', error);
      setErrors({ name: 'An error occurred while updating your profile. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Company Profile</h1>
              <p className="mt-2 text-gray-600">
                Update your company information
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/company-profile"
                className="bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
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
                href="/company-profile"
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
              <p>This is how your company profile will appear to job seekers.</p>
            </div>
            <div className="mt-5 border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900">{formData.name || 'Company Name'}</h4>
              {formData.description && (
                <p className="mt-2 text-sm text-gray-600">{formData.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                {formData.location && (
                  <span className="flex items-center">
                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {formData.location}
                  </span>
                )}
                {formData.size && (
                  <span className="flex items-center">
                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {formData.size}
                  </span>
                )}
                {formData.website && (
                  <span className="flex items-center">
                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
                      Website
                    </a>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
