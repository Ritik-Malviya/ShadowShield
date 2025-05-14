import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, Lock, FileText, MessageSquare, 
  Activity, AlertTriangle, Users, Check, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { activityAPI, securityAPI, fileAPI, messageAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import AISecurityLog from '../security/AISecurityLog';
import DataInjectionDefense from '../security/DataInjectionDefense';
import OneTimeAccessGenerator from '../security/OneTimeAccessGenerator';
import ActivityFeed from './ActivityFeed'; // Import the ActivityFeed component
import SecurityStatusCard from './SecurityStatusCard';
// import RecentActivitiesCard from '../cards/RecentActivitiesCard';
// import SystemResourcesCard from '../cards/SystemResourcesCard';
// import ThreatMapCard from '../cards/ThreatMapCard';
// import ActionCenterCard from '../cards/ActionCenterCard';

interface SecurityStats {
  counts: {
    critical: number;
    warning: number;
    info: number;
    total: number;
  };
  threatLevel: 'high' | 'medium' | 'low';
  recentCritical: SecurityEvent[];
}

interface Activity {
  _id: string;
  type: string;
  title: string;
  description: string;
  importance: string;
  createdAt: string;
  user: string;
}

interface SecurityEvent {
  _id: string;
  type: string;
  message: string;
  timestamp: string;
  location?: string;
  ip?: string;
  user?: string;
}

// Define the StatCard interface for our dashboard stat cards
interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const DashboardContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    counts: { critical: 0, warning: 0, info: 0, total: 0 },
    threatLevel: 'low',
    recentCritical: []
  });
  const [fileStats, setFileStats] = useState({ count: 0 });
  const [messageStats, setMessageStats] = useState({ count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // First, try to fetch just the basic data (activities and security stats)
        const [activitiesRes] = await Promise.all([
          activityAPI.getRecentActivities(5)
        ]);
        
        setActivities(activitiesRes.data.data);
        
        // If user is admin, fetch security stats
        if (user?.role === 'admin') {
          try {
            const securityStatsRes = await securityAPI.getSecurityStats();
            setSecurityStats(securityStatsRes.data.data);
          } catch (error) {
            console.error('Error fetching security stats:', error);
            // If there's an error getting security stats, we'll use default values
          }
        }
        
        // Get file and message counts
        try {
          const filesRes = await fileAPI.getFiles();
          setFileStats({ count: filesRes.data.count || 0 });
        } catch (error) {
          console.error('Error fetching file stats:', error);
        }
        
        try {
          const messagesRes = await messageAPI.getMessages();
          setMessageStats({ count: messagesRes.data.count || 0 });
        } catch (error) {
          console.error('Error fetching message stats:', error);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg text-gray-300">Loading dashboard data...</p>
      </div>
    );
  }

  // Create the stat cards array with the data we have
  const statCards: StatCard[] = [
    {
      title: "Security Status",
      value: securityStats.threatLevel.charAt(0).toUpperCase() + securityStats.threatLevel.slice(1),
      icon: <Shield className={`h-5 w-5 ${
        securityStats.threatLevel === 'high' ? 'text-red-500' : 
        securityStats.threatLevel === 'medium' ? 'text-yellow-500' : 
        'text-green-500'
      }`} />,
      color: securityStats.threatLevel === 'high' ? 'text-red-500' : 
             securityStats.threatLevel === 'medium' ? 'text-yellow-500' : 
             'text-green-500'
    },
    {
      title: "Active Files",
      value: fileStats.count,
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      color: "text-blue-500"
    },
    {
      title: "Secure Messages",
      value: messageStats.count,
      icon: <MessageSquare className="h-5 w-5 text-purple-500" />,
      color: "text-purple-500"
    },
    {
      title: "Threats Detected",
      value: securityStats.counts.critical + securityStats.counts.warning,
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      color: "text-amber-500"
    }
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Mission Control Center</h1>
          <p className="text-gray-400">Welcome back, {user?.name || 'Agent'}</p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button 
            onClick={() => navigate('/files')}
            className="flex items-center space-x-2"
          >
            <Lock className="h-4 w-4" />
            <span>Secure Upload</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/messages')}
            className="flex items-center space-x-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Send Message</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-full">
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-yellow-500">Security Operations Center</CardTitle>
            </CardHeader>
            <CardContent>
              <AISecurityLog />
            </CardContent>
          </Card>
          
          {/* Add the ActivityFeed component here */}
          <ActivityFeed maxItems={5} />
        </div>
        
        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-yellow-500">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <OneTimeAccessGenerator />
              <DataInjectionDefense />
            </CardContent>
          </Card>
        </div>
      </div>

      {user?.role === 'admin' && securityStats.recentCritical.length > 0 && (
        <Card className="mt-6 border-red-900/20 bg-red-900/10">
          <CardHeader>
            <CardTitle className="text-red-400">Recent Critical Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityStats.recentCritical.map((event) => (
                <div key={event._id} className="flex items-center p-3 bg-red-950/30 border border-red-900/40 rounded-lg">
                  <div className="flex-1">
                    <p className="text-red-300">{event.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(event.timestamp).toLocaleString()} 
                      {event.location && ` • ${event.location}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardContent;