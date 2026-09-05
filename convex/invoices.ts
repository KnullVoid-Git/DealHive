import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { dealId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.dealId) {
      return await ctx.db
        .query("invoices")
        .withIndex("by_deal_id", (q) => q.eq("deal_id", args.dealId))
        .collect();
    }
    return await ctx.db.query("invoices").collect();
  },
});

export const create = mutation({
  args: { dealId: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    const platformFee = Math.round(args.amount * 0.05 * 100) / 100;
    const creatorNet = Math.round((args.amount - platformFee) * 100) / 100;
    
    const newId = await ctx.db.insert("invoices", {
      id: "inv_" + Math.random().toString(36).substring(2, 9),
      deal_id: args.dealId,
      amount: args.amount,
      platform_fee: platformFee,
      creator_net: creatorNet,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      stripe_payment_intent_id: null,
      pdf_url: null,
      status: "pending",
      created_at: new Date().toISOString(),
    });
    return await ctx.db.get(newId);
  },
});

export const pay = mutation({
  args: { id: v.string(), status: v.string() },
  handler: async (ctx, args) => {
    const invoice = await ctx.db
      .query("invoices")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();
    if (!invoice) throw new Error("Invoice not found");

    const patches = {
      status: args.status,
      stripe_payment_intent_id: "pi_" + Math.random().toString(36).substring(2, 12),
      pdf_url: `/invoices/${args.id}_paid.pdf`,
    };
    await ctx.db.patch(invoice._id, patches);
    return { ...invoice, ...patches };
  },
});
