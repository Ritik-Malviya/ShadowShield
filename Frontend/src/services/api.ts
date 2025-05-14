import axios from 'axios';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    return api.post('/auth/login', credentials);
  },
  
  register: async (userData: { name: string; email: string; password: string }) => {
    return api.post('/auth/register', userData);
  },
  
  getProfile: async () => {
    // Change from '/auth/profile' to '/auth/me'
    return api.get('/auth/me');
  },
  
  logout: async () => {
    // Client-side logout (no server endpoint needed)
    return Promise.resolve({ data: { success: true } });
  },
    updateProfile: async (userData: { name?: string; email?: string }) => {
    return api.put('/auth/updatedetails', userData);
  }
};

// File API endpoints
export const fileAPI = {
  getFileInfo: async (fileId: string) => {
    return api.get(`/files/${fileId}`);
  },
  
  uploadFile: async (formData: FormData) => {
    return api.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  downloadFileWithCode: async (accessCode: string, options = {}) => {
    console.log("API call: downloadFileWithCode", accessCode, options);
    return api.get(`/files/access/${accessCode}/download`, {
      ...options,
      responseType: 'blob',
    });
  },
  
  verifyFile: async (formData: FormData) => {
    return api.post('/files/verify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  getFiles: async () => {
    return api.get('/files');
  },
  
  deleteFile: async (fileId: string) => {
    return api.delete(`/files/${fileId}`);
  },
  
  getFileInfoByCode: async (accessCode: string) => {
    console.log(`Getting file info for code: ${accessCode}`);
    return api.get(`/files/access/${accessCode}/info`);
  }
};

// Security API endpoints
export const securityAPI = {
  getSecurityEvents: async (page: number = 1) => {
    return api.get(`/security?page=${page}`);
  },
  generateDemoEvents: async () => {
    return api.post('/security/generate-demo');
  }
};

// Activity API endpoints
export const activityAPI = {
  getActivities: async (page: number = 1) => {
    return api.get(`/activities?page=${page}`);
  },
  
  getRecentActivities: async (limit: number = 5) => {
    return api.get(`/activities/recent?limit=${limit}`);
  },
  
  getActivitySummary: async () => {
    return api.get('/activities/summary');
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
    return api.post('/messages', messageData);
  },
  
  getMessages: async (type: 'inbox' | 'sent' = 'inbox') => {
    return api.get(`/messages?type=${type}`);
  },
  
  getMessage: async (id: string) => {
    return api.get(`/messages/${id}`);
  },
  
  deleteMessage: async (id: string) => {
    return api.delete(`/messages/${id}`);
  }
};

// Export the API instance
export default api;