import React from "react";
import { LucideIcon, AlertCircle } from "lucide-react";

interface FormInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: "text" | "email" | "tel" | "number" | "date" | "password";
  min?: string;
  max?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
}

export function FormInput({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  type = "text",
  min,
  max,
  icon: Icon,
  disabled = false,
  className = "",
}: FormInputProps) {
  const inputId = React.useId();

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        )}
        
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          disabled={disabled}
          className={`
            w-full px-3 py-2.5 text-sm border rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            transition-colors
            ${Icon ? "pl-10" : ""}
            ${error ? "border-red-500" : "border-gray-300"}
            ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
          `}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
      </div>
      
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-red-500 text-xs flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

interface FormTextAreaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  rows?: number;
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
}

export function FormTextArea({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  rows = 3,
  icon: Icon,
  disabled = false,
  className = "",
}: FormTextAreaProps) {
  const textareaId = React.useId();

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
        )}
        
        <textarea
          id={textareaId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={`
            w-full px-3 py-2.5 text-sm border rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            transition-colors resize-none
            ${Icon ? "pl-10" : ""}
            ${error ? "border-red-500" : "border-gray-300"}
            ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
          `}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${textareaId}-error` : undefined}
        />
      </div>
      
      {error && (
        <p
          id={`${textareaId}-error`}
          className="text-red-500 text-xs flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

interface FormSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function FormSelect({
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder = "Chọn một tùy chọn",
  disabled = false,
  className = "",
}: FormSelectProps) {
  const selectId = React.useId();

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-3 py-2.5 text-sm border rounded-lg 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          transition-colors
          ${error ? "border-red-500" : "border-gray-300"}
          ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
        `}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${selectId}-error` : undefined}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p
          id={`${selectId}-error`}
          className="text-red-500 text-xs flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}