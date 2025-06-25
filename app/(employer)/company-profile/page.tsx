"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface CompanyProfileData {
  id: string;
  name: string;
  description: string;
  industry: string;
  location: string;
  website?: string;
  size?: string;
  founded?: string;
}

export default function CompanyProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<CompanyProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      const { data: companyProfiles } = await client.models.CompanyProfile.list();
      const companyProfile = companyProfiles?.[0];
      
      if (companyProfile) {
        setProfile({
          id: companyProfile.id,
          name: companyProfile.name || "",
          description: companyProfile.description || "",
          industry: companyProfile.industry || "",
          location: companyProfile.location || "",
          website: companyProfile.website || "",
          size: companyProfile.size || "",
          founded: companyProfile.founded || ""
        });
      }
    } catch (error) {
      console.error("Error fetching company profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const handleEditProfile = () => {
    if (profile) {
      router.push("/company-profile/edit");
    } else {
      router.push("/company-profile/new");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Profile</h1>
            <p className="text-gray-600">Your company information and details</p>
          </div>

          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏢</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Company Profile Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your company profile to start attracting top talent and showcase your organization.
            </p>
            <button
              onClick={handleEditProfile}
              className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition-colors duration-200 shadow-sm"
            >
              Create Company Profile
            </button>
          </Card>
        </div>
      </div>
    );
  }

  const profileFields = [
    { label: "Company Name", value: profile.name, required: true },
    { label: "Industry", value: profile.industry, required: true },
    { label: "Location", value: profile.location, required: true },
    { label: "Website", value: profile.website, required: false },
    { label: "Company Size", value: profile.size, required: false },
    { label: "Founded", value: profile.founded, required: false }
  ];

  const completedFields = profileFields.filter(field => field.value).length;
  const totalFields = profileFields.length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Profile</h1>
            <p className="text-gray-600">Your company information and details</p>
          </div>
          <button
            onClick={handleEditProfile}
            className="inline-flex items-center px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
          >
            <span className="mr-2">✏️</span>
            Edit Profile
          </button>
        </div>

        {/* Profile Completion Status */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Profile Completion</h2>
            <span className={`text-sm font-medium ${completionPercentage === 100 ? 'text-success' : 'text-warning'}`}>
              {completionPercentage}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${completionPercentage === 100 ? 'bg-success' : 'bg-warning'}`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {completedFields} of {totalFields} fields completed
          </p>
        </Card>

        {/* Company Overview */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Company Overview</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{profile.name}</h3>
              {profile.description ? (
                <p className="text-gray-700 leading-relaxed">{profile.description}</p>
              ) : (
                <p className="text-gray-500 italic">No company description provided</p>
              )}
            </div>
          </div>
        </Card>

        {/* Company Details */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Company Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileFields.map((field, index) => (
              <div key={index} className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  {field.label}
                  {field.required && <span className="text-danger ml-1">*</span>}
                </label>
                {field.value ? (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                    {field.value}
                  </p>
                ) : (
                  <p className="text-gray-500 italic bg-gray-50 px-3 py-2 rounded-md border">
                    Not provided
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
