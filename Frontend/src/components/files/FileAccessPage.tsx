import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fileAPI } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from '../ui/use-toast';

const FileAccessPage = () => {
  const { accessId } = useParams<{ accessId: string }>();
  const [loading, setLoading] = useState(true);
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [decryptionKey, setDecryptionKey] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewable, setIsPreviewable] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Check if file type is previewable
  const checkIfPreviewable = (fileType: string) => {
    const previewableTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml',
      'application/pdf',
      'text/plain', 'text/html', 'text/css', 'text/javascript',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'video/mp4', 'video/webm', 'video/ogg'
    ];
    console.log("File type:", fileType);
    console.log("Is previewable:", previewableTypes.includes(fileType));
    return previewableTypes.includes(fileType);
  };

  // Fetch file info on component mount
  useEffect(() => {
    const fetchFileInfo = async () => {
      if (!accessId) {
        setError('No access code provided.');
        setLoading(false);
        return;
      }

      console.log("Access code from URL:", accessId);

      try {
        const response = await fileAPI.getFileInfoByCode(accessId);
        setFileInfo(response.data.data);
        
        // Check if file is previewable
        const fileType = response.data.data.type || response.data.data.mimeType;
        console.log("File type:", fileType);
        const canPreview = checkIfPreviewable(fileType);
        setIsPreviewable(canPreview);
        console.log("Is previewable:", canPreview);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch file info.');
      } finally {
        setLoading(false);
      }
    };

    fetchFileInfo();
  }, [accessId]);

  // Handle file download
  const handleDownload = async () => {
    if (!accessId || !decryptionKey) {
      setError('Access code and decryption key are required.');
      return;
    }

    setDownloading(true);
    setError(null);

    try {
      const response = await fileAPI.downloadFileWithCode(accessId, {
        params: { key: decryptionKey },
        responseType: 'blob',
      });

      // Create a download link
      const blob = new Blob([response.data], { type: fileInfo?.type || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileInfo?.originalName || 'download');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Download Complete',
        description: 'Your file has been downloaded successfully.',
        duration: 3000,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to download file.');
    } finally {
      setDownloading(false);
    }
  };

  // Handle file preview
  const handlePreview = async () => {
    if (!accessId || !decryptionKey) {
      setError('Access code and decryption key are required.');
      return;
    }

    if (!isPreviewable) {
      setError('This file type cannot be previewed in browser.');
      return;
    }

    setPreviewing(true);
    setError(null);

    try {
      const response = await fileAPI.previewFileWithCode(accessId, {
        params: { key: decryptionKey },
        responseType: 'blob',
      });

      // Create a blob URL for previewing
      const blob = new Blob([response.data], { type: fileInfo?.type || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);

      toast({
        title: 'Preview Ready',
        description: 'Your file is now ready for preview.',
        duration: 3000,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to preview file.');
    } finally {
      setPreviewing(false);
    }
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p>Loading file information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Render preview content based on file type
  const renderPreview = () => {
    if (!previewUrl) return null;

    const fileType = fileInfo?.type || fileInfo?.mimeType || '';

    if (fileType.startsWith('image/')) {
      return <img src={previewUrl} alt={fileInfo?.originalName} className="max-w-full max-h-[80vh] object-contain" />;
    } else if (fileType.startsWith('video/')) {
      return <video src={previewUrl} controls className="max-w-full max-h-[80vh]" />;
    } else if (fileType.startsWith('audio/')) {
      return <audio src={previewUrl} controls className="w-full" />;
    } else if (fileType === 'application/pdf') {
      return <embed src={previewUrl} type="application/pdf" width="100%" height="600px" />;
    } else if (fileType.startsWith('text/')) {
      return <iframe src={previewUrl} width="100%" height="600px" />;
    } else {
      return <p>Preview not available for this file type.</p>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Secure File Access</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md mb-6">
        <p className="text-lg font-semibold mb-2">{fileInfo?.originalName}</p>
        <p className="text-sm text-gray-400 mb-4">
          {fileInfo?.size > 1024 * 1024
            ? `${(fileInfo.size / (1024 * 1024)).toFixed(2)} MB`
            : `${(fileInfo.size / 1024).toFixed(2)} KB`}
        </p>
        <Input
          type="text"
          placeholder="Enter decryption key"
          value={decryptionKey}
          onChange={(e) => setDecryptionKey(e.target.value)}
          className="mb-4"
        />
        <div className="flex space-x-2">
          <Button
            onClick={handleDownload}
            disabled={downloading || !decryptionKey}
            className="flex-1"
          >
            {downloading ? 'Downloading...' : 'Download File'}
          </Button>
          
          {isPreviewable && (
            <Button
              onClick={handlePreview}
              disabled={previewing || !decryptionKey}
              className="flex-1"
              variant="outline"
            >
              {previewing ? 'Loading...' : 'Preview File'}
            </Button>
          )}
        </div>
      </div>

      {/* Preview area */}
      {previewUrl && (
        <div 
          ref={previewContainerRef}
          className="w-full max-w-4xl bg-gray-800 p-4 rounded-lg shadow-md"
        >
          <h2 className="text-xl font-semibold mb-4">File Preview</h2>
          <div className="overflow-auto">
            {renderPreview()}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileAccessPage;