// Create a new component: src/components/security/OneTimeAccessGenerator.tsx
import React, { useState } from 'react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Copy, RefreshCw, Lock } from 'lucide-react';

const OneTimeAccessGenerator = () => {
  const [accessLink, setAccessLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateOneTimeLink = () => {
    setIsGenerating(true);
    // Simulate API call to generate secure link
    setTimeout(() => {
      const randomKey = Math.random().toString(36).substring(2, 15);
      setAccessLink(`https://shadowshield.io/access/${randomKey}`);
      setIsGenerating(false);
    }, 1200);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(accessLink);
    // Show toast notification
  };
  
  return (
    <div className="space-y-4 p-4 bg-black/10 border border-gray-700 rounded-lg text-white">
      <div className="flex items-center space-x-2 mb-2">
        <Lock className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-medium text-white">One-Time Access Link</h3>
      </div>
      
      <div className="space-y-2">
        <Label className="text-white">Secure Access Link</Label>
        <div className="flex space-x-2">
          <Input 
            value={accessLink} 
            readOnly 
            placeholder="Generate a one-time link"
            className="bg-black/20 border-gray-700 text-white"
          />
          <Button 
            variant="outline" 
            onClick={copyToClipboard}
            disabled={!accessLink}
            className="shrink-0"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
      </div>
      
      <Button
        onClick={generateOneTimeLink}
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2 text-yellow-500" />
            Generate One-Time Link
          </>
        )}
      </Button>
      
      {accessLink && (
        <p className="text-xs text-amber-400">
          Warning: This link will only work once and expires in 24 hours.
        </p>
      )}
    </div>
  );
};

export default OneTimeAccessGenerator;