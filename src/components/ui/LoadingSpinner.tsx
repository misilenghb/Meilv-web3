interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full animate-spin ${className}`} />
  );
}

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "加载中...", className = "" }: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center gap-3 py-8 ${className}`}>
      <LoadingSpinner />
      <span className="text-sm opacity-70">{message}</span>
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  title = "暂无数据", 
  description, 
  action, 
  className = "" 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl opacity-20 mb-4">📭</div>
      <div className="text-lg font-medium opacity-80 mb-2">{title}</div>
      {description && (
        <div className="text-sm opacity-60 mb-4">{description}</div>
      )}
      {action}
    </div>
  );
}
