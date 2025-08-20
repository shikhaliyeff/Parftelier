import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Components
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';
import ProfileCheck from './components/ProfileCheck';

// Pages
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import RecommendationsPage from './pages/RecommendationsPage';
import PerfumeDetailPage from './pages/PerfumeDetailPage';
import MyShelfPage from './pages/MyShelfPage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route Component
const ProtectedRoute = ({ children, requireOnboarding = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If onboarding is required and user doesn't have a profile, redirect to onboarding
  if (requireOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return children;
};

// Public Route Component (redirects to home if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return user ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <div className="App">
      <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <HomePage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          } />
          
          <Route path="/recommendations" element={
            <ProtectedRoute>
              <ProfileCheck>
                <Layout>
                  <RecommendationsPage />
                </Layout>
              </ProfileCheck>
            </ProtectedRoute>
          } />
          
          <Route path="/perfume/:id" element={
            <ProtectedRoute>
              <ProfileCheck>
                <Layout>
                  <PerfumeDetailPage />
                </Layout>
              </ProfileCheck>
            </ProtectedRoute>
          } />
          
          <Route path="/shelf" element={
            <ProtectedRoute>
              <ProfileCheck>
                <Layout>
                  <MyShelfPage />
                </Layout>
              </ProfileCheck>
            </ProtectedRoute>
          } />
          
          <Route path="/search" element={
            <ProtectedRoute>
              <ProfileCheck>
                <Layout>
                  <SearchPage />
                </Layout>
              </ProfileCheck>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfileCheck>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProfileCheck>
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />}           />
        </Routes>
    </div>
  );
}

export default App;
