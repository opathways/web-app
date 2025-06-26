"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { useRouter } from "next/navigation";
import { Heading, View, Text, Button, Flex } from "@aws-amplify/ui-react";
import Card from "@/components/Card";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

type CompanyProfileData = Schema["CompanyProfile"]["type"];

export default function CompanyProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<CompanyProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: companyProfiles } = await client.models.CompanyProfile.list();
      const companyProfile = companyProfiles?.[0];
      
      if (companyProfile) {
        setProfile(companyProfile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Error fetching company profile:", err);
      setError("Failed to load company profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const handleEditProfile = () => {
    router.push("/company-profile/edit");
  };

  const handleCreateProfile = () => {
    router.push("/company-profile/new");
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Company Profile</h1>
        <p className="text-gray-600">Loading company profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Company Profile</h1>
        <Card className="border-l-4 border-l-danger bg-danger-50">
          <p className="text-danger-600 mb-4">{error}</p>
          <button 
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={fetchCompanyProfile}
          >
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Profile</h1>
            <p className="text-gray-600">View your company profile information and details.</p>
          </div>

          <Card className="text-center py-12">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">🏢</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Company Profile Found
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't created a company profile yet. Set up your profile to start posting jobs and attracting candidates.
              </p>
              <button 
                className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={handleCreateProfile}
              >
                Create Company Profile
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Profile</h1>
            <p className="text-gray-600">View your company profile information and details.</p>
          </div>
          <button 
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={handleEditProfile}
          >
            ✏️ Edit Profile
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h3>
                {profile.industry && (
                  <span className="inline-block px-3 py-1 bg-info-100 text-info-700 text-sm font-medium rounded-full">
                    {profile.industry}
                  </span>
                )}
              </div>

              {profile.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">About</h4>
                  <p className="text-gray-900 leading-relaxed">{profile.description}</p>
                </div>
              )}

              {profile.location && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Location</h4>
                  <div className="flex items-center text-gray-900">
                    <span className="mr-2">📍</span>
                    {profile.location}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Contact Information */}
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.contactEmail && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Email</h4>
                  <div className="flex items-center">
                    <span className="mr-2">✉️</span>
                    <a 
                      href={`mailto:${profile.contactEmail}`}
                      className="text-primary hover:text-primary-600 hover:underline transition-colors duration-150"
                    >
                      {profile.contactEmail}
                    </a>
                  </div>
                </div>
              )}

              {profile.website && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Website</h4>
                  <div className="flex items-center">
                    <span className="mr-2">🌐</span>
                    <a 
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-600 hover:underline break-all transition-colors duration-150"
                    >
                      {profile.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Profile Completeness */}
          <Card>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Status</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Company Name</span>
                <span className={`text-sm font-medium ${profile.name ? 'text-success' : 'text-danger'}`}>
                  {profile.name ? '✓ Complete' : '✗ Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Description</span>
                <span className={`text-sm font-medium ${profile.description ? 'text-success' : 'text-warning'}`}>
                  {profile.description ? '✓ Complete' : '⚠ Optional'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Industry</span>
                <span className={`text-sm font-medium ${profile.industry ? 'text-success' : 'text-warning'}`}>
                  {profile.industry ? '✓ Complete' : '⚠ Optional'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Location</span>
                <span className={`text-sm font-medium ${profile.location ? 'text-success' : 'text-warning'}`}>
                  {profile.location ? '✓ Complete' : '⚠ Optional'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Contact Email</span>
                <span className={`text-sm font-medium ${profile.contactEmail ? 'text-success' : 'text-danger'}`}>
                  {profile.contactEmail ? '✓ Complete' : '✗ Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Website</span>
                <span className={`text-sm font-medium ${profile.website ? 'text-success' : 'text-warning'}`}>
                  {profile.website ? '✓ Complete' : '⚠ Optional'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
