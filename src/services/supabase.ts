import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import {
  CreatorProfile,
  BrandProfile,
  Deal,
  DealMessage,
  Deliverable,
  Contract,
  Invoice,
  DealHiveNotification,
  RateBenchmark,
  Attachment,
  InvoiceStatus
} from '../types/supabase.types';
import { rateLimiter } from '../utils/rateLimiter';

// Standard mock storage key prefixes
const DB_PREFIX = 'dealhive_db_';

// 1. Live Supabase Client Initialization
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

const isLiveSupabase = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-supabase-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-supabase-anon-public-key'
);

export const supabase = isLiveSupabase ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Initial pre-populated data for creators (local simulator mode)
const INITIAL_CREATOR: CreatorProfile = {
  id: 'creator_sarah',
  username: 'sarah_creates',
  full_name: 'Sarah Jenkins',
  avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  bio: 'Lifestyle & Tech YouTube Creator making high-fidelity tech reviews and daily lifestyle vlogs for a highly engaged Gen-Z audience.',
  niche_tags: ['Tech', 'Lifestyle', 'Productivity'],
  rate_card: {
    integration: 3500,
    dedicated: 7000,
    shorts: 1500,
    social_package: 9500,
    exclusivity_premium: 20
  },
  youtube_connected: true,
  youtube_channel_id: 'UC_sarah_jenkins_creates',
  youtube_stats: {
    subscriber_count: 385000,
    avg_views: 125000,
    engagement_rate: 4.8,
    top_countries: ['United States', 'Canada', 'United Kingdom'],
    age_gender_split: {
      age: { '18-24': 45, '25-34': 38, '35-44': 12, '45+': 5 },
      gender: { 'Female': 58, 'Male': 39, 'Other': 3 }
    }
  },
  stripe_connected_id: 'acct_1NmockStripe123',
  stripe_status: 'active',
  subscription_plan: 'pro',
  visibility: 'public',
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
};

// Initial pre-populated data for brands (local simulator mode)
const INITIAL_BRANDS: BrandProfile[] = [
  {
    id: 'brand_samsung',
    company_name: 'Samsung',
    industry: 'Consumer Electronics',
    website: 'https://samsung.com',
    billing_email: 'finance@samsung.com',
    logo_url: 'https://logo.clearbit.com/samsung.com',
    created_at: new Date().toISOString()
  },
  {
    id: 'brand_nordvpn',
    company_name: 'NordVPN',
    industry: 'Cybersecurity',
    website: 'https://nordvpn.com',
    billing_email: 'billing@nordvpn.com',
    logo_url: 'https://logo.clearbit.com/nordvpn.com',
    created_at: new Date().toISOString()
  },
  {
    id: 'brand_lumen',
    company_name: 'Lumen Health',
    industry: 'Health & Wellness',
    website: 'https://lumen.me',
    billing_email: 'ap@lumen.me',
    logo_url: 'https://logo.clearbit.com/lumen.me',
    created_at: new Date().toISOString()
  },
  {
    id: 'brand_adobe',
    company_name: 'Adobe',
    industry: 'Creative Software',
    website: 'https://adobe.com',
    billing_email: 'accounts@adobe.com',
    logo_url: 'https://logo.clearbit.com/adobe.com',
    created_at: new Date().toISOString()
  }
];

// Initial mock deals (local simulator mode)
const INITIAL_DEALS: Deal[] = [
  {
    id: 'deal_samsung_galaxy',
    creator_id: 'creator_sarah',
    brand_id: 'brand_samsung',
    title: 'Galaxy S26 Ultra Launch Integration',
    deal_type: 'Integration',
    stage: 'negotiating',
    agreed_rate: 4200,
    currency: 'USD',
    payment_terms: 'Net 30',
    exclusivity: 'No other smartphone brands for 15 days post-publication',
    usage_rights: 'Digital ad rights for 30 days',
    kill_fee: 500,
    term_change_history: [],
    creator_agreed: false,
    brand_agreed: false,
    last_viewed_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'deal_nordvpn_protect',
    creator_id: 'creator_sarah',
    brand_id: 'brand_nordvpn',
    title: 'Cybersecurity Awareness Dedicated Video',
    deal_type: 'Dedicated Video',
    stage: 'contracted',
    agreed_rate: 7500,
    currency: 'USD',
    payment_terms: 'Net 15',
    exclusivity: 'No cybersecurity brand sponsorships for 30 days',
    usage_rights: 'Organic social cuts permitted',
    kill_fee: 1000,
    term_change_history: [],
    creator_agreed: true,
    brand_agreed: true,
    last_viewed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'deal_lumen_morning',
    creator_id: 'creator_sarah',
    brand_id: 'brand_lumen',
    title: 'Morning Routine Sponsorship',
    deal_type: 'Integration',
    stage: 'in_production',
    agreed_rate: 3500,
    currency: 'USD',
    payment_terms: 'Net 30',
    exclusivity: 'No wellness supplements for 7 days',
    usage_rights: 'None',
    kill_fee: 400,
    term_change_history: [],
    creator_agreed: true,
    brand_agreed: true,
    last_viewed_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'deal_adobe_express',
    creator_id: 'creator_sarah',
    brand_id: 'brand_adobe',
    title: 'Creative Express App Launch Review',
    deal_type: 'Social Package',
    stage: 'draft_submitted',
    agreed_rate: 8500,
    currency: 'USD',
    payment_terms: 'Net 30',
    exclusivity: 'No graphic design tools for 30 days',
    usage_rights: 'Adobe can re-post cutdowns',
    kill_fee: 1500,
    term_change_history: [],
    creator_agreed: true,
    brand_agreed: true,
    last_viewed_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_MESSAGES: DealMessage[] = [
  {
    id: 'msg_1',
    deal_id: 'deal_samsung_galaxy',
    sender_id: 'brand_samsung',
    message_text: "Hey Sarah! We loved your recent tech review. We would love to sponsor a dedicated integration in your upcoming vlogs introducing the Galaxy S26 Ultra's new AI features. What rate would work for you?",
    attachments: [],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_2',
    deal_id: 'deal_samsung_galaxy',
    sender_id: 'creator_sarah',
    message_text: "Hi Samsung team! Sounds super exciting. My standard integration rate is $3,500, but since this is a premium launch, I propose $4,200 which includes custom shorts cutdowns and cross-promotional community posts. Let me know what you think!",
    attachments: [],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_3',
    deal_id: 'deal_samsung_galaxy',
    sender_id: 'brand_samsung',
    message_text: 'That works for us. We will agree to terms on the Term Sheet! Please check the deliverables timeline.',
    attachments: [],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_DELIVERABLES: Deliverable[] = [
  {
    id: 'del_lumen_1',
    deal_id: 'deal_lumen_morning',
    name: 'Integrations Script Approval',
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    file_url: null,
    revision_count: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 'del_adobe_1',
    deal_id: 'deal_adobe_express',
    name: 'Dedicated Video Draft',
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'submitted',
    file_url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    revision_count: 1,
    created_at: new Date().toISOString()
  }
];

const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'con_nordvpn',
    deal_id: 'deal_nordvpn_protect',
    pdf_url: '/mock-contract-nordvpn.pdf',
    hellosign_request_id: 'hs_req_987',
    creator_signature_status: 'signed',
    brand_signature_status: 'signed',
    status: 'fully_signed',
    signed_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_1',
    deal_id: 'deal_nordvpn_protect',
    amount: 7500,
    platform_fee: 187.5,
    creator_net: 7312.5,
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    stripe_payment_intent_id: 'pi_nord_123',
    pdf_url: '/mock-invoice-nord.pdf',
    status: 'invoice_sent',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_BENCHMARKS: RateBenchmark[] = [
  { id: 'b_1', niche: 'Tech', subscriber_tier: '100k-500k', median_rate: 4500, p25_rate: 3500, p75_rate: 6000, sample_size: 48, calculated_at: new Date().toISOString() },
  { id: 'b_2', niche: 'Tech', subscriber_tier: '500k-1M', median_rate: 8500, p25_rate: 7000, p75_rate: 11000, sample_size: 29, calculated_at: new Date().toISOString() },
  { id: 'b_3', niche: 'Lifestyle', subscriber_tier: '100k-500k', median_rate: 3200, p25_rate: 2500, p75_rate: 4200, sample_size: 112, calculated_at: new Date().toISOString() }
];

const INITIAL_NOTIFICATIONS: DealHiveNotification[] = [
  {
    id: 'not_1',
    user_id: 'creator_sarah',
    icon: 'message-square',
    title: 'New pitch received',
    message: 'Samsung has sent you a deal pitch for S26 Launch.',
    link: '/inbox',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'not_2',
    user_id: 'creator_sarah',
    icon: 'credit-card',
    title: 'Invoice Sent',
    message: 'Invoice inv_1 was generated and sent to NordVPN.',
    link: '/payments',
    is_read: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper to load/save from localStorage (local simulator mode)
function getDB<T>(key: string, initial: T): T {
  const data = localStorage.getItem(DB_PREFIX + key);
  if (!data) {
    localStorage.setItem(DB_PREFIX + key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function saveDB<T>(key: string, data: T): void {
  localStorage.setItem(DB_PREFIX + key, JSON.stringify(data));
}

// In-memory global subscribers list for Mock Realtime
type RealtimeCallback = (payload: any) => void;
const messageListeners: Record<string, RealtimeCallback[]> = {};

const INITIAL_TEMPLATES = [
  {
    id: 'temp_dedicated',
    creator_id: 'creator_sarah',
    name: 'Premium Dedicated Video',
    description: 'Pre-filled terms optimized for standard dedicated reviews.',
    deal_type: 'Dedicated Video',
    default_rate: 7000,
    default_currency: 'USD',
    default_payment_terms: 'Net 15',
    default_exclusivity_days: 30,
    default_usage_rights_months: 6,
    default_revision_rounds: 3,
    default_kill_fee_percent: 25,
    is_default: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'temp_integration',
    creator_id: 'creator_sarah',
    name: 'Standard Sponsor Integration',
    description: 'Pre-filled terms optimized for sponsored integrations.',
    deal_type: 'Integration',
    default_rate: 3500,
    default_currency: 'USD',
    default_payment_terms: 'Net 30',
    default_exclusivity_days: 15,
    default_usage_rights_months: 3,
    default_revision_rounds: 2,
    default_kill_fee_percent: 20,
    is_default: false,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_TEAM_MEMBERS = [
  {
    id: 'tm_va',
    account_id: 'creator_sarah',
    account_type: 'creator',
    user_id: 'user_va_sarah',
    invited_email: 'jessica.va@sarahcreates.com',
    role: 'va',
    status: 'active',
    invited_by: 'creator_sarah',
    invited_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    accepted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_TEAM_INVITATIONS = [
  {
    id: 'inv_mngr',
    token: 'invite_mngr_token_123',
    account_id: 'creator_sarah',
    account_type: 'creator',
    email: 'alex.manager@sarahcreates.com',
    role: 'manager',
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    used: false
  }
];

const INITIAL_TEAM_ACTIVITY_LOG = [
  {
    id: 'act_1',
    account_id: 'creator_sarah',
    actor_user_id: 'user_va_sarah',
    actor_name: 'Jessica VA',
    action_type: 'approved_draft',
    entity_type: 'deal',
    entity_id: 'deal_lumen_morning',
    entity_name: 'Morning Routine Sponsorship',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'act_2',
    account_id: 'creator_sarah',
    actor_user_id: 'creator_sarah',
    actor_name: 'Sarah Jenkins (Owner)',
    action_type: 'created_deal',
    entity_type: 'deal',
    entity_id: 'deal_samsung_galaxy',
    entity_name: 'Galaxy S26 Launch Integration',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_REVIEWS = [
  {
    id: 'rev_samsung_1',
    reviewer_creator_id: 'creator_sarah',
    brand_id: 'brand_samsung',
    deal_id: 'deal_samsung_galaxy',
    overall_rating: 5,
    payment_speed_rating: 5,
    communication_rating: 4,
    revision_fairness_rating: 5,
    review_text: 'Samsung was incredible to work with! Super fast payments and very clear briefs.',
    is_anonymous: false,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_REPUTATION_SCORES = [
  {
    brand_id: 'brand_samsung',
    avg_overall: 4.8,
    avg_payment_speed: 4.9,
    avg_communication: 4.6,
    avg_revision_fairness: 4.8,
    total_reviews: 12
  },
  {
    brand_id: 'brand_nordvpn',
    avg_overall: 4.2,
    avg_payment_speed: 4.0,
    avg_communication: 4.3,
    avg_revision_fairness: 4.5,
    total_reviews: 24
  }
];

const INITIAL_BLACKLIST: any[] = [];
const INITIAL_INTERNAL_NOTES: any[] = [];

const INITIAL_BRIEFS = [
  {
    id: 'brief_samsung_galaxy',
    brand_id: 'brand_samsung',
    title: 'Galaxy S26 Launch Integration (Tech/PR)',
    deal_type: 'Integration',
    talking_points: [
      'Highlight Galaxy S26 Ultra’s new AI generative nightography camera.',
      'Showcase real-time content translation and transcription in daily vlogs.',
      'Mention $150 credit checkout incentive on Samsung.com links.'
    ],
    hook_focus: 'Nightography low-light photos comparison with default phone cameras.',
    restrictions: ['Do not mention competitors', 'No swearing or political comments'],
    creative_freedom_score: 55, // Guided
    compliance_checklist: [
      'Showcase S26 Ultra low light camera comparison on screen',
      'Explain AI transcription feature',
      'Link in video description with checkout code'
    ],
    attachments: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400'],
    created_at: new Date().toISOString()
  }
];

const INITIAL_CONTENT_LIBRARY = [
  {
    id: 'asset_nord_1',
    deal_id: 'deal_nordvpn_protect',
    asset_url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    file_name: 'NordVPN_Dedicated_sarah_creates.mp4',
    usage_duration_months: 6,
    usage_channels: ['YouTube organic', 'Instagram reposts'],
    exclusivity_period_months: 1,
    expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  }
];

const INITIAL_PARTNERSHIPS = [
  {
    id: 'crm_samsung_sarah',
    creator_id: 'creator_sarah',
    brand_id: 'brand_samsung',
    total_lifetime_value: 4200,
    collaborations_count: 1,
    avg_turnaround_days: 5,
    partnership_health_score: 95,
    last_collaboration_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'crm_samsung_marques',
    creator_id: 'creator_marques',
    brand_id: 'brand_samsung',
    total_lifetime_value: 15000,
    collaborations_count: 2,
    avg_turnaround_days: 7,
    partnership_health_score: 98,
    last_collaboration_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'crm_samsung_emma',
    creator_id: 'creator_emma',
    brand_id: 'brand_samsung',
    total_lifetime_value: 9500,
    collaborations_count: 1,
    avg_turnaround_days: 6,
    partnership_health_score: 92,
    last_collaboration_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'crm_samsung_raj',
    creator_id: 'creator_raj',
    brand_id: 'brand_samsung',
    total_lifetime_value: 4000,
    collaborations_count: 1,
    avg_turnaround_days: 4,
    partnership_health_score: 88,
    last_collaboration_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockDb = {
  getCreatorProfile: () => getDB<CreatorProfile>('creator_profile', INITIAL_CREATOR),
  saveCreatorProfile: (profile: CreatorProfile) => saveDB('creator_profile', profile),

  getBrands: () => getDB<BrandProfile[]>('brands', INITIAL_BRANDS),
  saveBrands: (brands: BrandProfile[]) => saveDB('brands', brands),

  getDeals: () => getDB<Deal[]>('deals', INITIAL_DEALS),
  saveDeals: (deals: Deal[]) => saveDB('deals', deals),

  getMessages: () => getDB<DealMessage[]>('messages', INITIAL_MESSAGES),
  saveMessages: (messages: DealMessage[]) => saveDB('messages', messages),

  getDeliverables: () => getDB<Deliverable[]>('deliverables', INITIAL_DELIVERABLES),
  saveDeliverables: (d: Deliverable[]) => saveDB('deliverables', d),

  getContracts: () => getDB<Contract[]>('contracts', INITIAL_CONTRACTS),
  saveContracts: (c: Contract[]) => saveDB('contracts', c),

  getInvoices: () => getDB<Invoice[]>('invoices', INITIAL_INVOICES),
  saveInvoices: (i: Invoice[]) => saveDB('invoices', i),

  getBenchmarks: () => getDB<RateBenchmark[]>('benchmarks', INITIAL_BENCHMARKS),

  getNotifications: () => getDB<DealHiveNotification[]>('notifications', INITIAL_NOTIFICATIONS),
  saveNotifications: (n: DealHiveNotification[]) => saveDB('notifications', n),

  getTemplates: () => getDB<any[]>('templates', INITIAL_TEMPLATES),
  saveTemplates: (t: any[]) => saveDB('templates', t),

  getTeamMembers: () => getDB<any[]>('team_members', INITIAL_TEAM_MEMBERS),
  saveTeamMembers: (t: any[]) => saveDB('team_members', t),

  getTeamInvitations: () => getDB<any[]>('team_invitations', INITIAL_TEAM_INVITATIONS),
  saveTeamInvitations: (t: any[]) => saveDB('team_invitations', t),

  getTeamActivityLogs: () => getDB<any[]>('team_activity_log', INITIAL_TEAM_ACTIVITY_LOG),
  saveTeamActivityLogs: (l: any[]) => saveDB('team_activity_log', l),

  getBrandReviews: () => getDB<any[]>('brand_reviews', INITIAL_REVIEWS),
  saveBrandReviews: (r: any[]) => saveDB('brand_reviews', r),

  getReputationScores: () => getDB<any[]>('brand_reputation_scores', INITIAL_REPUTATION_SCORES),
  saveReputationScores: (s: any[]) => saveDB('brand_reputation_scores', s),

  getBlacklist: () => getDB<any[]>('creator_brand_blacklist', INITIAL_BLACKLIST),
  saveBlacklist: (b: any[]) => saveDB('creator_brand_blacklist', b),

  getInternalNotes: () => getDB<any[]>('deal_internal_notes', INITIAL_INTERNAL_NOTES),
  saveInternalNotes: (n: any[]) => saveDB('deal_internal_notes', n),

  getBriefs: () => getDB<any[]>('campaign_briefs', INITIAL_BRIEFS),
  saveBriefs: (b: any[]) => saveDB('campaign_briefs', b),

  getContentLibrary: () => getDB<any[]>('content_library', INITIAL_CONTENT_LIBRARY),
  saveContentLibrary: (c: any[]) => saveDB('content_library', c),

  getPartnerships: () => getDB<any[]>('crm_partnerships', INITIAL_PARTNERSHIPS),
  savePartnerships: (p: any[]) => saveDB('crm_partnerships', p)
};

// Main API coordinator client
export const supabaseClient = {
  auth: {
    getUser: async () => {
      if (supabase) {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return { data: { user: null }, error };

        // Determine role based on which database profile exists
        const { data: creator } = await supabase.from('dealhive_creator_profile').select('id').eq('id', user.id).maybeSingle();
        const role = creator ? 'creator' : 'brand';
        localStorage.setItem('dealhive_auth_role', role);

        return {
          data: {
            user: {
              id: user.id,
              email: user.email || '',
              user_metadata: {
                full_name: user.user_metadata?.full_name || user.email || 'User'
              }
            }
          },
          error: null
        };
      }

      // Simulator Mode
      const isCreator = localStorage.getItem('dealhive_auth_role') !== 'brand';
      return {
        data: {
          user: {
            id: isCreator ? 'creator_sarah' : 'brand_samsung',
            email: isCreator ? 'hello@dealhive.io' : 'brand_manager@samsung.com',
            user_metadata: {
              full_name: isCreator ? 'Sarah Jenkins' : 'Samsung Sponsor'
            }
          }
        },
        error: null
      };
    },
    setRole: (role: 'creator' | 'brand') => {
      localStorage.setItem('dealhive_auth_role', role);
      window.dispatchEvent(new Event('auth-change'));
    },
    getRole: () => {
      return (localStorage.getItem('dealhive_auth_role') as 'creator' | 'brand') || 'creator';
    },
    signOut: async () => {
      if (supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('dealhive_auth_role');
      window.dispatchEvent(new Event('auth-change'));
      return { error: null };
    }
  },

  // Deals management
  deals: {
    list: async (): Promise<Deal[]> => {
      if (supabase) {
        const role = supabaseClient.auth.getRole();
        const userId = (await supabaseClient.auth.getUser()).data.user?.id;
        if (!userId) return [];

        const query = supabase.from('dealhive_deal').select('*');
        if (role === 'creator') {
          query.eq('creator_id', userId);
        } else {
          query.eq('brand_id', userId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []) as Deal[];
      }

      // Simulator Mode
      const deals = mockDb.getDeals();
      const role = supabaseClient.auth.getRole();
      if (role === 'creator') {
        return deals.filter(d => d.creator_id === 'creator_sarah');
      } else {
        return deals.filter(d => d.brand_id === 'brand_samsung');
      }
    },
    get: async (id: string): Promise<Deal | null> => {
      if (supabase) {
        const { data, error } = await supabase.from('dealhive_deal').select('*').eq('id', id).maybeSingle();
        if (error || !data) return null;

        // Track last viewed in database
        await supabase.from('dealhive_deal').update({ last_viewed_at: new Date().toISOString() }).eq('id', id);
        return data as Deal;
      }

      // Simulator Mode
      const deals = mockDb.getDeals();
      const deal = deals.find(d => d.id === id);
      if (deal) {
        const isCreator = supabaseClient.auth.getRole() === 'creator';
        const expectedUser = isCreator ? 'creator_sarah' : 'brand_samsung';
        if (deal.creator_id !== expectedUser && deal.brand_id !== expectedUser) {
          console.warn(`[Security Block] Unauthorized mock RLS access attempt to deal: ${id} by user: ${expectedUser}`);
          return null;
        }
        deal.last_viewed_at = new Date().toISOString();
        mockDb.saveDeals(deals);
      }
      return deal || null;
    },
    create: async (deal: Partial<Deal>): Promise<Deal> => {
      rateLimiter.checkAndThrow('db_write');
      if (supabase) {
        const user = (await supabaseClient.auth.getUser()).data.user;
        const userId = user?.id || 'creator_sarah';
        const isCreator = supabaseClient.auth.getRole() === 'creator';

        const newDeal = {
          creator_id: isCreator ? userId : (deal.creator_id || 'creator_sarah'),
          brand_id: !isCreator ? userId : (deal.brand_id || 'brand_samsung'),
          title: deal.title || 'Untitled Deal',
          deal_type: deal.deal_type || 'Integration',
          stage: 'negotiating',
          agreed_rate: Number(deal.agreed_rate) || 0.00,
          currency: deal.currency || 'USD',
          payment_terms: deal.payment_terms || 'Net 30',
          exclusivity: deal.exclusivity || null,
          usage_rights: deal.usage_rights || null,
          kill_fee: Number(deal.kill_fee) || 0.00,
          term_change_history: [],
          creator_agreed: isCreator,
          brand_agreed: !isCreator,
          last_viewed_at: new Date().toISOString()
        };

        const { data, error } = await supabase.from('dealhive_deal').insert(newDeal).select().single();
        if (error) throw error;

        // Auto insert a base deliverable
        await supabase.from('dealhive_deliverable').insert({
          deal_id: data.id,
          name: 'Concept Outline Script',
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
          revision_count: 0
        });

        // Trigger in-app notification
        await supabaseClient.notifications.trigger(
          data.creator_id,
          'briefcase',
          'New Deal Created',
          `A new deal "${data.title}" has been successfully added to your pipeline.`,
          `/deals/${data.id}`
        );

        return data as Deal;
      }

      // Simulator Mode
      const deals = mockDb.getDeals();
      const newDeal: Deal = {
        id: 'deal_' + Math.random().toString(36).substr(2, 9),
        creator_id: deal.creator_id || 'creator_sarah',
        brand_id: deal.brand_id || 'brand_samsung',
        title: deal.title || 'Untitled Deal',
        deal_type: deal.deal_type || 'Integration',
        stage: 'negotiating',
        agreed_rate: Number(deal.agreed_rate) || 0.00,
        currency: deal.currency || 'USD',
        payment_terms: deal.payment_terms || 'Net 30',
        exclusivity: deal.exclusivity || null,
        usage_rights: deal.usage_rights || null,
        kill_fee: Number(deal.kill_fee) || 0.00,
        term_change_history: [],
        creator_agreed: false,
        brand_agreed: false,
        last_viewed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      deals.push(newDeal);
      mockDb.saveDeals(deals);

      const deliverables = mockDb.getDeliverables();
      deliverables.push({
        id: 'del_' + Math.random().toString(36).substr(2, 9),
        deal_id: newDeal.id,
        name: 'Concept Outline Script',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        file_url: null,
        revision_count: 0,
        created_at: new Date().toISOString()
      });
      mockDb.saveDeliverables(deliverables);

      supabaseClient.notifications.trigger(
        newDeal.creator_id,
        'briefcase',
        'New Deal Created',
        `A new deal "${newDeal.title}" has been successfully added to your pipeline.`,
        `/deals/${newDeal.id}`
      );

      return newDeal;
    },
    update: async (id: string, updates: Partial<Deal>): Promise<Deal> => {
      rateLimiter.checkAndThrow('db_write');
      if (supabase) {
        const updatesClean = { ...updates };
        delete (updatesClean as any)._sysBypass;

        const { data, error } = await supabase.from('dealhive_deal').update({
          ...updatesClean,
          updated_at: new Date().toISOString()
        }).eq('id', id).select().single();
        if (error) throw error;
        return data as Deal;
      }

      // Simulator Mode
      const deals = mockDb.getDeals();
      const idx = deals.findIndex(d => d.id === id);
      if (idx === -1) throw new Error('Deal not found');

      const oldDeal = deals[idx];
      const isCreator = supabaseClient.auth.getRole() === 'creator';
      const expectedUser = isCreator ? 'creator_sarah' : 'brand_samsung';
      if (oldDeal.creator_id !== expectedUser && oldDeal.brand_id !== expectedUser) {
        throw new Error('Security Exception: Unauthorized mock RLS write attempt');
      }

      const updatesClean = { ...updates };
      const hasBypass = (updatesClean as any)._sysBypass === true;
      delete (updatesClean as any)._sysBypass;

      if (isCreator) {
        if (updatesClean.brand_agreed === true && !oldDeal.brand_agreed && !hasBypass) {
          console.warn("[Security Alert] Blocked creator attempting to agree on behalf of brand.");
          toast.error("Security Block: Creators cannot agree to terms on behalf of brands.");
          throw new Error("Security Exception: Unauthorized agreement escalation");
        }
        // Force reset brand agreement if key terms change
        if (updatesClean.agreed_rate !== undefined && updatesClean.agreed_rate !== oldDeal.agreed_rate ||
            updatesClean.deal_type !== undefined && updatesClean.deal_type !== oldDeal.deal_type ||
            updatesClean.currency !== undefined && updatesClean.currency !== oldDeal.currency ||
            updatesClean.payment_terms !== undefined && updatesClean.payment_terms !== oldDeal.payment_terms ||
            updatesClean.exclusivity !== undefined && updatesClean.exclusivity !== oldDeal.exclusivity ||
            updatesClean.usage_rights !== undefined && updatesClean.usage_rights !== oldDeal.usage_rights ||
            updatesClean.kill_fee !== undefined && updatesClean.kill_fee !== oldDeal.kill_fee) {
          updatesClean.brand_agreed = false;
        }
      } else {
        if (updatesClean.creator_agreed === true && !oldDeal.creator_agreed && !hasBypass) {
          console.warn("[Security Alert] Blocked brand attempting to agree on behalf of creator.");
          toast.error("Security Block: Brands cannot agree to terms on behalf of creators.");
          throw new Error("Security Exception: Unauthorized agreement escalation");
        }
        // Force reset creator agreement if key terms change
        if (updatesClean.agreed_rate !== undefined && updatesClean.agreed_rate !== oldDeal.agreed_rate ||
            updatesClean.deal_type !== undefined && updatesClean.deal_type !== oldDeal.deal_type ||
            updatesClean.currency !== undefined && updatesClean.currency !== oldDeal.currency ||
            updatesClean.payment_terms !== undefined && updatesClean.payment_terms !== oldDeal.payment_terms ||
            updatesClean.exclusivity !== undefined && updatesClean.exclusivity !== oldDeal.exclusivity ||
            updatesClean.usage_rights !== undefined && updatesClean.usage_rights !== oldDeal.usage_rights ||
            updatesClean.kill_fee !== undefined && updatesClean.kill_fee !== oldDeal.kill_fee) {
          updatesClean.creator_agreed = false;
        }
      }

      const updatedDeal = {
        ...oldDeal,
        ...updatesClean,
        updated_at: new Date().toISOString()
      };

      deals[idx] = updatedDeal;
      mockDb.saveDeals(deals);
      return updatedDeal;
    },
    proposeChange: async (id: string, field: string, newValue: any): Promise<Deal> => {
      rateLimiter.checkAndThrow('db_write');
      if (supabase) {
        const deal = await supabaseClient.deals.get(id);
        if (!deal) throw new Error('Deal not found');

        const oldValue = (deal as any)[field];
        const role = supabaseClient.auth.getRole();
        const userId = (await supabaseClient.auth.getUser()).data.user?.id || 'creator_sarah';

        const historyItem = {
          timestamp: new Date().toISOString(),
          sender_id: userId,
          field,
          old_value: oldValue,
          new_value: newValue
        };

        const updateData = {
          [field]: newValue,
          creator_agreed: role === 'creator',
          brand_agreed: role === 'brand',
          term_change_history: [...deal.term_change_history, historyItem],
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase.from('dealhive_deal').update(updateData).eq('id', id).select().single();
        if (error) throw error;

        const notifyTarget = role === 'creator' ? deal.brand_id : deal.creator_id;
        await supabaseClient.notifications.trigger(
          notifyTarget,
          'edit',
          'Proposed Term Change',
          `A change was proposed to "${field}": "${newValue}"`,
          `/deals/${id}`
        );

        return data as Deal;
      }

      // Simulator Mode
      const deals = mockDb.getDeals();
      const idx = deals.findIndex(d => d.id === id);
      if (idx === -1) throw new Error('Deal not found');

      const deal = deals[idx];
      const isCreator = supabaseClient.auth.getRole() === 'creator';
      const expectedUser = isCreator ? 'creator_sarah' : 'brand_samsung';
      if (deal.creator_id !== expectedUser && deal.brand_id !== expectedUser) {
        throw new Error('Security Exception: Unauthorized mock RLS write attempt');
      }

      const oldValue = (deal as any)[field];

      const historyItem = {
        timestamp: new Date().toISOString(),
        sender_id: isCreator ? 'creator_sarah' : 'brand_samsung',
        field,
        old_value: oldValue,
        new_value: newValue
      };

      const updatedDeal: Deal = {
        ...deal,
        [field]: newValue,
        creator_agreed: isCreator,
        brand_agreed: !isCreator,
        term_change_history: [...deal.term_change_history, historyItem],
        updated_at: new Date().toISOString()
      };

      deals[idx] = updatedDeal;
      mockDb.saveDeals(deals);

      const notifyTarget = isCreator ? 'brand_samsung' : 'creator_sarah';
      supabaseClient.notifications.trigger(
        notifyTarget,
        'edit',
        'Proposed Term Change',
        `A change was proposed to "${field}": "${newValue}"`,
        `/deals/${deal.id}`
      );

      return updatedDeal;
    }
  },

  // Messages / Realtime
  messages: {
    list: async (dealId: string): Promise<DealMessage[]> => {
      if (supabase) {
        const { data, error } = await supabase
          .from('dealhive_deal_message')
          .select('*')
          .eq('deal_id', dealId)
          .order('created_at', { ascending: true });
        if (error) throw error;
        return (data || []) as DealMessage[];
      }

      // Simulator Mode: check if user has access to this deal first
      const deal = await supabaseClient.deals.get(dealId);
      if (!deal) return [];

      const msgs = mockDb.getMessages();
      return msgs.filter(m => m.deal_id === dealId);
    },
    send: async (dealId: string, text: string, attachments: Attachment[] = []): Promise<DealMessage> => {
      rateLimiter.checkAndThrow('db_write');
      if (supabase) {
        const userId = (await supabaseClient.auth.getUser()).data.user?.id || 'creator_sarah';
        const newMsg = {
          deal_id: dealId,
          sender_id: userId,
          message_text: text || null,
          attachments: attachments || []
        };

        const { data, error } = await supabase.from('dealhive_deal_message').insert(newMsg).select().single();
        if (error) throw error;
        return data as DealMessage;
      }

      // Simulator Mode: check if user has access to this deal first
      const deal = await supabaseClient.deals.get(dealId);
      if (!deal) throw new Error('Security Exception: Unauthorized message dispatch');

      const msgs = mockDb.getMessages();
      const newMsg: DealMessage = {
        id: 'msg_' + Math.random().toString(36).substr(2, 9),
        deal_id: dealId,
        sender_id: supabaseClient.auth.getRole() === 'creator' ? 'creator_sarah' : 'brand_samsung',
        message_text: text || null,
        attachments,
        created_at: new Date().toISOString()
      };
      msgs.push(newMsg);
      mockDb.saveMessages(msgs);

      if (messageListeners[dealId]) {
        messageListeners[dealId].forEach(cb => cb(newMsg));
      }

      return newMsg;
    },
    subscribe: (dealId: string, callback: RealtimeCallback): () => void => {
      if (supabase) {
        const channel = supabase
          .channel(`deal-messages:${dealId}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'dealhive_deal_message', filter: `deal_id=eq.${dealId}` },
            (payload) => {
              callback(payload.new as DealMessage);
            }
          )
          .subscribe();
        return () => {
          supabase.removeChannel(channel);
        };
      }

      // Simulator Mode
      if (!messageListeners[dealId]) {
        messageListeners[dealId] = [];
      }
      messageListeners[dealId].push(callback);

      return () => {
        messageListeners[dealId] = messageListeners[dealId].filter(cb => cb !== callback);
      };
    }
  },

  // Deliverables
  deliverables: {
    list: async (dealId: string): Promise<Deliverable[]> => {
      if (supabase) {
        const { data, error } = await supabase.from('dealhive_deliverable').select('*').eq('deal_id', dealId);
        if (error) throw error;
        return (data || []) as Deliverable[];
      }

      // Simulator Mode: check if user has access to this deal first
      const deal = await supabaseClient.deals.get(dealId);
      if (!deal) return [];

      return mockDb.getDeliverables().filter(d => d.deal_id === dealId);
    },
    upload: async (id: string, fileUrl: string, progressCallback?: (p: number) => void): Promise<Deliverable> => {
      rateLimiter.checkAndThrow('db_write');
      if (supabase) {
        if (progressCallback) {
          let prog = 0;
          const interval = setInterval(() => {
            prog += 25;
            progressCallback(prog);
            if (prog >= 100) clearInterval(interval);
          }, 100);
        }

        await new Promise(r => setTimeout(r, 600));

        const { data: del, error: getErr } = await supabase.from('dealhive_deliverable').select('*').eq('id', id).single();
        if (getErr || !del) throw new Error('Deliverable not found');

        const { data, error } = await supabase
          .from('dealhive_deliverable')
          .update({
            status: 'submitted',
            file_url: fileUrl,
            revision_count: del.revision_count + 1
          })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;

        const { data: deal } = await supabase.from('dealhive_deal').select('brand_id').eq('id', del.deal_id).single();
        if (deal) {
          await supabaseClient.notifications.trigger(
            deal.brand_id,
            'file-text',
            'Draft submitted',
            `Creator submitted a draft for deliverable "${del.name}"`,
            `/deals/${del.deal_id}`
          );
        }

        return data as Deliverable;
      }

      // Simulator Mode
      const role = supabaseClient.auth.getRole();
      if (role !== 'creator') {
        console.warn("[Security Alert] Blocked deliverable upload attempt by non-creator.");
        toast.error("Security Block: Only creators can submit drafts for deliverables.");
        throw new Error("Security Exception: Only creators can upload drafts.");
      }

      if (progressCallback) {
        let prog = 0;
        const interval = setInterval(() => {
          prog += 20;
          progressCallback(prog);
          if (prog >= 100) clearInterval(interval);
        }, 150);
      }

      await new Promise(r => setTimeout(r, 800));
      
      const deliverables = mockDb.getDeliverables();
      const idx = deliverables.findIndex(d => d.id === id);
      if (idx === -1) throw new Error('Deliverable not found');

      const del = deliverables[idx];
      // Check if user has access to this deal
      const deal = await supabaseClient.deals.get(del.deal_id);
      if (!deal) throw new Error('Security Exception: Unauthorized deliverable edit');

      const updated: Deliverable = {
        ...del,
        status: 'submitted',
        file_url: fileUrl,
        revision_count: del.revision_count + 1
      };
      deliverables[idx] = updated;
      mockDb.saveDeliverables(deliverables);

      supabaseClient.notifications.trigger(
        'brand_samsung',
        'file-text',
        'Draft submitted',
        `Sarah submitted a draft for deliverable "${del.name}"`,
        `/deals/${del.deal_id}`
      );

      return updated;
    },
    updateStatus: async (id: string, status: 'approved' | 'revision_requested'): Promise<Deliverable> => {
      rateLimiter.checkAndThrow('db_write');
      if (supabase) {
        const { data: del, error: getErr } = await supabase.from('dealhive_deliverable').select('*').eq('id', id).single();
        if (getErr || !del) throw new Error('Deliverable not found');

        const { data, error } = await supabase.from('dealhive_deliverable').update({ status }).eq('id', id).select().single();
        if (error) throw error;

        const { data: deal } = await supabase.from('dealhive_deal').select('creator_id').eq('id', del.deal_id).single();
        if (deal) {
          await supabaseClient.notifications.trigger(
            deal.creator_id,
            status === 'approved' ? 'check-circle' : 'alert-circle',
            status === 'approved' ? 'Draft Approved!' : 'Revision Requested',
            `Brand set status of "${del.name}" to ${status}.`,
            `/deals/${del.deal_id}`
          );
        }

        return data as Deliverable;
      }

      // Simulator Mode
      const role = supabaseClient.auth.getRole();
      if (role !== 'brand') {
        console.warn("[Security Alert] Blocked deliverable review attempt by non-brand.");
        toast.error("Security Block: Only brand sponsors can approve or request revisions on deliverables.");
        throw new Error("Security Exception: Only brands can review deliverables.");
      }

      const deliverables = mockDb.getDeliverables();
      const idx = deliverables.findIndex(d => d.id === id);
      if (idx === -1) throw new Error('Deliverable not found');

      const del = deliverables[idx];
      // Check if user has access to this deal
      const deal = await supabaseClient.deals.get(del.deal_id);
      if (!deal) throw new Error('Security Exception: Unauthorized deliverable edit');

      const updated = { ...del, status };
      deliverables[idx] = updated;
      mockDb.saveDeliverables(deliverables);

      supabaseClient.notifications.trigger(
        'creator_sarah',
        status === 'approved' ? 'check-circle' : 'alert-circle',
        status === 'approved' ? 'Draft Approved!' : 'Revision Requested',
        `Brand set status of "${del.name}" to ${status}.`,
        `/deals/${del.deal_id}`
      );

      return updated;
    }
  },

  // Contracts
  contracts: {
    get: async (dealId: string): Promise<Contract | null> => {
      if (supabase) {
        const { data, error } = await supabase.from('dealhive_contract').select('*').eq('deal_id', dealId).maybeSingle();
        if (error) return null;
        return data as Contract | null;
      }

      // Simulator Mode: check if user has access to this deal first
      const deal = await supabaseClient.deals.get(dealId);
      if (!deal) return null;

      return mockDb.getContracts().find(c => c.deal_id === dealId) || null;
    },
    generate: async (dealId: string): Promise<Contract> => {
      rateLimiter.checkAndThrow('db_write');
      if (supabase) {
        const newContract = {
          deal_id: dealId,
          pdf_url: '/mock-generated-contract.pdf',
          hellosign_request_id: 'hs_req_' + Math.random().toString(36).substr(2, 5),
          creator_signature_status: 'unsigned',
          brand_signature_status: 'unsigned',
          status: 'unsigned'
        };

        const { data, error } = await supabase.from('dealhive_contract').insert(newContract).select().single();
        if (error) throw error;
        return data as Contract;
      }

      // Simulator Mode: check if user has access to this deal first
      const deal = await supabaseClient.deals.get(dealId);
      if (!deal) throw new Error('Security Exception: Unauthorized contract generation');

      await new Promise(r => setTimeout(r, 1500));

      const contracts = mockDb.getContracts();
      const newContract: Contract = {
        id: 'con_' + Math.random().toString(36).substr(2, 9),
        deal_id: dealId,
        pdf_url: '/mock-generated-contract.pdf',
        hellosign_request_id: 'hs_req_' + Math.random().toString(36).substr(2, 5),
        creator_signature_status: 'unsigned',
        brand_signature_status: 'unsigned',
        status: 'unsigned',
        signed_at: null,
        created_at: new Date().toISOString()
      };
      contracts.push(newContract);
      mockDb.saveContracts(contracts);
      return newContract;
    },
    sign: async (dealId: string, signee: 'creator' | 'brand'): Promise<Contract> => {
      rateLimiter.checkAndThrow('db_write');
      if (supabase) {
        const con = await supabaseClient.contracts.get(dealId);
        if (!con) throw new Error('Contract not found');

        const isCreator = signee === 'creator';
        const creator_sig = isCreator ? 'signed' : con.creator_signature_status;
        const brand_sig = !isCreator ? 'signed' : con.brand_signature_status;
        const isFullySigned = creator_sig === 'signed' && brand_sig === 'signed';

        const { data, error } = await supabase
          .from('dealhive_contract')
          .update({
            creator_signature_status: creator_sig,
            brand_signature_status: brand_sig,
            status: isFullySigned ? 'fully_signed' : 'partially_signed',
            signed_at: isFullySigned ? new Date().toISOString() : con.signed_at
          })
          .eq('deal_id', dealId)
          .select()
          .single();
        if (error) throw error;

        if (isFullySigned) {
          await supabase.from('dealhive_deal').update({ stage: 'in_production' }).eq('id', dealId);

          const { data: deal } = await supabase.from('dealhive_deal').select('creator_id, brand_id').eq('id', dealId).single();
          if (deal) {
            await supabaseClient.notifications.trigger(deal.creator_id, 'check', 'Contract Signed', 'Your deal contract has been fully e-signed by both parties.', `/deals/${dealId}`);
            await supabaseClient.notifications.trigger(deal.brand_id, 'check', 'Contract Signed', 'Your deal contract has been fully e-signed by both parties.', `/deals/${dealId}`);
          }
        }

        return data as Contract;
      }

      // Simulator Mode: check if user has access to this deal first
      const deal = await supabaseClient.deals.get(dealId);
      if (!deal) throw new Error('Security Exception: Unauthorized contract execution');

      const role = supabaseClient.auth.getRole();
      if (role !== signee) {
        console.warn(`[Security Alert] Blocked attempt to sign contract as ${signee} by role ${role}`);
        toast.error(`Security Block: Cannot sign contract on behalf of ${signee}.`);
        throw new Error(`Security Exception: Cannot sign contract on behalf of ${signee}`);
      }

      const contracts = mockDb.getContracts();
      const idx = contracts.findIndex(c => c.deal_id === dealId);
      if (idx === -1) throw new Error('Contract not found');

      const con = contracts[idx];
      const isCreator = signee === 'creator';
      
      const updated: Contract = {
        ...con,
        creator_signature_status: isCreator ? 'signed' : con.creator_signature_status,
        brand_signature_status: !isCreator ? 'signed' : con.brand_signature_status,
        status: (isCreator && con.brand_signature_status === 'signed') || (!isCreator && con.creator_signature_status === 'signed')
          ? 'fully_signed'
          : 'partially_signed',
        signed_at: (isCreator && con.brand_signature_status === 'signed') || (!isCreator && con.creator_signature_status === 'signed')
          ? new Date().toISOString()
          : null
      };

      contracts[idx] = updated;
      mockDb.saveContracts(contracts);

      if (updated.status === 'fully_signed') {
        const deals = mockDb.getDeals();
        const dealIdx = deals.findIndex(d => d.id === dealId);
        if (dealIdx !== -1) {
          deals[dealIdx].stage = 'in_production';
          mockDb.saveDeals(deals);
        }

        supabaseClient.notifications.trigger('creator_sarah', 'check', 'Contract Signed', 'Your deal contract has been fully e-signed by both parties.', `/deals/${dealId}`);
        supabaseClient.notifications.trigger('brand_samsung', 'check', 'Contract Signed', 'Your deal contract has been fully e-signed by both parties.', `/deals/${dealId}`);
      }

      return updated;
    }
  },

  // Invoices & Payments
  invoices: {
    list: async (): Promise<Invoice[]> => {
      if (supabase) {
        const { data, error } = await supabase.from('dealhive_invoice').select('*');
        if (error) throw error;
        return (data || []) as Invoice[];
      }

      // Simulator Mode: check if user has access to each invoice's deal
      const deals = await supabaseClient.deals.list();
      const dealIds = new Set(deals.map(d => d.id));
      return mockDb.getInvoices().filter(i => dealIds.has(i.deal_id));
    },
    create: async (dealId: string, amount: number, dueDate: string): Promise<Invoice> => {
      rateLimiter.checkAndThrow('db_write');
      if (supabase) {
        const platform_fee = Number((amount * 0.025).toFixed(2));
        const creator_net = Number((amount - platform_fee).toFixed(2));

        const newInv = {
          deal_id: dealId,
          amount,
          platform_fee,
          creator_net,
          due_date: dueDate,
          stripe_payment_intent_id: 'pi_' + Math.random().toString(36).substr(2, 9),
          pdf_url: '/mock-invoice.pdf',
          status: 'pending'
        };

        const { data, error } = await supabase.from('dealhive_invoice').insert(newInv).select().single();
        if (error) throw error;
        return data as Invoice;
      }

      // Simulator Mode: check if user has access to this deal first
      const deal = await supabaseClient.deals.get(dealId);
      if (!deal) throw new Error('Security Exception: Unauthorized invoice creation');

      const invoices = mockDb.getInvoices();
      const platform_fee = Number((amount * 0.025).toFixed(2));
      const creator_net = Number((amount - platform_fee).toFixed(2));

      const newInv: Invoice = {
        id: 'inv_' + Math.random().toString(36).substr(2, 9),
        deal_id: dealId,
        amount,
        platform_fee,
        creator_net,
        due_date: dueDate,
        stripe_payment_intent_id: 'pi_' + Math.random().toString(36).substr(2, 9),
        pdf_url: '/mock-invoice.pdf',
        status: 'pending',
        created_at: new Date().toISOString()
      };
      invoices.push(newInv);
      mockDb.saveInvoices(invoices);
      return newInv;
    },
    send: async (id: string): Promise<Invoice> => {
      rateLimiter.checkAndThrow('db_write');
      if (supabase) {
        const { data: inv, error: getErr } = await supabase.from('dealhive_invoice').select('*').eq('id', id).single();
        if (getErr || !inv) throw new Error('Invoice not found');

        const { data, error } = await supabase.from('dealhive_invoice').update({ status: 'invoice_sent' }).eq('id', id).select().single();
        if (error) throw error;

        const { data: deal } = await supabase.from('dealhive_deal').select('brand_id').eq('id', inv.deal_id).single();
        if (deal) {
          await supabaseClient.notifications.trigger(
            deal.brand_id,
            'mail',
            'Invoice received',
            `Invoice ${id} ($${inv.amount}) has been issued.`,
            '/payments'
          );
        }

        return data as Invoice;
      }

      // Simulator Mode
      const invoices = mockDb.getInvoices();
      const idx = invoices.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('Invoice not found');

      const inv = invoices[idx];
      const deal = await supabaseClient.deals.get(inv.deal_id);
      if (!deal) throw new Error('Security Exception: Unauthorized invoice transmission');

      const updated = {
        ...inv,
        status: 'invoice_sent' as InvoiceStatus
      };
      invoices[idx] = updated;
      mockDb.saveInvoices(invoices);

      supabaseClient.notifications.trigger(
        'brand_samsung',
        'mail',
        'Invoice received',
        `Invoice ${updated.id} ($${updated.amount}) has been issued.`,
        '/payments'
      );

      return updated;
    },
    pay: async (id: string, isStripeSim: boolean = false): Promise<Invoice> => {
      if (supabase) {
        const { data: inv, error: getErr } = await supabase.from('dealhive_invoice').select('*').eq('id', id).single();
        if (getErr || !inv) throw new Error('Invoice not found');

        if (!isStripeSim) {
          // Direct client update (will be blocked by PostgreSQL trigger checks)
          const { error } = await supabase.from('dealhive_invoice').update({ status: 'paid' }).eq('id', id);
          if (error) throw error;
        } else {
          // Bypasses RLS blocks via postgres security definer RPC
          const { error } = await supabase.rpc('simulate_invoice_payment', { target_invoice_id: id });
          if (error) throw error;
        }

        const { data, error: fetchErr } = await supabase.from('dealhive_invoice').select('*').eq('id', id).single();
        if (fetchErr) throw fetchErr;

        // Auto transition deal to completed stage (the RPC does this, but we mirror notifications here)
        await supabaseClient.notifications.trigger(
          data.creator_id || 'creator_sarah',
          'credit-card',
          'Payment Received',
          `You received $${data.creator_net} for deal payout!`,
          '/payments'
        );

        return data as Invoice;
      }

      // Simulator Mode
      const invoices = mockDb.getInvoices();
      const idx = invoices.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('Invoice not found');

      const updated = {
        ...invoices[idx],
        status: 'paid' as InvoiceStatus
      };
      invoices[idx] = updated;
      mockDb.saveInvoices(invoices);

      const deals = mockDb.getDeals();
      const dealIdx = deals.findIndex(d => d.id === updated.deal_id);
      if (dealIdx !== -1) {
        deals[dealIdx].stage = 'completed';
        mockDb.saveDeals(deals);
      }

      supabaseClient.notifications.trigger('creator_sarah', 'credit-card', 'Payment Received', `You received $${updated.creator_net} for deal payout!`, '/payments');

      return updated;
    }
  },

  // Notifications
  notifications: {
    list: async (): Promise<DealHiveNotification[]> => {
      if (supabase) {
        const userId = (await supabaseClient.auth.getUser()).data.user?.id;
        if (!userId) return [];
        const { data, error } = await supabase
          .from('dealhive_notification')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []) as DealHiveNotification[];
      }

      // Simulator Mode
      return mockDb.getNotifications().sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    markAllRead: async (): Promise<void> => {
      if (supabase) {
        const userId = (await supabaseClient.auth.getUser()).data.user?.id;
        if (!userId) return;
        await supabase.from('dealhive_notification').update({ is_read: true }).eq('user_id', userId);
        return;
      }

      // Simulator Mode
      const notifs = mockDb.getNotifications();
      notifs.forEach(n => n.is_read = true);
      mockDb.saveNotifications(notifs);
    },
    markAsRead: async (id: string): Promise<void> => {
      if (supabase) {
        await supabase.from('dealhive_notification').update({ is_read: true }).eq('id', id);
        return;
      }

      // Simulator Mode
      const notifs = mockDb.getNotifications();
      const idx = notifs.findIndex(n => n.id === id);
      if (idx !== -1) {
        notifs[idx].is_read = true;
        mockDb.saveNotifications(notifs);
      }
    },
    trigger: async (userId: string, icon: string, title: string, message: string, link: string) => {
      if (supabase) {
        const newNotif = {
          user_id: userId,
          icon,
          title,
          message,
          link,
          is_read: false
        };

        const { data, error } = await supabase.from('dealhive_notification').insert(newNotif).select().single();
        if (error) throw error;

        window.dispatchEvent(new CustomEvent('notification-triggered', { detail: data }));
        return;
      }

      // Simulator Mode
      const notifs = mockDb.getNotifications();
      const newNotif: DealHiveNotification = {
        id: 'not_' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        icon,
        title,
        message,
        link,
        is_read: false,
        created_at: new Date().toISOString()
      };
      notifs.push(newNotif);
      mockDb.saveNotifications(notifs);

      window.dispatchEvent(new CustomEvent('notification-triggered', { detail: newNotif }));
    }
  },

  // Profiles
  profiles: {
    getCreator: async (): Promise<CreatorProfile> => {
      if (supabase) {
        const userId = (await supabaseClient.auth.getUser()).data.user?.id;
        if (!userId) throw new Error('Not authenticated');

        const { data, error } = await supabase.from('dealhive_creator_profile').select('*').eq('id', userId).maybeSingle();
        if (error) throw error;
        if (data) return data as CreatorProfile;

        // Auto provision default creator profile on first request
        const defaultProfile = {
          id: userId,
          username: 'creator_' + Math.random().toString(36).substr(2, 6),
          full_name: 'Sarah Jenkins',
          rate_card: {
            integration: 3500,
            dedicated: 7000,
            shorts: 1500,
            social_package: 9500,
            exclusivity_premium: 20
          },
          niche_tags: ['Lifestyle'],
          youtube_connected: false,
          stripe_status: 'unconnected',
          subscription_plan: 'free',
          visibility: 'public'
        };

        const { data: newProfile, error: insErr } = await supabase.from('dealhive_creator_profile').insert(defaultProfile).select().single();
        if (insErr) throw insErr;
        return newProfile as CreatorProfile;
      }

      // Simulator Mode
      return mockDb.getCreatorProfile();
    },
    updateCreator: async (updates: Partial<CreatorProfile>): Promise<CreatorProfile> => {
      if (supabase) {
        const userId = (await supabaseClient.auth.getUser()).data.user?.id;
        if (!userId) throw new Error('Not authenticated');

        const updatesClean = { ...updates };
        delete (updatesClean as any)._sysBypass;

        const { data, error } = await supabase.from('dealhive_creator_profile').update(updatesClean).eq('id', userId).select().single();
        if (error) throw error;
        return data as CreatorProfile;
      }

      // Simulator Mode: check for privilege escalation (subscription plan or stripe status/id changes)
      const current = mockDb.getCreatorProfile();
      
      const isChangingPlan = updates.subscription_plan !== undefined && updates.subscription_plan !== current.subscription_plan;
      const isChangingStripeStatus = updates.stripe_status !== undefined && updates.stripe_status !== current.stripe_status;
      const isChangingStripeId = updates.stripe_connected_id !== undefined && updates.stripe_connected_id !== current.stripe_connected_id;
      
      if (isChangingPlan || isChangingStripeStatus || isChangingStripeId) {
        const hasBypass = (updates as any)._sysBypass === true;
        if (!hasBypass) {
          console.warn("[Security Alert] Blocked direct simulator update to subscription plan or Stripe configs without payment gateway simulation.");
          delete updates.subscription_plan;
          delete updates.stripe_status;
          delete updates.stripe_connected_id;
          toast.error("Security Block: Direct updates to billing plans or bank linked credentials are not permitted.");
        } else {
          delete (updates as any)._sysBypass;
        }
      }

      const updated = { ...current, ...updates };
      mockDb.saveCreatorProfile(updated);
      return updated;
    },
    getBrand: async (): Promise<BrandProfile> => {
      if (supabase) {
        const userId = (await supabaseClient.auth.getUser()).data.user?.id;
        if (!userId) throw new Error('Not authenticated');

        const { data, error } = await supabase.from('dealhive_brand_profile').select('*').eq('id', userId).maybeSingle();
        if (error) throw error;
        if (data) return data as BrandProfile;

        // Auto provision default brand profile on first request
        const defaultBrand = {
          id: userId,
          company_name: 'Samsung',
          industry: 'Consumer Electronics',
          billing_email: 'finance@samsung.com'
        };

        const { data: newBrand, error: insErr } = await supabase.from('dealhive_brand_profile').insert(defaultBrand).select().single();
        if (insErr) throw insErr;
        return newBrand as BrandProfile;
      }

      // Simulator Mode
      return mockDb.getBrands()[0];
    },
    updateBrand: async (updates: Partial<BrandProfile>): Promise<BrandProfile> => {
      if (supabase) {
        const userId = (await supabaseClient.auth.getUser()).data.user?.id;
        if (!userId) throw new Error('Not authenticated');

        const { data, error } = await supabase.from('dealhive_brand_profile').update(updates).eq('id', userId).select().single();
        if (error) throw error;
        return data as BrandProfile;
      }

      // Simulator Mode
      const brands = mockDb.getBrands();
      const updated = { ...brands[0], ...updates };
      brands[0] = updated;
      mockDb.saveBrands(brands);
      return updated;
    }
  },

  // Benchmarks
  benchmarks: {
    list: async (): Promise<RateBenchmark[]> => {
      if (supabase) {
        const { data, error } = await supabase.from('dealhive_rate_benchmarks').select('*');
        if (error) throw error;
        return (data || []) as RateBenchmark[];
      }

      // Simulator Mode
      return mockDb.getBenchmarks();
    }
  },

  // Deal Templates
  templates: {
    list: async (): Promise<any[]> => {
      return mockDb.getTemplates();
    },
    create: async (template: any): Promise<any> => {
      const list = mockDb.getTemplates();
      const newTemp = {
        ...template,
        id: 'temp_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      };
      if (newTemp.is_default) {
        list.forEach(t => t.is_default = false);
      }
      list.push(newTemp);
      mockDb.saveTemplates(list);
      return newTemp;
    },
    update: async (id: string, updates: any): Promise<any> => {
      const list = mockDb.getTemplates();
      const idx = list.findIndex(t => t.id === id);
      if (idx === -1) throw new Error('Template not found');
      const updated = { ...list[idx], ...updates };
      if (updates.is_default) {
        list.forEach(t => t.is_default = false);
      }
      list[idx] = updated;
      mockDb.saveTemplates(list);
      return updated;
    },
    delete: async (id: string): Promise<void> => {
      const list = mockDb.getTemplates();
      const filtered = list.filter(t => t.id !== id);
      mockDb.saveTemplates(filtered);
    },
    setDefault: async (id: string): Promise<void> => {
      const list = mockDb.getTemplates();
      list.forEach(t => {
        t.is_default = t.id === id;
      });
      mockDb.saveTemplates(list);
    }
  },

  // Scoped Teams System
  teams: {
    listMembers: async (): Promise<any[]> => {
      return mockDb.getTeamMembers();
    },
    listInvites: async (): Promise<any[]> => {
      return mockDb.getTeamInvitations().filter(i => !i.used);
    },
    inviteMember: async (email: string, role: string, note?: string): Promise<any> => {
      const invites = mockDb.getTeamInvitations();
      const newInv = {
        id: 'invite_' + Math.random().toString(36).substr(2, 9),
        token: 'token_' + Math.random().toString(36).substr(2, 12),
        account_id: 'creator_sarah',
        account_type: 'creator',
        email,
        role,
        note: note || '',
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        used: false,
        created_at: new Date().toISOString()
      };
      invites.push(newInv);
      mockDb.saveTeamInvitations(invites);

      // Log activity
      const logs = mockDb.getTeamActivityLogs();
      logs.unshift({
        id: 'act_' + Math.random().toString(36).substr(2, 9),
        account_id: 'creator_sarah',
        actor_user_id: 'creator_sarah',
        actor_name: 'Sarah Jenkins (Owner)',
        action_type: 'invited_member',
        entity_type: 'member',
        entity_id: newInv.id,
        entity_name: email,
        created_at: new Date().toISOString()
      });
      mockDb.saveTeamActivityLogs(logs);

      return newInv;
    },
    cancelInvite: async (id: string): Promise<void> => {
      const invites = mockDb.getTeamInvitations();
      const filtered = invites.filter(i => i.id !== id);
      mockDb.saveTeamInvitations(filtered);
    },
    resendInvite: async (id: string): Promise<void> => {
      const invites = mockDb.getTeamInvitations();
      const idx = invites.findIndex(i => i.id === id);
      if (idx !== -1) {
        invites[idx].expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
        mockDb.saveTeamInvitations(invites);
      }
    },
    updateMemberRole: async (id: string, role: string): Promise<any> => {
      const members = mockDb.getTeamMembers();
      const idx = members.findIndex(m => m.id === id);
      if (idx === -1) throw new Error('Member not found');
      members[idx].role = role;
      mockDb.saveTeamMembers(members);
      return members[idx];
    },
    removeMember: async (id: string): Promise<void> => {
      const members = mockDb.getTeamMembers();
      const filtered = members.filter(m => m.id !== id);
      mockDb.saveTeamMembers(filtered);
    },
    getActivityLogs: async (): Promise<any[]> => {
      return mockDb.getTeamActivityLogs().sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    logActivity: async (actionType: string, entityType: string, entityId: string, entityName: string): Promise<void> => {
      const logs = mockDb.getTeamActivityLogs();
      const teamRole = localStorage.getItem('dealhive_team_role');
      const actorName = teamRole ? `${localStorage.getItem('dealhive_user_name') || 'VA'} (${teamRole.toUpperCase()})` : 'Sarah Jenkins (Owner)';
      logs.unshift({
        id: 'act_' + Math.random().toString(36).substr(2, 9),
        account_id: 'creator_sarah',
        actor_user_id: teamRole ? 'user_va_sarah' : 'creator_sarah',
        actor_name: actorName,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        created_at: new Date().toISOString()
      });
      mockDb.saveTeamActivityLogs(logs);
    },
    validateInviteToken: async (token: string): Promise<any> => {
      const invites = mockDb.getTeamInvitations();
      const inv = invites.find(i => i.token === token && !i.used);
      if (!inv) return null;
      const isExpired = new Date(inv.expires_at) < new Date();
      if (isExpired) return null;
      return inv;
    },
    acceptInvite: async (token: string, fullName: string, _password?: string): Promise<any> => {
      const invites = mockDb.getTeamInvitations();
      const invIdx = invites.findIndex(i => i.token === token);
      if (invIdx === -1) throw new Error('Invalid invite token');
      invites[invIdx].used = true;
      mockDb.saveTeamInvitations(invites);

      const members = mockDb.getTeamMembers();
      const newMember = {
        id: 'tm_' + Math.random().toString(36).substr(2, 9),
        account_id: invites[invIdx].account_id,
        account_type: invites[invIdx].account_type,
        user_id: 'user_' + Math.random().toString(36).substr(2, 9),
        invited_email: invites[invIdx].email,
        role: invites[invIdx].role,
        status: 'active',
        invited_by: 'creator_sarah',
        invited_at: invites[invIdx].created_at || new Date().toISOString(),
        accepted_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      };
      members.push(newMember);
      mockDb.saveTeamMembers(members);

      // Log in as VA or Manager immediately for demo scoping
      localStorage.setItem('dealhive_team_role', invites[invIdx].role);
      localStorage.setItem('dealhive_user_name', fullName);
      localStorage.setItem('dealhive_auth_role', invites[invIdx].account_type);

      // Log activity
      const logs = mockDb.getTeamActivityLogs();
      logs.unshift({
        id: 'act_' + Math.random().toString(36).substr(2, 9),
        account_id: invites[invIdx].account_id,
        actor_user_id: newMember.user_id,
        actor_name: `${fullName} (${invites[invIdx].role.toUpperCase()})`,
        action_type: 'accepted_invite',
        entity_type: 'member',
        entity_id: newMember.id,
        entity_name: invites[invIdx].email,
        created_at: new Date().toISOString()
      });
      mockDb.saveTeamActivityLogs(logs);

      return newMember;
    }
  },

  // Brand Reputation System
  reviews: {
    listForBrand: async (brandId: string): Promise<any[]> => {
      const list = mockDb.getBrandReviews();
      return list.filter(r => r.brand_id === brandId);
    },
    getReputation: async (brandId: string): Promise<any> => {
      const scores = mockDb.getReputationScores();
      let score = scores.find(s => s.brand_id === brandId);
      if (!score) {
        // provision a default score
        score = {
          brand_id: brandId,
          avg_overall: 5.0,
          avg_payment_speed: 5.0,
          avg_communication: 5.0,
          avg_revision_fairness: 5.0,
          total_reviews: 0
        };
      }
      return score;
    },
    create: async (brandId: string, dealId: string, ratings: { overall: number, payment: number, communication: number, fairness: number }, text: string, isAnonymous: boolean): Promise<any> => {
      const list = mockDb.getBrandReviews();
      
      // Constraint: one review per deal
      if (list.some(r => r.deal_id === dealId)) {
        throw new Error('Review already submitted for this deal.');
      }

      const newReview = {
        id: 'rev_' + Math.random().toString(36).substr(2, 9),
        reviewer_creator_id: 'creator_sarah',
        brand_id: brandId,
        deal_id: dealId,
        overall_rating: ratings.overall,
        payment_speed_rating: ratings.payment,
        communication_rating: ratings.communication,
        revision_fairness_rating: ratings.fairness,
        review_text: text || '',
        is_anonymous: isAnonymous,
        created_at: new Date().toISOString()
      };
      list.push(newReview);
      mockDb.saveBrandReviews(list);

      // Recalculate reputation score
      const brandReviews = list.filter(r => r.brand_id === brandId);
      const total = brandReviews.length;
      const sumOverall = brandReviews.reduce((sum, r) => sum + r.overall_rating, 0);
      const sumPayment = brandReviews.reduce((sum, r) => sum + r.payment_speed_rating, 0);
      const sumComm = brandReviews.reduce((sum, r) => sum + r.communication_rating, 0);
      const sumFairness = brandReviews.reduce((sum, r) => sum + r.revision_fairness_rating, 0);

      const scores = mockDb.getReputationScores();
      const scoreIdx = scores.findIndex(s => s.brand_id === brandId);
      const newScore = {
        brand_id: brandId,
        avg_overall: Number((sumOverall / total).toFixed(1)),
        avg_payment_speed: Number((sumPayment / total).toFixed(1)),
        avg_communication: Number((sumComm / total).toFixed(1)),
        avg_revision_fairness: Number((sumFairness / total).toFixed(1)),
        total_reviews: total
      };

      if (scoreIdx !== -1) {
        scores[scoreIdx] = newScore;
      } else {
        scores.push(newScore);
      }
      mockDb.saveReputationScores(scores);

      return newReview;
    }
  },

  // Brand Blacklist System
  blacklist: {
    list: async (): Promise<any[]> => {
      return mockDb.getBlacklist();
    },
    add: async (nameOrUrl: string, reason?: string): Promise<any> => {
      const list = mockDb.getBlacklist();
      const newBlock = {
        id: 'bl_' + Math.random().toString(36).substr(2, 9),
        brand_name: nameOrUrl,
        reason: reason || '',
        created_at: new Date().toISOString()
      };
      list.push(newBlock);
      mockDb.saveBlacklist(list);
      return newBlock;
    },
    remove: async (id: string): Promise<void> => {
      const list = mockDb.getBlacklist();
      const filtered = list.filter(b => b.id !== id);
      mockDb.saveBlacklist(filtered);
    }
  },

  // Deal Room Brand Internal Notes
  notes: {
    list: async (dealId: string): Promise<any[]> => {
      const list = mockDb.getInternalNotes();
      return list.filter(n => n.deal_id === dealId);
    },
    create: async (dealId: string, content: string, mentionedUserIds: string[] = []): Promise<any> => {
      const list = mockDb.getInternalNotes();
      const newNote = {
        id: 'note_' + Math.random().toString(36).substr(2, 9),
        deal_id: dealId,
        author_name: 'Samsung Team Note',
        content,
        mentioned_user_ids: mentionedUserIds,
        created_at: new Date().toISOString()
      };
      list.push(newNote);
      mockDb.saveInternalNotes(list);
      return newNote;
    }
  },

  // Creator Reviews System (Bilateral Reputation)
  creatorReviews: {
    listForCreator: async (creatorId: string): Promise<any[]> => {
      const list = JSON.parse(localStorage.getItem('dealhive_creator_reviews') || '[]');
      return list.filter((r: any) => r.creator_id === creatorId);
    },
    getReputation: async (creatorId: string): Promise<any> => {
      const reviews = JSON.parse(localStorage.getItem('dealhive_creator_reviews') || '[]');
      const creatorReviews = reviews.filter((r: any) => r.creator_id === creatorId);
      const total = creatorReviews.length;
      if (total === 0) {
        return {
          creator_id: creatorId,
          avg_overall: 5.0,
          avg_content_quality: 5.0,
          avg_communication: 5.0,
          avg_timeliness: 5.0,
          total_reviews: 0,
          badges: ["⚡ Fast Payer", "💬 Great Communicator"]
        };
      }
      const sumOverall = creatorReviews.reduce((sum: number, r: any) => sum + r.overall_rating, 0);
      const sumQuality = creatorReviews.reduce((sum: number, r: any) => sum + r.content_quality_rating, 0);
      const sumComm = creatorReviews.reduce((sum: number, r: any) => sum + r.communication_rating, 0);
      const sumTimeliness = creatorReviews.reduce((sum: number, r: any) => sum + r.timeliness_rating, 0);

      const badges = [];
      if (sumOverall / total >= 4.5) badges.push("🎯 On-Brief");
      if (sumComm / total >= 4.5) badges.push("💬 Great Communicator");
      if (sumTimeliness / total >= 4.5) badges.push("⚡ Fast Turnaround");

      return {
        creator_id: creatorId,
        avg_overall: Number((sumOverall / total).toFixed(1)),
        avg_content_quality: Number((sumQuality / total).toFixed(1)),
        avg_communication: Number((sumComm / total).toFixed(1)),
        avg_timeliness: Number((sumTimeliness / total).toFixed(1)),
        total_reviews: total,
        badges
      };
    },
    create: async (creatorId: string, dealId: string, ratings: { overall: number, quality: number, communication: number, timeliness: number }, text: string, isAnonymous: boolean): Promise<any> => {
      const list = JSON.parse(localStorage.getItem('dealhive_creator_reviews') || '[]');
      if (list.some((r: any) => r.deal_id === dealId)) {
        throw new Error('Review already submitted for this deal.');
      }

      const newReview = {
        id: 'crev_' + Math.random().toString(36).substr(2, 9),
        brand_id: 'brand_samsung',
        creator_id: creatorId,
        deal_id: dealId,
        overall_rating: ratings.overall,
        content_quality_rating: ratings.quality,
        communication_rating: ratings.communication,
        timeliness_rating: ratings.timeliness,
        review_text: text || '',
        is_anonymous: isAnonymous,
        created_at: new Date().toISOString()
      };
      list.push(newReview);
      localStorage.setItem('dealhive_creator_reviews', JSON.stringify(list));

      // Trigger user badges update in creator profile
      const rep = await supabaseClient.creatorReviews.getReputation(creatorId);
      const profile = await supabaseClient.profiles.getCreator();
      await supabaseClient.profiles.updateCreator({
        ...profile,
        reputation_score: rep.avg_overall,
        badges: rep.badges
      });

      return newReview;
    }
  },

  // Campaign Brief Templates
  briefs: {
    list: async (brandId?: string): Promise<any[]> => {
      const briefs = mockDb.getBriefs();
      if (brandId) return briefs.filter(b => b.brand_id === brandId);
      return briefs;
    },
    create: async (brief: any): Promise<any> => {
      const briefs = mockDb.getBriefs();
      const newBrief = {
        id: 'brief_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        ...brief
      };
      briefs.push(newBrief);
      mockDb.saveBriefs(briefs);
      return newBrief;
    }
  },

  // Content Library Vault
  contentLibrary: {
    list: async (): Promise<any[]> => {
      return mockDb.getContentLibrary();
    },
    add: async (asset: any): Promise<any> => {
      const assets = mockDb.getContentLibrary();
      const newAsset = {
        id: 'asset_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        ...asset
      };
      assets.push(newAsset);
      mockDb.saveContentLibrary(assets);
      return newAsset;
    }
  },

  // Relationship CRM Partnerships
  partnerships: {
    list: async (): Promise<any[]> => {
      return mockDb.getPartnerships();
    },
    save: async (pList: any[]): Promise<void> => {
      mockDb.savePartnerships(pList);
    }
  },

  // Developer Hub Webhooks
  webhooks: {
    dispatch: async (event: string, payload: any): Promise<any> => {
      const storedLogs = JSON.parse(localStorage.getItem('dealhive_webhook_logs') || '[]');
      const newLog = {
        id: 'wh_log_' + Math.random().toString(36).substr(2, 9),
        event,
        payload,
        timestamp: new Date().toISOString(),
        status: 'success',
        response: { message: "Webhook successfully delivered, status 200 OK" }
      };
      storedLogs.unshift(newLog);
      localStorage.setItem('dealhive_webhook_logs', JSON.stringify(storedLogs.slice(0, 50)));

      // Dispatch event
      const evt = new CustomEvent('webhook-dispatched', { detail: newLog });
      window.dispatchEvent(evt);

      return newLog;
    }
  },

  // Crash & System Error Logging
  errorLog: {
    report: async (err: { errorMessage: string; errorStack: string | null; componentStack: string | null }): Promise<void> => {
      const timestamp = new Date().toISOString();
      const userId = localStorage.getItem('dealhive_auth_role') === 'brand' ? 'brand_samsung' : 'creator_sarah';
      const logEntry = {
        id: 'err_' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        error_message: err.errorMessage,
        error_stack: err.errorStack,
        component_stack: err.componentStack,
        url: window.location.href,
        user_agent: navigator.userAgent,
        created_at: timestamp
      };

      if (supabase) {
        try {
          const { error } = await supabase.from('dealhive_error_log').insert({
            error_message: err.errorMessage,
            error_stack: err.errorStack,
            component_stack: err.componentStack,
            url: window.location.href,
            user_agent: navigator.userAgent
          });
          if (error) console.error('Failed to log error to live database', error);
        } catch (dbErr) {
          console.error(dbErr);
        }
      }

      // Always write to local storage logs to satisfy simulator mode diagnostics feed
      const logs = JSON.parse(localStorage.getItem('dealhive_db_error_logs') || '[]');
      logs.unshift(logEntry);
      localStorage.setItem('dealhive_db_error_logs', JSON.stringify(logs.slice(0, 50)));

      // Dispatch event to settings diagnostics page to update in real-time
      window.dispatchEvent(new CustomEvent('dealhive-error-logged', { detail: logEntry }));
    },
    list: async (): Promise<any[]> => {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('dealhive_error_log')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && data) return data;
        } catch (e) {
          console.error('Failed to read live error logs', e);
        }
      }
      return JSON.parse(localStorage.getItem('dealhive_db_error_logs') || '[]');
    },
    clear: async (): Promise<void> => {
      localStorage.removeItem('dealhive_db_error_logs');
      if (supabase) {
        try {
          await supabase.from('dealhive_error_log').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } catch (e) {
          console.error('Failed to clear live database error logs', e);
        }
      }
      window.dispatchEvent(new Event('dealhive-error-logged'));
    }
  }
};
