import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { dealId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contracts")
      .withIndex("by_deal_id", (q) => q.eq("deal_id", args.dealId))
      .first();
  },
});

export const generate = mutation({
  args: { dealId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("contracts")
      .withIndex("by_deal_id", (q) => q.eq("deal_id", args.dealId))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    const newId = await ctx.db.insert("contracts", {
      id: Math.random().toString(36).substring(2, 9),
      deal_id: args.dealId,
      pdf_url: `/contracts/deal_${args.dealId}_signed.pdf`,
      hellosign_request_id: "hellosign_req_" + Math.random().toString(36).substring(2, 9),
      creator_signature_status: "unsigned",
      brand_signature_status: "unsigned",
      status: "unsigned",
      signed_at: null,
      created_at: new Date().toISOString(),
    });
    return await ctx.db.get(newId);
  },
});

export const sign = mutation({
  args: { dealId: v.string(), signerRole: v.string() },
  handler: async (ctx, args) => {
    const contract = await ctx.db
      .query("contracts")
      .withIndex("by_deal_id", (q) => q.eq("deal_id", args.dealId))
      .first();
    if (!contract) throw new Error("Contract not found");

    const patches: any = {};
    if (args.signerRole === "creator") {
      patches.creator_signature_status = "signed";
    } else {
      patches.brand_signature_status = "signed";
    }

    const cSigned = patches.creator_signature_status === "signed" || contract.creator_signature_status === "signed";
    const bSigned = patches.brand_signature_status === "signed" || contract.brand_signature_status === "signed";

    if (cSigned && bSigned) {
      patches.status = "fully_signed";
      patches.signed_at = new Date().toISOString();
    } else {
      patches.status = "partially_signed";
    }

    await ctx.db.patch(contract._id, patches);
    return { ...contract, ...patches };
  },
});
