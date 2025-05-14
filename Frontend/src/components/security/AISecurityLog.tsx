import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Clock, User, Map, Cpu, Eye, Lock, Keyboard, Info, Loader2 } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { securityAPI } from '@/services/api';

interface SecurityEvent {
  _id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  createdAt: string;
  location?: string;
  ip?: string;
  action?: string;
  aiConfidence?: number;
  mitigationApplied?: boolean;
  mitigationType?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

const AISecurityLog = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSecurityEvents = async (pageNumber = 1) => {
    try {
      setIsLoading(true);
      const response = await securityAPI.getSecurityEvents(pageNumber);
      
      const newEvents = response.data.data;
      
      if (pageNumber === 1) {
        setSecurityEvents(newEvents);
      } else {
        setSecurityEvents(prev => [...prev, ...newEvents]);
      }
      
      setHasMore(newEvents.length > 0 && response.data.pagination?.next);
      setPage(pageNumber);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching security events:', err);
      setError(err.response?.data?.error || 'Failed to load security events');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDemoEvents = async () => {
    try {
      setIsLoading(true);
      await securityAPI.generateDemoEvents();
      // After generating events, refresh the list
      fetchSecurityEvents(1);
    } catch (err: any) {
      console.error('Error generating demo events:', err);
      setError(err.response?.data?.error || 'Failed to generate demo events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityEvents();
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <Shield className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getEventBorderColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-900/50 bg-yellow-950/20';
      case 'critical':
        return 'border-red-900/50 bg-red-950/20';
      case 'info':
      default:
        return 'border-blue-900/50 bg-blue-950/20';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">AI Security Log</h2>
        <Button onClick={generateDemoEvents} disabled={isLoading}>
          Generate Demo Events
        </Button>
      </div>
      
      {error && (
        <div className="mb-4 p-4 border border-red-800 bg-red-900/20 text-red-400 rounded">
          {error}
        </div>
      )}
      
      {isLoading && page === 1 ? (
        <div className="flex justify-center items-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-lg text-gray-300">Loading security events...</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {securityEvents.length === 0 ? (
              <div className="text-center p-8 border border-gray-800 rounded-lg">
                <p className="text-gray-400">No security events found</p>
                <Button 
                  variant="outline" 
                  onClick={generateDemoEvents} 
                  className="mt-4"
                >
                  Generate Demo Events
                </Button>
              </div>
            ) : (
              securityEvents.map((event) => (
                <div 
                  key={event._id} 
                  className={`p-4 border rounded-lg ${getEventBorderColor(event.type)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getEventIcon(event.type)}
                      <span className="font-medium text-white">{event.message}</span>
                    </div>
                    <span className="text-xs text-gray-300">
                      {new Date(event.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {(event.location || event.ip) && (
                    <div className="flex flex-col space-y-1 mb-2">
                      {event.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-300">
                          <Map className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.ip && (
                        <div className="flex items-center gap-1 text-xs text-gray-300">
                          <User className="h-3 w-3" />
                          <span>IP: {event.ip}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {event.user && (
                    <div className="flex items-center gap-1 text-xs text-gray-300 mb-2">
                      <User className="h-3 w-3" />
                      <span>User: {event.user.name}</span>
                    </div>
                  )}
                  
                  {event.mitigationApplied && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-white">Action taken: </span>
                      <span className={event.type === 'critical' ? 'text-red-400' : 'text-amber-400'}>
                        {event.mitigationType === 'block' && 'Access blocked'}
                        {event.mitigationType === 'alert' && 'Alert triggered'}
                        {event.mitigationType === 'self-destruct' && 'Self-destruction initiated'}
                        {event.mitigationType === 'fake-data' && 'Fake data served'}
                        {!event.mitigationType && 'Mitigation applied'}
                      </span>
                    </div>
                  )}
                  
                  {event.aiConfidence !== undefined && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-300">AI Confidence:</span>
                      <div className="h-1.5 w-24 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            event.aiConfidence > 90 ? 'bg-green-500' : 
                            event.aiConfidence > 75 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${event.aiConfidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-300">{event.aiConfidence}%</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {hasMore && (
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={() => fetchSecurityEvents(page + 1)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AISecurityLog;