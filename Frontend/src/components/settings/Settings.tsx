import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '../ui/card';

// Add session ID to your component
const Settings = () => {
  const { user, sessionId } = useAuth();
  
  // In your security settings section:
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-yellow-500 font-bold mb-6">Settings</h1>
      
      {/* Other sections */}
      
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="h-5 w-5 mr-2 text-yellow-500" />
            Security Settings
          </CardTitle>
          <CardDescription>Manage your security preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-md text-white mb-2">Session Information</h3>
            {sessionId ? (
              <div className="text-sm text-white">
                <p>Your current session is active and secure.</p>
                <div className="mt-2">
                  <span className="text-gray-400">Session ID:</span> {sessionId.substring(0, 12)}...
                </div>
              </div>
            ) : (
              <p className="text-yellow-500">No active session detected.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;