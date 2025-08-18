import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { Heart, Star, Search, Filter, Trash2, Edit3, Plus } from 'lucide-react';
import { shelfAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const MyShelfPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const queryClient = useQueryClient();

  // Get saved perfumes
  const { data: shelfData, isLoading } = useQuery(
    'shelf',
    () => shelfAPI.getSavedPerfumes({ limit: 50 })
  );

  // Get shelf statistics
  const { data: statsData } = useQuery(
    'shelfStats',
    shelfAPI.getStats
  );

  // Remove from shelf mutation
  const removeMutation = useMutation(
    shelfAPI.removeFromShelf,
    {
      onSuccess: () => {
        toast.success('Removed from shelf');
        queryClient.invalidateQueries('shelf');
        queryClient.invalidateQueries('shelfStats');
      },
      onError: () => {
        toast.error('Failed to remove from shelf');
      }
    }
  );

  const handleRemoveFromShelf = (shelfId) => {
    if (window.confirm('Are you sure you want to remove this perfume from your shelf?')) {
      removeMutation.mutate(shelfId);
    }
  };

  const savedPerfumes = shelfData?.saved_perfumes || [];
  const stats = statsData?.stats || {};

  // Filter perfumes
  const filteredPerfumes = savedPerfumes.filter(perfume => {
    const matchesSearch = perfume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         perfume.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFamily = !selectedFamily || perfume.family === selectedFamily;
    const matchesRating = !selectedRating || perfume.rating === parseInt(selectedRating);
    
    return matchesSearch && matchesFamily && matchesRating;
  });

  const families = [...new Set(savedPerfumes.map(p => p.family).filter(Boolean))];
  const ratings = [5, 4, 3, 2, 1];

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
            My Shelf
          </h1>
          <p className="text-xl text-gray-600">
            Your personal perfume collection
          </p>
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-xl shadow-perfume p-6 text-center">
              <div className="text-3xl font-bold text-perfume-600 mb-2">
                {stats.total_perfumes || 0}
              </div>
              <div className="text-gray-600">Total Perfumes</div>
            </div>
            <div className="bg-white rounded-xl shadow-perfume p-6 text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">
                {stats.average_rating ? Math.round(stats.average_rating * 10) / 10 : 0}
              </div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="bg-white rounded-xl shadow-perfume p-6 text-center">
              <div className="text-3xl font-bold text-rose-600 mb-2">
                {stats.top_brands?.length || 0}
              </div>
              <div className="text-gray-600">Favorite Brands</div>
            </div>
            <div className="bg-white rounded-xl shadow-perfume p-6 text-center">
              <div className="text-3xl font-bold text-gold-600 mb-2">
                {stats.top_families?.length || 0}
              </div>
              <div className="text-gray-600">Scent Families</div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-perfume p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search your shelf..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="input-field max-w-xs"
            >
              <option value="">All Families</option>
              {families.map(family => (
                <option key={family} value={family}>{family}</option>
              ))}
            </select>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="input-field max-w-xs"
            >
              <option value="">All Ratings</option>
              {ratings.map(rating => (
                <option key={rating} value={rating}>{rating} Stars</option>
              ))}
            </select>
          </div>
        </div>

        {/* Perfumes Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading your shelf..." />
          </div>
        ) : filteredPerfumes.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPerfumes.map((perfume, index) => (
              <motion.div
                key={perfume.shelf_id}
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

                {/* Rating */}
                {perfume.rating && (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < perfume.rating ? 'text-amber-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {perfume.rating}/5
                    </span>
                  </div>
                )}

                {/* Notes */}
                {perfume.user_notes && (
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm italic">
                      "{perfume.user_notes}"
                    </p>
                  </div>
                )}

                {/* Tags */}
                {perfume.tags && perfume.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {perfume.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="flex-1 btn-ghost text-sm py-2">
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemoveFromShelf(perfume.shelf_id)}
                    disabled={removeMutation.isLoading}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Added Date */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Added {new Date(perfume.saved_at).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-perfume-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Your shelf is empty
              </h3>
              <p className="text-gray-600 mb-6">
                Start building your perfume collection by adding perfumes from recommendations or search.
              </p>
              <div className="flex space-x-4 justify-center">
                <button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Get Recommendations
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyShelfPage;
