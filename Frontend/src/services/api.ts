import axios from 'axios';

// Debug the environment variable
const apiUrl = import.meta.env.VITE_API_URL || 'https://shadowshield-backend.onrender.com';
console.log('API URL from environment:', apiUrl);
console.log('Using API base URL for all requests:', apiUrl);

// Create an axios instance with base URL
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timeout to avoid hanging requests
  timeout: 10000,
});

// Add a request interceptor to include the token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log the request URL for debugging
    console.log(`API Request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    return api.post('/api/auth/login', credentials);
  },
  
  register: async (userData: { name: string; email: string; password: string }) => {
    return api.post('/api/auth/register', userData);
  },
  
  getProfile: async () => {
    // Change from '/auth/profile' to '/auth/me'
    return api.get('/api/auth/me');
  },
    logout: async () => {
    // Client-side logout (no server endpoint needed)
    return Promise.resolve({ data: { success: true } });
  },
    updateProfile: async (userData: { name?: string; email?: string }) => {
    return api.put('/api/auth/updatedetails', userData);
  }
};

// File API endpoints
export const fileAPI = {
  getFileInfo: async (fileId: string) => {
    return api.get(`/api/files/${fileId}`);
  },
  
  uploadFile: async (formData: FormData) => {
    return api.post('/api/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  downloadFileWithCode: async (accessCode: string, options = {}) => {
    console.log("API call: downloadFileWithCode", accessCode, options);
    return api.get(`/api/files/access/${accessCode}/download`, {
      ...options,
      responseType: 'blob',
    });
  },
    verifyFile: async (formData: FormData) => {
    return api.post('/api/files/verify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  getFiles: async () => {
    return api.get('/api/files');
  },
  
  deleteFile: async (fileId: string) => {
    return api.delete(`/api/files/${fileId}`);
  },
  
  getFileInfoByCode: async (accessCode: string) => {
    console.log(`Getting file info for code: ${accessCode}`);
    return api.get(`/api/files/access/${accessCode}/info`);
  }
};

// Security API endpoints
export const securityAPI = {
  getSecurityEvents: async (page: number = 1) => {
    return api.get(`/api/security?page=${page}`);
  },
  generateDemoEvents: async () => {
    return api.post('/api/security/generate-demo');
  }
};

// Activity API endpoints
export const activityAPI = {
  getActivities: async (page: number = 1) => {
    return api.get(`/api/activities?page=${page}`);
  },
  
  getRecentActivities: async (limit: number = 5) => {
    return api.get(`/api/activities/recent?limit=${limit}`);
  },
  
  getActivitySummary: async () => {
    return api.get('/api/activities/summary');
  }
};

// Message API endpoints
export const messageAPI = {
  sendMessage: async (messageData: {
    recipients: string[];
    subject: string;
    content: string;
    classification?: string;
    selfDestruct?: boolean;
    priority?: string;
  }) => {
    return api.post('/api/messages', messageData);
  },
  
  getMessages: async (type: 'inbox' | 'sent' = 'inbox') => {
    return api.get(`/api/messages?type=${type}`);
  },
  
  getMessage: async (id: string) => {
    return api.get(`/api/messages/${id}`);
  },
  
  deleteMessage: async (id: string) => {
    return api.delete(`/api/messages/${id}`);
  }
};

// Export the API instance
export default api;