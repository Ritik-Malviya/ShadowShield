import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { 
  Shield, 
  FileText, 
  MessageSquare, 
  ShieldAlert, 
  Settings, 
  User, 
  Menu,
  ChevronRight,
  LogOut,
  Home
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

type SidebarItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Files', path: '/files', icon: <FileText size={20} /> },
    { name: 'Messages', path: '/messages', icon: <MessageSquare size={20} /> },
    { name: 'Security Log', path: '/security-log', icon: <ShieldAlert size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-20"
        )}
        style={{ top: '64px' }} // Adjust based on your navbar height
      >
        {/* Sidebar toggle */}
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-4 bg-gray-800 border border-gray-700 rounded-full p-1"
        >
          <ChevronRight 
            size={16} 
            className={cn(
              "text-gray-400 transition-transform duration-300",
              sidebarOpen ? "rotate-180" : ""
            )} 
          />
        </button>
        
        {/* Sidebar items */}
        <div className="flex-1 overflow-y-auto pt-6 pb-4">
          <div className="px-3 space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center py-3 px-3 rounded-md transition-colors",
                  location.pathname === item.path 
                    ? "bg-yellow-900/40 text-yellow-500" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-white",
                  !sidebarOpen && "justify-center"
                )}
              >
                <div className={cn("flex items-center", !sidebarOpen && "justify-center")}>
                  {item.icon}
                  {sidebarOpen && <span className="ml-3">{item.name}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Sidebar footer */}
        <div className="p-3 border-t border-gray-800">
          <div className={cn(
            "flex items-center mb-4",
            !sidebarOpen && "justify-center"
          )}>
            {user && (
              <>
                <div className="bg-yellow-600 rounded-full h-10 w-10 flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {sidebarOpen && (
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.role}</p>
                  </div>
                )}
              </>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center w-full py-2 px-3 rounded-md text-red-400 hover:bg-gray-800 transition-colors",
              !sidebarOpen && "justify-center"
            )}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        "flex-1 overflow-auto transition-all duration-300 ease-in-out",
        sidebarOpen ? "ml-64" : "ml-20",
        "pt-16" // For navbar
      )}>
        <Navbar />
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
