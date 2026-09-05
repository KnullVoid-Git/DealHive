import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCreator = query({
  args: { id: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.id) {
      const existing = await ctx.db
        .query("creator_profiles")
        .withIndex("id", (q) => q.eq("id", args.id!))
        .first();
      if (existing) return existing;
    }
    return await ctx.db.query("creator_profiles").first();
  },
});

export const updateCreator = mutation({
  args: { id: v.string(), updates: v.any() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("creator_profiles")
      .withIndex("id", (q) => q.eq("id", args.id))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, args.updates);
      return { ...existing, ...args.updates };
    } else {
      const newId = await ctx.db.insert("creator_profiles", {
        id: args.id,
        username: args.updates.username || "creator",
        full_name: args.updates.full_name || "Sarah Jenkins",
        avatar_url: args.updates.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        bio: args.updates.bio || "Lifestyle & Tech YouTube Creator making high-fidelity tech reviews and daily lifestyle vlogs for a highly engaged Gen-Z audience.",
        niche_tags: args.updates.niche_tags || ["Tech", "Lifestyle", "Productivity"],
        rate_card: args.updates.rate_card || { integration: 3500, dedicated: 7000, shorts: 1500, social_package: 9500, exclusivity_premium: 20 },
        youtube_connected: args.updates.youtube_connected ?? true,
        youtube_channel_id: args.updates.youtube_channel_id || "UC_sarah_jenkins_creates",
        youtube_stats: args.updates.youtube_stats || {
          subscriber_count: 514000,
          avg_views: 184000,
          engagement_rate: 5.2,
          top_countries: ["United States", "United Kingdom", "Canada"],
          age_gender_split: {
            age: { "18-24": 42, "25-34": 38, "35-44": 14, "45+": 6 },
            gender: { Female: 48, Male: 50, Other: 2 }
          }
        },
        stripe_connected_id: args.updates.stripe_connected_id || "acct_mock_sarah_jenkins",
        stripe_status: args.updates.stripe_status || "active",
        subscription_plan: args.updates.subscription_plan || "pro",
        visibility: args.updates.visibility || "public",
        created_at: new Date().toISOString(),
      });
      return await ctx.db.get(newId);
    }
  },
});

export const getBrand = query({
  args: { id: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.id) {
      const existing = await ctx.db
        .query("brand_profiles")
        .withIndex("id", (q) => q.eq("id", args.id!))
        .first();
      if (existing) return existing;
    }
    return await ctx.db.query("brand_profiles").first();
  },
});

export const updateBrand = mutation({
  args: { id: v.string(), updates: v.any() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("brand_profiles")
      .withIndex("id", (q) => q.eq("id", args.id))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, args.updates);
      return { ...existing, ...args.updates };
    } else {
      const newId = await ctx.db.insert("brand_profiles", {
        id: args.id,
        company_name: args.updates.company_name || "Samsung Electronics",
        industry: args.updates.industry || "Consumer Electronics",
        website: args.updates.website || "https://samsung.com",
        billing_email: args.updates.billing_email || "sponsors@samsung.com",
        logo_url: args.updates.logo_url || "https://logo.clearbit.com/samsung.com",
        created_at: new Date().toISOString(),
      });
      return await ctx.db.get(newId);
    }
  },
});
