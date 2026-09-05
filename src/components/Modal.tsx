import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'standard' | 'wide';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'standard',
  children,
  footer
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    standard: 'max-w-[540px]',
    wide: 'max-w-[760px]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#111827]/45 backdrop-blur-[6px] transition-opacity duration-300"
      />
      
      {/* Modal card content */}
      <div 
        className={`relative w-full bg-surface rounded-xl shadow-xl border border-border p-7 flex flex-col z-10 animate-spring transform transition-all ${sizeClasses[size]}`}
        style={{
          animation: 'modalEntrance 200ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h3 className="text-lg font-bold text-text-primary sora-heading">
            {title}
          </h3>
          <Button variant="icon" onClick={onClose} aria-label="Close modal">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable contents */}
        <div className="py-5 overflow-y-auto max-h-[60vh] text-sm text-text-secondary">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="pt-4 border-t border-border flex justify-end items-center space-x-3">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalEntrance {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
export default Modal;

