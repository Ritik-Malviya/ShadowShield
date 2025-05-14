import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Shield, Bell, User, Menu, X, Settings, FileText, MessageSquare, ShieldAlert, Key, UserCircle2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const { logout, user, sessionId } = useAuth();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Shield size={16} /> },
    { path: "/files", label: "Files", icon: <FileText size={16} /> },
    { path: "/messages", label: "Messages", icon: <MessageSquare size={16} /> },
    { path: "/security-log", label: "Security Log", icon: <ShieldAlert size={16} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={16} /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      // Force navigation to login page anyway
      navigate('/login');
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 fixed top-0 left-0 right-0 h-16 z-50 flex items-center px-4">
      <div className="flex-1 flex items-center">
        <Link to="/dashboard" className="flex items-center">
          <Shield className="h-6 w-6 text-yellow-500 mr-2" />
          <span className="text-white font-bold text-lg">ShadowShield</span>
        </Link>
      </div>
      
      {/* Session ID display */}
      {sessionId && (
        <div className="hidden sm:flex items-center px-3 py-1.5 bg-gray-800 rounded border border-gray-700">
          <Key size={12} className="text-yellow-500 mr-1.5" />
          <span className="text-xs text-gray-300">Session: {sessionId.substring(0, 8)}...</span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
