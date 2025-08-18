import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  Sparkles, 
  Search, 
  Heart, 
  Star, 
  TrendingUp,
  Zap,
  Users,
  Award
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { perfumesAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const HomePage = () => {
  const { user } = useAuth();

  // Fetch popular perfumes for showcase
  const { data: popularPerfumes, isLoading } = useQuery(
    'popularPerfumes',
    () => perfumesAPI.getPopular({ limit: 6 })
  );

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Recommendations',
      description: 'Get personalized fragrance suggestions based on your unique preferences and style.',
      color: 'from-perfume-500 to-rose-500'
    },
    {
      icon: Search,
      title: 'Smart Discovery',
      description: 'Explore thousands of perfumes with advanced search and filtering options.',
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: Heart,
      title: 'My Shelf',
      description: 'Build your personal perfume collection with notes, ratings, and memories.',
      color: 'from-rose-500 to-pink-500'
    },
    {
      icon: TrendingUp,
      title: 'Adaptive Learning',
      description: 'Our AI learns from your feedback to provide better recommendations over time.',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const stats = [
    { icon: Users, label: 'Active Users', value: '10K+' },
    { icon: Award, label: 'Perfumes', value: '50K+' },
    { icon: Star, label: 'Reviews', value: '100K+' },
    { icon: Zap, label: 'AI Matches', value: '1M+' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-perfume-50 via-white to-rose-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-perfume-500 to-rose-500 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-elegant font-bold text-gradient mb-6">
                Discover Your Perfect Scent
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Let AI guide you to the perfect fragrance. Our intelligent recommendation system 
                learns your preferences to suggest perfumes that match your unique style and personality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/recommendations"
                  className="btn-primary text-lg px-8 py-4"
                >
                  Get Recommendations
                </Link>
                <Link
                  to="/search"
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Explore Perfumes
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-elegant font-bold text-gray-900 mb-4">
              Why Choose ScentSage?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of perfume discovery with our cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Perfumes Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-elegant font-bold text-gray-900 mb-4">
              Popular Perfumes
            </h2>
            <p className="text-xl text-gray-600">
              Discover what others are loving
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularPerfumes?.perfumes?.slice(0, 6).map((perfume, index) => (
                <motion.div
                  key={perfume.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {perfume.name}
                      </h3>
                      <p className="text-perfume-600 font-medium">
                        {perfume.brand}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="text-sm text-gray-600">4.5</span>
                    </div>
                  </div>
                  
                  {perfume.family && (
                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 bg-perfume-100 text-perfume-800 text-xs font-medium rounded-full">
                        {perfume.family}
                      </span>
                    </div>
                  )}
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {perfume.description || 'A sophisticated fragrance with distinctive character.'}
                  </p>
                  
                  <Link
                    to={`/perfume/${perfume.id}`}
                    className="btn-ghost w-full text-center"
                  >
                    View Details
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-perfume-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-perfume-500 to-rose-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-elegant font-bold text-white mb-6">
              Ready to Find Your Signature Scent?
            </h2>
            <p className="text-xl text-perfume-100 mb-8">
              Join thousands of users who have discovered their perfect fragrance with ScentSage
            </p>
            <Link
              to="/recommendations"
              className="inline-block bg-white text-perfume-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Your Journey
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
