import React, { useRef } from 'react';

export interface PremiumGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const PremiumGlassCard: React.FC<PremiumGlassCardProps> = ({ children, className = '', ...props }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Set custom CSS variables on the element
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const isClickable = !!props.onClick;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-border-strong ${
        isClickable ? 'cursor-pointer hover:-translate-y-0.5 active:scale-[0.98]' : ''
      } ${className}`}
      style={{
        transitionTimingFunction: 'var(--spring)',
        ...props.style
      }}
      {...props}
    >
      {/* Dynamic Ambient Background Sweep */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), hsla(var(--brand-h, 244), var(--brand-s, 100%), var(--brand-l, 70%), 0.06), transparent 80%)`,
        }}
      />

      {/* Dynamic 1px Border Highlight Sweep (Linear style) */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl border border-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(140px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), hsla(var(--brand-h, 244), var(--brand-s, 100%), var(--brand-l, 70%), 0.35), transparent 80%)`,
          WebkitMaskImage: 'linear-gradient(#fff, #fff)',
          WebkitMaskComposite: 'destination-in',
          maskComposite: 'exclude',
          padding: '1px',
        }}
      />

      {/* Card Inset Shadow Highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Card Content Wrapper */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PremiumGlassCard;

