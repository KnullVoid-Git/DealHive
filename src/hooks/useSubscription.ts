import { useState, useEffect } from 'react';
import { convexClient as supabaseClient } from '../services/convex';
import { CreatorProfile } from '../types/supabase.types';

export interface SubscriptionState {
  plan: 'free' | 'pro' | 'business';
  isProOrAbove: boolean;
  isBusinessOrAbove: boolean;
  activeDealsCount: number;
  activeDealsLimit: number;
  platformFeePercent: number;
  loading: boolean;
  upgrade: (plan: 'pro' | 'business') => Promise<void>;
}

export const useSubscription = (): SubscriptionState => {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [activeDealsCount, setActiveDealsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadSubDetails = async () => {
    try {
      const p = await supabaseClient.profiles.getCreator();
      setProfile(p);
      const deals = await supabaseClient.deals.list();
      const activeDeals = deals.filter(d => d.stage !== 'completed');
      setActiveDealsCount(activeDeals.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubDetails();

    // Event listener for auth changes
    window.addEventListener('auth-change', loadSubDetails);
    return () => {
      window.removeEventListener('auth-change', loadSubDetails);
    };
  }, []);

  const upgrade = async (plan: 'pro' | 'business') => {
    setLoading(true);
    const p = await supabaseClient.profiles.getCreator();
    const updated = await supabaseClient.profiles.updateCreator({
      ...p,
      subscription_plan: plan,
      _sysBypass: true
    } as any);
    setProfile(updated);
    setLoading(false);
    
    // In-app alert
    supabaseClient.notifications.trigger(
      'creator_sarah',
      'award',
      'Plan Upgraded! 🚀',
      `Welcome to Creator ${plan.toUpperCase()}! All limitations have been lifted.`,
      '/'
    );
  };

  const plan = profile?.subscription_plan || 'free';
  const activeDealsLimit = plan === 'free' ? 3 : 999999;
  const platformFeePercent = plan === 'free' ? 3.0 : plan === 'pro' ? 1.5 : 0.5;

  return {
    plan,
    isProOrAbove: plan === 'pro' || plan === 'business',
    isBusinessOrAbove: plan === 'business',
    activeDealsCount,
    activeDealsLimit,
    platformFeePercent,
    loading,
    upgrade
  };
};
export default useSubscription;
