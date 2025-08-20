import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Star, Clock, Wind } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import { shelfAPI } from '../services/api';
import { getFamilySpecificPerfumeImage, getPerfumeGradient } from '../utils/perfumeImages';
import toast from 'react-hot-toast';

const PerfumeDetailModal = ({ perfume, isOpen, onClose }) => {
  const queryClient = useQueryClient();

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
      perfume_id: perfume.id,
      rating: 5,
      notes: 'Added from recommendations'
    });
  };

  if (!perfume) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-200">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              <h2 className="text-2xl font-elegant font-bold text-gray-900 pr-8">
                {perfume.name}
              </h2>
              <p className="text-perfume-600 font-medium text-lg">
                {perfume.brand}
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Image and Basic Info */}
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Perfume Image */}
                <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden">
                  <img
                    src={getFamilySpecificPerfumeImage(perfume)}
                    alt={`${perfume.name} by ${perfume.brand}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to gradient background if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    className={`w-full h-full bg-gradient-to-br ${getPerfumeGradient(perfume)} flex items-center justify-center hidden`}
                    style={{ display: 'none' }}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm text-white font-medium">{perfume.brand}</p>
                      <p className="text-xs text-white opacity-80">{perfume.name}</p>
                    </div>
                  </div>
                </div>

                {/* Basic Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    {perfume.family && (
                      <span className="inline-block px-3 py-1 bg-perfume-100 text-perfume-800 text-sm font-medium rounded-full">
                        {perfume.family}
                      </span>
                    )}
                    {perfume.gender && (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                        {perfume.gender}
                      </span>
                    )}
                  </div>

                  {/* Match Score */}
                  <div className="flex items-center space-x-2 mb-4">
                    <Star className="w-5 h-5 text-amber-400 fill-current" />
                    <span className="text-lg font-semibold">
                      {Math.round(perfume.score * 100)}% Match
                    </span>
                  </div>

                  {/* Performance */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{perfume.longevity}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wind className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{perfume.sillage}</span>
                    </div>
                  </div>

                  {/* Year and Concentration */}
                  <div className="text-sm text-gray-600 space-y-1">
                    {perfume.year && <p>Released: {perfume.year}</p>}
                    {perfume.concentration && <p>Concentration: {perfume.concentration}</p>}
                    {perfume.perfumer && <p>Perfumer: {perfume.perfumer}</p>}
                  </div>
                </div>
              </div>

              {/* Description */}
              {perfume.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{perfume.description}</p>
                </div>
              )}

              {/* AI Explanation */}
              {perfume.explanation && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Why This Matches You</h3>
                  <div className="bg-perfume-50 border border-perfume-200 rounded-lg p-4">
                    <p className="text-gray-700 italic leading-relaxed">"{perfume.explanation}"</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {perfume.notes && perfume.notes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Fragrance Notes</h3>
                  <div className="space-y-3">
                    {['top', 'middle', 'base'].map((category) => {
                      const categoryNotes = perfume.notes.filter(note => note.category === category);
                      if (categoryNotes.length === 0) return null;
                      
                      return (
                        <div key={category}>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                            {category} Notes
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {categoryNotes.map((note, idx) => (
                              <span
                                key={idx}
                                className={`note-tag ${note.category || ''}`}
                              >
                                {note.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleAddToShelf}
                  disabled={addToShelfMutation.isLoading}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  <Heart className="w-4 h-4" />
                  <span>{addToShelfMutation.isLoading ? 'Adding...' : 'Add to Shelf'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PerfumeDetailModal;
