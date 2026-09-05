import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { dealId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deliverables")
      .withIndex("by_deal_id", (q) => q.eq("deal_id", args.dealId))
      .collect();
  },
});

export const add = mutation({
  args: { dealId: v.string(), name: v.string(), dueDate: v.string() },
  handler: async (ctx, args) => {
    const newId = await ctx.db.insert("deliverables", {
      id: Math.random().toString(36).substring(2, 9),
      deal_id: args.dealId,
      name: args.name,
      due_date: args.dueDate,
      status: "pending",
      file_url: null,
      revision_count: 0,
      created_at: new Date().toISOString(),
    });
    return await ctx.db.get(newId);
  },
});

export const updateStatus = mutation({
  args: { id: v.string(), status: v.string(), fileUrl: v.union(v.string(), v.null()) },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("deliverables")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();
    if (!item) throw new Error("Deliverable not found");

    const patches: any = { status: args.status };
    if (args.fileUrl !== undefined) {
      patches.file_url = args.fileUrl;
    }
    if (args.status === "submitted") {
      patches.revision_count = (item.revision_count || 0) + 1;
    }
    await ctx.db.patch(item._id, patches);
    return { ...item, ...patches };
  },
});
