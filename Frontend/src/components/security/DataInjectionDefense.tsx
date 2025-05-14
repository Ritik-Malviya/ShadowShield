// Create src/components/security/DataInjectionDefense.tsx
import React, { useState } from 'react';
import { FileText, Shield, AlertTriangle, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';

const DataInjectionDefense = () => {
  const [status, setStatus] = useState<'idle'|'generating'|'complete'>('idle');
  const [progress, setProgress] = useState(0);
  
  const handleGenerateFakeData = () => {
    setStatus('generating');
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus('complete');
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };
  
  return (
    <div className="border border-gray-700 rounded-lg p-4 space-y-4 text-white">
      <div className="flex items-center space-x-2">
        <Shield className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-medium text-white">AI Fake Data Injection</h3>
      </div>
      
      <p className="text-sm text-white">
        Generate convincing false intelligence data to mislead attackers while protecting your actual classified information.
      </p>
      
      {status === 'idle' && (
        <div className="p-4 bg-amber-900/20 border border-amber-800 rounded-md">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-400">Intrusion Alert</p>
              <p className="text-xs text-white mt-1">
                3 unauthorized access attempts detected from IP 193.147.xx.xx (St. Petersburg, Russia).
                AI recommends deploying fake data countermeasures.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {status === 'generating' && (
        <div className="space-y-3">
          <p className="text-sm text-blue-400">AI is generating realistic fake mission data...</p>
          <Progress value={progress} className="h-2" />
          <div className="grid grid-cols-2 gap-2 text-xs text-white">
            <div>Creating false mission coordinates</div>
            <div>Fabricating agent identities</div>
            <div>Generating convincing timelines</div>
            <div>Adding historical consistency</div>
          </div>
        </div>
      )}
      
      {status === 'complete' && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-500" />
            <p className="text-sm text-green-400">Fake data generated and deployed successfully!</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs mt-2">
            <div className="p-2 bg-black/30 rounded">
              <div className="font-medium mb-1 text-white">Real Data (Protected)</div>
              <div className="opacity-50 text-white">████████████████████</div>
              <div className="opacity-50 text-white">███████████████</div>
              <div className="opacity-50 text-white">███████████████████</div>
            </div>
            <div className="p-2 bg-black/30 rounded">
              <div className="font-medium mb-1 text-white">Fake Data (Exposed)</div>
              <div className="text-white">Operation Sunset Mirage</div>
              <div className="text-white">53.41°N, 59.02°E</div>
              <div className="text-white">Agent: <span className="text-amber-400">Dimitri K.</span></div>
            </div>
          </div>
          
          <div className="p-3 bg-green-900/20 border border-green-800 rounded text-xs text-white">
            The attacker has been fed misleading information. Their access has been logged and reported.
          </div>
        </div>
      )}
      
      {status !== 'complete' && (
        <Button 
          className="w-full" 
          onClick={handleGenerateFakeData}
          disabled={status === 'generating'}
        >
          {status === 'generating' ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            <span className="flex items-center">
              <Shield className="mr-2 h-4 w-4 text-yellow-500" />
              Deploy Fake Data Defense
            </span>
          )}
        </Button>
      )}
      
      {status === 'complete' && (
        <Button variant="outline" onClick={() => setStatus('idle')} className="w-full">
          Reset Defense System
        </Button>
      )}
    </div>
  );
};

export default DataInjectionDefense;