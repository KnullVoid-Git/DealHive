import React from 'react';
import { DealStage, InvoiceStatus } from '../types/supabase.types';

export interface StatusBadgeProps {
  status: DealStage | InvoiceStatus | string;
  type?: 'deal' | 'payment';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // Format labels nicely
  const getLabel = (s: string) => {
    return s.replace(/_/g, ' ').toUpperCase();
  };

  const getColors = (s: string): { bg: string; text: string; border: string; dot: string } => {
    switch (s) {
      case 'completed':
      case 'paid':
      case 'approved':
        return {
          bg: 'var(--color-success-bg)',
          text: 'var(--color-success)',
          border: 'var(--color-success-border)',
          dot: 'var(--color-success)'
        };
      case 'negotiating':
      case 'pending':
      case 'pending_invoice':
        return {
          bg: 'var(--color-warning-bg)',
          text: 'var(--color-warning)',
          border: 'var(--color-warning-border)',
          dot: 'var(--color-warning)'
        };
      case 'revisions':
      case 'overdue':
        return {
          bg: 'var(--color-danger-bg)',
          text: 'var(--color-danger)',
          border: 'var(--color-danger-border)',
          dot: 'var(--color-danger)'
        };
      case 'contracted':
      case 'invoice_sent':
        return {
          bg: 'var(--color-info-bg)',
          text: 'var(--color-info)',
          border: 'var(--color-info-border)',
          dot: 'var(--color-info)'
        };
      case 'in_production':
        return {
          bg: 'var(--color-brand-light)',
          text: 'var(--color-brand)',
          border: 'rgba(108, 99, 255, 0.25)',
          dot: 'var(--color-brand)'
        };
      case 'draft_submitted':
        return {
          bg: '#F5F3FF', // purple light
          text: '#7C3AED',
          border: '#DDD6FE',
          dot: '#7C3AED'
        };
      case 'published':
        return {
          bg: '#ECFDF5', // emerald light
          text: '#10B981',
          border: '#A7F3D0',
          dot: '#10B981'
        };
      default:
        return {
          bg: 'var(--color-neutral-bg)',
          text: 'var(--color-neutral)',
          border: 'var(--color-neutral-border)',
          dot: 'var(--color-neutral)'
        };
    }
  };

  const colors = getColors(status);

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full border leading-none select-none tracking-[0.03em]"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0"
        style={{ backgroundColor: colors.dot }}
      />
      {getLabel(status)}
    </span>
  );
};
export default StatusBadge;

