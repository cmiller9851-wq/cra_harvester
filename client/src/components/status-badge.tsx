import { cn } from "@/lib/utils";

export type StatusType = "pending" | "completed" | "failed";

interface StatusBadgeProps {
  status: string; // Using string to be flexible with backend return types
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase() as StatusType;

  const styles = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    failed: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const labels = {
    pending: "Processing",
    completed: "Completed",
    failed: "Failed",
  };

  const selectedStyle = styles[normalizedStatus] || styles.pending;
  const label = labels[normalizedStatus] || status;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        selectedStyle,
        className
      )}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full mr-1.5",
        normalizedStatus === "pending" && "bg-yellow-500 animate-pulse",
        normalizedStatus === "completed" && "bg-green-500",
        normalizedStatus === "failed" && "bg-red-500"
      )} />
      {label}
    </span>
  );
}
