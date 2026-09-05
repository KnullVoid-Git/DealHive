import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'standard' | 'secondary' | 'hero';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'standard',
  className = '',
  ...props
}) => {
  const isClickable = !!props.onClick;
  const baseStyle = `rounded-2xl transition-all duration-300 overflow-hidden ${
    isClickable ? 'cursor-pointer active:scale-95 hover:-translate-y-0.5 hover:shadow-md' : ''
  }`;
  
  const variants = {
    standard: 'bg-surface border border-border shadow-sm hover:shadow-md hover:border-border-strong p-6',
    secondary: 'bg-surface-2 border border-border p-4 shadow-none',
    hero: 'bg-gradient-to-br from-brand via-[#8B78FF] to-[#A78BFA] text-white p-6 shadow-[0_8px_32px_rgba(108,99,255,0.3)]'
  };

  const cardStyle = `${baseStyle} ${variants[variant]} ${className}`;

  return (
    <div 
      className={cardStyle} 
      style={{
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        ...props.style
      }}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;

