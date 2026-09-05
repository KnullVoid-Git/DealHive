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

export type DeliverableStatus =
  | 'pending'
  | 'submitted'
  | 'approved'
  | 'revision_requested';

export type ContractStatus =
  | 'unsigned'
  | 'partially_signed'
  | 'fully_signed';

export type InvoiceStatus =
  | 'pending'
  | 'invoice_sent'
  | 'overdue'
  | 'paid';

export type UserRole = 'creator' | 'brand';

export interface DealHiveUser {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface RateCard {
  integration: number;
  dedicated: number;
  shorts: number;
  social_package: number;
  exclusivity_premium: number;
}

export interface YouTubeStats {
  subscriber_count: number;
  avg_views: number;
  engagement_rate: number;
  top_countries: string[];
  age_gender_split: {
    age: Record<string, number>;
    gender: Record<string, number>;
  };
}

export interface CreatorProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  niche_tags: string[];
  rate_card: RateCard;
  youtube_connected: boolean;
  youtube_channel_id: string | null;
  youtube_stats: YouTubeStats | null;
  stripe_connected_id: string | null;
  stripe_status: 'unconnected' | 'pending' | 'active';
  subscription_plan: 'free' | 'pro' | 'business';
  visibility: 'public' | 'unlisted' | 'private';
  availability_status?: 'open' | 'booked';
  verified_analytics?: boolean;
  reputation_score?: number;
  badges?: string[];
  instagram_connected?: boolean;
  instagram_stats?: any;
  created_at: string;
}

export interface BrandProfile {
  id: string;
  company_name: string;
  industry: string;
  website: string | null;
  billing_email: string;
  logo_url: string | null;
  reputation_score?: number;
  badges?: string[];
  preferred_creators?: string[];
  created_at: string;
}

export interface TermChangeHistoryItem {
  timestamp: string;
  sender_id: string;
  field: string;
  old_value: any;
  new_value: any;
}

export interface Deal {
  id: string;
  creator_id: string;
  brand_id: string;
  title: string;
  deal_type: 'Integration' | 'Dedicated Video' | 'Shorts' | 'Social Package' | 'Long-Term Partnership';
  stage: DealStage;
  agreed_rate: number;
  currency: string;
  payment_terms: string;
  exclusivity: string | null;
  usage_rights: string | null;
  kill_fee: number;
  term_change_history: TermChangeHistoryItem[];
  creator_agreed: boolean;
  brand_agreed: boolean;
  last_viewed_at: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string | null;
  health_score?: number;
  health_status?: 'healthy' | 'at_risk' | 'critical';
}

export interface Attachment {
  url: string;
  filename: string;
  size: string;
  type: string;
}

export interface DealMessage {
  id: string;
  deal_id: string;
  sender_id: string;
  message_text: string | null;
  attachments: Attachment[];
  created_at: string;
}

export interface Deliverable {
  id: string;
  deal_id: string;
  name: string;
  due_date: string;
  status: DeliverableStatus;
  file_url: string | null;
  revision_count: number;
  created_at: string;
}

export interface Contract {
  id: string;
  deal_id: string;
  pdf_url: string | null;
  hellosign_request_id: string | null;
  creator_signature_status: string;
  brand_signature_status: string;
  status: ContractStatus;
  signed_at: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  deal_id: string;
  amount: number;
  platform_fee: number;
  creator_net: number;
  due_date: string;
  stripe_payment_intent_id: string | null;
  pdf_url: string | null;
  status: InvoiceStatus;
  created_at: string;
}

export interface PaymentReminder {
  id: string;
  invoice_id: string;
  reminder_type: '7d' | '1d' | '0d' | 'overdue';
  sent_at: string;
}

export interface RateBenchmark {
  id: string;
  niche: string;
  subscriber_tier: string;
  median_rate: number;
  p25_rate: number;
  p75_rate: number;
  sample_size: number;
  calculated_at: string;
}

export interface DealHiveNotification {
  id: string;
  user_id: string;
  icon: string;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  deal_id: string;
  reviewer_id: string;
  recipient_id: string;
  reviewer_role: 'creator' | 'brand';
  overall_rating: number;
  payment_speed_rating?: number;
  communication_rating: number;
  creative_freedom_rating?: number;
  professionalism_rating: number;
  content_quality_rating?: number;
  timeliness_rating?: number;
  review_text: string;
  is_anonymous: boolean;
  created_at: string;
}

export interface CampaignBrief {
  id: string;
  brand_id: string;
  title: string;
  deal_type: string;
  talking_points: string[];
  hook_focus: string;
  restrictions: string[];
  creative_freedom_score: number; // 1 to 100
  compliance_checklist: string[];
  attachments: string[];
  created_at: string;
}

export interface ContentLibraryAsset {
  id: string;
  deal_id: string;
  asset_url: string;
  file_name: string;
  usage_duration_months: number;
  usage_channels: string[];
  exclusivity_period_months: number;
  expires_at: string;
  created_at: string;
}
