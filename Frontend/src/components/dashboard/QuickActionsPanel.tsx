import React from "react";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Upload,
  MessageSquare,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsPanelProps {
  className?: string;
  onUploadFile?: () => void;
  onSendMessage?: () => void;
  onAccessSecurity?: () => void;
  onEmergencyDestroy?: () => void;
}

const QuickActionsPanel = ({
  className,
  onUploadFile = () => {},
  onSendMessage = () => {},
  onAccessSecurity = () => {},
  onEmergencyDestroy = () => {},
}: QuickActionsPanelProps) => {
  return (
    <div
      className={cn(
        "bg-black/90 border border-gray-800 rounded-lg p-6 shadow-lg",
        className,
      )}
    >
      <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
        <Shield className="mr-2 h-5 w-5 text-yellow-500" />
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={onUploadFile}
          className="bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 h-20"
          variant="outline"
        >
          <div className="flex flex-col items-center justify-center w-full">
            <Upload className="h-6 w-6 mb-1 text-emerald-500" />
            <span>Upload File</span>
          </div>
        </Button>

        <Button
          onClick={onSendMessage}
          className="bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 h-20"
          variant="outline"
        >
          <div className="flex flex-col items-center justify-center w-full">
            <MessageSquare className="h-6 w-6 mb-1 text-blue-500" />
            <span>Send Message</span>
          </div>
        </Button>

        <Button
          onClick={onAccessSecurity}
          className="bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 h-20"
          variant="outline"
        >
          <div className="flex flex-col items-center justify-center w-full">
            <Settings className="h-6 w-6 mb-1 text-yellow-500" />
            <span>Security Settings</span>
          </div>
        </Button>

        <Button
          onClick={onEmergencyDestroy}
          className="bg-gray-800 hover:bg-gray-700 text-gray-100 border border-red-900 h-20"
          variant="outline"
        >
          <div className="flex flex-col items-center justify-center w-full">
            <AlertTriangle className="h-6 w-6 mb-1 text-red-500" />
            <span>Emergency Destroy</span>
          </div>
        </Button>
      </div>

      <div className="mt-4 text-xs text-gray-500 border-t border-gray-800 pt-3">
        <p>All actions are logged and verified on blockchain</p>
      </div>
    </div>
  );
};

export default QuickActionsPanel;
