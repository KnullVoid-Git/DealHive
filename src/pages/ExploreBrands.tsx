import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Lock, 
  Sparkles, 
  Send, 
  Check, 
  DollarSign 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { convexClient as supabaseClient } from '../services/convex';
import { Card, Button, InputField } from '../components';

interface SponsorshipBrand {
  id: string;
  name: string;
  industry: string;
  logo: string;
  website: string;
  avgBudget: string;
  activeBrief: string;
  nicheTags: string[];
}

const SPONSORSHIP_BRANDS: SponsorshipBrand[] = [
  {
    id: 'brand_samsung',
    name: 'Samsung',
    industry: 'Consumer Electronics',
    logo: 'https://logo.clearbit.com/samsung.com',
    website: 'https://samsung.com',
    avgBudget: '$5,000 - $15,000',
    activeBrief: 'Galaxy S26 Ultra Content Creation and AI features demo.',
    nicheTags: ['Tech', 'Gadgets', 'Lifestyle']
  },
  {
    id: 'brand_nordvpn',
    name: 'NordVPN',
    industry: 'Cybersecurity',
    logo: 'https://logo.clearbit.com/nordvpn.com',
    website: 'https://nordvpn.com',
    avgBudget: '$2,500 - $8,000',
    activeBrief: 'Dedicated integration explaining secure browsing and digital privacy.',
    nicheTags: ['Tech', 'Education', 'Productivity']
  },
  {
    id: 'brand_adobe',
    name: 'Adobe',
    industry: 'Creative Software',
    logo: 'https://logo.clearbit.com/adobe.com',
    website: 'https://adobe.com',
    avgBudget: '$4,000 - $12,000',
    activeBrief: 'Creative Cloud Express review and custom creative assets walkthrough.',
    nicheTags: ['Tech', 'Design', 'Productivity']
  },
  {
    id: 'brand_shopify',
    name: 'Shopify',
    industry: 'E-commerce Platform',
    logo: 'https://logo.clearbit.com/shopify.com',
    website: 'https://shopify.com',
    avgBudget: '$6,000 - $20,000',
    activeBrief: 'Side hustle series: Building a digital storefront in under 10 minutes.',
    nicheTags: ['Business', 'Finance', 'Lifestyle']
  },
  {
    id: 'brand_spotify',
    name: 'Spotify',
    industry: 'Music Streaming',
    logo: 'https://logo.clearbit.com/spotify.com',
    website: 'https://spotify.com',
    avgBudget: '$3,000 - $7,500',
    activeBrief: 'Personalized playlists sharing and Student discount promo integration.',
    nicheTags: ['Lifestyle', 'Food', 'Entertainment']
  }
];

export const ExploreBrands: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState<SponsorshipBrand | null>(null);

  // Pitch Form states
  const [pitchTitle, setPitchTitle] = useState('');
  const [pitchMessage, setPitchMessage] = useState('');
  const [requestedRate, setRequestedRate] = useState<number>(3500);
  const [creativeFreedom, setCreativeFreedom] = useState<number>(70);
  const [incomingOffers, setIncomingOffers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const creatorProfile = await supabaseClient.profiles.getCreator();
      setProfile(creatorProfile);
      const storedOffers = localStorage.getItem('dealhive_db_incoming_offers');
      setIncomingOffers(storedOffers ? JSON.parse(storedOffers) : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeSimulation = async () => {
    if (profile) {
      try {
        const updated = { ...profile, subscription_plan: 'pro' };
        await supabaseClient.profiles.updateCreator({
          subscription_plan: 'pro',
          _sysBypass: true
        } as any);
        setProfile(updated);
        toast.success('Successfully upgraded to PRO Tier! Brand Discovery unlocked! 🚀');
      } catch {
        toast.error('Failed to trigger pro upgrade simulation.');
      }
    }
  };

  const checkEligibility = (brandId: string) => {
    if (!profile) return { allowed: false, reason: 'No profile', text: 'Submit Proposal' };
    if (localStorage.getItem(`dealhive_brand_${brandId}_accepts_incoming`) === 'false') {
      return { allowed: false, reason: 'paused', text: 'Sponsor paused inbound pitches' };
    }
    if (incomingOffers.some(o => o.creator_id === profile.id && o.brand_id === brandId && o.status === 'pending')) {
      return { allowed: false, reason: 'pending', text: 'Proposal Pending Review' };
    }

    const rejectedOffer = incomingOffers.find(o => o.creator_id === profile.id && o.brand_id === brandId && o.status === 'rejected');
    if (rejectedOffer && rejectedOffer.rejected_at) {
      const rejectedTime = new Date(rejectedOffer.rejected_at).getTime();
      const nowTime = new Date().getTime();
      const cooldownDaysLeft = 30 - Math.floor((nowTime - rejectedTime) / (1000 * 60 * 60 * 24));
      if (cooldownDaysLeft > 0) {
        return { allowed: false, reason: 'rejected', text: `Declined (Cool-down: ${cooldownDaysLeft} days)` };
      }
    }
    return { allowed: true, text: 'Submit Collaboration Proposal' };
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrand || !profile) return;

    if (!pitchTitle || !pitchMessage) {
      toast.error('Please fill in custom offer outline details.');
      return;
    }

    try {
      const storedOffers = localStorage.getItem('dealhive_db_incoming_offers');
      const currentOffers = storedOffers ? JSON.parse(storedOffers) : [];

      const newOffer = {
        id: 'offer_' + Math.random().toString(36).substring(2, 11),
        creator_id: profile.id,
        creator_name: profile.full_name,
        creator_username: profile.username,
        creator_avatar: profile.avatar_url,
        creator_subscribers: '385K',
        creator_niche: profile.niche_tags || ['Tech', 'Lifestyle'],
        brand_id: selectedBrand.id,
        brand_name: selectedBrand.name,
        title: pitchTitle,
        message: pitchMessage,
        requested_rate: requestedRate,
        creative_freedom: creativeFreedom,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      currentOffers.unshift(newOffer);
      localStorage.setItem('dealhive_db_incoming_offers', JSON.stringify(currentOffers));
      setIncomingOffers(currentOffers);
      toast.success(`Collaboration proposal dispatched directly to ${selectedBrand.name}!`);
      
      setSelectedBrand(null);
      setPitchTitle('');
      setPitchMessage('');
    } catch {
      toast.error('Failed to save collaboration offer.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-6 w-full max-w-[1140px] mx-auto py-7 px-8">
        <div className="h-8 bg-surface-2 animate-pulse w-48 rounded" />
        <div className="h-64 bg-surface-2 animate-pulse w-full rounded" />
      </div>
    );
  }

  // Lock Explorer screen for non-pro creators
  if (!profile || (profile.subscription_plan !== 'pro' && profile.subscription_plan !== 'business')) {
    return (
      <div className="w-full max-w-[1140px] mx-auto py-7 px-8 space-y-7 relative select-none">
        <div className="flex flex-col border-b border-border pb-4 opacity-40">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-brand" />
            <h2 className="text-xl font-bold text-text-primary sora-heading leading-none pt-0.5">
              Brand Sponsorship Explorer
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-2">
            Pitch verified active brands, review custom briefs, and send direct sponsorship deals.
          </p>
        </div>

        <div className="relative border border-border bg-surface-2/15 p-12 rounded-3xl overflow-hidden flex flex-col items-center justify-center text-center shadow-xl backdrop-blur-xl py-20 min-h-[450px]">
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-brand)]/5 via-transparent to-amber-500/5 opacity-50" />
          <div className="relative w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg text-amber-500 backdrop-blur-md mb-6 animate-pulse">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-[10px] bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-3">
            Premium Creator Feature
          </span>
          <h3 className="text-xl font-bold text-text-primary sora-heading max-w-md">
            Unlock Verified Brand Partnership Pipelines
          </h3>
          <p className="text-xs text-text-muted max-w-lg mt-3 leading-relaxed">
            Free-tier accounts are restricted to manual inbox pitches. Upgrade to the{' '}
            <span className="text-brand font-bold">DealHive Pro Subscription</span> to search top sponsoring brands, discover active briefs (Samsung, Adobe, Shopify), and submit custom incoming offers directly to brand dashboard pipelines.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl w-full mt-8 border-y border-border py-6 my-2 text-left">
            <div className="space-y-1">
              <span className="text-xs font-bold text-text-primary flex items-center">
                <Check className="w-4 h-4 text-emerald-500 mr-1" /> Direct Sponsoring Explorer
              </span>
              <p className="text-[10.5px] text-text-muted">Pitch Samsung, Adobe, Shopify, and more instantly.</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-brand flex items-center">
                <Check className="w-4 h-4 text-emerald-500 mr-1" /> "Incoming Offers" Panel
              </span>
              <p className="text-[10.5px] text-text-muted">Brands see your detailed media-kit pitches on top.</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-text-primary flex items-center">
                <Check className="w-4 h-4 text-emerald-500 mr-1" /> 1-Click Deal Provisioning
              </span>
              <p className="text-[10.5px] text-text-muted">Acceptances auto-generate negotiation deal sheets.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={handleUpgradeSimulation}
              className="px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-full text-xs font-extrabold flex items-center space-x-2 shadow-lg transition-all active:scale-95 hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upgrade to Pro Plan Now — $29/mo</span>
            </button>
            <button
              onClick={() => toast.error('You need a Pro subscription to view this page.')}
              className="px-6 py-3 bg-surface border border-border hover:border-text-muted rounded-full text-xs font-bold text-text-secondary transition-all active:scale-95"
            >
              Learn More
            </button>
          </div>
          <span className="text-[10px] text-text-faint mt-4 block">
            Cancel anytime. No lock-in contracts. 14-day money-back guarantee.
          </span>
        </div>
      </div>
    );
  }

  // Active filter results
  const filteredBrands = SPONSORSHIP_BRANDS.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.activeBrief.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = industryFilter === 'all' || b.industry.toLowerCase().includes(industryFilter.toLowerCase());
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="w-full max-w-[1140px] mx-auto py-7 px-8 space-y-7 animate-stagger-item select-none">
      <div className="flex flex-col border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-brand" />
            <h2 className="text-xl font-bold text-text-primary sora-heading leading-none pt-0.5">
              Brand Partnership Explorer
            </h2>
          </div>
          <span className="text-[10px] bg-brand/10 border border-brand/20 text-brand px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            ⭐ Pro Member Access
          </span>
        </div>
        <p className="text-xs text-text-muted mt-2">
          Submit customized sponsorship pitches directly to active campaign briefs. Upgraded brand managers see your pitch on top.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface border border-border p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search brands, active briefs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-surface border border-border rounded-lg text-xs outline-none focus:border-brand font-semibold shadow-inner"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'Electronics', 'Cybersecurity', 'Software', 'Platform'].map(ind => (
            <button
              key={ind}
              onClick={() => setIndustryFilter(ind === 'all' ? 'all' : ind)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all active:scale-95 ${
                (industryFilter === ind || (ind === 'all' && industryFilter === 'all'))
                  ? 'bg-brand/10 border-brand text-brand'
                  : 'bg-surface border-border text-text-secondary hover:border-text-muted'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.map(b => {
          const eligibility = checkEligibility(b.id);
          return (
            <Card
              key={b.id}
              variant="standard"
              className="p-5 border border-border hover:border-brand/35 transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/5 duration-300 bg-surface"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-lg overflow-hidden border border-border/80 flex-shrink-0 bg-surface flex items-center justify-center p-1">
                      <img src={b.logo} alt={b.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="text-sm font-bold text-text-primary sora-heading">{b.name}</span>
                      <span className="text-[10px] text-text-muted mt-1">{b.industry}</span>
                    </div>
                  </div>
                  <a
                    href={b.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-brand uppercase tracking-wider hover:underline"
                  >
                    Visit →
                  </a>
                </div>

                <div className="flex flex-wrap gap-1">
                  {b.nicheTags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-surface-2 border border-border text-[9px] font-bold text-text-secondary rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-1 bg-surface-2/45 p-3 rounded-xl border border-border/40">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Active Brief Target</span>
                  <p className="text-xs text-text-secondary leading-relaxed font-semibold">{b.activeBrief}</p>
                </div>

                <div className="flex justify-between items-center text-xs font-semibold py-1">
                  <span className="text-text-muted text-[10px] uppercase font-bold">Avg Collaboration budget</span>
                  <span className="font-mono text-brand font-extrabold flex items-center">
                    <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                    {b.avgBudget}
                  </span>
                </div>
              </div>

              <div className="border-t border-border/40 pt-4 mt-4">
                <button
                  disabled={!eligibility.allowed}
                  onClick={() => {
                    setSelectedBrand(b);
                    setPitchTitle(`Collab Request: ${b.name} x ${profile?.full_name}`);
                  }}
                  className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 shadow transition-all active:scale-95 ${
                    eligibility.allowed
                      ? 'bg-brand hover:bg-brand-dark text-white'
                      : 'bg-surface-3 border border-border text-text-muted cursor-not-allowed shadow-none'
                  }`}
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  <span>{eligibility.text}</span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pitch Modal */}
      {selectedBrand && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBrand(null)}
        >
          <Card
            variant="standard"
            className="w-full max-w-[480px] border border-border bg-surface shadow-2xl p-6 select-none animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-border pb-3.5 flex-shrink-0">
              <div className="flex flex-col select-none leading-none">
                <span className="text-sm font-bold text-text-primary sora-heading">Pitch Proposal to {selectedBrand.name}</span>
                <span className="text-[10px] font-bold text-text-muted mt-1.5 uppercase tracking-wider">
                  Verified Pro Pipeline Dispatcher
                </span>
              </div>
              <button
                onClick={() => setSelectedBrand(null)}
                className="text-text-muted hover:text-text-primary text-xs font-bold font-mono px-2 py-0.5 border border-border rounded"
              >
                Esc
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="py-4 space-y-4">
              <InputField
                label="Pitch Proposal Title"
                value={pitchTitle}
                onChange={(e) => setPitchTitle(e.target.value)}
                placeholder="e.g. 10-Minute Side Hustle Walkthrough Integration"
                required
              />

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Campaign Pitch Description</label>
                <textarea
                  value={pitchMessage}
                  onChange={(e) => setPitchMessage(e.target.value)}
                  placeholder="Explain your video concept, integration placement structure, how you showcase the product, and why your audience matches this brief perfectly..."
                  rows={4}
                  className="w-full p-2.5 border border-border bg-surface text-xs rounded-md outline-none focus:border-brand font-semibold text-text-secondary shadow-inner"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Requested Sponsorship Rate ($)"
                  type="number"
                  value={String(requestedRate)}
                  onChange={(e) => setRequestedRate(Number(e.target.value) || 0)}
                  placeholder="Integration fee..."
                  required
                />

                <div className="flex flex-col space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Freedom Score</label>
                    <span className="text-[9.5px] font-mono text-brand font-bold">{creativeFreedom}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={creativeFreedom}
                    onChange={(e) => setCreativeFreedom(Number(e.target.value))}
                    className="w-full accent-brand h-1 bg-border rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 border-t border-border pt-4 mt-4">
                <Button variant="secondary" onClick={() => setSelectedBrand(null)}>
                  Cancel
                </Button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  <span>Send Incoming Offer</span>
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};