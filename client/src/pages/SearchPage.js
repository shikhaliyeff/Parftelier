import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Heart } from 'lucide-react';
import { perfumesAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get brands and families for filters
  const { data: brandsData } = useQuery('brands', perfumesAPI.getBrands);
  const { data: familiesData } = useQuery('families', perfumesAPI.getFamilies);

  // Search perfumes
  const { data: searchData, isLoading } = useQuery(
    ['perfumes', debouncedSearchTerm, selectedBrand, selectedFamily, selectedGender, sortBy, sortOrder],
    () => perfumesAPI.search({
      q: debouncedSearchTerm,
      brand: selectedBrand,
      family: selectedFamily,
      gender: selectedGender,
      sort: sortBy,
      order: sortOrder,
      limit: 20
    }),
    {
      enabled: true,
    }
  );

  const perfumes = searchData?.perfumes || [];
  const brands = brandsData?.brands || [];
  const families = familiesData?.families || [];

  const genders = [
    { value: '', label: 'All Genders' },
    { value: 'masculine', label: 'Masculine' },
    { value: 'feminine', label: 'Feminine' },
    { value: 'unisex', label: 'Unisex' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'brand', label: 'Brand' },
    { value: 'year', label: 'Year' },
    { value: 'family', label: 'Family' }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('');
    setSelectedFamily('');
    setSelectedGender('');
    setSortBy('name');
    setSortOrder('asc');
  };

  const hasActiveFilters = searchTerm || selectedBrand || selectedFamily || selectedGender;

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
            Discover Perfumes
          </h1>
          <p className="text-xl text-gray-600">
            Search and explore thousands of fragrances
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-perfume p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search perfumes by name, brand, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="input-field"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="input-field"
            >
              <option value="">All Families</option>
              {families.map(family => (
                <option key={family} value={family}>{family}</option>
              ))}
            </select>

            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="input-field"
            >
              {genders.map(gender => (
                <option key={gender.value} value={gender.value}>{gender.label}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="input-field"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {searchData?.pagination?.total || 0} results found
              </span>
              <button
                onClick={clearFilters}
                className="text-perfume-600 hover:text-perfume-700 text-sm font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Searching perfumes..." />
          </div>
        ) : perfumes.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {perfumes.map((perfume, index) => (
              <motion.div
                key={perfume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card p-6"
              >
                {/* Perfume Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
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
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < 4 ? 'text-amber-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">4.2</span>
                </div>

                {/* Notes Preview */}
                {perfume.notes && perfume.notes.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {perfume.notes.slice(0, 3).map((note, idx) => (
                        <span
                          key={idx}
                          className={`note-tag ${note.category || ''}`}
                        >
                          {note.name}
                        </span>
                      ))}
                      {perfume.notes.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{perfume.notes.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link
                    to={`/perfume/${perfume.id}`}
                    className="flex-1 btn-primary text-sm py-2 text-center"
                  >
                    View Details
                  </Link>
                  <button className="px-3 py-2 bg-perfume-100 text-perfume-700 rounded-lg hover:bg-perfume-200 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
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
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No perfumes found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {searchData?.pagination && searchData.pagination.has_more && (
          <div className="mt-8 text-center">
            <button className="btn-secondary">
              Load More Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
