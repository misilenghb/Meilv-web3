import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ 
  children, 
  className = "", 
  padding = "md", 
  hover = false,
  onClick 
}: GlassCardProps) {
  const paddingClasses = {
    sm: "p-3",
    md: "p-4 md:p-6",
    lg: "p-6 md:p-8"
  };

  const baseClasses = "glass rounded-2xl";
  const hoverClasses = hover ? "hover:opacity-80 transition-opacity cursor-pointer" : "";
  const paddingClass = paddingClasses[padding];
  
  const allClasses = `${baseClasses} ${paddingClass} ${hoverClasses} ${className}`.trim();

  if (onClick) {
    return (
      <div className={allClasses} onClick={onClick} role="button" tabIndex={0}>
        {children}
      </div>
    );
  }

  return (
    <div className={allClasses}>
      {children}
    </div>
  );
}
