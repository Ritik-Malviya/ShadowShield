import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { toast } from "../ui/use-toast";
import {
  Upload,
  Lock,
  Shield,
  Clock,
  Eye,
  Trash2,
  FileText,
  X,
  Copy,
  AlertTriangle,
} from "lucide-react";
import SecurityRulesConfig from "../shared/SecurityRulesConfig";
import BlockchainVerificationBadge from "../shared/BlockchainVerificationBadge";
import { fileAPI } from "../../services/api";

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FileUploadModal = ({ open, onOpenChange }: FileUploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "encrypting" | "verifying" | "complete" | "error"
  >("idle");
  const [currentStep, setCurrentStep] = useState(1);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [securitySettings, setSecuritySettings] = useState({
    classification: "confidential", // public, confidential, secret, top-secret
    selfDestruct: true,
    maxAccess: 1,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    authorizedEmails: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSecuritySettingChange = (key: string, value: any) => {
    setSecuritySettings({
      ...securitySettings,
      [key]: value
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.error("No file selected");
      return;
    }

    console.log("Starting file upload for:", selectedFile.name);
    setUploadStatus("uploading");
    setUploadProgress(0);

    // Create a FormData object
    const formData = new FormData();
    formData.append("file", selectedFile); // This should be the first append

    // Add other fields
    formData.append("selfDestruct", securitySettings.selfDestruct.toString());
    formData.append("maxAccess", securitySettings.maxAccess.toString());
    formData.append("classification", securitySettings.classification);

    if (securitySettings.expiresAt) {
      formData.append("expiresAt", new Date(securitySettings.expiresAt).toISOString());
    }

    if (securitySettings.authorizedEmails) {
      formData.append("authorizedEmails", securitySettings.authorizedEmails);
    }
    
    console.log("Form data created with file:", selectedFile.name);
    
    // Debug log the form data
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value instanceof File ? `File: ${value.name}` : value}`);
    }

    // Simulated progress updates
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);
    
    // Actual upload
    const response = await fileAPI.uploadFile(formData);
    
    clearInterval(progressInterval);
    setUploadProgress(100);
    
    // Simulated encryption and verification steps for UI feedback
    setUploadStatus("encrypting");
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUploadStatus("verifying");
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUploadStatus("complete");
    
    // Set the access code and file URL for sharing
    if (response.data && response.data.data) {
      setAccessCode(response.data.data.accessCode);
      setFileId(response.data.data._id);
      setEncryptionKey(response.data.data.encryptionKey);
      setFileUrl(`${window.location.origin}/access/${response.data.data.accessCode}`);
      
      // Add encryption key
      setEncryptionKey(response.data.data.encryptionKey);
      
      // Move to next step after successful upload
      setCurrentStep(2);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    navigate('/dashboard');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Secure access link has been copied",
        });
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-black/10 border border-gray-700 rounded-lg p-4 sm:p-6 lg:p-8 text-center">
              {selectedFile ? (
                <div className="space-y-3 sm:space-y-4">
                  <FileText className="h-10 w-10 sm:h-14 sm:w-14 lg:h-16 lg:w-16 mx-auto text-primary" />
                  <p className="text-base sm:text-lg lg:text-xl font-medium truncate max-w-full">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Badge
                    variant="outline"
                    className="bg-green-900/20 text-green-400 border-green-800 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1"
                  >
                    File Selected
                  </Badge>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 lg:space-y-6 py-3 sm:py-4">
                  <Upload className="h-10 w-10 sm:h-14 sm:w-14 lg:h-16 lg:w-16 mx-auto text-gray-400" />
                  <p className="text-sm sm:text-base lg:text-lg text-gray-400">
                    Drag and drop your file here or click to browse
                  </p>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Label
                    htmlFor="file-upload"
                    className="inline-block px-3 py-2 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 bg-primary/20 border border-primary/50 rounded-md cursor-pointer hover:bg-primary/30 transition-colors text-xs sm:text-sm lg:text-base"
                  >
                    Select File
                  </Label>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {selectedFile && (
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6 bg-black/10 border border-gray-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm sm:text-base lg:text-lg font-medium">Upload Status</h3>
                  <Badge
                    variant="outline"
                    className={
                      uploadStatus === "error"
                        ? "bg-red-900/20 text-red-400 border-red-800 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1"
                        : uploadStatus !== "idle"
                        ? "bg-amber-900/20 text-amber-400 border-amber-800 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1"
                        : "bg-gray-800 text-gray-400 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1"
                    }
                  >
                    {uploadStatus === "idle"
                      ? "Ready"
                      : uploadStatus === "uploading"
                      ? "Uploading..."
                      : uploadStatus === "encrypting"
                      ? "Encrypting..."
                      : uploadStatus === "verifying"
                      ? "Blockchain Verification..."
                      : uploadStatus === "error"
                      ? "Upload Failed"
                      : "Complete"}
                  </Badge>
                </div>
                <Progress 
                  value={uploadProgress} 
                  className={`h-2 sm:h-2.5 bg-gray-800 ${uploadStatus === "error" ? "text-red-500" : ""}`} 
                />

                {uploadStatus === "idle" && (
                  <Button onClick={handleUpload} className="w-full py-2 sm:py-4 lg:py-5 text-xs sm:text-sm lg:text-base">
                    <Upload className="mr-2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" /> Begin Secure Upload
                  </Button>
                )}

                {uploadStatus === "error" && (
                  <Button onClick={handleUpload} className="w-full py-2 sm:py-4 lg:py-5 text-xs sm:text-sm lg:text-base">
                    <Upload className="mr-2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" /> Retry Upload
                  </Button>
                )}

                {uploadStatus === "complete" && (
                  <div className="flex justify-center py-1 sm:py-2">
                    <BlockchainVerificationBadge />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 sm:space-y-5 max-h-[40vh] sm:max-h-[45vh] md:max-h-[50vh] lg:max-h-[55vh] overflow-y-auto pr-1 sm:pr-2">
            <div className="bg-black/10 border border-gray-700 rounded-lg p-3 sm:p-4 lg:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4 lg:mb-5">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-500" />
                <h3 className="text-base sm:text-lg lg:text-xl font-medium">Security Configuration</h3>
              </div>

              <Tabs defaultValue="time" className="w-full">
                <TabsList className="grid grid-cols-3 mb-3 sm:mb-4 lg:mb-5">
                  <TabsTrigger
                    value="time"
                    className="data-[state=active]:bg-primary/20 text-xs sm:text-sm lg:text-base px-1 sm:px-2 lg:px-3 h-8 sm:h-9 lg:h-10"
                  >
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Time</span><span className="sm:hidden">Time</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="access"
                    className="data-[state=active]:bg-primary/20 text-xs sm:text-sm lg:text-base px-1 sm:px-2 lg:px-3 h-8 sm:h-9 lg:h-10"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Access</span><span className="sm:hidden">Access</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="manual"
                    className="data-[state=active]:bg-primary/20 text-xs sm:text-sm lg:text-base px-1 sm:px-2 lg:px-3 h-8 sm:h-9 lg:h-10"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Kill Switch</span><span className="sm:hidden">Kill</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="time" className="space-y-3 sm:space-y-4 p-2 sm:p-3 lg:p-4 bg-black/20 rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor="expires-at" className="text-xs sm:text-sm lg:text-base">Self-destruction time</Label>
                    <Input 
                      id="expires-at" 
                      type="datetime-local" 
                      value={securitySettings.expiresAt}
                      onChange={(e) => handleSecuritySettingChange('expiresAt', e.target.value)}
                      className="bg-black/20 border-gray-700"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="self-destruct-time"
                      checked={securitySettings.selfDestruct}
                      onChange={(e) => handleSecuritySettingChange('selfDestruct', e.target.checked)}
                      className="rounded bg-black/20 border-gray-700"
                    />
                    <Label htmlFor="self-destruct-time" className="text-xs sm:text-sm lg:text-base">
                      Enable self-destruction at specified time
                    </Label>
                  </div>
                </TabsContent>

                <TabsContent value="access" className="space-y-3 sm:space-y-4 p-2 sm:p-3 lg:p-4 bg-black/20 rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor="max-access" className="text-xs sm:text-sm lg:text-base">Maximum access count</Label>
                    <Input 
                      id="max-access" 
                      type="number" 
                      min="1" 
                      max="10" 
                      value={securitySettings.maxAccess}
                      onChange={(e) => handleSecuritySettingChange('maxAccess', parseInt(e.target.value))}
                      className="bg-black/20 border-gray-700"
                    />
                    <p className="text-xs text-gray-400">File will self-destruct after this many access attempts</p>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-3 sm:space-y-4 p-2 sm:p-3 lg:p-4 bg-black/20 rounded-md">
                  <p className="text-xs sm:text-sm lg:text-base text-gray-400">
                    Once uploaded, the file can be manually destroyed at any time from your dashboard.
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            <div className="bg-black/10 border border-gray-700 rounded-lg p-3 sm:p-4 lg:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4 lg:mb-5">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary" />
                <h3 className="text-base sm:text-lg lg:text-xl font-medium">Access Control</h3>
              </div>

              <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                <div className="grid gap-1 sm:gap-2">
                  <Label htmlFor="access-email" className="text-xs sm:text-sm lg:text-base mb-1 block">
                    Authorized Email Addresses (Optional)
                  </Label>
                  <Input
                    id="access-email"
                    placeholder="Enter email addresses (comma separated)"
                    className="bg-black/20 border-gray-700 text-xs sm:text-sm lg:text-base h-8 sm:h-9 lg:h-10"
                    value={securitySettings.authorizedEmails}
                    onChange={(e) => handleSecuritySettingChange('authorizedEmails', e.target.value)}
                  />
                </div>

                <div className="grid gap-1 sm:gap-2">
                  <Label htmlFor="classification" className="text-xs sm:text-sm lg:text-base mb-1 block">
                    Security Classification
                  </Label>
                  <select
                    id="classification"
                    className="bg-black/20 border-gray-700 text-xs sm:text-sm lg:text-base h-8 sm:h-9 lg:h-10 rounded-md px-3"
                    value={securitySettings.classification}
                    onChange={(e) => handleSecuritySettingChange('classification', e.target.value)}
                  >
                    <option value="public">Public</option>
                    <option value="confidential">Confidential</option>
                    <option value="secret">Secret</option>
                    <option value="top-secret">Top Secret</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3 bg-black/20 rounded-md p-2 sm:p-3 lg:p-4 mt-1 sm:mt-2">
                  <input
                    type="checkbox"
                    id="generate-one-time"
                    className="rounded bg-black/20 border-gray-700 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
                    checked={true}
                    disabled
                  />
                  <Label htmlFor="generate-one-time" className="text-xs sm:text-sm lg:text-base">
                    Generate one-time access keys (always enabled for security)
                  </Label>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 sm:space-y-5 max-h-[40vh] sm:max-h-[45vh] md:max-h-[50vh] lg:max-h-[55vh] overflow-y-auto pr-1 sm:pr-2">
            <div className="bg-black/10 border border-gray-700 rounded-lg p-4 sm:p-5 lg:p-7">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-center mb-4 sm:mb-5 lg:mb-7">
                Mission Briefing: File Ready
              </h3>

              <div className="space-y-2 sm:space-y-3 lg:space-y-4 mb-4 sm:mb-5 lg:mb-7">
                <div className="flex justify-between items-center py-1.5 sm:py-2 lg:py-2.5 border-b border-gray-700">
                  <span className="text-xs sm:text-sm lg:text-base text-gray-400">File Name:</span>
                  <span className="font-medium text-xs sm:text-sm lg:text-base truncate max-w-[180px] sm:max-w-[220px] lg:max-w-[320px]">
                    {selectedFile?.name || "classified_document.pdf"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 sm:py-2 lg:py-2.5 border-b border-gray-700">
                  <span className="text-xs sm:text-sm lg:text-base text-gray-400">Security Level:</span>
                  <Badge className="bg-red-900/30 text-red-400 border-red-800 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1">
                    {securitySettings.classification.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex justify-between items-center py-1.5 sm:py-2 lg:py-2.5 border-b border-gray-700">
                  <span className="text-xs sm:text-sm lg:text-base text-gray-400">Self-Destruct Protocol:</span>
                  <span className="font-medium text-amber-400 text-xs sm:text-sm lg:text-base">
                    {securitySettings.selfDestruct 
                      ? `Time-based (${new Date(securitySettings.expiresAt).toLocaleString()})` 
                      : "Manual Destroy Only"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 sm:py-2 lg:py-2.5 border-b border-gray-700">
                  <span className="text-xs sm:text-sm lg:text-base text-gray-400">
                    Blockchain Verification:
                  </span>
                  <BlockchainVerificationBadge />
                </div>

                <div className="flex justify-between items-center py-1.5 sm:py-2 lg:py-2.5 border-b border-gray-700">
                  <span className="text-xs sm:text-sm lg:text-base text-gray-400">Access Method:</span>
                  <span className="font-medium text-xs sm:text-sm lg:text-base">One-Time Key</span>
                </div>
              </div>

              <div className="bg-black/30 border border-gray-700 rounded-lg p-3 sm:p-4 lg:p-5 mb-4 sm:mb-5 lg:mb-7">
                <p className="text-center text-xs sm:text-sm lg:text-base text-gray-400 mb-2 sm:mb-3">
                  Secure Access Link
                </p>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Input
                    value={fileUrl || "Link generating..."}
                    readOnly
                    className="bg-black/20 border-gray-700 text-xs sm:text-sm h-8 sm:h-9 lg:h-10"
                  />
                  <Button 
                    variant="outline" 
                    className="shrink-0 h-8 sm:h-9 lg:h-10 px-2 sm:px-3 lg:px-4 text-xs sm:text-sm"
                    onClick={() => fileUrl && copyToClipboard(fileUrl)}
                    disabled={!fileUrl}
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Copy
                  </Button>
                </div>
              </div>

              {/* Encryption Key Section */}
              {encryptionKey && (
                <div className="mt-4">
                  <Label className="text-xs font-semibold mb-1 flex items-center">
                    <Shield className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    Encryption Key (Save this for security verification)
                  </Label>
                  <div className="relative">
                    <div className="bg-black/20 border border-gray-700 rounded p-2 text-xs font-mono text-amber-400 overflow-x-auto">
                      {encryptionKey}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                      onClick={() => {
                        navigator.clipboard.writeText(encryptionKey);
                        toast({
                          title: "Copied!",
                          description: "Encryption key copied to clipboard",
                          duration: 2000
                        });
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-amber-600/70 mt-1 flex items-start">
                    <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                    Keep this key secure! It's required to verify file integrity and cannot be recovered.
                  </p>
                  <div className="mt-2 bg-amber-950/30 border border-amber-900/50 rounded-md p-3">
                    <h4 className="text-xs font-semibold text-amber-400 flex items-center">
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                      Important Security Notice
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {securitySettings.classification === 'top-secret' 
                        ? <strong className="text-amber-400">This file requires the encryption key to download.</strong>
                        : 'Save this key if you want to verify file integrity later.'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      The key is only shown once and cannot be recovered after closing this dialog.
                    </p>
                  </div>
                </div>
              )}

              <div className="text-center">
                <p className="text-xs sm:text-sm lg:text-base text-gray-400 mb-3 sm:mb-4 lg:mb-5">
                  This file will self-destruct according to your security
                  settings.
                </p>
                <Button 
                  variant="destructive" 
                  className="h-8 sm:h-9 lg:h-10 px-3 sm:px-4 lg:px-5 text-xs sm:text-sm lg:text-base"
                  onClick={() => {
                    if (fileId) { // <-- Use fileId here
                      fileAPI.deleteFile(fileId)
                        .then(() => {
                          toast({
                            title: "File Destroyed",
                            description: "The file has been permanently deleted from the system"
                          });
                          handleClose();
                        })
                        .catch(err => {
                          console.error('Error destroying file:', err);
                          toast({
                            title: "Error",
                            description: "Failed to destroy the file. Try again later.",
                            variant: "destructive"
                          });
                        });
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" /> Emergency Destroy Now
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="w-[calc(100%-32px)] sm:max-w-[550px] md:max-w-[650px] lg:max-w-[700px] max-h-[92vh] sm:max-h-[95vh] bg-gray-900 text-white border border-gray-700 p-3 sm:p-4 lg:p-6">
        <DialogHeader className="mb-2 sm:mb-3 lg:mb-5">
          <DialogTitle className="text-base sm:text-lg lg:text-2xl font-bold flex items-center">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-1 sm:mr-2 lg:mr-3 text-yellow-500" />
            {currentStep === 1
              ? "Secure File Upload"
              : currentStep === 2
                ? "Configure Security Settings"
                : "Mission Complete"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm lg:text-base text-gray-400 mt-1 sm:mt-1.5">
            {currentStep === 1
              ? "Upload your classified file with advanced security protocols."
              : currentStep === 2
                ? "Set self-destruction rules and access controls."
                : "Your file is now secured with blockchain verification and ready to share."}
          </DialogDescription>
          <Button
            className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 p-0"
            onClick={handleClose}
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="py-1 sm:py-2 lg:py-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm lg:text-base ${currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-gray-800 text-gray-500"}`}
              >
                1
              </div>
              <div
                className={`h-1 sm:h-1.5 w-4 sm:w-7 lg:w-10 ${currentStep > 1 ? "bg-primary" : "bg-gray-800"}`}
              ></div>
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm lg:text-base ${currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-gray-800 text-gray-500"}`}
              >
                2
              </div>
              <div
                className={`h-1 sm:h-1.5 w-4 sm:w-7 lg:w-10 ${currentStep > 2 ? "bg-primary" : "bg-gray-800"}`}
              ></div>
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm lg:text-base ${currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-gray-800 text-gray-500"}`}
              >
                3
              </div>
            </div>
            <Badge variant="outline" className="bg-black/20 border-gray-700 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1">
              {currentStep === 1
                ? "Upload"
                : currentStep === 2
                  ? "Configure"
                  : "Complete"}
            </Badge>
          </div>

          {renderStepContent()}
        </div>

        {/* Fixed footer with buttons always inside container */}
        <div className="mt-3 sm:mt-4 lg:mt-6 pt-3 sm:pt-4 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row sm:justify-between items-center w-full gap-2 sm:gap-3">
            {currentStep > 1 ? (
              <Button 
                variant="outline" 
                className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm lg:text-base px-3 sm:px-4 lg:px-5 w-full sm:w-auto" 
                onClick={handlePrevStep}
              >
                Back
              </Button>
            ) : (
              <div className="hidden sm:block"> </div> 
            )}
            {currentStep < 3 ? (
              <Button
                className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm lg:text-base px-3 sm:px-4 lg:px-5 w-full sm:w-auto"
                onClick={currentStep === 1 ? handleUpload : handleNextStep}
                disabled={(currentStep === 1 && (!selectedFile || uploadStatus === "uploading")) || (uploadStatus === "error")}
              >
                {currentStep === 1 
                  ? selectedFile && uploadStatus === "complete" 
                    ? "Next: Security Settings" 
                    : selectedFile
                      ? "Upload File"
                      : "Select & Upload File"
                  : "Complete Setup"}
              </Button>
            ) : (
              <Button 
                variant="default" 
                className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm lg:text-base px-3 sm:px-4 lg:px-5 w-full sm:w-auto" 
                onClick={handleClose}
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadModal;