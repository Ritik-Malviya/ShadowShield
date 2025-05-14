import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Clock, Eye, Shield, Key, Lock, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface SecurityRulesConfigProps {
  onConfigChange?: (config: SecurityConfig) => void;
  defaultConfig?: SecurityConfig;
  className?: string;
}

export interface SecurityConfig {
  destructionType: "time" | "access" | "manual";
  timeSettings: {
    hours: number;
    minutes: number;
  };
  accessSettings: {
    maxAccesses: number;
  };
  manualSettings: {
    enableKillSwitch: boolean;
  };
  blockchainVerification: boolean;
  advancedSecurity: {
    enableAiProtection: boolean;
    enableFakeDataInjection: boolean;
  };
}

const SecurityRulesConfig = ({
  onConfigChange,
  defaultConfig = {
    destructionType: "time",
    timeSettings: {
      hours: 24,
      minutes: 0,
    },
    accessSettings: {
      maxAccesses: 3,
    },
    manualSettings: {
      enableKillSwitch: true,
    },
    blockchainVerification: true,
    advancedSecurity: {
      enableAiProtection: true,
      enableFakeDataInjection: false,
    },
  },
  className,
}: SecurityRulesConfigProps) => {
  const [config, setConfig] = useState<SecurityConfig>(defaultConfig);

  const handleConfigChange = (newConfig: Partial<SecurityConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
  };

  const handleTimeChange = (
    field: keyof SecurityConfig["timeSettings"],
    value: number,
  ) => {
    const updatedTimeSettings = { ...config.timeSettings, [field]: value };
    handleConfigChange({ timeSettings: updatedTimeSettings });
  };

  const handleAccessChange = (value: number) => {
    handleConfigChange({ accessSettings: { maxAccesses: value } });
  };

  const handleManualChange = (value: boolean) => {
    handleConfigChange({ manualSettings: { enableKillSwitch: value } });
  };

  const handleAdvancedSecurityChange = (
    field: keyof SecurityConfig["advancedSecurity"],
    value: boolean,
  ) => {
    const updatedAdvancedSecurity = {
      ...config.advancedSecurity,
      [field]: value,
    };
    handleConfigChange({ advancedSecurity: updatedAdvancedSecurity });
  };

  return (
    <Card className={cn("w-full bg-zinc-900 border-zinc-800", className)}>
      <CardHeader>
        <CardTitle className="flex items-center text-zinc-100">
          <Shield className="mr-2 h-5 w-5 text-yellow-500" />
          Security Rules Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={config.destructionType}
          onValueChange={(value) =>
            handleConfigChange({
              destructionType: value as SecurityConfig["destructionType"],
            })
          }
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-6 bg-zinc-800">
            <TabsTrigger
              value="time"
              className="data-[state=active]:bg-zinc-700"
            >
              <Clock className="mr-2 h-4 w-4" /> Time-based
            </TabsTrigger>
            <TabsTrigger
              value="access"
              className="data-[state=active]:bg-zinc-700"
            >
              <Eye className="mr-2 h-4 w-4" /> Access-based
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="data-[state=active]:bg-zinc-700"
            >
              <Key className="mr-2 h-4 w-4" /> Manual Kill Switch
            </TabsTrigger>
          </TabsList>

          <TabsContent value="time" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Self-destruct after</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-sm">Hours</Label>
                  <Input
                    type="number"
                    min="0"
                    max="168"
                    value={config.timeSettings.hours}
                    onChange={(e) =>
                      handleTimeChange("hours", parseInt(e.target.value) || 0)
                    }
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-sm">Minutes</Label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={config.timeSettings.minutes}
                    onChange={(e) =>
                      handleTimeChange("minutes", parseInt(e.target.value) || 0)
                    }
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
              </div>
              <p className="text-sm text-zinc-400 mt-2">
                Content will be permanently destroyed after{" "}
                {config.timeSettings.hours > 0 &&
                  `${config.timeSettings.hours} hour(s)`}{" "}
                {config.timeSettings.minutes > 0 &&
                  `${config.timeSettings.minutes} minute(s)`}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="access" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-zinc-300">Maximum access count</Label>
                <span className="text-emerald-500 font-medium">
                  {config.accessSettings.maxAccesses}
                </span>
              </div>
              <Slider
                defaultValue={[config.accessSettings.maxAccesses]}
                min={1}
                max={10}
                step={1}
                onValueChange={(values) => handleAccessChange(values[0])}
                className="py-4"
              />
              <p className="text-sm text-zinc-400">
                Content will self-destruct after being accessed{" "}
                {config.accessSettings.maxAccesses} time(s)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-zinc-300">Enable Kill Switch</Label>
                <p className="text-sm text-zinc-400">
                  Allows you to manually destroy content at any time
                </p>
              </div>
              <Switch
                checked={config.manualSettings.enableKillSwitch}
                onCheckedChange={handleManualChange}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
            {config.manualSettings.enableKillSwitch && (
              <div className="mt-4 p-3 bg-zinc-800 rounded-md border border-zinc-700">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                  <p className="text-sm text-zinc-300">
                    When activated, you'll receive a unique destruction key.
                    Keep it secure - anyone with this key can trigger content
                    destruction.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-6 border-t border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-zinc-300">Blockchain Verification</Label>
              <p className="text-sm text-zinc-400">
                Log all security events on blockchain for tamper-proof
                verification
              </p>
            </div>
            <Switch
              checked={config.blockchainVerification}
              onCheckedChange={(value) =>
                handleConfigChange({ blockchainVerification: value })
              }
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-zinc-300">Advanced Security Options</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-zinc-400 text-sm">
                    AI Intrusion Detection
                  </Label>
                  <p className="text-xs text-zinc-500">
                    Detect suspicious access patterns and lock content
                  </p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Switch
                        checked={config.advancedSecurity.enableAiProtection}
                        onCheckedChange={(value) =>
                          handleAdvancedSecurityChange(
                            "enableAiProtection",
                            value,
                          )
                        }
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Uses AI to detect unauthorized access attempts
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-zinc-400 text-sm">
                    Fake Data Injection
                  </Label>
                  <p className="text-xs text-zinc-500">
                    Serve decoy content to potential attackers
                  </p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Switch
                        checked={
                          config.advancedSecurity.enableFakeDataInjection
                        }
                        onCheckedChange={(value) =>
                          handleAdvancedSecurityChange(
                            "enableFakeDataInjection",
                            value,
                          )
                        }
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Misleads attackers with AI-generated fake content
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Lock className="mr-2 h-4 w-4" /> Apply Security Rules
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityRulesConfig;
