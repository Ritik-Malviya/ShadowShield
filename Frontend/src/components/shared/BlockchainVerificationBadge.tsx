import React from "react";
import { cn } from "@/lib/utils";
import { Shield, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type VerificationStatus = "verified" | "pending" | "failed" | "unknown";

interface BlockchainVerificationBadgeProps {
  status?: VerificationStatus;
  transactionHash?: string;
  timestamp?: string;
  className?: string;
  showLabel?: boolean;
}

const BlockchainVerificationBadge = ({
  status = "unknown",
  transactionHash = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  timestamp = new Date().toISOString(),
  className = "",
  showLabel = true,
}: BlockchainVerificationBadgeProps) => {
  const statusConfig = {
    verified: {
      icon: ShieldCheck,
      label: "Blockchain Verified",
      description: "This item has been verified on the blockchain",
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
    },
    pending: {
      icon: Clock,
      label: "Verification Pending",
      description: "Blockchain verification in progress",
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
    },
    failed: {
      icon: ShieldAlert,
      label: "Verification Failed",
      description: "Blockchain verification failed",
      color: "text-red-500 bg-red-50 dark:bg-red-950/30",
    },
    unknown: {
      icon: Shield,
      label: "Unverified",
      description: "This item has not been verified on the blockchain",
      color: "text-gray-500 bg-gray-50 dark:bg-gray-800/30",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const formatTransactionHash = (hash: string) => {
    if (!hash) return "";
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
              config.color,
              className,
            )}
          >
            <Icon size={14} />
            {showLabel && <span>{config.label}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{config.description}</p>
            {transactionHash && (
              <p className="text-xs opacity-80">
                TX: {formatTransactionHash(transactionHash)}
              </p>
            )}
            {timestamp && (
              <p className="text-xs opacity-80">
                Time: {formatTimestamp(timestamp)}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BlockchainVerificationBadge;
