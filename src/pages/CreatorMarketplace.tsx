import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  DollarSign, 
  Users, 
  BarChart3, 
  Check, 
  Send, 
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  Award,
  Video,
  FileText,
  Instagram
} from 'lucide-react';
import toast from 'react-hot-toast';
import { convexClient as supabaseClient, mockDb } from '../services/convex';
import { Card, Button, InputField } from '../components';

interface MarketplaceCreator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  niche: string[];
  subscribers: string;
  subCount: number;
  avgViews: number;
  minRate: number;
  engagement: number;
  location: string;
  availability: 'open' | 'booked';
  youtube_connected: boolean;
  instagram_connected: boolean;
  rating: number;
  badges: string[];
}

const MARKETPLACE_CREATORS: MarketplaceCreator[] = [
  {
    id: 'creator_sarah',
    name: 'Sarah Jenkins',
    username: 'sarah_creates',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    niche: ['Tech', 'Lifestyle', 'Productivity'],
    subscribers: '385K',
    subCount: 385000,
    avgViews: 125000,
    minRate: 3500,
    engagement: 4.8,
    location: 'New York, US',
    availability: 'open',
    youtube_connected: true,
    instagram_connected: true,
    rating: 4.8,
    badges: ['⚡ Fast Turnaround', '💬 Great Communicator']
  },
  {
    id: 'creator_marques',
    name: 'Marques K.',
    username: 'mkbhd_mock',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    niche: ['Tech', 'Gadgets'],
    subscribers: '16M',
    subCount: 16000000,
    avgViews: 4500000,
    minRate: 15000,
    engagement: 6.2,
    location: 'New Jersey, US',
    availability: 'booked',
    youtube_connected: true,
    instagram_connected: false,
    rating: 4.9,
    badges: ['🎯 On-Brief', '💬 Great Communicator']
  },
  {
    id: 'creator_emma',
    name: 'Emma Chamberlain',
    username: 'emma_mock',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    niche: ['Lifestyle', 'Fashion', 'Travel'],
    subscribers: '12M',
    subCount: 12000000,
    avgViews: 2800000,
    minRate: 9500,
    engagement: 5.5,
    location: 'Los Angeles, US',
    availability: 'open',
    youtube_connected: true,
    instagram_connected: true,
    rating: 4.6,
    badges: ['🎯 On-Brief']
  },
  {
    id: 'creator_alex',
    name: 'Alex Hormozi',
    username: 'alex_mock',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    niche: ['Finance', 'Business', 'Productivity'],
    subscribers: '2.5M',
    subCount: 2500000,
    avgViews: 450000,
    minRate: 7000,
    engagement: 4.2,
    location: 'Miami, US',
    availability: 'open',
    youtube_connected: true,
    instagram_connected: false,
    rating: 4.2,
    badges: ['💬 Great Communicator']
  },
  {
    id: 'creator_raj',
    name: 'Rajesh Kumar',
    username: 'raj_tech',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    niche: ['Tech', 'Gaming', 'Education'],
    subscribers: '1.2M',
    subCount: 1200000,
    avgViews: 220000,
    minRate: 4000,
    engagement: 5.1,
    location: 'Bangalore, India',
    availability: 'open',
    youtube_connected: true,
    instagram_connected: true,
    rating: 4.7,
    badges: ['⚡ Fast Turnaround']
  },
  {
    id: 'creator_siti',
    name: 'Siti Aminah',
    username: 'siti_travels',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    niche: ['Travel', 'Food', 'Lifestyle'],
    subscribers: '500K',
    subCount: 500000,
    avgViews: 85000,
    minRate: 2200,
    engagement: 7.2,
    location: 'Jakarta, Indonesia',
    availability: 'booked',
    youtube_connected: true,
    instagram_connected: true,
    rating: 4.8,
    badges: ['🎯 On-Brief', '⚡ Fast Turnaround']
  }
];

const AVAILABLE_NICHES = ['Tech', 'Lifestyle', 'Productivity', 'Gadgets', 'Fashion', 'Travel', 'Finance', 'Business', 'Gaming', 'Food', 'Education'];

export const CreatorMarketplace: React.FC = () => {
  const [creators, setCreators] = useState<MarketplaceCreator[]>(MARKETPLACE_CREATORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [subscriberTier, setSubscriberTier] = useState('all');
  const [maxRate, setMaxRate] = useState<number>(20000);
  const [minEngagement, setMinEngagement] = useState<number>(0);
  const [locationFilter, setLocationFilter] = useState('');
  const [availability, setAvailability] = useState('all');

  // Preview Creator detail drawer state
  const [previewCreator, setPreviewCreator] = useState<MarketplaceCreator | null>(null);

  // Pitch Form states
  const [selectedCreator, setSelectedCreator] = useState<MarketplaceCreator | null>(null);
  const [pitchTitle, setPitchTitle] = useState('');
  const [dealType, setDealType] = useState('Integration');
  const [offeredRate, setOfferedRate] = useState<number>(3500);
  const [creativeFreedom, setCreativeFreedom] = useState<number>(50);
  const [hookFocus, setHookFocus] = useState('');
  const [talkingPoints, setTalkingPoints] = useState('');
  const [complianceChecklist, setComplianceChecklist] = useState('');
  const [modalStep, setModalStep] = useState<number>(1);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await supabaseClient.profiles.getCreator();
        if (profile) {
          setCreators(prev => prev.map(c => {
            if (c.id === 'creator_sarah') {
              return {
                ...c,
                name: profile.full_name,
                username: profile.username,
                bio: profile.bio,
                minRate: profile.rate_card?.integration || c.minRate,
                youtube_connected: profile.youtube_connected,
                instagram_connected: profile.instagram_connected || false,
                availability: (profile.availability_status as 'open' | 'booked') || c.availability
              };
            }
            return c;
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadProfile();
  }, []);

  const handleNicheToggle = (niche: string) => {
    setSelectedNiches(prev => 
      prev.includes(niche) ? prev.filter(n => n !== niche) : [...prev, niche]
    );
  };

  const filteredCreators = creators.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesNiches = selectedNiches.length === 0 || 
                          c.niche.some(n => selectedNiches.includes(n));
    
    let matchesTier = true;
    if (subscriberTier === 'micro') {
      matchesTier = c.subCount < 100000;
    } else if (subscriberTier === 'mid') {
      matchesTier = c.subCount >= 100000 && c.subCount < 500000;
    } else if (subscriberTier === 'macro') {
      matchesTier = c.subCount >= 500000 && c.subCount < 1000000;
    } else if (subscriberTier === 'mega') {
      matchesTier = c.subCount >= 1000000;
    }

    const matchesRate = c.minRate <= maxRate;
    const matchesEngagement = c.engagement >= minEngagement;
    const matchesLocation = locationFilter === '' || c.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesAvailability = availability === 'all' || c.availability === availability;

    return matchesSearch && matchesNiches && matchesTier && matchesRate && matchesEngagement && matchesLocation && matchesAvailability;
  });

  const handleSendPitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreator) return;

    if (!pitchTitle || !hookFocus) {
      toast.error('Please pre-fill crucial outline details.');
      return;
    }

    try {
      const complianceList = complianceChecklist.split('\n').filter(line => line.trim().length > 0);
      const talkingPointsList = talkingPoints.split('\n').filter(line => line.trim().length > 0);

      // Save campaign brief via client
      await supabaseClient.briefs.create({
        brand_id: 'brand_samsung',
        title: pitchTitle,
        deal_type: dealType,
        talking_points: talkingPointsList.length > 0 ? talkingPointsList : ['Demonstrate the product naturally.'],
        hook_focus: hookFocus,
        restrictions: ['No competitors logos visible', 'No swearing'],
        creative_freedom_score: creativeFreedom,
        compliance_checklist: complianceList.length > 0 ? complianceList : ['Show download links on screen', 'Integrate visual logo overlay'],
        attachments: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400']
      });

      // Save deal in mock DB
      const deals = mockDb.getDeals();
      const newDealId = 'deal_' + Math.random().toString(36).substring(2, 11);
      const newDeal = {
        id: newDealId,
        creator_id: selectedCreator.id,
        brand_id: 'brand_samsung',
        title: pitchTitle,
        deal_type: dealType as any,
        stage: 'negotiating' as const,
        agreed_rate: offeredRate,
        currency: 'USD',
        payment_terms: 'Net 30',
        exclusivity: 'No competitors for 15 days',
        usage_rights: 'Standard digital rights',
        kill_fee: Number((offeredRate * 0.2).toFixed(0)),
        term_change_history: [],
        creator_agreed: false,
        brand_agreed: true,
        last_viewed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      deals.unshift(newDeal);
      mockDb.saveDeals(deals);

      // Save message
      const messages = mockDb.getMessages();
      messages.push({
        id: 'msg_' + Math.random().toString(36).substring(2, 11),
        deal_id: newDealId,
        sender_id: 'brand_samsung',
        message_text: `Hi ${selectedCreator.name}! We'd love to partner with you for our new campaign: "${pitchTitle}". We've generated a negotiated deal outline with a rate of $${offeredRate.toLocaleString()} and a structured Campaign Brief template (Creative Freedom: ${creativeFreedom}%). Please check the Term Sheet in the Deal Room!`,
        attachments: [],
        created_at: new Date().toISOString()
      });
      mockDb.saveMessages(messages);

      // Trigger notification
      await supabaseClient.notifications.trigger(
        selectedCreator.id,
        'message-square',
        'New Pitch Proposal 🚀',
        `Samsung sent you a sponsorship pitch: "${pitchTitle}" for $${offeredRate.toLocaleString()}.`,
        `/deals/${newDealId}`
      );

      // Dispatch webhook
      await supabaseClient.webhooks.dispatch('deal.created', {
        deal_id: newDealId,
        title: pitchTitle,
        creator_id: selectedCreator.id,
        offered_rate: offeredRate,
        deal_type: dealType,
        creative_freedom_score: creativeFreedom
      });

      // Update CRM
      const partnerships = mockDb.getPartnerships();
      const existIdx = partnerships.findIndex(p => p.creator_id === selectedCreator.id);
      if (existIdx !== -1) {
        partnerships[existIdx].collaborations_count += 1;
        partnerships[existIdx].last_collaboration_at = new Date().toISOString();
        mockDb.savePartnerships(partnerships);
      } else {
        partnerships.push({
          id: 'crm_' + Math.random().toString(36).substring(2, 7),
          creator_id: selectedCreator.id,
          brand_id: 'brand_samsung',
          total_lifetime_value: 0,
          collaborations_count: 1,
          avg_turnaround_days: 7,
          partnership_health_score: 92,
          last_collaboration_at: new Date().toISOString()
        });
        mockDb.savePartnerships(partnerships);
      }

      toast.success(`Structured sponsorship pitch dispatched successfully to ${selectedCreator.name}!`);
      setSelectedCreator(null);
      setPitchTitle('');
      setHookFocus('');
      setTalkingPoints('');
      setComplianceChecklist('');
      setModalStep(1);
    } catch (err) {
      toast.error('Failed to dispatch campaign brief pitch.');
    }
  };

  const getCreativeFreedomDetails = (score: number) => {
    if (score < 30) {
      return { text: 'Strictly Scripted', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
    } else if (score < 70) {
      return { text: 'Guided Freedom', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    } else {
      return { text: 'Total Creative Freedom', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    }
  };

  return (
    <div className="w-full max-w-[1140px] mx-auto py-7 px-8 space-y-7 animate-stagger-item select-none">
      <div className="flex flex-col select-none border-b border-border pb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-brand animate-pulse" />
          <h2 className="text-xl font-bold text-text-primary sora-heading leading-none pt-0.5">
            Consent-Based Creator Marketplace
          </h2>
        </div>
        <p className="text-xs text-text-muted mt-2 leading-none">
          Discover verified creators who opted in, control their own rates, and sync active channel analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Filter Pane */}
        <div className="lg:col-span-3 space-y-5 bg-surface border border-border p-5 rounded-2xl shadow-sm backdrop-blur-md">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <SlidersHorizontal className="w-4 h-4 text-brand" />
            <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Discovery Filters</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase">Creator Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Name or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-surface border border-border rounded-lg text-xs outline-none focus:border-brand font-semibold shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase">Niche Tags</label>
            <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1 no-scrollbar border border-border/40 p-2 rounded-lg bg-surface-2/10">
              {AVAILABLE_NICHES.map(niche => {
                const isSelected = selectedNiches.includes(niche);
                return (
                  <button
                    key={niche}
                    onClick={() => handleNicheToggle(niche)}
                    className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-all active:scale-95 ${
                      isSelected ? 'bg-brand/10 border-brand text-brand' : 'bg-surface border-border text-text-secondary hover:border-text-muted'
                    }`}
                  >
                    {niche}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase">Subscriber Tier</label>
            <select
              value={subscriberTier}
              onChange={(e) => setSubscriberTier(e.target.value)}
              className="w-full h-9 px-2 border border-border bg-surface text-xs rounded-lg outline-none font-semibold text-text-secondary"
            >
              <option value="all">All Tiers</option>
              <option value="micro">Micro (&lt; 100K)</option>
              <option value="mid">Mid (100K - 500K)</option>
              <option value="macro">Macro (500K - 1M)</option>
              <option value="mega">Mega (1M+)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary uppercase">
              <span>Max Integration Rate</span>
              <span className="font-mono text-brand">${maxRate.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="20000"
              step="500"
              value={maxRate}
              onChange={(e) => setMaxRate(Number(e.target.value))}
              className="w-full accent-brand h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary uppercase">
              <span>Min Engagement Rate</span>
              <span className="font-mono text-brand">{minEngagement}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="0.5"
              value={minEngagement}
              onChange={(e) => setMinEngagement(Number(e.target.value))}
              className="w-full accent-brand h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Filter by country/city..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-surface border border-border rounded-lg text-xs outline-none focus:border-brand font-semibold shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase">Availability Status</label>
            <div className="flex bg-surface-2/60 border border-border p-0.5 rounded-lg">
              {['all', 'open', 'booked'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setAvailability(mode)}
                  className={`flex-1 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                    availability === mode ? 'bg-surface shadow text-brand' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Directory Listings */}
        <div className="lg:col-span-9 space-y-5">
          <div className="flex justify-between items-center text-xs font-semibold text-text-secondary border-b border-border/60 pb-2.5 select-none">
            <span>
              Showing <span className="text-text-primary font-bold">{filteredCreators.length}</span> verified creators matching options
            </span>
            <span className="text-[10px] bg-brand-light/30 border border-brand/10 text-brand px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
              Consent Opt-In Active
            </span>
          </div>

          {filteredCreators.length === 0 ? (
            <Card variant="standard" className="p-12 text-center border border-dashed border-border bg-surface-2/10 select-none">
              <Users className="w-12 h-12 mx-auto text-text-faint animate-bounce" />
              <h4 className="text-sm font-bold text-text-primary mt-4 sora-heading">No Matching Creators Found</h4>
              <p className="text-xs text-text-muted mt-2 leading-relaxed">
                Try loosening your filters (e.g. increase max budget caps or clear selected niche filters) to explore more channel profiles.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredCreators.map(c => {
                const isOpen = c.availability === 'open';
                return (
                  <Card
                    key={c.id}
                    variant="standard"
                    className="p-5 border border-border hover:border-brand/35 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/5 transition-all duration-300 relative bg-surface cursor-pointer"
                    onClick={() => setPreviewCreator(c)}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border/80 flex-shrink-0">
                            <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col leading-tight select-none">
                            <span className="text-sm font-bold text-text-primary sora-heading flex items-center">
                              {c.name}
                              {(c.youtube_connected || c.instagram_connected) && (
                                <span title="Verified Connected Stats">
                                  <Check className="w-4 h-4 ml-1 text-brand fill-brand/20 animate-pulse" />
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-text-muted mt-0.5">@{c.username}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border select-none ${
                          isOpen ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20'
                        }`}>
                          {isOpen ? 'Open to Collabs' : 'Fully Booked'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 select-none">
                        {c.niche.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-surface-2 border border-border text-[9px] font-bold text-text-secondary rounded">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 py-3 border-y border-border/40 select-none bg-surface-2/10 rounded-lg p-2 text-center">
                        <div className="flex flex-col leading-none">
                          <span className="text-[9px] text-text-muted uppercase font-bold">Subscribers</span>
                          <span className="font-mono text-[11px] font-extrabold text-text-primary mt-1.5 flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 mr-1 text-brand" />
                            {c.subscribers}
                          </span>
                        </div>
                        <div className="flex flex-col leading-none">
                          <span className="text-[9px] text-text-muted uppercase font-bold">Avg Views</span>
                          <span className="font-mono text-[11px] font-extrabold text-text-primary mt-1.5 flex items-center justify-center">
                            <BarChart3 className="w-3.5 h-3.5 mr-1 text-brand" />
                            {c.avgViews >= 1000000 ? (c.avgViews / 1000000).toFixed(1) + 'M' : (c.avgViews / 1000).toFixed(0) + 'K'}
                          </span>
                        </div>
                        <div className="flex flex-col leading-none">
                          <span className="text-[9px] text-text-muted uppercase font-bold">Engagement</span>
                          <span className="font-mono text-[11px] font-extrabold text-text-primary mt-1.5 flex items-center justify-center">
                            <TrendingUp className="w-3.5 h-3.5 mr-1 text-brand" />
                            {c.engagement}%
                          </span>
                        </div>
                      </div>

                      {c.badges && c.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1 select-none py-1">
                          {c.badges.map(b => (
                            <span key={b} className="px-2 py-0.5 bg-brand-light border border-brand/20 text-brand rounded-[4px] text-[8.5px] font-bold uppercase tracking-wide">
                              {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center border-t border-border/40 pt-4 mt-4">
                      <div className="flex flex-col leading-none select-none">
                        <span className="text-[9px] text-text-muted uppercase font-bold">Integration Rate</span>
                        <span className="font-mono text-sm font-extrabold text-text-primary mt-1">
                          ${c.minRate.toLocaleString()}+
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCreator(c);
                          setPitchTitle(`${c.name} Campaign Pitch`);
                          setOfferedRate(c.minRate);
                          setModalStep(1);
                        }}
                        className="px-3 py-1.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 shadow active:scale-95 transition-spring hover:-translate-y-0.5"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        <span>Send Pitch</span>
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Creator Detail Modal / Drawer */}
      {previewCreator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewCreator(null)}>
          <Card
            variant="standard"
            className="w-full max-w-[600px] max-h-[90vh] overflow-y-auto border border-border bg-surface shadow-2xl flex flex-col justify-between p-6 select-none animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand/20 flex-shrink-0">
                  <img src={previewCreator.avatar} alt={previewCreator.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col select-none">
                  <h3 className="text-base font-bold text-text-primary sora-heading flex items-center">
                    {previewCreator.name}
                    {(previewCreator.youtube_connected || previewCreator.instagram_connected) && (
                      <Check className="w-4 h-4 ml-1 text-brand fill-brand/20 animate-pulse" />
                    )}
                  </h3>
                  <span className="text-xs text-text-muted mt-0.5">@{previewCreator.username}</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-text-muted" />
                    <span className="text-[11px] text-text-muted font-medium">{previewCreator.location}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setPreviewCreator(null)} className="text-text-muted hover:text-text-primary text-xs font-bold font-mono px-2 py-0.5 border border-border rounded">
                Esc
              </button>
            </div>

            <div className="py-5 space-y-5">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Creator Bio & Target Audience</h4>
                <p className="text-xs text-text-secondary leading-relaxed font-medium">
                  Hi, I'm {previewCreator.name}! I create high-fidelity, engaging content focusing on {previewCreator.niche.join(', ')} niches. I help top global brands connect with active, hyper-targeted audiences through trusted integrations, native product placements, and organic story-telling format reviews. Let's work together!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-surface-2/40 border border-border/60 rounded-xl space-y-2">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Channel Availability</span>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${previewCreator.availability === 'open' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="text-xs font-bold text-text-primary">
                      {previewCreator.availability === 'open' ? 'Accepting Collabs' : 'Fully Booked'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-surface-2/40 border border-border/60 rounded-xl space-y-2">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Connected Integrations</span>
                  <div className="flex items-center space-x-3">
                    {previewCreator.youtube_connected && (
                      <span className="flex items-center space-x-1 text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        <Video className="w-3.5 h-3.5" />
                        <span>YouTube</span>
                      </span>
                    )}
                    {previewCreator.instagram_connected && (
                      <span className="flex items-center space-x-1 text-xs font-bold text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                        <Instagram className="w-3.5 h-3.5" />
                        <span>Instagram</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Verified Analytics Breakdown</h4>
                <div className="grid grid-cols-3 gap-3 bg-brand/5 border border-brand/15 p-4 rounded-xl text-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Subscribers</span>
                    <span className="font-mono text-base font-extrabold text-brand mt-1 flex items-center justify-center">
                      <Users className="w-4 h-4 mr-1" />
                      {previewCreator.subscribers}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Avg Views</span>
                    <span className="font-mono text-base font-extrabold text-brand mt-1 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      {previewCreator.avgViews >= 1000000 ? (previewCreator.avgViews / 1000000).toFixed(1) + 'M' : (previewCreator.avgViews / 1000).toFixed(0) + 'K'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Engagement</span>
                    <span className="font-mono text-base font-extrabold text-brand mt-1 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {previewCreator.engagement}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sponsorship Rate Packages</h4>
                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-surface-2/10">
                  <div className="p-3 flex justify-between items-center text-xs font-semibold">
                    <div className="flex flex-col leading-tight">
                      <span className="text-text-primary font-bold">Standard 30-60s Integration</span>
                      <span className="text-[10px] text-text-muted mt-0.5">Perfect for mid-rolls or pre-rolls in standard videos</span>
                    </div>
                    <span className="font-mono text-brand font-extrabold">${previewCreator.minRate.toLocaleString()}+</span>
                  </div>
                  <div className="p-3 flex justify-between items-center text-xs font-semibold">
                    <div className="flex flex-col leading-tight">
                      <span className="text-text-primary font-bold">Dedicated Product Video</span>
                      <span className="text-[10px] text-text-muted mt-0.5">Complete review, USPs demo, custom links</span>
                    </div>
                    <span className="font-mono text-brand font-extrabold">${(previewCreator.minRate * 2).toLocaleString()}+</span>
                  </div>
                  <div className="p-3 flex justify-between items-center text-xs font-semibold">
                    <div className="flex flex-col leading-tight">
                      <span className="text-text-primary font-bold">Shorts / Reels Campaign</span>
                      <span className="text-[10px] text-text-muted mt-0.5">High-impact 30s quick clip package</span>
                    </div>
                    <span className="font-mono text-brand font-extrabold">${(previewCreator.minRate * 0.6).toLocaleString()}+</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-border pt-4">
              <span className="text-[10px] text-text-muted flex items-center">
                <Check className="w-3.5 h-3.5 mr-1 text-brand" />
                Verified via DealHive Analytics Engine
              </span>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => setPreviewCreator(null)}>
                  Close Profile
                </Button>
                <button
                  onClick={() => {
                    const c = previewCreator;
                    setPreviewCreator(null);
                    setSelectedCreator(c);
                    setPitchTitle(`${c.name} Campaign Pitch`);
                    setOfferedRate(c.minRate);
                    setModalStep(1);
                  }}
                  className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  <span>Send Collaboration Request</span>
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Pitch Modal */}
      {selectedCreator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedCreator(null)}>
          <Card
            variant="standard"
            className="w-full max-w-[480px] h-[550px] border border-border bg-surface shadow-2xl flex flex-col justify-between p-6 select-none animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-border pb-3.5 flex-shrink-0">
              <div className="flex flex-col select-none leading-none">
                <span className="text-sm font-bold text-text-primary sora-heading">
                  Pitch Partnership with {selectedCreator.name}
                </span>
                <span className="text-[10px] font-bold text-text-muted mt-1.5 uppercase tracking-wider">
                  Step {modalStep} of 2 &middot; Campaign Configuration
                </span>
              </div>
              <button onClick={() => setSelectedCreator(null)} className="text-text-muted hover:text-text-primary text-xs font-bold font-mono px-2 py-0.5 border border-border rounded">
                Esc
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
              {modalStep === 1 ? (
                <>
                  <InputField
                    label="Brief / Campaign Pitch Title"
                    value={pitchTitle}
                    onChange={(e) => setPitchTitle(e.target.value)}
                    placeholder="e.g. Samsung Galaxy S26 Unboxing Review"
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Deal Format Type</label>
                      <select
                        value={dealType}
                        onChange={(e) => setDealType(e.target.value)}
                        className="h-10 px-2 border border-border bg-surface text-xs rounded-md outline-none font-semibold text-text-secondary"
                      >
                        <option value="Integration">Video Integration</option>
                        <option value="Dedicated Video">Dedicated Video</option>
                        <option value="Shorts">Shorts / Reels Package</option>
                        <option value="Social Package">Social Package</option>
                      </select>
                    </div>

                    <InputField
                      label="Offered Sponsorship Rate ($)"
                      type="number"
                      value={String(offeredRate)}
                      onChange={(e) => setOfferedRate(Number(e.target.value) || 0)}
                      placeholder="Offer value..."
                      required
                    />
                  </div>

                  <div className="space-y-1.5 select-none bg-surface-2/10 p-3 rounded-lg border border-border/40">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Creative Freedom score</label>
                      <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase rounded-[4px] leading-none ${getCreativeFreedomDetails(creativeFreedom).color}`}>
                        {getCreativeFreedomDetails(creativeFreedom).text} ({creativeFreedom}%)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={creativeFreedom}
                      onChange={(e) => setCreativeFreedom(Number(e.target.value))}
                      className="w-full accent-brand h-1 bg-border rounded-lg appearance-none cursor-pointer mt-2"
                    />
                    <span className="text-[9.5px] text-text-muted mt-1 leading-normal block">
                      Scripted (0%): tight outlines and forced wordings. Guided (50%): key talking points. Free (100%): creator chooses creative path.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <InputField
                    label="Hook Focus (Key segment attention puller)"
                    value={hookFocus}
                    onChange={(e) => setHookFocus(e.target.value)}
                    placeholder="Describe how the unboxing should hook visual attention..."
                    required
                  />

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-brand" />
                      <span>Talking Points USPs (One per line)</span>
                    </label>
                    <textarea
                      value={talkingPoints}
                      onChange={(e) => setTalkingPoints(e.target.value)}
                      placeholder={"Showcase the premium camera zoom...\nExplain AI instant transcription...\nShare personalized checkout codes..."}
                      rows={3}
                      className="w-full p-2.5 border border-border bg-surface text-xs rounded-md outline-none focus:border-brand font-semibold text-text-secondary shadow-inner"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5 text-brand" />
                      <span>Compliance Checklist (One per line)</span>
                    </label>
                    <textarea
                      value={complianceChecklist}
                      onChange={(e) => setComplianceChecklist(e.target.value)}
                      placeholder={"Place download link in top 2 lines of video description\nOverlay generative checkout code for 10s\nVerify compliance declaration"}
                      rows={3}
                      className="w-full p-2.5 border border-border bg-surface text-xs rounded-md outline-none focus:border-brand font-semibold text-text-secondary shadow-inner"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-border pt-4 flex-shrink-0">
              {modalStep === 2 ? (
                <button
                  type="button"
                  onClick={() => setModalStep(1)}
                  className="px-3.5 py-2 bg-surface-2 hover:bg-surface-3 border border-border rounded-lg text-xs font-bold text-text-secondary transition-all active:scale-95"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => setSelectedCreator(null)}>
                  Cancel
                </Button>
                {modalStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!pitchTitle) {
                        toast.error('Please enter a brief campaign title.');
                        return;
                      }
                      setModalStep(2);
                    }}
                    className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold flex items-center space-x-1 transition-all active:scale-95 shadow"
                  >
                    <span>Next: Outline Brief</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendPitch}
                    className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold flex items-center space-x-1 transition-all active:scale-95 shadow"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    <span>Send sponsorship pitch</span>
                  </button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};