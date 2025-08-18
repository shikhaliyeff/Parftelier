import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { Heart, Star, Filter, RefreshCw } from 'lucide-react';
import { recommendationsAPI, shelfAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const RecommendationsPage = () => {
  const [context, setContext] = useState('');
  const queryClient = useQueryClient();

  // Get recommendations
  const { data: recommendations, isLoading, refetch, error } = useQuery(
    ['recommendations', context],
    () => recommendationsAPI.getRecommendations({ context, limit: 10 }),
    {
      enabled: false, // Don't auto-fetch, user needs to trigger
      onError: (error) => {
        if (error.response?.status === 404 && error.response?.data?.error?.includes('profile not found')) {
          // Redirect to onboarding if profile not found
          window.location.href = '/onboarding';
        }
      }
    }
  );

  // Add to shelf mutation
  const addToShelfMutation = useMutation(
    shelfAPI.addToShelf,
    {
      onSuccess: () => {
        toast.success('Added to your shelf!');
        queryClient.invalidateQueries('shelf');
      },
      onError: () => {
        toast.error('Failed to add to shelf');
      }
    }
  );

  // Submit feedback mutation
  const feedbackMutation = useMutation(
    recommendationsAPI.submitFeedback,
    {
      onSuccess: () => {
        toast.success('Feedback recorded!');
      },
      onError: () => {
        toast.error('Failed to record feedback');
      }
    }
  );

  const handleGetRecommendations = () => {
    refetch();
  };

  const handleAddToShelf = (perfume) => {
    addToShelfMutation.mutate({
      perfume_id: perfume.id,
      rating: 5,
      notes: 'Added from recommendations'
    });
  };

  const handleFeedback = (perfume, feedbackType) => {
    if (recommendations?.session_id) {
      feedbackMutation.mutate({
        session_id: recommendations.session_id,
        perfume_id: perfume.id,
        feedback_type: feedbackType,
        rating: feedbackType === 'like' ? 5 : 2
      });
    }
  };

  const contexts = [
    { value: '', label: 'All Contexts' },
    { value: 'office', label: 'Office/Work' },
    { value: 'evening', label: 'Evening/Date' },
    { value: 'summer', label: 'Summer' },
    { value: 'winter', label: 'Winter' },
    { value: 'casual', label: 'Casual' }
  ];

  // Show onboarding prompt if no profile
  if (error?.response?.status === 404 && error.response?.data?.error?.includes('profile not found')) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-perfume-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-elegant font-bold text-gray-900 mb-4">
              Complete Your Profile First
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              To get personalized recommendations, please complete the onboarding quiz.
            </p>
            <button
              onClick={() => window.location.href = '/onboarding'}
              className="btn-primary text-lg px-8 py-3"
            >
              Start Onboarding Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-elegant font-bold text-gradient mb-4">
            Your Personalized Recommendations
          </h1>
          <p className="text-xl text-gray-600">
            Discover perfumes tailored to your unique preferences
          </p>
        </motion.div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-perfume p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Context:</label>
            </div>
            <select
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="input-field max-w-xs"
            >
              {contexts.map((ctx) => (
                <option key={ctx.value} value={ctx.value}>
                  {ctx.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleGetRecommendations}
              disabled={isLoading}
              className="btn-primary flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Getting Recommendations...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Get Recommendations</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recommendations */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Finding your perfect matches..." />
          </div>
        )}

        {recommendations?.recommendations && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {recommendations.recommendations.map((perfume, index) => (
              <motion.div
                key={perfume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                {/* Perfume Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {perfume.name}
                  </h3>
                  <p className="text-perfume-600 font-medium mb-2">
                    {perfume.brand}
                  </p>
                  {perfume.family && (
                    <span className="inline-block px-2 py-1 bg-perfume-100 text-perfume-800 text-xs font-medium rounded-full mb-3">
                      {perfume.family}
                    </span>
                  )}
                </div>

                {/* Score */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="text-sm font-medium">
                      {Math.round(perfume.score * 100)}% Match
                    </span>
                  </div>
                </div>

                {/* AI Explanation */}
                {perfume.explanation && (
                  <p className="text-gray-600 text-sm mb-4 italic">
                    "{perfume.explanation}"
                  </p>
                )}

                {/* Notes */}
                {perfume.notes && perfume.notes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Key Notes:</h4>
                    <div className="flex flex-wrap gap-1">
                      {perfume.notes.slice(0, 3).map((note, idx) => (
                        <span
                          key={idx}
                          className={`note-tag ${note.category || ''}`}
                        >
                          {note.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToShelf(perfume)}
                    disabled={addToShelfMutation.isLoading}
                    className="flex-1 btn-primary text-sm py-2"
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    Add to Shelf
                  </button>
                  <button
                    onClick={() => handleFeedback(perfume, 'like')}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => handleFeedback(perfume, 'dislike')}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    👎
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !recommendations?.recommendations && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-perfume-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready for Recommendations?
              </h3>
              <p className="text-gray-600 mb-6">
                Click the button above to get your personalized perfume recommendations based on your preferences.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
