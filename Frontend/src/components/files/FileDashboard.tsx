import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Shield, 
  AlertTriangle,
  Lock,
  Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import { fileAPI } from '../../services/api';
import FileUploadModal from './FileUploadModal';

const FileDashboard = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  
  useEffect(() => {
    const loadFiles = async () => {
      setLoading(true);
      try {
        const response = await fileAPI.getFiles();
        setFiles(response.data.data || []);
      } catch (error) {
        console.error('Failed to load files:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFiles();
  }, []);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { month: 'short', day: 'numeric', year: 'numeric' } as const;
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes >= 1000000) {
      return (bytes / 1000000).toFixed(2) + ' MB';
    }
    return (bytes / 1000).toFixed(2) + ' KB';
  };
  
  const getClassificationBadge = (classification) => {
    if (!classification) return null;
    
    const classColors = {
      'top-secret': 'bg-red-900/30 text-red-500 border-red-800',
      'secret': 'bg-amber-900/30 text-amber-500 border-amber-800',
      'confidential': 'bg-blue-900/30 text-blue-500 border-blue-800',
      'restricted': 'bg-purple-900/30 text-purple-500 border-purple-800',
      'unclassified': 'bg-green-900/30 text-green-500 border-green-800'
    };
    
    return (
      <span className={`text-xs px-2 py-0.5 border rounded-full ${classColors[classification] || classColors.unclassified}`}>
        {classification}
      </span>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl text-yellow-500 font-bold">Secure Files</h1>
        <Button 
          className="flex items-center bg-yellow-600 hover:bg-yellow-700"
          onClick={() => setUploadModalOpen(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
      </div>
      
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-white flex items-center">
            <Shield className="h-5 w-5 text-yellow-500 mr-2" />
            Protected Documents
          </h2>
        </div>
        
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 bg-gray-800 rounded"></div>
            ))}
          </div>
        ) : files.length > 0 ? (
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file._id} className="flex items-center p-3 border border-gray-800 bg-gray-800/50 rounded-md">
                <FileText className="h-10 w-10 text-blue-400 mr-4 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium truncate">{file.originalName}</h3>
                    {getClassificationBadge(file.classification)}
                  </div>
                  
                  <div className="flex text-xs text-gray-400 gap-3">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(file.createdAt)}
                    </span>
                    <span>{formatFileSize(file.size)}</span>
                    <span className="flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Access: {file.accessCode}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No files uploaded yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Upload a file to get started with secure file sharing
            </p>
          </div>
        )}
      </div>
      
      <FileUploadModal 
        open={uploadModalOpen} 
        onOpenChange={setUploadModalOpen} 
      />
    </div>
  );
};

export default FileDashboard;