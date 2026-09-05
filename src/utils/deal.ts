export type DealStage =
  | 'negotiating'
  | 'contracted'
  | 'in_production'
  | 'draft_submitted'
  | 'revisions'
  | 'approved'
  | 'published'
  | 'payment_pending'
  | 'completed';

export function getDealStageColor(stage: string): string {
  const normStage = stage.toLowerCase().replace(/[\s_-]+/g, '');
  switch (normStage) {
    case 'negotiating':
      return '#6C63FF';
    case 'contracted':
      return '#2563EB';
    case 'inproduction':
    case 'production':
      return '#D97706';
    case 'draftsubmitted':
    case 'draft':
      return '#7C3AED';
    case 'revisions':
      return '#DC2626';
    case 'approved':
      return '#059669';
    case 'published':
      return '#16A34A';
    case 'paymentpending':
    case 'pendingpayment':
      return '#EA580C';
    case 'completed':
      return '#15803D';
    default:
      return '#6B7280'; // fallback neutral gray
  }
}

export interface DealHealthResult {
  score: number;
  status: 'healthy' | 'at_risk' | 'critical';
  deductions: string[];
}

export function calculateDealHealth(
  deal: any,
  deliverables: any[] = [],
  messages: any[] = []
): DealHealthResult {
  let score = 100;
  const deductions: string[] = [];
  const bonuses: string[] = [];
  const now = new Date();

  // Deduct 20: no messages in > 5 days (deal going cold)
  const dealMessages = messages.filter(m => m.deal_id === deal.id);
  if (dealMessages.length > 0) {
    const lastMsgTime = new Date(dealMessages[dealMessages.length - 1].created_at);
    const daysSinceLastMsg = (now.getTime() - lastMsgTime.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastMsg > 5) {
      score -= 20;
      deductions.push('No messages in > 5 days (deal going cold)');
    }
  } else {
    // If deal created >5 days ago and no messages
    const createdTime = new Date(deal.created_at);
    const daysSinceCreation = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation > 5) {
      score -= 20;
      deductions.push('No messages exchanged since creation (>5 days)');
    }
  }

  // Deduct 15: next deadline in <= 2 days
  // Deduct 30: any deadline is overdue
  const dealDels = deliverables.filter(d => d.deal_id === deal.id);
  let hasOverdue = false;
  let hasUrgent = false;

  dealDels.forEach(d => {
    if (!d.due_date || d.status === 'approved') return;
    const dueTime = new Date(d.due_date);
    const daysDiff = (dueTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 0) {
      hasOverdue = true;
    } else if (daysDiff <= 2) {
      hasUrgent = true;
    }
  });

  if (hasOverdue) {
    score -= 30;
    deductions.push('Deliverable deadline is overdue');
  } else if (hasUrgent) {
    score -= 15;
    deductions.push('Deliverable deadline due within 2 days');
  }

  // Deduct 10: deliverable submitted but not reviewed in > 3 days (brand unresponsive)
  let brandUnresponsive = false;
  dealDels.forEach(d => {
    if (d.status === 'submitted' && d.created_at) {
      const submittedTime = new Date(d.created_at);
      const daysDiff = (now.getTime() - submittedTime.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 3) {
        brandUnresponsive = true;
      }
    }
  });
  if (brandUnresponsive) {
    score -= 10;
    deductions.push('Deliverable submitted but not reviewed in >3 days');
  }

  // Deduct 10: term sheet not agreed within 7 days of deal creation
  if (!deal.creator_agreed || !deal.brand_agreed) {
    const createdTime = new Date(deal.created_at);
    const daysDiff = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 7) {
      score -= 10;
      deductions.push('Term sheet not agreed within 7 days of deal creation');
    }
  }

  // Deduct 15: contract not signed within 5 days of term agreement
  if (deal.creator_agreed && deal.brand_agreed && deal.stage === 'contracted') {
    const createdTime = new Date(deal.created_at); // fallback or agreement timestamp if we had it
    const daysDiff = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 5) {
      score -= 15;
      deductions.push('Contract not signed within 5 days of agreement');
    }
  }

  // Add 10 (bonus): messages sent in last 24h
  let messageSentIn24h = false;
  if (dealMessages.length > 0) {
    const lastMsgTime = new Date(dealMessages[dealMessages.length - 1].created_at);
    const hoursSinceLastMsg = (now.getTime() - lastMsgTime.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastMsg <= 24) {
      messageSentIn24h = true;
    }
  }
  if (messageSentIn24h) {
    score += 10;
    bonuses.push('Active chat in last 24 hours');
  }

  // Add 5 (bonus): all deliverables on track
  const allOnTrack = dealDels.length > 0 && dealDels.every(d => d.status === 'approved' || (d.due_date && new Date(d.due_date) > now));
  if (allOnTrack) {
    score += 5;
    bonuses.push('All deliverables on track');
  }

  // Bound score
  score = Math.max(0, Math.min(100, score));

  // Determine status
  let status: 'healthy' | 'at_risk' | 'critical' = 'healthy';
  if (score < 50) {
    status = 'critical';
  } else if (score < 80) {
    status = 'at_risk';
  }

  return {
    score,
    status,
    deductions
  };
}
