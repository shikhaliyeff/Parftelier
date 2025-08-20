import { useState, useEffect, createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Check if user is logged in on mount
  useEffect(() => {
    console.log('🔐 useAuth: Component mounted, checking localStorage');
    const storedToken = localStorage.getItem('token');
    console.log('🔐 useAuth: Stored token exists:', !!storedToken);
    if (storedToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      console.log('🔐 useAuth: Token set in API headers');
    }
    setLoading(false);
    console.log('🔐 useAuth: Initial loading complete');
  }, []);

  // Get current user
  const { isLoading: userLoading } = useQuery(
    'currentUser',
    async () => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) return null;
      
      const response = await api.get('/auth/me');
      return response.data.user;
    },
    {
      enabled: !!localStorage.getItem('token'), // Check localStorage directly
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      onSuccess: (data) => {
        console.log('🔐 useAuth: Current user loaded:', data);
        setUser(data);
      },
      onError: (error) => {
        console.error('🔐 useAuth: Current user error:', error);
        // Only clear token on 401 errors, not other errors
        if (error.response?.status === 401) {
          console.log('🔐 useAuth: Token expired, clearing authentication');
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }
    }
  );

  // Login mutation
  const loginMutation = useMutation(
    async (credentials) => {
      console.log('🔐 useAuth: Starting login mutation with credentials:', credentials);
      const response = await api.post('/auth/login', credentials);
      console.log('🔐 useAuth: Login API response:', response.data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        console.log('🔐 useAuth: Login mutation success, data:', data);
        localStorage.setItem('token', data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setUser(data.user);
        queryClient.invalidateQueries('currentUser');
        toast.success('Welcome back!');
        console.log('🔐 useAuth: Navigating to home page');
        navigate('/');
      },
      onError: (error) => {
        console.error('🔐 useAuth: Login mutation error:', error);
        const message = error.response?.data?.error || 'Login failed';
        toast.error(message);
      }
    }
  );

  // Register mutation
  const registerMutation = useMutation(
    async (userData) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        localStorage.setItem('token', data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setUser(data.user);
        queryClient.invalidateQueries('currentUser');
        toast.success('Account created successfully!');
        navigate('/onboarding');
      },
      onError: (error) => {
        const message = error.response?.data?.error || 'Registration failed';
        toast.error(message);
      }
    }
  );

  // Logout function
  const logout = () => {
    console.log('🔐 useAuth: Logging out user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    queryClient.clear();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Change password mutation
  const changePasswordMutation = useMutation(
    async (passwords) => {
      const response = await api.post('/auth/change-password', passwords);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Password changed successfully');
      },
      onError: (error) => {
        const message = error.response?.data?.error || 'Failed to change password';
        toast.error(message);
      }
    }
  );

  const value = {
    user,
    loading: loading || userLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    changePassword: changePasswordMutation.mutate,
    isLoggingIn: loginMutation.isLoading,
    isRegistering: registerMutation.isLoading,
    isChangingPassword: changePasswordMutation.isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
