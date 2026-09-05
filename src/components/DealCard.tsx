import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Deal, BrandProfile } from '../types/supabase.types';
import { StatusBadge } from './StatusBadge';
import { DealStageProgressBar } from './DealStageProgressBar';

export interface DealCardProps {
  deal: Deal;
  brand: BrandProfile;
  onClick?: () => void;
}

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  brand,
  onClick
}) => {
  // Mock deadline countdown logic
  const getDeadlineText = () => {
    if (deal.stage === 'completed') return { text: 'Delivered', urgent: false };
    
    // Simulate deadline countdown based on created date
    const elapsed = Date.now() - new Date(deal.created_at).getTime();
    const daysLeft = Math.max(1, 14 - Math.floor(elapsed / (24 * 60 * 60 * 1000)));

    if (deal.stage === 'revisions') {
      return { text: 'Revision due in 2d', urgent: true };
    }
    if (deal.stage === 'negotiating') {
      return { text: 'Feedback in 3d', urgent: false };
    }
    
    if (daysLeft <= 3) {
      return { text: `Draft due in ${daysLeft}d`, urgent: true };
    }
    return { text: `Post date in ${daysLeft}d`, urgent: false };
  };

  const deadline = getDeadlineText();

  // Get stage-specific color mappings
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'completed': return 'var(--color-success)';
      case 'negotiating': return 'var(--color-brand)';
      case 'revisions': return 'var(--color-danger)';
      case 'draft_submitted': return '#7C3AED';
      case 'approved': return '#059669';
      default: return 'var(--color-warning)';
    }
  };

  return (
    <div
      onClick={onClick}
      className="group w-[280px] flex-shrink-0 bg-surface border border-border hover:shadow-md hover:border-border-strong cursor-pointer rounded-xl p-4 select-none transition-all duration-150 ease-out"
      style={{
        borderLeft: `3.5px solid ${getStageColor(deal.stage)}`
      }}
    >
      {/* Row 1: Logo, Brand Name & Amount */}
      <div className="flex items-center justify-between pb-3.5 border-b border-border">
        <div className="flex items-center space-x-2">
          {brand.logo_url ? (
            <img 
              src={brand.logo_url} 
              alt={brand.company_name} 
              className="w-6 h-6 rounded-full border border-border"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-brand-light flex items-center justify-center font-bold text-[10px] text-brand border border-brand/10">
              {brand.company_name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <span className="text-xs font-bold text-text-primary truncate max-w-[120px]">
            {brand.company_name}
          </span>
        </div>
        
        <span 
          data-type="number" 
          className="font-mono text-xs font-bold text-text-primary"
        >
          ${deal.agreed_rate.toLocaleString()}
        </span>
      </div>

      {/* Row 2: Deal Type & Stage Badge */}
      <div className="flex items-center justify-between py-3">
        <span className="inline-flex px-2 py-0.5 text-[9px] font-bold uppercase bg-surface-2 border border-border text-text-muted rounded-sm leading-none">
          {deal.deal_type}
        </span>
        <StatusBadge status={deal.stage} />
      </div>

      {/* Row 3: Compact Progress Bar */}
      <div className="py-1">
        <DealStageProgressBar currentStage={deal.stage} compact={true} />
      </div>

      {/* Row 4: Deadline Countdown */}
      <div className="flex items-center justify-between pt-3 mt-1.5 border-t border-border">
        <div className={`flex items-center space-x-1.5 text-[11px] font-medium leading-none ${
          deadline.urgent ? 'text-danger' : 'text-text-muted'
        }`}>
          {deadline.urgent ? (
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 animate-bounce" />
          ) : (
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          <span data-type="number" className="font-mono">{deadline.text}</span>
        </div>
      </div>
    </div>
  );
};
export default DealCard;

