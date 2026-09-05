import React from 'react';
import { Check } from 'lucide-react';
import { DealStage } from '../types/supabase.types';

export interface DealStageProgressBarProps {
  currentStage: DealStage;
  compact?: boolean;
}

const STAGES: { value: DealStage; label: string }[] = [
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'contracted', label: 'Contracted' },
  { value: 'in_production', label: 'Production' },
  { value: 'draft_submitted', label: 'Submitted' },
  { value: 'revisions', label: 'Revisions' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
  { value: 'payment_pending', label: 'Payment' },
  { value: 'completed', label: 'Completed' }
];

export const DealStageProgressBar: React.FC<DealStageProgressBarProps> = ({
  currentStage,
  compact = false
}) => {
  const currentIdx = STAGES.findIndex(s => s.value === currentStage);
  const percentage = Math.round(((currentIdx) / (STAGES.length - 1)) * 100);

  if (compact) {
    // Compact version (4px fill bar)
    return (
      <div className="w-full">
        <div className="h-1 w-full bg-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand transition-all duration-500 ease-out" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  // Full Node Stepper (Deal Room header)
  return (
    <div className="flex flex-col items-center w-full max-w-[480px]">
      <div className="relative flex items-center justify-between w-full select-none">
        {/* Background Track */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />
        
        {/* Active Fill Track */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-brand -translate-y-1/2 z-0 transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
        />

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={stage.value} className="relative z-10 flex flex-col items-center">
              {/* Stepper node circle */}
              {isCompleted ? (
                <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center text-white scale-100 transition-transform">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
              ) : isCurrent ? (
                <div 
                  className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-white ring-4 ring-brand/18 animate-pulse scale-105"
                  style={{ boxShadow: '0 0 0 3px var(--color-brand-glow)' }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-surface border-2 border-border-strong flex items-center justify-center scale-95" />
              )}

              {/* Tooltip labels for current node only to prevent clutter */}
              {isCurrent && (
                <span className="absolute top-7 whitespace-nowrap text-[10px] font-bold text-brand uppercase tracking-wider">
                  {stage.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default DealStageProgressBar;

