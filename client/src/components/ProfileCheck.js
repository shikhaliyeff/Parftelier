import React from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { profileAPI } from '../services/api';
import LoadingSpinner from './UI/LoadingSpinner';

const ProfileCheck = ({ children }) => {
  const { data: profileData, isLoading, error } = useQuery(
    'userProfile',
    profileAPI.getProfile,
    {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      onError: (error) => {
        console.log('ProfileCheck error:', error);
      },
      onSuccess: (data) => {
        console.log('ProfileCheck success:', data);
      }
    }
  );

  console.log('ProfileCheck state:', { isLoading, error, profileData });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking your profile..." />
      </div>
    );
  }

  // If there's an error (profile not found) or no profile data, redirect to onboarding
  if (error || !profileData?.profile) {
    console.log('Redirecting to onboarding. Error:', error, 'ProfileData:', profileData);
    return <Navigate to="/onboarding" replace />;
  }

  console.log('Profile found, showing children');
  // User has completed onboarding, show the protected content
  return children;
};

export default ProfileCheck;
