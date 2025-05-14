import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  AlertTriangle,
  FileText,
  MessageSquare,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SecurityStatusCardProps {
  securityLevel?: "high" | "medium" | "low";
  activeFiles?: number;
  activeMessages?: number;
  threatsDetected?: number;
  lastScan?: string;
}

const SecurityStatusCard = ({
  securityLevel = "high",
  activeFiles = 12,
  activeMessages = 5,
  threatsDetected = 0,
  lastScan = "2 minutes ago",
}: SecurityStatusCardProps) => {
  // Calculate security score based on security level
  const getSecurityScore = () => {
    switch (securityLevel) {
      case "high":
        return 92;
      case "medium":
        return 65;
      case "low":
        return 30;
      default:
        return 0;
    }
  };

  // Get color based on security level
  const getSecurityColor = () => {
    switch (securityLevel) {
      case "high":
        return "bg-green-600";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-red-600";
      default:
        return "bg-gray-400";
    }
  };

  // Get badge color based on security level
  const getSecurityBadgeColor = () => {
    switch (securityLevel) {
      case "high":
        return "bg-green-600/20 text-green-600 border-green-600/50";
      case "medium":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
      case "low":
        return "bg-red-600/20 text-red-600 border-red-600/50";
      default:
        return "bg-gray-400/20 text-gray-400 border-gray-400/50";
    }
  };

  return (
    <Card className="w-full max-w-[380px] h-[200px] bg-zinc-900 border-zinc-800 text-white shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Security Status
          </CardTitle>
          <Badge
            variant="outline"
            className={`${getSecurityBadgeColor()} capitalize`}
          >
            {securityLevel} security
          </Badge>
        </div>
        <CardDescription className="text-zinc-400">
          System security status and active items
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-zinc-400">Security Score</span>
              <span className="text-sm font-medium">{getSecurityScore()}%</span>
            </div>
            <Progress
              value={getSecurityScore()}
              className="h-2 bg-zinc-800"
              indicatorClassName={getSecurityColor()}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 bg-zinc-800/50 p-2 rounded-md">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">{activeFiles} Active Files</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Files currently shared and accessible</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 bg-zinc-800/50 p-2 rounded-md">
                    <MessageSquare className="h-4 w-4 text-indigo-400" />
                    <span className="text-sm">{activeMessages} Messages</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Active self-destructing messages</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="w-full flex justify-between items-center text-xs text-zinc-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Last scan: {lastScan}</span>
          </div>
          {threatsDetected > 0 ? (
            <div className="flex items-center gap-1 text-red-400">
              <AlertTriangle className="h-3 w-3" />
              <span>{threatsDetected} threats detected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-400">
              <Shield className="h-3 w-3" />
              <span>No threats detected</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default SecurityStatusCard;
