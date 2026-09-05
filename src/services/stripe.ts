import { convexClient as supabaseClient, mockDb, supabase } from './convex';
import { Invoice } from '../types/supabase.types';

export const stripeService = {
  /**
   * Simulates creator bank account connection workflow
   */
  startOnboarding: async (): Promise<string> => {
    // Return a mocked Stripe Connect OAuth onboarding URL
    return '/stripe-connect-mock-flow';
  },

  /**
   * Finalizes Stripe connected account details on callback redirect
   */
  completeOnboarding: async (): Promise<void> => {
    await supabaseClient.profiles.getCreator();
    await supabaseClient.profiles.updateCreator({
      stripe_connected_id: 'acct_stripe_connect_' + Math.random().toString(36).substr(2, 6),
      stripe_status: 'active',
      _sysBypass: true
    } as any);
  },

  /**
   * Simulates Checkout Payment intents with application fee cuts based on plan tiers
   */
  processBrandPayment: async (invoiceId: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 1200)); // Latency delay
    
    const profile = await supabaseClient.profiles.getCreator();
    const plan = profile?.subscription_plan || 'free';
    const rate = plan === 'free' ? 0.03 : plan === 'pro' ? 0.015 : 0.005;

    // If live Supabase is active, execute checkout simulation through secure RPC function
    if (supabase) {
      await supabaseClient.invoices.pay(invoiceId, true);
      return true;
    }

    const invoices = mockDb.getInvoices();
    const invIdx = invoices.findIndex((i: Invoice) => i.id === invoiceId);
    if (invIdx !== -1) {
      const amount = invoices[invIdx].amount;
      const platform_fee = Number((amount * rate).toFixed(2));
      const creator_net = Number((amount - platform_fee).toFixed(2));

      invoices[invIdx].platform_fee = platform_fee;
      invoices[invIdx].creator_net = creator_net;
      invoices[invIdx].status = 'paid';
      mockDb.saveInvoices(invoices);

      // Webhook event dispatch
      await supabaseClient.webhooks.dispatch('payment.received', {
        invoice_id: invoiceId,
        amount,
        platform_fee,
        creator_net,
        currency: (invoices[invIdx] as any).currency || 'USD',
        paid_at: new Date().toISOString()
      });
      
      // Update LTV inside Partnerships CRM
      const partnerships = mockDb.getPartnerships();
      const pIdx = partnerships.findIndex((p: any) => p.creator_id === 'creator_sarah');
      if (pIdx !== -1) {
        partnerships[pIdx].total_lifetime_value += amount;
        mockDb.savePartnerships(partnerships);
      }
    }

    return true;
  }
};
