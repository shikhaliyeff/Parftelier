import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { profileAPI } from '../services/api';
import api from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';


const OnboardingPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // Clear profile cache on mount
  useEffect(() => {
    queryClient.removeQueries('userProfile');
    console.log('Cleared userProfile cache on mount');
  }, [queryClient]);

  // Check if user already has a profile
  const { data: profileData, isLoading: profileLoading, error: profileError } = useQuery(
    'userProfile',
    profileAPI.getProfile,
    {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 0,
      cacheTime: 0,
      onSuccess: (data) => {
        console.log('OnboardingPage - Profile check success:', data);
        if (data?.profile) {
          console.log('OnboardingPage - User already has profile, redirecting to recommendations');
          navigate('/recommendations', { replace: true });
        }
      },
      onError: (error) => {
        console.log('OnboardingPage - Profile check error:', error);
      }
    }
  );

  console.log('OnboardingPage - Profile state:', { 
    profileData, 
    profileLoading, 
    profileError, 
    hasProfile: !!profileData?.profile 
  });



  // Fetch onboarding questions
  const { data: questionsData, isLoading, error, refetch } = useQuery(
    'onboardingQuestions',
    profileAPI.getOnboardingQuestions,
    {
      retry: false, // Disable retries to prevent infinite loops
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
      onError: (error) => {
        console.error('Failed to fetch onboarding questions:', error);
      },
      onSuccess: (data) => {
        console.log('Successfully fetched questions:', data);
        console.log('Questions data structure:', JSON.stringify(data, null, 2));
        console.log('Questions data.data:', data?.data);
        console.log('Questions data.data.questions:', data?.data?.questions);
      }
    }
  );

  // Manual refresh function
  const handleRefresh = () => {
    queryClient.invalidateQueries('onboardingQuestions'); // Only invalidate this query
    refetch(); // Refetch the data
  };

  // Register and create profile mutation
  const registerAndCreateProfileMutation = useMutation(
    async ({ email, name, answers }) => {
      // First register the user
      const registerResponse = await api.post('/auth/register', { email, name, password: 'temp123' });
      const { token } = registerResponse.data;
      
      // Set the token for subsequent requests
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Then create the profile
      return await profileAPI.createProfile({ answers });
    },
    {
      onSuccess: () => {
        // Clear all cache and invalidate the profile cache
        queryClient.clear();
        queryClient.invalidateQueries('userProfile');
        toast.success('Profile created successfully!');
        // Longer delay to ensure cache is cleared and database is updated
        setTimeout(() => {
          navigate('/recommendations');
        }, 500);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create profile');
      }
    }
  );

  // Create profile mutation (for already logged in users)
  const createProfileMutation = useMutation(
    profileAPI.createProfile,
    {
      onSuccess: () => {
        console.log('Profile created successfully');
        // Clear all cache and invalidate the profile cache
        queryClient.clear();
        queryClient.invalidateQueries('userProfile');
        queryClient.removeQueries('userProfile'); // Force remove the query
        toast.success('Profile created successfully!');
        // Clean up pending answers
        localStorage.removeItem('pendingQuizAnswers');
        // Set the bypass flag and navigate with a small delay to ensure profile is created
        localStorage.setItem('profileJustCreated', 'true');
        setTimeout(() => {
          navigate('/recommendations');
        }, 100);
      },
      onError: (error) => {
        console.error('Profile creation failed:', error);
        toast.error(error.response?.data?.error || 'Failed to create profile');
      }
    }
  );

  // Check for pending quiz answers and auto-create profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    const pendingAnswers = localStorage.getItem('pendingQuizAnswers');
    
    console.log('Checking pending answers - token:', !!token, 'pendingAnswers:', !!pendingAnswers, 'profileData:', profileData, 'profileLoading:', profileLoading);
    
    if (token && pendingAnswers && !profileLoading && !profileData?.profile && profileError?.response?.status === 404) {
      console.log('Found pending quiz answers for logged in user with no profile, creating profile automatically');
      try {
        const parsedAnswers = JSON.parse(pendingAnswers);
        console.log('Auto-creating profile with pending answers:', parsedAnswers);
        createProfileMutation.mutate({ answers: parsedAnswers });
        localStorage.removeItem('pendingQuizAnswers'); // Clean up immediately
      } catch (error) {
        console.error('Error parsing pending answers or creating profile:', error);
        localStorage.removeItem('pendingQuizAnswers'); // Clean up invalid data
      }
    }
  }, [profileData, profileLoading, profileError, createProfileMutation]);



  // Early return if still loading
  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Loading your personalized experience..." />
          <div className="mt-4 text-sm text-gray-500">
            {isLoading ? 'Fetching onboarding questions...' : 'Checking your profile...'}
          </div>
        </div>
      </div>
    );
  }

  // If user already has a profile, show a message and redirect
  if (profileData?.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-perfume-500 to-perfume-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Already Exists</h2>
          <p className="text-gray-600 mb-6">You already have a fragrance profile. Redirecting to your recommendations...</p>
          <button
            onClick={() => navigate('/recommendations')}
            className="px-6 py-3 bg-perfume-600 text-white rounded-lg hover:bg-perfume-700"
          >
            View My Recommendations
          </button>
        </div>
      </div>
    );
  }

  // Show email form for account creation
  if (showEmailForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-perfume-500 to-perfume-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
            <p className="text-gray-600">Enter your details to save your fragrance profile</p>
            <p className="text-sm text-gray-500 mt-2">This will create a new account with your quiz answers</p>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            registerAndCreateProfileMutation.mutate({ email, name, answers });
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-perfume-500"
                placeholder="Your name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-perfume-500"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={registerAndCreateProfileMutation.isLoading}
                className="flex-1 px-4 py-2 bg-perfume-600 text-white rounded-md hover:bg-perfume-700 disabled:opacity-50"
              >
                {registerAndCreateProfileMutation.isLoading ? 'Creating...' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Early return if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Questions
          </h3>
          <p className="text-gray-600 mb-4">
            {error.message || 'Something went wrong while loading the questions.'}
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleRefresh} 
              className="btn-primary w-full"
            >
              Refresh Questions
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-secondary w-full"
            >
              Hard Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Extract questions data safely - Axios wraps response in data property
  const questions = questionsData?.data?.questions || {};
  const questionKeys = Object.keys(questions);
  const currentQuestionKey = questionKeys[currentStep];
  const currentQuestion = questions[currentQuestionKey];

  // Debug logging
  console.log('questionsData:', questionsData);
  console.log('questionsData.data:', questionsData?.data);
  console.log('questions:', questions);
  console.log('questionKeys:', questionKeys);
  console.log('currentStep:', currentStep);
  console.log('Raw questionsData:', JSON.stringify(questionsData, null, 2));
  console.log('currentQuestionKey:', currentQuestionKey);
  console.log('currentQuestion:', currentQuestion);

  // Safety check for when questions are not loaded
  if (!questionsData || !questions || questionKeys.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-perfume-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Questions Available
          </h3>
          <p className="text-gray-600">
            Unable to load the onboarding questions.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Debug: questionsData={!!questionsData}, questions={!!questions}, keys={questionKeys.length}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary mt-4"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Add safety check for current question
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Question Not Found
          </h3>
          <p className="text-gray-600">
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  const handleAnswer = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionKey]: value
    }));
  };

  const handleNext = async () => {
    if (currentStep < questionKeys.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step - check if user is logged in
      const token = localStorage.getItem('token');
      console.log('=== HANDLE NEXT FINAL STEP ===');
      console.log('Token exists:', !!token);
      console.log('User object:', user);
      console.log('ProfileData:', profileData);
      console.log('ProfileError:', profileError);
      console.log('ProfileLoading:', profileLoading);
      
      if (!token) {
        // User not logged in - show email form for registration
        console.log('No token found, showing email form');
        setShowEmailForm(true);
        return;
      }
      
      // User is logged in - save answers to localStorage and try to create profile
      console.log('User is logged in, saving answers and creating profile');
      localStorage.setItem('pendingQuizAnswers', JSON.stringify(answers));
      
      // Try to create profile immediately
      try {
        console.log('Creating profile with answers:', answers);
        createProfileMutation.mutate({ answers });
      } catch (error) {
        console.error('Error creating profile:', error);
        // If profile creation fails, navigate anyway - ProfileCheck will handle it
        navigate('/recommendations');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isMultiSelect = currentQuestion?.type === 'multi_select';
  const currentAnswer = answers[currentQuestionKey] || (isMultiSelect ? [] : '');

  const renderQuestion = () => {
    if (!currentQuestion || !currentQuestion.type) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">Question not available</p>
        </div>
      );
    }
    
    switch (currentQuestion.type) {
      case 'multi_select':
        return (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label
                key={option.value}
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  currentAnswer.includes(option.value)
                    ? 'border-perfume-500 bg-perfume-50'
                    : 'border-gray-200 hover:border-perfume-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={currentAnswer.includes(option.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleAnswer([...currentAnswer, option.value]);
                    } else {
                      handleAnswer(currentAnswer.filter(v => v !== option.value));
                    }
                  }}
                  className="mt-1 w-4 h-4 text-perfume-600 border-gray-300 rounded focus:ring-perfume-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        );

      case 'single_select':
        return (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label
                key={option.value}
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  currentAnswer === option.value
                    ? 'border-perfume-500 bg-perfume-50'
                    : 'border-gray-200 hover:border-perfume-300'
                }`}
              >
                <input
                  type="radio"
                  name={currentQuestionKey}
                  value={option.value}
                  checked={currentAnswer === option.value}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="mt-1 w-4 h-4 text-perfume-600 border-gray-300 focus:ring-perfume-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    if (isMultiSelect) {
      return currentAnswer.length > 0;
    }
    return currentAnswer !== '';
  };

  const progress = ((currentStep + 1) / questionKeys.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-perfume-50 via-white to-rose-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-8 h-8 text-perfume-600" />
            <h1 className="text-3xl font-elegant font-bold text-gradient">
              Discover Your Scent
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {user ? 'Let\'s update your personalized fragrance profile' : 'Let\'s create your personalized fragrance profile'}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep + 1} of {questionKeys.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-perfume-500 to-rose-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-perfume p-8"
        >
          <h2 className="text-2xl font-elegant font-semibold text-gray-900 mb-6">
            {currentQuestion.question}
          </h2>

          {renderQuestion()}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-perfume-600 hover:bg-perfume-50'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed() || (registerAndCreateProfileMutation.isLoading || createProfileMutation.isLoading) || profileLoading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                canProceed() && !(registerAndCreateProfileMutation.isLoading || createProfileMutation.isLoading || profileLoading)
                  ? 'btn-primary'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>
                {currentStep === questionKeys.length - 1
                  ? profileLoading
                    ? 'Checking Profile...'
                    : (registerAndCreateProfileMutation.isLoading || createProfileMutation.isLoading)
                      ? 'Creating Profile...'
                      : user ? 'See Recommendations' : 'Create Profile'
                  : 'Next'
                }
              </span>
              {currentStep < questionKeys.length - 1 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>

        {/* Skip Option */}
        {currentStep === 0 && (
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/recommendations')}
              className="text-gray-500 hover:text-perfume-600 text-sm font-medium"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
