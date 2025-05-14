import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { fileAPI } from '../../services/api';

interface FileVerificationProps {
  fileId?: string;
}

const FileVerification: React.FC<FileVerificationProps> = ({ fileId }) => {
  const [encryptionKey, setEncryptionKey] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const verifyFile = async () => {
    if (!file || !encryptionKey) {
      setErrorMessage('Please select a file and enter an encryption key');
      return;
    }

    setVerificationStatus('verifying');
    
    try {
      // Create FormData with file and key
      const formData = new FormData();
      formData.append('file', file);
      formData.append('encryptionKey', encryptionKey);
      
      if (fileId) {
        formData.append('fileId', fileId);
      }
      
      // Call verification API
      const response = await fileAPI.verifyFile(formData);
      
      if (response.data.success) {
        setVerificationStatus('success');
      } else {
        setVerificationStatus('error');
        setErrorMessage(response.data.message || 'Verification failed. The file may be tampered with or the key is incorrect.');
      }
    } catch (err: any) {
      setVerificationStatus('error');
      setErrorMessage(err.response?.data?.error || 'An error occurred during verification');
    }
  };

  return (
    <Card className="w-full border-gray-800 bg-gray-900">
      <CardHeader>
        <CardTitle className="text-sm flex items-center">
          <Shield className="h-4 w-4 mr-2 text-amber-500" />
          File Integrity Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload" className="text-xs mb-1.5 block">
              Select File to Verify
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="text-xs"
              />
            </div>
            {file && (
              <p className="text-xs text-gray-400 mt-1">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="encryption-key" className="text-xs mb-1.5 block">
              Encryption Key
            </Label>
            <Input
              id="encryption-key"
              type="text"
              placeholder="Paste your encryption key here"
              value={encryptionKey}
              onChange={(e) => setEncryptionKey(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          
          <Button 
            onClick={verifyFile} 
            disabled={verificationStatus === 'verifying' || !file || !encryptionKey}
            className="w-full"
            variant="secondary"
          >
            {verificationStatus === 'verifying' ? (
              <>
                <div className="h-4 w-4 border-2 border-t-transparent rounded-full animate-spin mr-2"></div>
                Verifying...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Verify File Integrity
              </>
            )}
          </Button>
          
          {verificationStatus === 'success' && (
            <div className="bg-green-900/30 border border-green-800 rounded-md p-3 text-green-400 text-xs flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Verification Successful</p>
                <p className="mt-1 text-green-400/70">This file matches the original encrypted file and has not been tampered with.</p>
              </div>
            </div>
          )}
          
          {verificationStatus === 'error' && (
            <div className="bg-red-900/30 border border-red-800 rounded-md p-3 text-red-400 text-xs flex items-start">
              <XCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Verification Failed</p>
                <p className="mt-1 text-red-400/70">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileVerification;