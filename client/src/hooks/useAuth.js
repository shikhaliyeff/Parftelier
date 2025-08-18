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
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // Get current user
  const { data: currentUser, isLoading: userLoading } = useQuery(
    'currentUser',
    async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const response = await api.get('/auth/me');
      return response.data.user;
    },
    {
      enabled: !!localStorage.getItem('token'),
      retry: false,
      onSuccess: (data) => {
        setUser(data);
      },
      onError: () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      }
    }
  );

  // Login mutation
  const loginMutation = useMutation(
    async (credentials) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    {
      onSuccess: (data) => {
        localStorage.setItem('token', data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setUser(data.user);
        queryClient.invalidateQueries('currentUser');
        toast.success('Welcome back!');
        navigate('/');
      },
      onError: (error) => {
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
