import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'react-query';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { profileAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  // Fetch onboarding questions
  const { data: questionsData, isLoading } = useQuery(
    'onboardingQuestions',
    profileAPI.getOnboardingQuestions
  );

  // Create profile mutation
  const createProfileMutation = useMutation(
    profileAPI.createProfile,
    {
      onSuccess: () => {
        toast.success('Profile created successfully!');
        navigate('/recommendations');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create profile');
      }
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your personalized experience..." />
      </div>
    );
  }

  const questions = questionsData?.questions || {};
  const questionKeys = Object.keys(questions);
  const currentQuestionKey = questionKeys[currentStep];
  const currentQuestion = questions[currentQuestionKey];

  const handleAnswer = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionKey]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < questionKeys.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit profile
      createProfileMutation.mutate({ answers });
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
            Let's create your personalized fragrance profile
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
              disabled={!canProceed() || createProfileMutation.isLoading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                canProceed() && !createProfileMutation.isLoading
                  ? 'btn-primary'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>
                {currentStep === questionKeys.length - 1
                  ? createProfileMutation.isLoading
                    ? 'Creating Profile...'
                    : 'Create Profile'
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
