import React from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { profileAPI } from '../services/api';
import LoadingSpinner from './UI/LoadingSpinner';

const ProfileCheck = ({ children }) => {
  const profileJustCreated = localStorage.getItem('profileJustCreated');
  const token = localStorage.getItem('token');
  
  console.log('ProfileCheck - Component rendered');
  console.log('ProfileCheck - profileJustCreated flag:', profileJustCreated);
  console.log('ProfileCheck - token exists:', !!token);

  // Always call useQuery at the top level (React Hook Rules)
  const { data: profileData, isLoading, error, refetch } = useQuery(
    'userProfile', // Use stable cache key
    profileAPI.getProfile,
    {
      enabled: !!token, // Only run if we have a token
      retry: 1,
      retryDelay: 500,
      refetchOnWindowFocus: false,
      staleTime: 0, // Don't cache - always fetch fresh
      cacheTime: 0, // Don't keep in cache
      refetchOnMount: true, // Always refetch when component mounts
      onError: (error) => {
        console.log('ProfileCheck error:', error);
        console.log('ProfileCheck error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
      },
      onSuccess: (data) => {
        console.log('ProfileCheck success:', data);
      },
      onSettled: (data, error) => {
        console.log('ProfileCheck settled:', { data, error });
      }
    }
  );

  // Check if we should bypass profile check (after useQuery)
  if (profileJustCreated) {
    console.log('ProfileCheck - Bypassing profile check due to profileJustCreated flag');
    localStorage.removeItem('profileJustCreated');
    return children;
  }

  // Check if we have a token
  if (!token) {
    console.log('ProfileCheck - No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProfileCheck state:', { isLoading, error, profileData });
  console.log('ProfileCheck - profileData structure:', JSON.stringify(profileData, null, 2));
  console.log('ProfileCheck - profileData?.data?.profile exists:', !!profileData?.data?.profile);
  console.log('ProfileCheck - typeof profileData:', typeof profileData);
  
  // Additional debugging for data structure
  if (profileData) {
    console.log('ProfileCheck - profileData keys:', Object.keys(profileData));
    if (profileData.data) {
      console.log('ProfileCheck - profileData.data keys:', Object.keys(profileData.data));
      if (profileData.data.profile) {
        console.log('ProfileCheck - profile keys:', Object.keys(profileData.data.profile));
      }
    }
  }

  // Show loading state while checking
  if (isLoading) {
    console.log('ProfileCheck - Loading profile data...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Checking your profile...</p>
          <p className="mt-2 text-sm text-gray-500">This should only take a moment</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 px-4 py-2 bg-perfume-500 text-white rounded-lg hover:bg-perfume-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.log('ProfileCheck - Error loading profile:', error);
    // If it's a 404 (no profile), redirect to onboarding
    if (error.response?.status === 404) {
      console.log('ProfileCheck - No profile found, redirecting to onboarding');
      return <Navigate to="/onboarding" replace />;
    }
    
    // For other errors, show error message
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading profile. Please try again.</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 px-4 py-2 bg-perfume-500 text-white rounded-lg hover:bg-perfume-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Multiple ways to check for profile data
  const hasProfile = profileData?.data?.profile || 
                    profileData?.profile ||
                    (profileData && typeof profileData === 'object' && 'data' in profileData && profileData.data?.profile) ||
                    (profileData && profileData.id); // Direct profile object
  
  console.log('ProfileCheck - hasProfile:', hasProfile);
  console.log('ProfileCheck - profileData.data?.profile:', profileData?.data?.profile);
  
  // If we have profile data, show the children
  if (hasProfile) {
    console.log('Profile found, showing children');
    return children;
  }

  // If no error but no profile data, and we're not loading, redirect to onboarding
  if (!isLoading && !profileData) {
    console.log('ProfileCheck - No profile data found, redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // If still loading, show loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text="Checking your profile..." />
    </div>
  );
};

export default ProfileCheck;
