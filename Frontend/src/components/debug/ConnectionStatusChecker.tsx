import React, { useEffect, useState } from 'react';
import axios from 'axios';

// IMPORTANT: Hardcoded production URL to solve connection issues
const PRODUCTION_API_URL = 'https://shadowshield-backend.onrender.com';

interface ConnectionStatus {
  connected: boolean;
  backendUrl: string;
  lastChecked: string;
  error?: string;
  roundTripTime?: number;
}

const EnhancedConnectionMonitor: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    backendUrl: PRODUCTION_API_URL,
    lastChecked: 'Not checked yet',
  });
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    // Check connection on component mount
    checkConnection();
    
    // Set up interval to check periodically (every 30 seconds)
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    const startTime = Date.now();
    
    try {
      console.log('Checking backend connection...');
      const response = await axios.get(`${PRODUCTION_API_URL}/health`, { 
        timeout: 5000,
        headers: {
          'Origin': window.location.origin
        }
      });
      
      const endTime = Date.now();
      const roundTripTime = endTime - startTime;
      
      if (response.data && response.data.success) {
        console.log('Backend connection successful');
        setStatus({
          connected: true,
          backendUrl: PRODUCTION_API_URL,
          lastChecked: new Date().toLocaleTimeString(),
          roundTripTime
        });
      } else {
        console.warn('Backend returned unexpected response', response.data);
        setStatus({
          connected: false,
          backendUrl: PRODUCTION_API_URL,
          lastChecked: new Date().toLocaleTimeString(),
          error: 'Backend returned unexpected response',
          roundTripTime
        });
      }
    } catch (error: any) {
      console.error('Backend connection failed:', error);
      setStatus({
        connected: false,
        backendUrl: PRODUCTION_API_URL,
        lastChecked: new Date().toLocaleTimeString(),
        error: error.message || 'Unknown error'
      });
      
      // If connection fails, make the status visible
      setVisible(true);
    }
  };

  if (!visible && status.connected) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: status.connected ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 999,
        maxWidth: '300px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '14px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <strong>{status.connected ? 'Backend Connected' : 'Backend Connection Issue'}</strong>
        <button 
          onClick={() => setVisible(false)}
          style={{
            background: 'none', 
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        URL: {status.backendUrl}
      </div>
      
      {status.roundTripTime && (
        <div style={{ marginBottom: '4px' }}>
          Response time: {status.roundTripTime}ms
        </div>
      )}
      
      {status.error && (
        <div style={{ marginBottom: '4px', wordBreak: 'break-word' }}>
          Error: {status.error}
        </div>
      )}
      
      <div style={{ fontSize: '12px', marginTop: '8px' }}>
        Last checked: {status.lastChecked}
        <button 
          onClick={checkConnection}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            marginLeft: '8px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Check Now
        </button>
      </div>
    </div>  );
};

export default EnhancedConnectionMonitor;
