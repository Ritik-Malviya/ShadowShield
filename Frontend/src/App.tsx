import { Suspense, useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import DashboardContent from "./components/dashboard/DashboardContent";
import FileUploadModal from "./components/files/FileUploadModal";
import MessageComposer from "./components/messages/MessageComposer";
import FileAccessPage from "./components/files/FileAccessPage";
import AISecurityLog from "./components/security/AISecurityLog";
import UserProfile from './components/user/UserProfile';
import Layout from "./components/layout/Layout";
import Navbar from "./components/layout/Navbar";
// Import only Lucide icons
import { Shield, LogOut, User, Settings as SettingsIcon, Key, UserCircle2 } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import FileDashboard from "./components/files/FileDashboard";

// Update the SettingsPage component 
const SettingsPage = () => {
  const { sessionId, user, token } = useAuth();
  const [showDebug, setShowDebug] = useState(false);
  const [storedUsers, setStoredUsers] = useState<any[]>([]);
  
  // Function to load and display stored users
  const loadStoredUsers = () => {
    try {
      const usersData = localStorage.getItem('mock_users');
      if (usersData) {
        setStoredUsers(JSON.parse(usersData));
      } else {
        setStoredUsers([]);
      }
    } catch (error) {
      console.error('Error loading stored users:', error);
    }
  };
  
  // Load stored users when debug panel is opened
  useEffect(() => {
    if (showDebug) {
      loadStoredUsers();
    }
  }, [showDebug]);
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl text-yellow-500 font-bold mb-6">Settings</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-lg text-white mb-2">Account Settings</h2>
          <p className="text-gray-400">Manage your account preferences (under development)</p>
        </div>
        
        <div className="mt-6 p-4 bg-gray-800 rounded-md">
          <h3 className="text-md text-yellow-400 mb-2">Session Information</h3>
          {sessionId ? (
            <div>
              <div className="text-sm text-white mb-2">
                Your current session is active and secure.
              </div>
              <div className="p-3 bg-gray-900 rounded border border-gray-700">
                <div className="text-xs text-yellow-500 mb-1 flex items-center">
                  <Key className="h-3 w-3 mr-1" />
                  Session Identifier
                </div>
                <div className="font-mono text-sm text-white break-all">
                  {sessionId}
                </div>
              </div>
              
              {user && (
                <div className="mt-4 p-3 bg-gray-900 rounded border border-gray-700">
                  <div className="text-xs text-yellow-500 mb-1 flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    User Information
                  </div>
                  <div className="text-sm text-white">
                    <div><span className="text-gray-400">ID:</span> {user.id}</div>
                    <div><span className="text-gray-400">Name:</span> {user.name}</div>
                    <div><span className="text-gray-400">Email:</span> {user.email}</div>
                    <div><span className="text-gray-400">Role:</span> {user.role}</div>
                    <div><span className="text-gray-400">Clearance:</span> {user.clearanceLevel}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-amber-400">
              No active session detected. Try logging out and back in.
            </div>
          )}
        </div>
        
        {/* Debug section - only for development */}
        <div className="mt-6">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs px-3 py-1 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300 rounded-full"
          >
            {showDebug ? "Hide" : "Show"} Debug Info
          </button>
          
          {showDebug && (
            <div className="mt-4 p-4 bg-gray-800 rounded-md border border-gray-700">
              <h3 className="text-sm text-red-400 mb-3">Debug Information (Development Only)</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-gray-400 mb-1">Local Storage</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-gray-900 rounded">
                      <span className="text-gray-500">Token:</span> 
                      <span className="text-gray-300 break-all">{localStorage.getItem('token') || 'Not set'}</span>
                    </div>
                    <div className="p-2 bg-gray-900 rounded">
                      <span className="text-gray-500">User ID:</span> 
                      <span className="text-gray-300">{localStorage.getItem('userId') || 'Not set'}</span>
                    </div>
                    <div className="p-2 bg-gray-900 rounded">
                      <span className="text-gray-500">Session ID:</span> 
                      <span className="text-gray-300">{localStorage.getItem('sessionId') || 'Not set'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs text-gray-400 mb-1">Registered Users ({storedUsers.length})</h4>
                  <div className="max-h-60 overflow-y-auto">
                    {storedUsers.map((storedUser) => (
                      <div key={storedUser.id} className="p-2 mb-2 bg-gray-900 rounded text-xs">
                        <div><span className="text-gray-500">ID:</span> <span className="text-gray-300">{storedUser.id}</span></div>
                        <div><span className="text-gray-500">Name:</span> <span className="text-gray-300">{storedUser.name}</span></div>
                        <div><span className="text-gray-500">Email:</span> <span className="text-gray-300">{storedUser.email}</span></div>
                        <div><span className="text-gray-500">Password:</span> <span className="text-gray-300">{storedUser.password}</span></div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={loadStoredUsers}
                    className="mt-2 text-xs px-2 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded"
                  >
                    Refresh User List
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-4">
    <Shield className="h-12 w-12 text-red-500 mb-4" />
    <h1 className="text-2xl text-yellow-500 font-bold mb-2">404 - Not Found</h1>
    <p className="text-gray-400 mb-6">The resource you requested does not exist</p>
    <button 
      className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
      onClick={() => window.history.back()}
    >
      Go Back
    </button>
  </div>
);

// Update the ProtectedRoute component to use Layout
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center">
          <Shield className="h-12 w-12 text-yellow-500 mb-4 animate-pulse" />
          <p className="text-gray-400">Loading secure environment...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
          <Shield className="h-12 w-12 text-yellow-500 animate-pulse" />
        </div>
      }>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/access/:accessId" element={<FileAccessPage />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardContent />} />
            <Route path="/files" element={<FileDashboard />} />
            <Route path="/messages" element={<MessageComposer isOpen={true} onClose={() => {}} />} />
            <Route path="/security-log" element={<AISecurityLog />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<UserProfile />} />
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
          
          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
