import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.userId))
      .collect();
  },
});

export const trigger = mutation({
  args: { userId: v.string(), icon: v.string(), title: v.string(), message: v.string(), link: v.string() },
  handler: async (ctx, args) => {
    const newId = await ctx.db.insert("notifications", {
      id: "notif_" + Math.random().toString(36).substring(2, 9),
      user_id: args.userId,
      icon: args.icon,
      title: args.title,
      message: args.message,
      link: args.link,
      is_read: false,
      created_at: new Date().toISOString(),
    });
    return await ctx.db.get(newId);
  },
});

export const markAsRead = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const notification = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();
    if (notification) {
      await ctx.db.patch(notification._id, { is_read: true });
    }
  },
});

export const markAllRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.userId))
      .filter((q) => q.eq(q.field("is_read"), false))
      .collect();
    for (const notif of notifications) {
      await ctx.db.patch(notif._id, { is_read: true });
    }
  },
});
