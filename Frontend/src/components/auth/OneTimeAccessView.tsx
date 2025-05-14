import React, { useState, useEffect } from "react";
import {
  Shield,
  Clock,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BlockchainVerificationBadgeProps {
  status?: "verified" | "pending" | "destroyed";
}

// Implementing the BlockchainVerificationBadge component directly in this file
const BlockchainVerificationBadge = ({
  status = "verified",
}: BlockchainVerificationBadgeProps) => {
  return (
    <div
      className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        status === "verified"
          ? "bg-emerald-900/30 text-emerald-400 border border-emerald-700"
          : status === "pending"
            ? "bg-amber-900/30 text-amber-400 border border-amber-700"
            : "bg-red-900/30 text-red-400 border border-red-700"
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full mr-1.5 ${
          status === "verified"
            ? "bg-emerald-400"
            : status === "pending"
              ? "bg-amber-400"
              : "bg-red-400"
        }`}
      />
      {status === "verified"
        ? "Blockchain Verified"
        : status === "pending"
          ? "Verification Pending"
          : "Destruction Verified"}
    </div>
  );
};

interface OneTimeAccessViewProps {
  fileId?: string;
  messageId?: string;
  contentType?: "file" | "message";
  expirationTime?: number; // in seconds
  isAuthenticated?: boolean;
  onAccessComplete?: () => void;
  onDestroy?: () => void;
}

const OneTimeAccessView = ({
  fileId = "f1a2b3c4",
  messageId = "m1a2b3c4",
  contentType = "file",
  expirationTime = 300, // 5 minutes default
  isAuthenticated = true,
  onAccessComplete = () => {},
  onDestroy = () => {},
}: OneTimeAccessViewProps) => {
  const [timeRemaining, setTimeRemaining] = useState(expirationTime);
  const [isLoading, setIsLoading] = useState(true);
  const [isDestroyed, setIsDestroyed] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showDestructionDialog, setShowDestructionDialog] = useState(false);

  // Mock content data
  const mockFileData = {
    name: "Operation_Blackout_Brief.pdf",
    size: "2.4 MB",
    uploadedBy: "Agent X",
    securityLevel: "Top Secret",
    content:
      "This is a highly classified document containing mission details...",
  };

  const mockMessageData = {
    sender: "Agent Z",
    timestamp: "2023-06-15 14:30",
    securityLevel: "Confidential",
    content:
      "Rendezvous at the extraction point at 0200 hours. Bring the package. Trust no one.",
  };

  // Countdown timer effect
  useEffect(() => {
    if (!isAuthenticated || isDestroyed) return;

    // Simulate loading delay
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Countdown timer
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSelfDestruct();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(loadingTimer);
    };
  }, [isAuthenticated, isDestroyed]);

  // Format time remaining as MM:SS
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const progressPercentage = (timeRemaining / expirationTime) * 100;

  // Handle self-destruct
  const handleSelfDestruct = () => {
    setShowDestructionDialog(true);
    setTimeout(() => {
      setIsDestroyed(true);
      setShowContent(false);
      setShowDestructionDialog(false);
      onDestroy();
    }, 3000);
  };

  // Handle view content
  const handleViewContent = () => {
    setShowContent(true);
    // In a real app, this would trigger the one-time access consumption
    setTimeout(() => {
      onAccessComplete();
    }, 1000);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-black p-6">
        <Card className="w-full max-w-md p-6 bg-gray-900 border-red-500 border-2">
          <div className="flex flex-col items-center text-center space-y-4">
            <Lock className="h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-bold text-red-500">Access Denied</h2>
            <p className="text-gray-400">
              Your one-time access key is invalid or has already been used.
            </p>
            <Alert className="bg-red-900/30 border-red-800 text-red-300">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This access attempt has been logged and reported to the system
                administrator.
              </AlertDescription>
            </Alert>
            <Button variant="destructive" className="mt-4">
              Return to Secure Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isDestroyed) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-black p-6">
        <Card className="w-full max-w-md p-6 bg-gray-900 border-red-500 border-2">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertTriangle className="h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-bold text-red-500">
              Content Destroyed
            </h2>
            <p className="text-gray-400">
              This {contentType} has self-destructed and is no longer available.
            </p>
            <BlockchainVerificationBadge status="destroyed" />
            <Button
              variant="outline"
              className="mt-4 border-gray-700 text-gray-400"
            >
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[600px] bg-black p-6">
      <Card className="w-full max-w-4xl bg-gray-900 border-gray-800 overflow-hidden">
        {/* Security header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            <span className="text-emerald-500 font-medium">
              Secure One-Time Access
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Badge
              variant="outline"
              className="border-yellow-500 text-yellow-500"
            >
              {contentType === "file" ? "CLASSIFIED FILE" : "SECURE MESSAGE"}
            </Badge>
            <BlockchainVerificationBadge status="verified" />
          </div>
        </div>

        {/* Main content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Shield className="h-16 w-16 text-blue-500" />
              </motion.div>
              <h3 className="text-xl font-medium text-gray-200">
                Establishing Secure Connection
              </h3>
              <p className="text-gray-400 text-center max-w-md">
                Verifying one-time access credentials and preparing secure
                viewing environment...
              </p>
              <Progress value={45} className="w-64 h-2" />
            </div>
          ) : !showContent ? (
            <div className="flex flex-col items-center py-8 space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                <h2 className="text-2xl font-bold text-gray-200 mb-2">
                  {contentType === "file"
                    ? "Classified File Ready"
                    : "Secure Message Ready"}
                </h2>
                <p className="text-gray-400 mb-6">
                  This content will be available for viewing only once. After
                  viewing or when the timer expires, it will self-destruct
                  permanently.
                </p>

                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Clock className="h-5 w-5 text-red-500" />
                  <span className="text-xl font-mono text-red-500">
                    {formatTimeRemaining()}
                  </span>
                </div>

                <Progress
                  value={progressPercentage}
                  className={`h-2 mb-6 ${progressPercentage < 30 ? "text-red-500" : "text-blue-500"}`}
                />

                <Button
                  onClick={handleViewContent}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View {contentType === "file" ? "File" : "Message"} Now
                </Button>
              </div>

              <div className="text-sm text-gray-500 max-w-md text-center">
                <p>
                  By accessing this content, you acknowledge that your actions
                  are being logged and verified on the blockchain for security
                  purposes.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-200">
                    {contentType === "file"
                      ? mockFileData.name
                      : "Secure Message"}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {contentType === "file"
                      ? `Size: ${mockFileData.size} • Uploaded by: ${mockFileData.uploadedBy}`
                      : `From: ${mockMessageData.sender} • Sent: ${mockMessageData.timestamp}`}
                  </p>
                </div>
                <Badge className="bg-red-900 text-red-300 border-red-700">
                  {contentType === "file"
                    ? mockFileData.securityLevel
                    : mockMessageData.securityLevel}
                </Badge>
              </div>

              <div className="bg-gray-900 p-4 rounded border border-gray-700 mb-4 min-h-[200px]">
                <p className="text-gray-300 whitespace-pre-line">
                  {contentType === "file"
                    ? mockFileData.content
                    : mockMessageData.content}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-500">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-mono">
                    {formatTimeRemaining()}
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleSelfDestruct}
                >
                  Destroy Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Self-destruct dialog */}
      <Dialog
        open={showDestructionDialog}
        onOpenChange={setShowDestructionDialog}
      >
        <DialogContent className="bg-gray-900 border-red-500 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Self-Destruction Initiated
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <motion.div
              className="w-full bg-red-900/20 h-2 mb-4"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3 }}
            />
            <p className="text-gray-300 text-center">
              This content is being permanently destroyed and will no longer be
              accessible.
            </p>
          </div>
          <DialogFooter>
            <div className="w-full flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.2, 0.8, 1.1, 0.9, 1],
                  opacity: [1, 0.8, 0.6, 0.4, 0.2, 0],
                }}
                transition={{ duration: 3 }}
              >
                <CheckCircle className="h-8 w-8 text-red-500" />
              </motion.div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OneTimeAccessView;
