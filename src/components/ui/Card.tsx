import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const Card = ({ className, children, ...props }: CardProps) => (
  <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden", className)} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ className, children, ...props }: CardProps) => (
  <div className={cn("px-6 py-4 border-b border-gray-50", className)} {...props}>
    {children}
  </div>
);

export const CardContent = ({ className, children, ...props }: CardProps) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);
