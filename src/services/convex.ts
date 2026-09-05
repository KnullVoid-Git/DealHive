import { ConvexHttpClient } from 'convex/browser';
import { supabaseClient as supabaseClientOriginal } from './supabase';
import { Deal, DealMessage, Deliverable, Contract, Invoice, DealHiveNotification } from '../types/supabase.types';

// Export mockDb and supabase so other services can import them from './convex' directly
export { mockDb, supabase } from './supabase';

// Standard Convex Client Initialization
const convexUrl = (import.meta as any).env.VITE_CONVEX_URL || '';
const isLiveConvex = !!(
  convexUrl &&
  convexUrl !== 'https://your-convex-project-id.convex.cloud'
);

export const client = isLiveConvex ? new ConvexHttpClient(convexUrl) : null;

export const convexClient = {
  auth: {
    getUser: async () => {
      return supabaseClientOriginal.auth.getUser();
    },
    setRole: (role: 'creator' | 'brand') => {
      supabaseClientOriginal.auth.setRole(role);
    },
    getRole: () => {
      return supabaseClientOriginal.auth.getRole();
    },
    signOut: async () => {
      return supabaseClientOriginal.auth.signOut();
    }
  },

  // Deals management
  deals: {
    list: async (): Promise<Deal[]> => {
      if (isLiveConvex && client) {
        try {
          const role = convexClient.auth.getRole();
          const userRes = await convexClient.auth.getUser();
          const userId = userRes.data.user?.id || 'creator_sarah';
          const res = await client.query('deals:list' as any, { role, userId }) as Deal[];
          if (Array.isArray(res) && res.length > 0) return res;
        } catch (err) {
          console.warn('[Convex Error] Falling back to offline simulator:', err);
        }
      }
      return supabaseClientOriginal.deals.list();
    },
    get: async (id: string): Promise<Deal | null> => {
      if (isLiveConvex && client) {
        try {
          const res = await client.query('deals:get' as any, { id }) as Deal | null;
          if (res) return res;
        } catch (err) {
          console.warn('[Convex Error] Falling back to offline simulator:', err);
        }
      }
      return supabaseClientOriginal.deals.get(id);
    },
    create: async (deal: Partial<Deal>): Promise<Deal> => {
      if (isLiveConvex && client) {
        try {
          const res = await client.mutation('deals:create' as any, { deal }) as Deal;
          if (res) return res;
        } catch (err) {
          console.warn('[Convex Error] Falling back to offline simulator:', err);
        }
      }
      return supabaseClientOriginal.deals.create(deal);
    },
    update: async (id: string, updates: Partial<Deal>): Promise<Deal> => {
      if (isLiveConvex && client) {
        try {
          const res = await client.mutation('deals:update' as any, { id, updates }) as Deal;
          if (res) return res;
        } catch (err) {
          console.warn('[Convex Error] Falling back to offline simulator:', err);
        }
      }
      return supabaseClientOriginal.deals.update(id, updates);
    },
    proposeChange: async (id: string, field: string, newValue: any): Promise<Deal> => {
      if (isLiveConvex && client) {
        try {
          const userRes = await convexClient.auth.getUser();
          const userId = userRes.data.user?.id || 'creator_sarah';
          const deal = await convexClient.deals.get(id);
          const oldValue = deal ? (deal as any)[field] : null;
          const res = await client.mutation('deals:proposeChange' as any, {
            id,
            field,
            oldValue,
            newValue,
            senderId: userId
          }) as Deal;
          if (res) return res;
        } catch (err) {
          console.warn('[Convex Error] Proposed term change failed. Falling back:', err);
        }
      }
      return supabaseClientOriginal.deals.proposeChange(id, field, newValue);
    }
  },

  // Messages / Realtime
  messages: {
    list: async (dealId: string): Promise<DealMessage[]> => {
      if (isLiveConvex && client) {
        try {
          const res = await client.query('messages:list' as any, { dealId }) as DealMessage[];
          if (Array.isArray(res) && res.length > 0) return res;
        } catch (err) {
          console.warn('[Convex Error] Falling back to offline simulator:', err);
        }
      }
      return supabaseClientOriginal.messages.list(dealId);
    },
    send: async (dealId: string, text: string, attachments: any[] = []): Promise<DealMessage> => {
      if (isLiveConvex && client) {
        try {
          const userRes = await convexClient.auth.getUser();
          const userId = userRes.data.user?.id || 'creator_sarah';
          const res = await client.mutation('messages:send' as any, {
            dealId,
            senderId: userId,
            messageText: text,
            attachments
          }) as DealMessage;
          if (res) return res;
        } catch (err) {
          console.warn('[Convex Error] Sending message failed. Falling back:', err);
        }
      }
      return supabaseClientOriginal.messages.send(dealId, text, attachments);
    },
    subscribe: (dealId: string, callback: (newMsg: DealMessage) => void) => {
      return supabaseClientOriginal.messages.subscribe(dealId, callback);
    }
  },

  // Deliverables
  deliverables: {
    list: async (dealId: string): Promise<Deliverable[]> => {
      if (isLiveConvex && client) {
        try {
          const res = await client.query('deliverables:list' as any, { dealId }) as Deliverable[];
          if (Array.isArray(res) && res.length > 0) return res;
        } catch (err) {
          console.warn('[Convex Error] Falling back to offline simulator:', err);
        }
      }
      return supabaseClientOriginal.deliverables.list(dealId);
    },
    upload: async (id: string, fileUrl: string, progressCallback?: (p: number) => void): Promise<Deliverable> => {
      if (isLiveConvex && client) {
        try {
          const res = await client.mutation('deliverables:updateStatus' as any, { id, status: 'submitted', fileUrl }) as Deliverable;
          if (res) return res;
        } catch (err) {
          console.warn('[Convex Error] Uploading deliverable failed:', err);
        }
      }
      return supabaseClientOriginal.deliverables.upload(id, fileUrl, progressCallback);
    },
    updateStatus: async (id: string, status: 'approved' | 'revision_requested'): Promise<Deliverable> => {
      if (isLiveConvex && client) {
        try {
          const res = await client.mutation('deliverables:updateStatus' as any, { id, status, fileUrl: null }) as Deliverable;
          if (res) return res;
        } catch (err) {
          console.warn('[Convex Error] Updating status failed. Falling back:', err);
        }
      }
      return supabaseClientOriginal.deliverables.updateStatus(id, status);
    }
  },

  // Contracts
  contracts: {
    get: async (dealId: string): Promise<Contract | null> => {
      if (isLiveConvex && client) {
        try {
          const res = await client.query('contracts:get' as any, { dealId }) as Contract | null;
          if (res) return res;
        } catch (err) {
          console.warn('[Convex Error] Falling back to offline simulator:', err);
        }
      }
      return supabaseClientOriginal.contracts.get(dealId);
    },
    generate: async (dealId: string): Promise<Contract> => {
      if (isLiveConvex && client) {
        try {
          const res = await client.mutation('contracts:generate' as any, { dealId }) as Contract;
          if (res) return res;
        } catch (err) {
          console.warn('[Convex Error] Contract generation failed. Falling back:', err);
        }
      }
      return supabaseClientOriginal.contracts.generate(dealId);
    },
    sign: async (dealId: string, signee: 'creator' | 'brand'): Promise<Contract> => {
      if (isLiveConvex && client) {
        try {
          const res = await client.mutation('contracts:sign' as any, { dealId, signerRole: signee }) as Contract;
          if (res) return res;
        } catch (err) {
          console.warn('[Convex Error] Contract signing failed. Falling back:', err);
        }
      }
      return supabaseClientOriginal.contracts.sign(dealId, signee);
    }
  },

  // Invoices
  invoices: {
    list: async (): Promise<Invoice[]> => {
      if (isLiveConvex && client) {
        try {
          const res = await client.query('invoices:list' as any, {}) as Invoice[];
          if (Array.isArray(res) && res.length > 0) return res;
        } catch (err) {
          console.warn('[Convex Error] Falling back to offline simulator:', err);
        }
      }
      return supabaseClientOriginal.invoices.list();
    },
    create: async (dealId: string, amount: number, dueDate: string): Promise<Invoice> => {
      if (isLiveConvex && client) {
        try {
          const res = await client.mutation('invoices:create' as any, { dealId, amount, dueDate }) as Invoice;
          if (res) return res;
        } catch (err) {
          console.warn('[Convex Error] Invoice creation failed. Falling back:', err);
        }
      }
      return supabaseClientOriginal.invoices.create(dealId, amount, dueDate);
    },
    send: async (id: string): Promise<Invoice> => {
      return supabaseClientOriginal.invoices.send(id);
    },
    pay: async (id: string, isStripeSim: boolean = false): Promise<Invoice> => {
      if (isLiveConvex && client) {
        try {
          const res = await client.mutation('invoices:pay' as any, { id, status: 'paid' }) as Invoice;
          if (res) return res;
        } catch (err) {
          console.warn('[Convex Error] Paying invoice failed. Falling back:', err);
        }
      }
      return supabaseClientOriginal.invoices.pay(id, isStripeSim);
    }
  },

  // Notifications
  notifications: {
    list: async (): Promise<DealHiveNotification[]> => {
      if (isLiveConvex && client) {
        try {
          const userRes = await convexClient.auth.getUser();
          const userId = userRes.data.user?.id || 'creator_sarah';
          const res = await client.query('notifications:list' as any, { userId }) as DealHiveNotification[];
          if (Array.isArray(res) && res.length > 0) return res;
        } catch (err) {
          console.warn('[Convex Error] Falling back to offline simulator:', err);
        }
      }
      return supabaseClientOriginal.notifications.list();
    },
    trigger: async (userId: string, icon: string, title: string, message: string, link: string) => {
      if (isLiveConvex && client) {
        try {
          const res = await client.mutation('notifications:trigger' as any, { userId, icon, title, message, link });
          if (res) return res;
        } catch (err) {
          console.warn('[Convex Error] Dispatching notification failed. Falling back:', err);
        }
      }
      return supabaseClientOriginal.notifications.trigger(userId, icon, title, message, link);
    },
    markAsRead: async (id: string) => {
      if (isLiveConvex && client) {
        try {
          return await client.mutation('notifications:markAsRead' as any, { id });
        } catch (err) {
          console.warn('[Convex Error] Marking notification read failed. Falling back:', err);
        }
      }
      return supabaseClientOriginal.notifications.markAsRead(id);
    },
    markAllRead: async () => {
      if (isLiveConvex && client) {
        try {
          const userRes = await convexClient.auth.getUser();
          const userId = userRes.data.user?.id || 'creator_sarah';
          return await client.mutation('notifications:markAllRead' as any, { userId });
        } catch (err) {
          console.warn('[Convex Error] Marking all read failed. Falling back:', err);
        }
      }
      return supabaseClientOriginal.notifications.markAllRead();
    }
  },

  // Profiles
  profiles: {
    getCreator: async () => {
      if (isLiveConvex && client) {
        try {
          let res = await client.query('profiles:getCreator' as any, {});
          if (!res) {
            const initial = await supabaseClientOriginal.profiles.getCreator();
            res = await client.mutation('profiles:updateCreator' as any, { id: 'creator_sarah', updates: initial });
          }
          if (res) return res;
        } catch (err) {
          console.warn('[Convex Error] Falling back to offline creator profile:', err);
        }
      }
      return supabaseClientOriginal.profiles.getCreator();
    },
    updateCreator: async (updates: any) => {
      if (isLiveConvex && client) {
        try {
          const res = await client.mutation('profiles:updateCreator' as any, { id: 'creator_sarah', updates });
          if (res) return res;
        } catch (err) {
          console.warn('[Convex Error] Updating creator profile failed. Falling back:', err);
        }
      }
      return supabaseClientOriginal.profiles.updateCreator(updates);
    },
    getBrand: async () => {
      if (isLiveConvex && client) {
        try {
          let res = await client.query('profiles:getBrand' as any, {});
          if (!res) {
            const initial = await supabaseClientOriginal.profiles.getBrand();
            res = await client.mutation('profiles:updateBrand' as any, { id: 'brand_samsung', updates: initial });
          }
          if (res) return res;
        } catch (err) {
          console.warn('[Convex Error] Falling back to offline brand profile:', err);
        }
      }
      return supabaseClientOriginal.profiles.getBrand();
    },
    updateBrand: async (updates: any) => {
      if (isLiveConvex && client) {
        try {
          const res = await client.mutation('profiles:updateBrand' as any, { id: 'brand_samsung', updates });
          if (res) return res;
        } catch (err) {
          console.warn('[Convex Error] Updating brand profile failed. Falling back:', err);
        }
      }
      return supabaseClientOriginal.profiles.updateBrand(updates);
    }
  },

  // Delegate all remaining modules directly to the original Supabase implementations to ensure full completeness
  benchmarks: supabaseClientOriginal.benchmarks,
  templates: supabaseClientOriginal.templates,
  teams: supabaseClientOriginal.teams,
  reviews: supabaseClientOriginal.reviews,
  blacklist: supabaseClientOriginal.blacklist,
  notes: supabaseClientOriginal.notes,
  creatorReviews: supabaseClientOriginal.creatorReviews,
  briefs: supabaseClientOriginal.briefs,
  contentLibrary: supabaseClientOriginal.contentLibrary,
  partnerships: supabaseClientOriginal.partnerships,
  webhooks: supabaseClientOriginal.webhooks,
  errorLog: supabaseClientOriginal.errorLog
};
