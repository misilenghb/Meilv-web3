import { ReactNode } from "react";

interface GlassFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function GlassField({ label, error, required, children, className = "" }: GlassFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <div className="text-red-400 text-xs" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

interface GlassInputProps {
  type?: "text" | "email" | "password" | "number" | "tel";
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  autoComplete?: string;
  min?: number;
  max?: number;
}

export function GlassInput({
  type = "text",
  placeholder,
  value,
  onChange,
  onKeyPress,
  disabled = false,
  className = "",
  autoComplete,
  min,
  max
}: GlassInputProps) {
  const baseClasses = "glass rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      disabled={disabled}
      className={`${baseClasses} ${disabledClasses} ${className}`.trim()}
      autoComplete={autoComplete}
      min={min}
      max={max}
    />
  );
}

interface GlassTextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export function GlassTextarea({
  placeholder,
  value,
  onChange,
  disabled = false,
  rows = 3,
  className = ""
}: GlassTextareaProps) {
  const baseClasses = "glass rounded px-3 py-2 w-full resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      rows={rows}
      className={`${baseClasses} ${disabledClasses} ${className}`.trim()}
    />
  );
}

interface GlassSelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function GlassSelect({
  value,
  onChange,
  disabled = false,
  className = "",
  children
}: GlassSelectProps) {
  const baseClasses = "glass rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${baseClasses} ${disabledClasses} ${className}`.trim()}
    >
      {children}
    </select>
  );
}
