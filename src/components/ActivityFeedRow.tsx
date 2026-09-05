import React from 'react';
import { ArrowUpRight, ArrowDownLeft, FileText, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export interface ActivityFeedRowProps {
  id: string;
  type: 'incoming' | 'outgoing' | 'event' | 'system';
  title: string;
  subtitle: string;
  timestamp: string;
  amount?: string;
  status?: string;
}

export const ActivityFeedRow: React.FC<ActivityFeedRowProps> = ({
  type,
  title,
  subtitle,
  timestamp,
  amount,
  status
}) => {
  const getIcon = () => {
    switch (type) {
      case 'incoming':
        return {
          node: <ArrowDownLeft className="w-4 h-4 text-success" />,
          bg: 'var(--color-success-bg)'
        };
      case 'outgoing':
        return {
          node: <ArrowUpRight className="w-4 h-4 text-danger" />,
          bg: 'var(--color-danger-bg)'
        };
      case 'event':
        return {
          node: <FileText className="w-4 h-4 text-brand" />,
          bg: 'var(--color-brand-light)'
        };
      default:
        return {
          node: <CheckCircle2 className="w-4 h-4 text-info" />,
          bg: 'var(--color-info-bg)'
        };
    }
  };

  const iconInfo = getIcon();

  return (
    <div className="flex items-center justify-between h-[52px] py-2 border-b border-border last:border-0 hover:bg-surface-2/40 px-2 rounded-md transition-colors select-none">
      <div className="flex items-center space-x-3">
        <div 
          className="w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconInfo.bg }}
        >
          {iconInfo.node}
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-semibold text-text-primary leading-tight">
            {title}
          </span>
          <span className="text-[10px] text-text-muted mt-0.5 leading-none">
            {subtitle} · <span data-type="number" className="font-mono text-[9.5px]">{timestamp}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {amount && (
          <span 
            data-type="number" 
            className={`font-mono text-xs font-bold leading-none ${type === 'incoming' ? 'text-success' : type === 'outgoing' ? 'text-danger' : 'text-text-primary'}`}
          >
            {type === 'incoming' ? '+' : type === 'outgoing' ? '-' : ''}{amount}
          </span>
        )}
        {status && <StatusBadge status={status} />}
      </div>
    </div>
  );
};