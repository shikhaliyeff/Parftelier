import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { Heart, Star, ArrowLeft, Share2, Calendar, User } from 'lucide-react';
import { perfumesAPI, shelfAPI, recommendationsAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const PerfumeDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  // Get perfume details
  const { data: perfumeData, isLoading, error } = useQuery(
    ['perfume', id],
    () => perfumesAPI.getById(id)
  );

  // Get similar perfumes
  const { data: similarPerfumes } = useQuery(
    ['similarPerfumes', id],
    () => recommendationsAPI.getSimilarPerfumes(id, { limit: 3 }),
    {
      enabled: !!id,
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

  const handleAddToShelf = () => {
    addToShelfMutation.mutate({
      perfume_id: parseInt(id),
      rating: 5,
      notes: 'Added from perfume details'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading perfume details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Perfume Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The perfume you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/search" className="btn-primary">
            Browse Perfumes
          </Link>
        </div>
      </div>
    );
  }

  const perfume = perfumeData?.perfume;

  if (!perfume) {
    return null;
  }

  const notesByCategory = {
    top: perfume.notes?.filter(note => note.category === 'top') || [],
    middle: perfume.notes?.filter(note => note.category === 'middle') || [],
    base: perfume.notes?.filter(note => note.category === 'base') || []
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            to="/search"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-perfume-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Search</span>
          </Link>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-perfume overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-elegant font-bold text-gray-900 mb-2">
                  {perfume.name}
                </h1>
                <p className="text-xl text-perfume-600 font-medium mb-4">
                  {perfume.brand}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  {perfume.year && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{perfume.year}</span>
                    </div>
                  )}
                  {perfume.perfumer && (
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{perfume.perfumer}</span>
                    </div>
                  )}
                  {perfume.family && (
                    <span className="inline-block px-3 py-1 bg-perfume-100 text-perfume-800 rounded-full font-medium">
                      {perfume.family}
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < 4 ? 'text-amber-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">4.2 (128 reviews)</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-4 md:mt-0">
                <button
                  onClick={handleAddToShelf}
                  disabled={addToShelfMutation.isLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Heart className="w-4 h-4" />
                  <span>Add to Shelf</span>
                </button>
                <button className="btn-secondary flex items-center space-x-2">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          {perfume.description && (
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {perfume.description}
              </p>
            </div>
          )}

          {/* Notes */}
          {perfume.notes && perfume.notes.length > 0 && (
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Fragrance Notes
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(notesByCategory).map(([category, notes]) => (
                  <div key={category}>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 capitalize">
                      {category} Notes
                    </h3>
                    <div className="space-y-2">
                      {notes.map((note, idx) => (
                        <span
                          key={idx}
                          className={`note-tag ${category}`}
                        >
                          {note.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance */}
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Performance
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {perfume.longevity && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Longevity
                  </h3>
                  <p className="text-gray-700">{perfume.longevity}</p>
                </div>
              )}
              {perfume.sillage && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sillage
                  </h3>
                  <p className="text-gray-700">{perfume.sillage}</p>
                </div>
              )}
            </div>
          </div>

          {/* Similar Perfumes */}
          {similarPerfumes?.similar_perfumes && similarPerfumes.similar_perfumes.length > 0 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Similar Perfumes
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {similarPerfumes.similar_perfumes.map((similarPerfume) => (
                  <Link
                    key={similarPerfume.id}
                    to={`/perfume/${similarPerfume.id}`}
                    className="block card p-4 hover:shadow-perfume-lg transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {similarPerfume.name}
                    </h3>
                    <p className="text-perfume-600 text-sm mb-2">
                      {similarPerfume.brand}
                    </p>
                    {similarPerfume.family && (
                      <span className="inline-block px-2 py-1 bg-perfume-100 text-perfume-800 text-xs rounded-full">
                        {similarPerfume.family}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PerfumeDetailPage;
