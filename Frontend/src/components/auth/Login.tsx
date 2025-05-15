import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn,
  Key,
  CheckCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [sessionIdDisplay, setSessionIdDisplay] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("Login submit with API URL:", import.meta.env.VITE_API_URL);
      await login(formData.email, formData.password);
      
      // Show success state with session ID
      setLoginSuccess(true);
      setSessionIdDisplay(localStorage.getItem('sessionId'));
      
      // Navigate after a short delay to show session ID
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Login error details:', error);
      if (error.message === 'Network Error') {
        setErrorMessage('Network error - Check your connection and make sure the backend server is running. Contact support if this persists.');
      } else {
        setErrorMessage(error.response?.data?.error || 'Authentication failed');
      }
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <Shield className="h-12 w-12 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold text-yellow-500 mb-2">ShadowShield</h1>
          <p className="text-gray-400">Secure Authentication</p>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-400">
              <Lock className="h-5 w-5 mr-2" />
              Secure Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="bg-red-900/30 border border-red-800 rounded-md p-3 mb-4 text-red-400 text-sm">
                {errorMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white text-sm">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Login to System
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-4 pt-0">
            <div className="text-sm text-gray-400">
              Don't have an account? <Link to="/register" className="text-yellow-500 hover:underline">Register</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {loginSuccess && sessionIdDisplay && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-xl font-bold text-yellow-500 mb-2">Authentication Successful</h2>
              <p className="text-gray-300 text-center mb-4">
                Your secure session has been established
              </p>
              <div className="w-full bg-gray-800 rounded-lg p-4 mb-4">
                <div className="text-xs text-yellow-500 mb-1 flex items-center">
                  <Key className="h-3 w-3 mr-1" />
                  Session Identifier
                </div>
                <div className="font-mono text-sm text-white break-all">
                  {sessionIdDisplay}
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Redirecting to secure dashboard...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;