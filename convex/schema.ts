import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  creator_profiles: defineTable({
    id: v.string(),
    username: v.string(),
    full_name: v.string(),
    avatar_url: v.union(v.string(), v.null()),
    bio: v.union(v.string(), v.null()),
    niche_tags: v.array(v.string()),
    rate_card: v.any(), // RateCard object
    youtube_connected: v.boolean(),
    youtube_channel_id: v.union(v.string(), v.null()),
    youtube_stats: v.any(), // YouTubeStats object
    stripe_connected_id: v.union(v.string(), v.null()),
    stripe_status: v.string(), // 'unconnected' | 'pending' | 'active'
    subscription_plan: v.string(), // 'free' | 'pro' | 'business'
    visibility: v.string(), // 'public' | 'unlisted' | 'private'
    availability_status: v.optional(v.string()),
    verified_analytics: v.optional(v.boolean()),
    reputation_score: v.optional(v.number()),
    badges: v.optional(v.array(v.string())),
    instagram_connected: v.optional(v.boolean()),
    instagram_stats: v.optional(v.any()),
    created_at: v.string(),
  }).index("id", ["id"]),

  brand_profiles: defineTable({
    id: v.string(),
    company_name: v.string(),
    industry: v.string(),
    website: v.union(v.string(), v.null()),
    billing_email: v.string(),
    logo_url: v.union(v.string(), v.null()),
    reputation_score: v.optional(v.number()),
    badges: v.optional(v.array(v.string())),
    preferred_creators: v.optional(v.array(v.string())),
    created_at: v.string(),
  }).index("id", ["id"]),

  deals: defineTable({
    id: v.string(),
    creator_id: v.string(),
    brand_id: v.string(),
    title: v.string(),
    deal_type: v.string(),
    stage: v.string(),
    agreed_rate: v.number(),
    currency: v.string(),
    payment_terms: v.string(),
    exclusivity: v.union(v.string(), v.null()),
    usage_rights: v.union(v.string(), v.null()),
    kill_fee: v.number(),
    term_change_history: v.array(v.any()),
    creator_agreed: v.boolean(),
    brand_agreed: v.boolean(),
    last_viewed_at: v.string(),
    created_at: v.string(),
    updated_at: v.string(),
    assigned_to: v.optional(v.union(v.string(), v.null())),
    health_score: v.optional(v.number()),
    health_status: v.optional(v.string()),
  }).index("id", ["id"])
    .index("by_creator_id", ["creator_id"])
    .index("by_brand_id", ["brand_id"]),

  deal_messages: defineTable({
    id: v.string(),
    deal_id: v.string(),
    sender_id: v.string(),
    message_text: v.union(v.string(), v.null()),
    attachments: v.array(v.any()),
    created_at: v.string(),
  }).index("by_deal_id", ["deal_id"]),

  deliverables: defineTable({
    id: v.string(),
    deal_id: v.string(),
    name: v.string(),
    due_date: v.string(),
    status: v.string(),
    file_url: v.union(v.string(), v.null()),
    revision_count: v.number(),
    created_at: v.string(),
  }).index("by_deal_id", ["deal_id"]),

  contracts: defineTable({
    id: v.string(),
    deal_id: v.string(),
    pdf_url: v.union(v.string(), v.null()),
    hellosign_request_id: v.union(v.string(), v.null()),
    creator_signature_status: v.string(),
    brand_signature_status: v.string(),
    status: v.string(),
    signed_at: v.union(v.string(), v.null()),
    created_at: v.string(),
  }).index("by_deal_id", ["deal_id"]),

  invoices: defineTable({
    id: v.string(),
    deal_id: v.string(),
    amount: v.number(),
    platform_fee: v.number(),
    creator_net: v.number(),
    due_date: v.string(),
    stripe_payment_intent_id: v.union(v.string(), v.null()),
    pdf_url: v.union(v.string(), v.null()),
    status: v.string(),
    created_at: v.string(),
  }).index("by_deal_id", ["deal_id"]),

  rate_benchmarks: defineTable({
    id: v.string(),
    niche: v.string(),
    subscriber_tier: v.string(),
    median_rate: v.number(),
    p25_rate: v.number(),
    p75_rate: v.number(),
    sample_size: v.number(),
    calculated_at: v.string(),
  }).index("by_niche", ["niche"]),

  notifications: defineTable({
    id: v.string(),
    user_id: v.string(),
    icon: v.string(),
    title: v.string(),
    message: v.string(),
    link: v.string(),
    is_read: v.boolean(),
    created_at: v.string(),
  }).index("by_user_id", ["user_id"]),

  reviews: defineTable({
    id: v.string(),
    deal_id: v.string(),
    reviewer_id: v.string(),
    recipient_id: v.string(),
    reviewer_role: v.string(),
    overall_rating: v.number(),
    payment_speed_rating: v.optional(v.number()),
    communication_rating: v.number(),
    creative_freedom_rating: v.optional(v.number()),
    professionalism_rating: v.number(),
    content_quality_rating: v.optional(v.number()),
    timeliness_rating: v.optional(v.number()),
    review_text: v.string(),
    is_anonymous: v.boolean(),
    created_at: v.string(),
  }).index("by_recipient_id", ["recipient_id"]),

  campaign_briefs: defineTable({
    id: v.string(),
    brand_id: v.string(),
    title: v.string(),
    deal_type: v.string(),
    talking_points: v.array(v.string()),
    hook_focus: v.string(),
    restrictions: v.array(v.string()),
    creative_freedom_score: v.number(),
    compliance_checklist: v.array(v.string()),
    attachments: v.array(v.string()),
    created_at: v.string(),
  }).index("by_brand_id", ["brand_id"]),

  content_library: defineTable({
    id: v.string(),
    deal_id: v.string(),
    asset_url: v.string(),
    file_name: v.string(),
    usage_duration_months: v.number(),
    usage_channels: v.array(v.string()),
    exclusivity_period_months: v.number(),
    expires_at: v.string(),
    created_at: v.string(),
  }).index("by_deal_id", ["deal_id"]),

  team_members: defineTable({
    email: v.string(),
    role: v.string(),
    title: v.string(),
    joined_at: v.string(),
  }).index("by_email", ["email"]),

  team_invitations: defineTable({
    id: v.string(),
    email: v.string(),
    role: v.string(),
    title: v.string(),
    invited_at: v.string(),
  }).index("by_email", ["email"]),

  team_activity_logs: defineTable({
    id: v.string(),
    user: v.string(),
    action: v.string(),
    timestamp: v.string(),
  }),

  templates: defineTable({
    id: v.string(),
    name: v.string(),
    type: v.string(),
    content: v.string(),
    is_default: v.boolean(),
    created_at: v.string(),
  }),

  error_logs: defineTable({
    id: v.string(),
    message: v.string(),
    stack: v.union(v.string(), v.null()),
    timestamp: v.string(),
  }),
});
