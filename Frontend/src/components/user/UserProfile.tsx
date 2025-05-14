import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Shield, User, Mail, Clock, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const UserProfile = () => {
  const { user, sessionId } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl text-yellow-500 font-bold mb-6">User Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="h-5 w-5 mr-2 text-yellow-500" />
                Account Information
              </CardTitle>
              <CardDescription>Your personal account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-gray-400">Full Name</span>
                <span className="text-white">{user.name}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-gray-400">Email Address</span>
                <div className="flex items-center">
                  <Mail className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
                  <span className="text-white">{user.email}</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-gray-400">Role</span>
                <span className="text-white capitalize">{user.role}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-gray-400">Clearance Level</span>
                <div className="flex items-center">
                  <Shield className="h-3.5 w-3.5 text-yellow-500 mr-1.5" />
                  <span className="text-white capitalize">{user.clearanceLevel}</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1 mt-4 pt-4 border-t border-gray-800">
                <span className="text-xs text-gray-400">Current Session ID</span>
                <div className="bg-gray-800 p-2 rounded font-mono text-xs text-yellow-400 break-all">
                  {sessionId}
                </div>
                <span className="text-xs text-gray-500 flex items-center mt-1">
                  <Shield className="h-3 w-3 mr-1" />
                  This session ID is used to track your current login session
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="h-5 w-5 mr-2 text-yellow-500" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Connection</span>
                <span className="text-green-500 text-sm">Secure</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Session</span>
                <span className="text-green-500 text-sm">Active</span>
              </div>
              
              <div className="h-px w-full bg-gray-800 my-2"></div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-gray-400">Session Started</span>
                <div className="flex items-center text-white text-sm">
                  <Clock className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-gray-400">Account Created</span>
                <div className="flex items-center text-white text-sm">
                  <Calendar className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;