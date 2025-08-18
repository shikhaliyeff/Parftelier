import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { User, Settings, Lock, Heart, Star, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { profileAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, changePassword, isChangingPassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const queryClient = useQueryClient();

  // Get user profile
  const { data: profileData, isLoading } = useQuery(
    'userProfile',
    profileAPI.getProfile
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    profileAPI.updateProfile,
    {
      onSuccess: () => {
        toast.success('Profile updated successfully!');
        queryClient.invalidateQueries('userProfile');
      },
      onError: () => {
        toast.error('Failed to update profile');
      }
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('newPassword');

  const onSubmitProfile = (data) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitPassword = (data) => {
    changePassword(data);
  };

  const profile = profileData?.profile;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-elegant font-bold text-gradient mb-4">
            Profile Settings
          </h1>
          <p className="text-xl text-gray-600">
            Manage your account and preferences
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-perfume p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-perfume-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {user?.name || 'User'}
                </h3>
                <p className="text-gray-600">{user?.email}</p>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-perfume-50 text-perfume-700 border border-perfume-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-perfume p-8"
            >
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Profile Information
                  </h2>
                  <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.name}
                        {...register('name', { required: 'Name is required' })}
                        className="input-field"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        disabled
                        className="input-field bg-gray-50"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Email cannot be changed
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={updateProfileMutation.isLoading}
                      className="btn-primary"
                    >
                      {updateProfileMutation.isLoading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Fragrance Preferences
                  </h2>
                  
                  {profile?.fragrance_dna ? (
                    <div className="space-y-6">
                      {/* Preferred Families */}
                      {profile.fragrance_dna.families && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Preferred Scent Families
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            {Object.entries(profile.fragrance_dna.families)
                              .filter(([_, weight]) => weight > 0.3)
                              .sort(([_, a], [__, b]) => b - a)
                              .map(([family, weight]) => (
                                <div key={family} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <span className="font-medium capitalize">{family}</span>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-perfume-500 h-2 rounded-full"
                                        style={{ width: `${weight * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      {Math.round(weight * 100)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Preferred Notes */}
                      {profile.fragrance_dna.notes && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Preferred Notes
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            {Object.entries(profile.fragrance_dna.notes)
                              .filter(([_, weight]) => weight > 0.3)
                              .sort(([_, a], [__, b]) => b - a)
                              .map(([note, weight]) => (
                                <div key={note} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <span className="font-medium capitalize">{note}</span>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-rose-500 h-2 rounded-full"
                                        style={{ width: `${weight * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      {Math.round(weight * 100)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Usage Contexts */}
                      {profile.fragrance_dna.contexts && profile.fragrance_dna.contexts.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Preferred Contexts
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {profile.fragrance_dna.contexts.map((context) => (
                              <span
                                key={context}
                                className="px-3 py-1 bg-perfume-100 text-perfume-800 rounded-full text-sm font-medium"
                              >
                                {context}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          These preferences help us provide better perfume recommendations. 
                          You can update them by retaking the onboarding quiz.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-perfume-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No preferences set
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Complete the onboarding quiz to set your fragrance preferences.
                      </p>
                      <button className="btn-primary">
                        Take Quiz
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Security Settings
                  </h2>
                  <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        {...register('currentPassword', { required: 'Current password is required' })}
                        className="input-field"
                      />
                      {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        {...register('newPassword', {
                          required: 'New password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          }
                        })}
                        className="input-field"
                      />
                      {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (value) =>
                            value === password || 'Passwords do not match'
                        })}
                        className="input-field"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="btn-primary"
                    >
                      {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
