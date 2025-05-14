import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, FileText, MessageSquare, Eye, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import all components
import SecurityStatusCard from "../dashboard/SecurityStatusCard";
import QuickActionsPanel from "../dashboard/QuickActionsPanel";
import ActivityFeed from "../dashboard/ActivityFeed";
import FileUploadModal from "../files/FileUploadModal";
import MessageComposer from "../messages/MessageComposer";
import OneTimeAccessView from "../auth/OneTimeAccessView";
import SecurityRulesConfig from "../shared/SecurityRulesConfig";
import BlockchainVerificationBadge from "../shared/BlockchainVerificationBadge";
import DashboardContent from "../dashboard/DashboardContent";

const ComponentShowcase = () => {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [showOneTimeAccess, setShowOneTimeAccess] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="w-full p-6 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Shield className="mr-3 h-8 w-8 text-blue-500" />
            ShadowShield Component Showcase
          </h1>
          <p className="text-gray-400 mt-2">
            Explore all components of the self-destructing file security system
          </p>
        </header>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8 bg-gray-800 p-1">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-gray-700"
            >
              Dashboard Components
            </TabsTrigger>
            <TabsTrigger
              value="modals"
              className="data-[state=active]:bg-gray-700"
            >
              Modal Components
            </TabsTrigger>
            <TabsTrigger
              value="shared"
              className="data-[state=active]:bg-gray-700"
            >
              Shared Components
            </TabsTrigger>
            <TabsTrigger
              value="fullpage"
              className="data-[state=active]:bg-gray-700"
            >
              Full Page Views
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">
                    Security Status Card
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SecurityStatusCard />
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">
                    Quick Actions Panel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QuickActionsPanel
                    onUploadFile={() => setShowFileUpload(true)}
                    onSendMessage={() => setShowMessageComposer(true)}
                  />
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-white">Activity Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityFeed maxItems={3} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="modals" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">
                    File Upload Modal
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <FileText className="h-16 w-16 text-blue-500 mb-4" />
                  <Button
                    onClick={() => setShowFileUpload(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Open File Upload Modal
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Message Composer</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <MessageSquare className="h-16 w-16 text-purple-500 mb-4" />
                  <Button
                    onClick={() => setShowMessageComposer(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Open Message Composer
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shared" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">
                    Security Rules Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SecurityRulesConfig />
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">
                    Blockchain Verification Badge
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">Verified:</p>
                    <BlockchainVerificationBadge status="verified" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">Pending:</p>
                    <BlockchainVerificationBadge status="pending" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">Failed:</p>
                    <BlockchainVerificationBadge status="failed" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fullpage" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">
                    Dashboard Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Shield className="h-16 w-16 text-emerald-500 mb-4" />
                  <p className="text-gray-400 mb-4">
                    Full dashboard view with all components
                  </p>
                  <Button
                    onClick={() => navigate("/")}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    View Dashboard
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">
                    One-Time Access View
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Eye className="h-16 w-16 text-amber-500 mb-4" />
                  <p className="text-gray-400 mb-4">
                    Secure one-time access interface
                  </p>
                  <Button
                    onClick={() => setShowOneTimeAccess(true)}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    View One-Time Access
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showFileUpload && (
        <FileUploadModal
          open={showFileUpload}
          onOpenChange={setShowFileUpload}
        />
      )}

      {showMessageComposer && (
        <MessageComposer
          isOpen={showMessageComposer}
          onClose={() => setShowMessageComposer(false)}
        />
      )}

      {showOneTimeAccess && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <Button
              className="absolute -top-12 right-0 bg-red-600 hover:bg-red-700"
              onClick={() => setShowOneTimeAccess(false)}
            >
              <Lock className="mr-2 h-4 w-4" /> Close Secure View
            </Button>
            <OneTimeAccessView />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentShowcase;
