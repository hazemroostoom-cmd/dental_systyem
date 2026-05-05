import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const Tooltip = ({ content, children, position = "top", className }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsVisible(true);
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: position === "top" ? rect.top - 8 : rect.bottom + 8
      });
    }
  };

  return (
    <div 
      className="relative inline-block" 
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "fixed z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-sm animate-in fade-in zoom-in-95 duration-100 whitespace-nowrap pointer-events-none",
            className
          )}
          style={{
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            transform: `translate(-50%, ${position === "top" ? "-100%" : "0"})`
          }}
        >
          {content}
          <div 
            className={cn(
              "absolute w-2 h-2 bg-gray-900 rotate-45",
              position === "top" ? "-bottom-1 left-1/2 -translate-x-1/2" : "-top-1 left-1/2 -translate-x-1/2"
            )}
          />
        </div>
      )}
    </div>
  );
};
