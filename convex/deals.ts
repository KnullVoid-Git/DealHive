import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { role: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    if (args.role === "creator") {
      return await ctx.db
        .query("deals")
        .withIndex("by_creator_id", (q) => q.eq("creator_id", args.userId))
        .collect();
    } else {
      return await ctx.db
        .query("deals")
        .withIndex("by_brand_id", (q) => q.eq("brand_id", args.userId))
        .collect();
    }
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const deal = await ctx.db
      .query("deals")
      .withIndex("id", (q) => q.eq("id", args.id))
      .first();
    if (deal) {
      // Update last viewed timestamp
      await ctx.db.patch(deal._id, { last_viewed_at: new Date().toISOString() });
    }
    return deal;
  },
});

export const create = mutation({
  args: { deal: v.any() },
  handler: async (ctx, args) => {
    const newId = await ctx.db.insert("deals", {
      id: args.deal.id || Math.random().toString(36).substring(2, 9),
      creator_id: args.deal.creator_id,
      brand_id: args.deal.brand_id,
      title: args.deal.title,
      deal_type: args.deal.deal_type,
      stage: args.deal.stage || "negotiating",
      agreed_rate: args.deal.agreed_rate || 0,
      currency: args.deal.currency || "USD",
      payment_terms: args.deal.payment_terms || "Net 30",
      exclusivity: args.deal.exclusivity || null,
      usage_rights: args.deal.usage_rights || null,
      kill_fee: args.deal.kill_fee || 0,
      term_change_history: args.deal.term_change_history || [],
      creator_agreed: args.deal.creator_agreed || false,
      brand_agreed: args.deal.brand_agreed || false,
      last_viewed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return await ctx.db.get(newId);
  },
});

export const update = mutation({
  args: { id: v.string(), updates: v.any() },
  handler: async (ctx, args) => {
    const deal = await ctx.db
      .query("deals")
      .withIndex("id", (q) => q.eq("id", args.id))
      .first();
    if (!deal) throw new Error("Deal not found");
    const patched = { ...args.updates, updated_at: new Date().toISOString() };
    await ctx.db.patch(deal._id, patched);
    return { ...deal, ...patched };
  },
});

export const proposeChange = mutation({
  args: { id: v.string(), field: v.string(), oldValue: v.any(), newValue: v.any(), senderId: v.string() },
  handler: async (ctx, args) => {
    const deal = await ctx.db
      .query("deals")
      .withIndex("id", (q) => q.eq("id", args.id))
      .first();
    if (!deal) throw new Error("Deal not found");

    const historyItem = {
      timestamp: new Date().toISOString(),
      sender_id: args.senderId,
      field: args.field,
      old_value: args.oldValue,
      new_value: args.newValue,
    };

    const newHistory = [...(deal.term_change_history || []), historyItem];
    const updates: any = {
      term_change_history: newHistory,
      [args.field]: args.newValue,
      creator_agreed: args.senderId === deal.creator_id,
      brand_agreed: args.senderId === deal.brand_id,
      updated_at: new Date().toISOString(),
    };

    await ctx.db.patch(deal._id, updates);
    return { ...deal, ...updates };
  },
});
