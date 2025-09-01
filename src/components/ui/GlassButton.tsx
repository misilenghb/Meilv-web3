import { ReactNode } from "react";

interface GlassButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "glass" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export default function GlassButton({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = ""
}: GlassButtonProps) {
  const baseClasses = "rounded font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50";
  
  const variantClasses = {
    primary: "bg-accent text-white hover:bg-accent/90 active:bg-accent/80",
    secondary: "bg-white/10 text-white hover:bg-white/20 active:bg-white/30",
    glass: "glass hover:bg-white/5 active:bg-white/10",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800"
  };

  const sizeClasses = {
    sm: "px-3 py-1 text-xs min-h-[32px]",
    md: "px-4 py-2 text-sm min-h-[40px]",
    lg: "px-6 py-3 text-base min-h-[48px]"
  };

  const disabledClasses = disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  
  const allClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`.trim();

  return (
    <button
      type={type}
      className={allClasses}
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>加载中...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
