import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  // Styles per Section 9 and 15
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-full active:scale-95 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-50 select-none';
  
  const variants = {
    primary: 'bg-brand text-white shadow-brand hover:bg-brand-dark focus:ring-focus',
    secondary: 'bg-surface border border-border-strong text-text-primary hover:bg-surface-2 hover:border-brand focus:ring-focus',
    ghost: 'bg-transparent text-brand hover:bg-brand-light active:bg-brand-light focus:ring-focus',
    danger: 'bg-danger text-white shadow-md hover:bg-red-700 focus:ring-red-200',
    icon: 'p-2 bg-transparent text-text-muted hover:bg-surface-2 hover:text-text-primary rounded-full transition-colors'
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs rounded-full',
    md: 'px-5 py-2.5 text-sm rounded-full',
    lg: 'px-7 py-3 text-base rounded-full'
  };

  // Fixed size for icon button
  const buttonStyle = variant === 'icon' 
    ? `${baseStyle} ${variants[variant]} ${className}`
    : `${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      disabled={disabled || loading}
      className={buttonStyle}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        ...(loading ? { width: '120px' } : {})
      }}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {icon && <span className="mr-2 inline-flex">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
export default Button;

