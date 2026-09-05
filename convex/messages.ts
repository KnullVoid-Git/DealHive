import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { dealId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deal_messages")
      .withIndex("by_deal_id", (q) => q.eq("deal_id", args.dealId))
      .collect();
  },
});

export const send = mutation({
  args: { dealId: v.string(), senderId: v.string(), messageText: v.union(v.string(), v.null()), attachments: v.array(v.any()) },
  handler: async (ctx, args) => {
    const newId = await ctx.db.insert("deal_messages", {
      id: Math.random().toString(36).substring(2, 9),
      deal_id: args.dealId,
      sender_id: args.senderId,
      message_text: args.messageText,
      attachments: args.attachments,
      created_at: new Date().toISOString(),
    });
    return await ctx.db.get(newId);
  },
});
