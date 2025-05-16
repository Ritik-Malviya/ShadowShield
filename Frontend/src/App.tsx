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
import axios from 'axios';
// Import only Lucide icons
import { 
  Shield, 
  LogOut, 
  User, 
  Settings as SettingsIcon, 
  Key, 
  UserCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw 
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import FileDashboard from "./components/files/FileDashboard";
import EnhancedConnectionMonitor from "./components/debug/ConnectionStatusChecker";

// IMPORTANT: Hardcoded production URL to solve connection issues
const PRODUCTION_API_URL = 'https://shadowshield-backend.onrender.com';

// Simpler API Connection Status Checker Component for legacy code
const ConnectionStatusChecker = () => {
  // Skip implementation as we now use the enhanced version
  return null;
};

// Update the SettingsPage component with improved UI
const SettingsPage = () => {
  const { sessionId, user, token } = useAuth();
  const [showDebug, setShowDebug] = useState(false);
  const [storedUsers, setStoredUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("account");
  
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
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-yellow-500 font-bold">Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your security preferences and account information</p>
        </div>
        
        {user && (
          <div className="flex items-center bg-gray-800/60 p-2 rounded-lg">
            <div className="bg-gradient-to-r from-yellow-600 to-red-600 rounded-full h-10 w-10 flex items-center justify-center text-white font-semibold mr-3">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-white">{user.name}</div>
              <div className="flex items-center text-xs text-gray-400">
                <span className="inline-flex items-center mr-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></span>
                  Active
                </span>
                <span className="inline-block px-1.5 py-0.5 bg-yellow-900/40 text-yellow-500 rounded text-[10px]">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar with navigation tabs */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-gray-800/50 border-b border-gray-800">
              <h3 className="text-sm font-medium text-white">Settings Menu</h3>
            </div>
            <div className="p-2">
              <button 
                onClick={() => setActiveTab("account")}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  activeTab === "account" 
                    ? "bg-yellow-900/30 text-yellow-500" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                } transition-colors flex items-center`}
              >
                <UserCircle2 className="h-4 w-4 mr-2" />
                Account Settings
              </button>
              <button 
                onClick={() => setActiveTab("sessions")}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  activeTab === "sessions" 
                    ? "bg-yellow-900/30 text-yellow-500" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                } transition-colors flex items-center`}
              >
                <Key className="h-4 w-4 mr-2" />
                Session Information
              </button>
              <button 
                onClick={() => setActiveTab("security")}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  activeTab === "security" 
                    ? "bg-yellow-900/30 text-yellow-500" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                } transition-colors flex items-center`}
              >
                <Shield className="h-4 w-4 mr-2" />
                Security
              </button>
            </div>
            
            {/* Debug toggle button */}
            <div className="p-3 border-t border-gray-800 bg-gray-800/30">
              <button 
                onClick={() => setShowDebug(!showDebug)}
                className={`w-full text-left text-xs px-3 py-2 rounded flex items-center ${
                  showDebug 
                    ? "bg-red-900/20 text-red-400" 
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                }`}
              >
                <AlertTriangle className="h-3 w-3 mr-2" />
                {showDebug ? "Hide Debug Info" : "Show Debug Info"}
              </button>
            </div>
          </div>
          
          {/* Status Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-medium text-gray-400">SYSTEM STATUS</h3>
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">API Connection</span>
                <span className="text-green-500">Online</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Session Health</span>
                <span className="text-green-500">Secure</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Last Login</span>
                <span className="text-gray-300">Today</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="lg:col-span-9">
          {/* Account Settings Tab */}
          {activeTab === "account" && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="p-5 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg text-white font-medium">Account Settings</h2>
                  <p className="text-gray-400 text-sm mt-1">Manage your account preferences and information</p>
                </div>
                <div className="px-2.5 py-1 bg-gray-800 text-yellow-500 text-xs rounded">
                  Under Development
                </div>
              </div>
              
              <div className="p-5">
                {user && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-400">Display Name</label>
                      <div className="px-3 py-2 bg-gray-800 rounded border border-gray-700 text-white">
                        {user.name}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-400">Email Address</label>
                      <div className="px-3 py-2 bg-gray-800 rounded border border-gray-700 text-white">
                        {user.email}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-400">User ID</label>
                      <div className="px-3 py-2 bg-gray-800 rounded border border-gray-700 text-gray-300 text-sm font-mono">
                        {user.id}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-400">Clearance Level</label>
                      <div className="px-3 py-2 bg-gray-800 rounded border border-gray-700 text-white flex items-center">
                        <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                        {user.clearanceLevel} 
                        <span className="text-xs text-gray-500 ml-2">({user.role})</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-gray-800 flex gap-3">
                  <button className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 flex items-center text-sm">
                    <UserCircle2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                  <button className="px-4 py-2 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 flex items-center text-sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Session Information Tab */}
          {activeTab === "sessions" && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="p-5 border-b border-gray-800">
                <h2 className="text-lg text-white font-medium">Session Information</h2>
                <p className="text-gray-400 text-sm mt-1">Details about your current authentication session</p>
              </div>
              
              <div className="p-5">
                {sessionId ? (
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-green-900/20 text-green-400 text-sm rounded-md border border-green-900/30">
                      <Shield className="h-5 w-5 mr-2" />
                      Your current session is active and secure
                    </div>
                    
                    <div className="p-4 bg-gray-800/50 rounded-md border border-gray-700 space-y-4">
                      <div>
                        <div className="flex items-center text-yellow-500 text-xs mb-2">
                          <Key className="h-3 w-3 mr-1" />
                          <span className="font-medium">SESSION IDENTIFIER</span>
                        </div>
                        <div className="font-mono text-sm text-white p-3 bg-gray-900 rounded border border-gray-800 break-all">
                          {sessionId}
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-700">
                        <div className="flex items-center text-yellow-500 text-xs mb-2">
                          <Clock className="h-3 w-3 mr-1" />
                          <span className="font-medium">SESSION DETAILS</span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="p-3 bg-gray-900 rounded border border-gray-800">
                            <div className="text-[10px] text-gray-500 mb-1">CREATED</div>
                            <div className="text-xs text-white">Today</div>
                          </div>
                          <div className="p-3 bg-gray-900 rounded border border-gray-800">
                            <div className="text-[10px] text-gray-500 mb-1">EXPIRES</div>
                            <div className="text-xs text-white">24 hours</div>
                          </div>
                          <div className="p-3 bg-gray-900 rounded border border-gray-800">
                            <div className="text-[10px] text-gray-500 mb-1">IP ADDRESS</div>
                            <div className="text-xs text-white">192.168.1.1</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {user && (
                      <div className="p-4 bg-gray-800/50 rounded-md border border-gray-700">
                        <div className="flex items-center text-yellow-500 text-xs mb-3">
                          <User className="h-3 w-3 mr-1" />
                          <span className="font-medium">USER INFORMATION</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-900 rounded border border-gray-800">
                            <div className="text-[10px] text-gray-500 mb-1">ID</div>
                            <div className="text-xs text-white font-mono break-all">{user.id}</div>
                          </div>
                          <div className="p-3 bg-gray-900 rounded border border-gray-800">
                            <div className="text-[10px] text-gray-500 mb-1">NAME</div>
                            <div className="text-xs text-white">{user.name}</div>
                          </div>
                          <div className="p-3 bg-gray-900 rounded border border-gray-800">
                            <div className="text-[10px] text-gray-500 mb-1">EMAIL</div>
                            <div className="text-xs text-white">{user.email}</div>
                          </div>
                          <div className="p-3 bg-gray-900 rounded border border-gray-800">
                            <div className="text-[10px] text-gray-500 mb-1">ROLE</div>
                            <div className="text-xs text-white flex items-center">
                              {user.role}
                              <span className="ml-2 px-1 py-0.5 bg-yellow-900/40 text-yellow-500 text-[10px] rounded">
                                Level {user.clearanceLevel}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2 flex gap-3">
                      <button className="px-4 py-2 bg-red-900/20 text-red-400 rounded hover:bg-red-900/40 text-sm flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        End Session
                      </button>
                      <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 text-sm flex items-center">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Token
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-900/20 border border-yellow-900/30 rounded-md">
                    <div className="flex items-center text-amber-400 mb-2">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span className="font-medium">No active session detected</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Try logging out and back in to establish a new secure session.
                    </p>
                    <button className="mt-3 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 text-sm">
                      Go to Login
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="p-5 border-b border-gray-800">
                <h2 className="text-lg text-white font-medium">Security Settings</h2>
                <p className="text-gray-400 text-sm mt-1">Manage your security preferences and information</p>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-md border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-400 mt-1">Add an extra layer of security to your account</p>
                    </div>
                    <div className="px-2.5 py-1 bg-gray-900 text-yellow-500 text-xs rounded">
                      Coming Soon
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-800/50 rounded-md border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Password Management</h3>
                      <p className="text-sm text-gray-400 mt-1">Update your password and security questions</p>
                    </div>
                    <button className="px-3 py-1.5 bg-gray-900 text-gray-300 text-xs rounded hover:bg-gray-700">
                      Change Password
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-800/50 rounded-md border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Login History</h3>
                      <p className="text-sm text-gray-400 mt-1">View your recent login activity</p>
                    </div>
                    <button className="px-3 py-1.5 bg-gray-900 text-gray-300 text-xs rounded hover:bg-gray-700">
                      View History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Debug section - only for development */}
          {showDebug && (
            <div className="mt-6 p-5 bg-gray-900 border border-red-900/30 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
                <h3 className="text-sm text-red-400 font-medium">Debug Information (Development Only)</h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs text-gray-400 mb-2 font-medium">Local Storage</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-gray-800 rounded border border-gray-700">
                      <div className="text-[10px] text-gray-500 mb-1">TOKEN</div>
                      <div className="text-gray-300 break-all font-mono">{localStorage.getItem('token') || 'Not set'}</div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded border border-gray-700">
                      <div className="text-[10px] text-gray-500 mb-1">USER ID</div>
                      <div className="text-gray-300 font-mono">{localStorage.getItem('userId') || 'Not set'}</div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded border border-gray-700">
                      <div className="text-[10px] text-gray-500 mb-1">SESSION ID</div>
                      <div className="text-gray-300 font-mono">{localStorage.getItem('sessionId') || 'Not set'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs text-gray-400 font-medium">Registered Users ({storedUsers.length})</h4>
                    <button 
                      onClick={loadStoredUsers}
                      className="px-2 py-1 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded text-xs flex items-center"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh
                    </button>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {storedUsers.map((storedUser) => (
                      <div key={storedUser.id} className="p-3 bg-gray-800 rounded border border-gray-700 text-xs">
                        <div className="grid grid-cols-2 gap-y-1">
                          <div>
                            <span className="text-gray-500 text-[10px]">ID:</span> 
                            <span className="text-gray-300 ml-1 font-mono">{storedUser.id}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-[10px]">NAME:</span> 
                            <span className="text-gray-300 ml-1">{storedUser.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-[10px]">EMAIL:</span> 
                            <span className="text-gray-300 ml-1">{storedUser.email}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-[10px]">PASSWORD:</span> 
                            <span className="text-gray-300 ml-1 font-mono">{storedUser.password}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {storedUsers.length === 0 && (
                      <div className="p-3 bg-gray-800 rounded text-center text-gray-400 text-xs">
                        No registered users found
                      </div>
                    )}
                  </div>
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
      <ConnectionStatusChecker />
      <EnhancedConnectionMonitor />
    </AuthProvider>
  );
}

export default App;
