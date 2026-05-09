/**
 * Reusable Blog Form Field Component
 * Handles form field rendering with proper error display
 */

import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import type { FieldError, Merge } from 'react-hook-form';

interface BlogFormFieldProps {
  label: string;
  htmlFor: string;
  error?: FieldError | Merge<FieldError, (FieldError | undefined)[]>;
  required?: boolean;
  helperText?: string;
  children: React.ReactNode;
}

export function BlogFormField({
  label,
  htmlFor,
  error,
  required = false,
  helperText,
  children,
}: BlogFormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {children}
      
      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-1.5 text-xs text-red-600 mt-1.5">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{error.message}</span>
        </div>
      )}
      
      {/* Helper Text */}
      {!error && helperText && (
        <p className="text-xs text-slate-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}

