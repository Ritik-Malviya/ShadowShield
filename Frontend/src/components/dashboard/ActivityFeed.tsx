import React from "react";
import { Shield, Eye, Clock, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ActivityType =
  | "upload"
  | "access"
  | "expiration"
  | "destruction"
  | "security";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar: string;
  };
  fileId?: string;
  fileName?: string;
  verified: boolean;
  securityLevel?: "low" | "medium" | "high";
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
  maxItems?: number;
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case "upload":
      return <Shield className="h-5 w-5 text-blue-500" />;
    case "access":
      return <Eye className="h-5 w-5 text-green-500" />;
    case "expiration":
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case "destruction":
      return <Trash2 className="h-5 w-5 text-red-500" />;
    case "security":
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    default:
      return <Shield className="h-5 w-5 text-blue-500" />;
  }
};

const getSecurityLevelBadge = (level?: "low" | "medium" | "high") => {
  if (!level) return null;

  const colors = {
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <span
      className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded ${colors[level]}`}
    >
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
};

const ActivityFeed = ({
  activities = defaultActivities,
  maxItems = 10,
}: ActivityFeedProps) => {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card className="w-full bg-black/50 border-gray-800 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center">
          <Shield className="mr-2 h-5 w-5 text-blue-400" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              No recent activity to display
            </div>
          ) : (
            displayActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-3 rounded-lg bg-gray-900/60 border border-gray-800 hover:bg-gray-800/80 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white truncate">
                      {activity.title}
                    </p>
                    <div className="flex items-center">
                      {getSecurityLevelBadge(activity.securityLevel)}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-gray-400">
                              {activity.timestamp}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Activity recorded at {activity.timestamp}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {activity.description}
                  </p>
                  {activity.fileName && (
                    <div className="mt-2">
                      <Badge
                        variant="outline"
                        className="text-xs bg-gray-800 text-gray-300 border-gray-700"
                      >
                        {activity.fileName}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    {activity.user && (
                      <div className="flex items-center">
                        <Avatar className="h-5 w-5 mr-1">
                          <img
                            src={activity.user.avatar}
                            alt={activity.user.name}
                          />
                        </Avatar>
                        <span className="text-xs text-gray-400">
                          {activity.user.name}
                        </span>
                      </div>
                    )}
                    {activity.verified && (
                      <div className="flex items-center">
                        <Badge
                          variant="outline"
                          className="text-xs bg-emerald-900/30 text-emerald-400 border-emerald-800"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Blockchain Verified
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Default mock data
const defaultActivities: ActivityItem[] = [
  {
    id: "1",
    type: "upload",
    title: "Mission Brief Uploaded",
    description:
      "Operation Nightfall documents uploaded with 24hr self-destruct timer",
    timestamp: "10 minutes ago",
    user: {
      name: "Agent Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Smith",
    },
    fileName: "nightfall_brief_v2.pdf",
    verified: true,
    securityLevel: "high",
  },
  {
    id: "2",
    type: "access",
    title: "Classified File Accessed",
    description: "Agent accessed Operation Blackout files using one-time key",
    timestamp: "1 hour ago",
    user: {
      name: "Agent Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Johnson",
    },
    fileName: "blackout_intel.zip",
    verified: true,
    securityLevel: "medium",
  },
  {
    id: "3",
    type: "security",
    title: "Security Alert",
    description:
      "Multiple failed access attempts detected from unauthorized IP",
    timestamp: "3 hours ago",
    fileId: "file-456",
    fileName: "asset_locations.enc",
    verified: true,
    securityLevel: "high",
  },
  {
    id: "4",
    type: "destruction",
    title: "Emergency Destruction",
    description: "Manual kill switch activated for compromised documents",
    timestamp: "Yesterday",
    user: {
      name: "Director Hayes",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hayes",
    },
    fileName: "field_agents.dat",
    verified: true,
    securityLevel: "high",
  },
  {
    id: "5",
    type: "expiration",
    title: "Automatic Expiration",
    description: "Time-based destruction completed for temporary access files",
    timestamp: "2 days ago",
    fileName: "meeting_coordinates.enc",
    verified: true,
    securityLevel: "medium",
  },
];

export default ActivityFeed;
