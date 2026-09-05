import React, { forwardRef } from 'react';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  prefixIcon?: React.ReactNode;
  textarea?: boolean;
  rows?: number;
}

export const InputField = forwardRef<HTMLInputElement & HTMLTextAreaElement, InputFieldProps>(({
  label,
  error,
  prefixIcon,
  textarea = false,
  className = '',
  id,
  ...props
}, ref) => {
  const baseInputStyle = 'w-full h-10 px-3 bg-surface border border-border rounded-md text-sm text-text-primary placeholder-text-faint transition-all duration-150 ease-out focus:border-brand focus:ring-focus';
  const errorInputStyle = 'border-danger focus:border-danger focus:ring-[0_0_0_3px_rgba(220,38,38,0.12)]';
  
  const textareaStyle = `${baseInputStyle} h-auto py-2.5 resize-none`;

  const inputStyle = textarea 
    ? `${textareaStyle} ${error ? errorInputStyle : ''} ${prefixIcon ? 'pl-9' : ''} ${className}`
    : `${baseInputStyle} ${error ? errorInputStyle : ''} ${prefixIcon ? 'pl-9' : ''} ${className}`;

  const uniqueId = id || 'input_' + Math.random().toString(36).substr(2, 9);

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label htmlFor={uniqueId} className="text-xs font-semibold text-text-secondary uppercase tracking-[0.04em] select-none">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefixIcon && (
          <div className="absolute left-3 text-text-muted flex items-center justify-center pointer-events-none">
            {prefixIcon}
          </div>
        )}
        {textarea ? (
          <textarea
            id={uniqueId}
            ref={ref}
            className={inputStyle}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={uniqueId}
            ref={ref}
            className={inputStyle}
            {...props}
          />
        )}
      </div>
      {error && (
        <span className="text-xs text-danger font-medium select-none">
          {error}
        </span>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';
export default InputField;

