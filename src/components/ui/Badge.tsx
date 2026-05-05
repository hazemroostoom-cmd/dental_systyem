import { cn } from "@/lib/utils";
import { CaseStatus } from "@/types";

const statusStyles: Record<CaseStatus, string> = {
  ScanReceived: "bg-blue-50 text-blue-700 border-blue-100",
  Design: "bg-purple-50 text-purple-700 border-purple-100",
  AwaitingApproval: "bg-amber-50 text-amber-700 border-amber-100",
  InProduction: "bg-indigo-50 text-indigo-700 border-indigo-100",
  Shipped: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export const Badge = ({ status, className }: { status: CaseStatus; className?: string }) => (
  <span className={cn(
    "px-2.5 py-0.5 rounded-full text-xs font-medium border",
    statusStyles[status],
    className
  )}>
    {status.replace(/([A-Z])/g, ' $1').trim()}
  </span>
);
