import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Shield,
  FileText,
  MessageSquare,
  Settings,
  Activity,
  Home,
  LogOut,
  Lock,
  Key,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  className?: string;
  activePath?: string;
}

const Sidebar = ({ className, activePath = "/" }: SidebarProps) => {
  const navigate = useNavigate();
  const { logout, user, sessionId } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      navigate('/login');
    }
  };

  // Navigation items with their paths and icons
  const navItems = [
    { name: "Dashboard", path: "/", icon: <Home size={20} /> },
    { name: "Files", path: "/files", icon: <FileText size={20} /> },
    { name: "Messages", path: "/messages", icon: <MessageSquare size={20} /> },
    {
      name: "Security Log",
      path: "/security-log",
      icon: <Activity size={20} />,
    },
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div
      className={cn(
        "w-[280px] h-full bg-black/95 text-white flex flex-col border-r border-gray-800",
        className,
      )}
    >
      {/* Logo and title section */}
      <div className="p-6 flex items-center space-x-3">
        <Shield className="h-8 w-8 text-red-500" />
        <div>
          <h2 className="font-bold text-lg">ShadowShield</h2>
          <p className="text-xs text-gray-400">Secure Data Platform</p>
        </div>
      </div>

      <Separator className="bg-gray-800" />

      {/* Navigation section */}
      <div className="flex-1 py-6 px-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <TooltipProvider key={item.path}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors",
                      activePath === item.path
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50",
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    {item.name === "Messages" && (
                      <Badge className="ml-auto bg-red-500 hover:bg-red-600">
                        3
                      </Badge>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </nav>
      </div>

      {/* Security status section */}
      <div className="p-4 bg-gray-900/50 border-t border-gray-800">
        <div className="flex items-center space-x-3 mb-3">
          <Lock size={18} className="text-green-500" />
          <div>
            <p className="text-sm font-medium">Security Status</p>
            <p className="text-xs text-green-500">Secure Connection</p>
          </div>
        </div>
        
        {/* Session ID display */}
        {sessionId && (
          <div className="mb-3 py-2 px-3 bg-gray-800/80 rounded border border-gray-700 text-xs">
            <div className="flex items-center text-yellow-500 mb-1">
              <Key size={10} className="mr-1" />
              <span>Session ID</span>
            </div>
            <div className="font-mono text-gray-300 text-xs break-all">
              {sessionId}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-400">Active</span>
          </div>
          <button 
            className="flex items-center text-xs text-gray-400 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut size={14} className="mr-1" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
