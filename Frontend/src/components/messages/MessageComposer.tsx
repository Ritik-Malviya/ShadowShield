import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Lock,
  Send,
  Image,
  AlertTriangle,
  Clock,
  Eye,
  Shield,
  Info,
} from "lucide-react";

interface MessageComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSend?: (message: {
    content: string;
    securityType: string;
    carrierImage: File | null;
    destructionRules: {
      type: string;
      timeLimit?: number;
      accessLimit?: number;
      killSwitch: boolean;
    };
  }) => void;
}

const MessageComposer = ({
  isOpen = true,
  onClose = () => {},
  onSend = () => {},
}: MessageComposerProps) => {
  const navigate = useNavigate();
  const [messageContent, setMessageContent] = useState<string>("");
  const [securityType, setSecurityType] = useState<string>("standard");
  const [carrierImage, setCarrierImage] = useState<File | null>(null);
  const [destructionType, setDestructionType] = useState<string>("time");
  const [timeLimit, setTimeLimit] = useState<number>(24);
  const [accessLimit, setAccessLimit] = useState<number>(1);
  const [killSwitch, setKillSwitch] = useState<boolean>(true);
  const [verificationStatus, setVerificationStatus] =
    useState<string>("pending");

  // Handle close action with navigation
  const handleClose = () => {
    // Reset form
    setMessageContent("");
    setSecurityType("standard");
    setCarrierImage(null);
    setDestructionType("time");
    setTimeLimit(24);
    setAccessLimit(1);
    setVerificationStatus("pending");
    
    // Close modal and navigate back
    onClose();
    navigate('/dashboard');
  };

  const handleSend = () => {
    // Simulate blockchain verification
    setVerificationStatus("verifying");
    setTimeout(() => {
      setVerificationStatus("verified");
      onSend({
        content: messageContent,
        securityType,
        carrierImage,
        destructionRules: {
          type: destructionType,
          timeLimit: destructionType === "time" ? timeLimit : undefined,
          accessLimit: destructionType === "access" ? accessLimit : undefined,
          killSwitch,
        },
      });
      // Reset form after sending
      setTimeout(() => {
        setMessageContent("");
        setSecurityType("standard");
        setCarrierImage(null);
        setDestructionType("time");
        setTimeLimit(24);
        setAccessLimit(1);
        setVerificationStatus("pending");
        handleClose(); // Use our handleClose function that includes navigation
      }, 1500);
    }, 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCarrierImage(e.target.files[0]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border border-gray-800 text-gray-100 p-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        <DialogHeader className="p-6 border-b border-gray-800">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-400" />
            Secure Message Composer
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a self-destructing message with advanced security options
          </DialogDescription>
          {/* Add close button in the header */}
          <Button 
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <Tabs defaultValue="compose" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 bg-gray-800">
              <TabsTrigger
                value="compose"
                className="data-[state=active]:bg-gray-700"
              >
                Compose Message
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-gray-700"
              >
                Security Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Message Content</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your secure message here..."
                  className="h-32 bg-gray-800 border-gray-700 focus:border-blue-500"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Encryption Method</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer border ${securityType === "standard" ? "border-blue-500 bg-gray-800" : "border-gray-700 bg-gray-900"}`}
                    onClick={() => setSecurityType("standard")}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                      <Shield className="h-8 w-8 text-blue-400" />
                      <div className="font-medium">Standard Encryption</div>
                      <p className="text-xs text-gray-400 text-center">
                        AES-256 encryption with secure key exchange
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer border ${securityType === "steganography" ? "border-blue-500 bg-gray-800" : "border-gray-700 bg-gray-900"}`}
                    onClick={() => setSecurityType("steganography")}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                      <Image className="h-8 w-8 text-purple-400" />
                      <div className="font-medium">Steganography</div>
                      <p className="text-xs text-gray-400 text-center">
                        Hide message within an image file
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {securityType === "steganography" && (
                <div className="space-y-2 p-4 border border-dashed border-gray-700 rounded-md bg-gray-800/50">
                  <Label htmlFor="carrier-image">Carrier Image</Label>
                  <Input
                    id="carrier-image"
                    type="file"
                    accept="image/*"
                    className="bg-gray-800 border-gray-700"
                    onChange={handleImageUpload}
                  />
                  {carrierImage && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-green-400 border-green-400"
                      >
                        Image Selected: {carrierImage.name}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCarrierImage(null)}
                        className="h-6 text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-amber-400 text-xs">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      For maximum security, use high-resolution images
                    </span>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="space-y-4">
                <Label>Self-Destruction Rules</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Card
                    className={`cursor-pointer border ${destructionType === "time" ? "border-blue-500 bg-gray-800" : "border-gray-700 bg-gray-900"}`}
                    onClick={() => setDestructionType("time")}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                      <Clock className="h-6 w-6 text-blue-400" />
                      <div className="font-medium text-sm">Time-based</div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer border ${destructionType === "access" ? "border-blue-500 bg-gray-800" : "border-gray-700 bg-gray-900"}`}
                    onClick={() => setDestructionType("access")}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                      <Eye className="h-6 w-6 text-purple-400" />
                      <div className="font-medium text-sm">Access-based</div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer border ${destructionType === "manual" ? "border-blue-500 bg-gray-800" : "border-gray-700 bg-gray-900"}`}
                    onClick={() => setDestructionType("manual")}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                      <AlertTriangle className="h-6 w-6 text-red-400" />
                      <div className="font-medium text-sm">Manual Only</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {destructionType === "time" && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="time-limit">Time Limit (hours)</Label>
                    <span className="text-blue-400 font-mono">
                      {timeLimit}h
                    </span>
                  </div>
                  <Input
                    id="time-limit"
                    type="range"
                    min="1"
                    max="72"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                    className="accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1h</span>
                    <span>24h</span>
                    <span>72h</span>
                  </div>
                </div>
              )}

              {destructionType === "access" && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="access-limit">Access Limit (views)</Label>
                    <span className="text-purple-400 font-mono">
                      {accessLimit} view{accessLimit !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <Input
                    id="access-limit"
                    type="range"
                    min="1"
                    max="10"
                    value={accessLimit}
                    onChange={(e) => setAccessLimit(parseInt(e.target.value))}
                    className="accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 view</span>
                    <span>5 views</span>
                    <span>10 views</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between space-x-2 p-4 border border-gray-800 rounded-md bg-gray-800/50">
                <div className="space-y-1">
                  <div className="font-medium flex items-center gap-2">
                    Manual Kill Switch
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-60 text-xs">
                            Enables you to manually destroy the message at any
                            time, regardless of other settings
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-gray-400">
                    Allow remote destruction at any time
                  </p>
                </div>
                <Switch
                  checked={killSwitch}
                  onCheckedChange={setKillSwitch}
                  className="data-[state=checked]:bg-red-500"
                />
              </div>

              <div className="mt-6 p-4 border border-gray-800 rounded-md bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Blockchain Verification</div>
                  <Badge
                    variant="outline"
                    className={`
                      ${verificationStatus === "pending" ? "text-amber-400 border-amber-400" : ""}
                      ${verificationStatus === "verifying" ? "text-blue-400 border-blue-400" : ""}
                      ${verificationStatus === "verified" ? "text-green-400 border-green-400" : ""}
                    `}
                  >
                    {verificationStatus === "pending" && "Pending"}
                    {verificationStatus === "verifying" && "Verifying..."}
                    {verificationStatus === "verified" && "Verified"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Message delivery and destruction events will be logged on the
                  blockchain for security
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-800 bg-gray-900">
          <Button
            variant="outline"
            onClick={handleClose} // Update to use our handleClose function
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={
              !messageContent.trim() ||
              (securityType === "steganography" && !carrierImage)
            }
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Secure Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageComposer;
