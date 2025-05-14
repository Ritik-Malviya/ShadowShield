import React from "react";
import { 
  Card, 
  CardContent
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { AlertTriangle, Bell, Shield, Clock, ChevronRight } from "lucide-react";
import { Badge } from "../../components/ui/badge";

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      title: "Security Alert",
      message: "Suspicious login attempt detected from Moscow, Russia",
      time: "10 minutes ago",
      type: "warning"
    },
    {
      id: 2,
      title: "File Expiring",
      message: "Mission_brief_14.pdf will self-destruct in 2 hours",
      time: "30 minutes ago",
      type: "info"
    },
    {
      id: 3,
      title: "Message Read",
      message: "Agent Miller accessed your secure message",
      time: "2 hours ago",
      type: "success"
    },
    {
      id: 4,
      title: "Access Attempt",
      message: "Blocked unauthorized access to classified file #278",
      time: "3 hours ago",
      type: "warning"
    },
    {
      id: 5,
      title: "AI Defense Triggered",
      message: "Fake data injection deployed against potential attack",
      time: "Yesterday",
      type: "warning"
    }
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Bell className="h-5 w-5 mr-2 text-primary" />
          Notifications
        </h1>
        <Badge variant="outline" className="bg-red-900/30 text-red-400 border-red-800">
          {notifications.length} New
        </Badge>
      </div>

      <div className="grid gap-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="mt-1">
                {notification.type === "warning" && (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
                {notification.type === "info" && (
                  <Clock className="h-5 w-5 text-blue-500" />
                )}
                {notification.type === "success" && (
                  <Shield className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium">{notification.title}</h3>
                  <span className="text-xs text-gray-400">{notification.time}</span>
                </div>
                <p className="text-sm text-gray-400">{notification.message}</p>
                <div className="mt-3 flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs text-primary hover:text-primary-foreground hover:bg-primary/20 p-0"
                  >
                    View Details
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length > 0 && (
        <div className="mt-6 flex justify-between">
          <Button variant="outline" className="border-gray-700 text-gray-400">
            Mark All as Read
          </Button>
          <Button variant="destructive" size="sm">
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};

export default Notifications;