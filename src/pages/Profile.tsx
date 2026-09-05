import React, { useState, useEffect } from 'react';
import { 
  Youtube, 
  RefreshCw, 
  Check, 
  Plus, 
  Sparkles,
  Copy,
  Globe,
  Lock,
  Sliders,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { convexClient as supabaseClient, mockDb } from '../services/convex';
import { CreatorProfile, RateCard } from '../types/supabase.types';
import { 
  Button, 
  Card,
  InputField,
  ShimmerSkeleton,
  Modal
} from '../components';

const AVAILABLE_NICHES = [
  'Tech', 'Lifestyle', 'Productivity', 'Gadgets', 'Fashion', 
  'Travel', 'Finance', 'Business', 'Gaming', 'Food', 
  'Fitness', 'Education', 'Beauty', 'Entertainment', 'Science', 
  'DIY', 'Parenting', 'Pets'
];

interface PartnerLogoProps {
  url: string;
  className?: string;
  imgClassName?: string;
  initialsSizeClass?: string;
}

const PartnerLogo: React.FC<PartnerLogoProps> = ({
  url,
  className = '',
  imgClassName = '',
  initialsSizeClass = 'text-xs'
}) => {
  const [error, setError] = useState(false);

  const getInitials = (logoUrl: string) => {
    try {
      if (logoUrl.includes('logo.clearbit.com/')) {
        return logoUrl.split('logo.clearbit.com/')[1].split('.')[0].substring(0, 2).toUpperCase();
      }
      return 'P';
    } catch {
      return 'P';
    }
  };

  if (error || !url) {
    const initials = getInitials(url);
    return (
      <div className={`w-full h-full rounded-lg bg-brand-light border border-brand/25 text-brand font-extrabold flex items-center justify-center select-none ${className}`}>
        <span className={`font-sans uppercase tracking-wider ${initialsSizeClass}`}>{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt="partner logo"
      className={imgClassName}
      onError={() => setError(true)}
    />
  );
};

export const Profile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [rateCard, setRateCard] = useState<RateCard>({
    integration: 0,
    dedicated: 0,
    shorts: 0,
    social_package: 0,
    exclusivity_premium: 0
  });

  const [editingRateField, setEditingRateField] = useState<keyof RateCard | null>(null);
  const [editingRateValue, setEditingRateValue] = useState('');
  const [bioOutline, setBioOutline] = useState('');
  
  const [pastPartners, setPastPartners] = useState<string[]>([
    'https://logo.clearbit.com/samsung.com',
    'https://logo.clearbit.com/nordvpn.com',
    'https://logo.clearbit.com/adobe.com'
  ]);
  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');

  const [connectingYoutube, setConnectingYoutube] = useState(false);
  const [connectingInstagram, setConnectingInstagram] = useState(false);
  const [isConnectingModalOpen, setIsConnectingModalOpen] = useState(false);
  const [connectingServiceType, setConnectingServiceType] = useState<'youtube' | 'instagram'>('youtube');
  const [connectingApiKey, setConnectingApiKey] = useState('');
  
  const [selectedPackage, setSelectedPackage] = useState<'bronze' | 'silver' | 'gold'>('bronze');

  const packages = {
    bronze: {
      name: 'Bronze (30s Mid-Roll)',
      price: 3500,
      delivery: '7 days',
      desc: 'A 30-45s mid-roll integration in a standard tech/lifestyle video.'
    },
    silver: {
      name: 'Silver (Dedicated Video)',
      price: 7000,
      delivery: '14 days',
      desc: "Full dedicated video focusing entirely on the sponsor's product/service."
    },
    gold: {
      name: 'Gold (Social Cross-Post)',
      price: 9500,
      delivery: '21 days',
      desc: 'Dedicated video plus TikTok and YouTube Shorts cross-post packages.'
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      let creatorProfile = await supabaseClient.profiles.getCreator();
      if (!creatorProfile) {
        creatorProfile = mockDb.getCreatorProfile();
      }
      setProfile(creatorProfile);
      setRateCard(creatorProfile.rate_card || {
        integration: 3500,
        dedicated: 7000,
        shorts: 1500,
        social_package: 9500,
        exclusivity_premium: 20
      });
      setBioOutline(creatorProfile.bio || '');

      const storedPartners = localStorage.getItem('dealhive_past_partners');
      if (storedPartners) {
        setPastPartners(JSON.parse(storedPartners));
      } else {
        localStorage.setItem('dealhive_past_partners', JSON.stringify(pastPartners));
      }
    } catch (err) {
      console.error('Error loading profile data:', err);
      const fallback = mockDb.getCreatorProfile();
      setProfile(fallback);
      setRateCard(fallback.rate_card);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompleteness = (prof: CreatorProfile, rates: RateCard, partners: string[]) => {
    let score = 0;
    if (prof.avatar_url) score += 20;
    if (prof.youtube_connected) score += 20;
    if (prof.niche_tags && prof.niche_tags.length >= 3) score += 15;

    let hasRatesCount = 0;
    if (rates.integration > 0) hasRatesCount++;
    if (rates.dedicated > 0) hasRatesCount++;
    if (rates.shorts > 0) hasRatesCount++;
    if (rates.social_package > 0) hasRatesCount++;
    if (rates.exclusivity_premium > 0) hasRatesCount++;
    if (hasRatesCount >= 2) score += 20;

    if (partners.length >= 1) score += 10;
    if (prof.bio && prof.bio.trim().length > 0) score += 15;

    return score;
  };

  const handleUpdateProfile = async (updates: Partial<CreatorProfile>) => {
    if (profile) {
      try {
        const updated = await supabaseClient.profiles.updateCreator(updates);
        setProfile(updated);
      } catch (err) {
        toast.error('Failed to auto-update profile.');
      }
    }
  };

  const handleToggleNiche = (niche: string) => {
    if (!profile) return;
    let list = [...profile.niche_tags];
    if (list.includes(niche)) {
      list = list.filter(n => n !== niche);
    } else {
      if (list.length >= 5) {
        toast.error('You can select a maximum of 5 niche tags!');
        return;
      }
      list.push(niche);
    }
    handleUpdateProfile({ niche_tags: list });
  };

  const startEditingRate = (field: keyof RateCard) => {
    setEditingRateField(field);
    setEditingRateValue(String(rateCard[field] || 0));
  };

  const saveEditingRate = async () => {
    if (!editingRateField || !profile) return;
    const valueNum = Number(editingRateValue) || 0;
    const newRates = { ...rateCard, [editingRateField]: valueNum };
    setRateCard(newRates);
    setEditingRateField(null);
    try {
      await supabaseClient.profiles.updateCreator({ rate_card: newRates });
      toast.success('Rate card updated!');
      loadProfileData();
    } catch {
      toast.error('Failed to save rate.');
    }
  };

  const saveBioOutline = () => {
    if (profile && profile.bio !== bioOutline) {
      handleUpdateProfile({ bio: bioOutline });
      toast.success('Bio saved successfully!');
    }
  };

  const reorderPartners = (idx: number, dir: 'left' | 'right') => {
    const list = [...pastPartners];
    if (dir === 'left' && idx > 0) {
      const temp = list[idx];
      list[idx] = list[idx - 1];
      list[idx - 1] = temp;
    } else if (dir === 'right' && idx < pastPartners.length - 1) {
      const temp = list[idx];
      list[idx] = list[idx + 1];
      list[idx + 1] = temp;
    }
    setPastPartners(list);
    localStorage.setItem('dealhive_past_partners', JSON.stringify(list));
    toast.success('Partners list reordered!');
  };

  const removePartner = (idx: number) => {
    const list = pastPartners.filter((_, i) => i !== idx);
    setPastPartners(list);
    localStorage.setItem('dealhive_past_partners', JSON.stringify(list));
    toast.success('Partner removed!');
  };

  const handleAddPartner = () => {
    if (!newPartnerName.trim()) return;
    const cleanName = newPartnerName.toLowerCase().replace(/\s+/g, '');
    const logoUrl = `https://logo.clearbit.com/${cleanName}.com`;
    const list = [...pastPartners, logoUrl];
    setPastPartners(list);
    localStorage.setItem('dealhive_past_partners', JSON.stringify(list));
    setNewPartnerName('');
    setIsAddPartnerModalOpen(false);
    toast.success('Brand partner logo added!');
  };

  const handleConnectYoutube = () => {
    setConnectingServiceType('youtube');
    setConnectingApiKey(localStorage.getItem('dealhive_youtube_api_key') || '');
    setIsConnectingModalOpen(true);
  };

  const handleDisconnectYoutube = () => {
    if (profile) {
      const updatedProfile = {
        ...profile,
        youtube_connected: false,
        youtube_channel_id: '',
        youtube_stats: null
      };
      localStorage.removeItem('dealhive_youtube_api_key');
      mockDb.saveCreatorProfile(updatedProfile);
      setProfile(updatedProfile);
      toast.success('YouTube sync disconnected.');
    }
  };

  const handleConnectInstagram = () => {
    setConnectingServiceType('instagram');
    setConnectingApiKey(localStorage.getItem('dealhive_instagram_api_key') || '');
    setIsConnectingModalOpen(true);
  };

  const handleDisconnectInstagram = () => {
    if (profile) {
      const updatedProfile = {
        ...profile,
        instagram_connected: false,
        instagram_stats: null
      };
      localStorage.removeItem('dealhive_instagram_api_key');
      mockDb.saveCreatorProfile(updatedProfile);
      setProfile(updatedProfile);
      toast.success('Instagram sync disconnected.');
    }
  };

  const completeChannelSync = async (skipKey = false) => {
    setIsConnectingModalOpen(false);
    const keyVal = skipKey ? '' : connectingApiKey.trim();

    // Mock API implementations matching helper interfaces
    const mockYoutubeData = {
      subscriber_count: 385000,
      avg_views: 125000,
      engagement_rate: 4.8,
      top_countries: ['United States', 'Canada', 'United Kingdom'],
      age_gender_split: {
        age: { '18-24': 45, '25-34': 38, '35-44': 12, '45+': 5 },
        gender: { Female: 58, Male: 39, Other: 3 }
      }
    };

    const mockInstagramData = {
      follower_count: 852000,
      avg_engagement_rate: 6.8,
      top_countries: ['United States', 'Brazil', 'India'],
      demographics: {
        age: { '18-24': 35, '25-34': 45, '35-44': 15, '45+': 5 },
        gender: { Female: 62, Male: 35, Other: 3 }
      }
    };

    if (connectingServiceType === 'youtube') {
      setConnectingYoutube(true);
      try {
        await new Promise(r => setTimeout(r, 1000));
        let stats = { ...mockYoutubeData };
        let chanId = 'UC_sarah_jenkins_creates';
        if (keyVal) {
          localStorage.setItem('dealhive_youtube_api_key', keyVal);
          chanId = `UC_live_api_${keyVal.substring(0, 8)}`;
          stats.subscriber_count = 524000;
          stats.avg_views = 195000;
          stats.engagement_rate = 5.6;
        } else {
          localStorage.removeItem('dealhive_youtube_api_key');
        }

        if (profile) {
          const updated = {
            ...profile,
            youtube_connected: true,
            youtube_channel_id: chanId,
            youtube_stats: stats
          };
          mockDb.saveCreatorProfile(updated);
          setProfile(updated);
          toast.success(keyVal ? 'YouTube synced using Developer API key!' : 'YouTube Channel synced via Google OAuth!');
        }
      } catch {
        toast.error('Failed to sync YouTube integration.');
      } finally {
        setConnectingYoutube(false);
      }
    } else {
      setConnectingInstagram(true);
      try {
        await new Promise(r => setTimeout(r, 1000));
        let stats = { ...mockInstagramData };
        if (keyVal) {
          localStorage.setItem('dealhive_instagram_api_key', keyVal);
          stats.follower_count = 920000;
          stats.avg_engagement_rate = 7.4;
        } else {
          localStorage.removeItem('dealhive_instagram_api_key');
        }

        if (profile) {
          const updated = {
            ...profile,
            instagram_connected: true,
            instagram_stats: stats
          };
          mockDb.saveCreatorProfile(updated);
          setProfile(updated);
          toast.success(keyVal ? 'Instagram synced using Graph API key!' : 'Instagram synced via Graph API!');
        }
      } catch {
        toast.error('Failed to sync Instagram integration.');
      } finally {
        setConnectingInstagram(false);
      }
    }
  };

  const copyMediaKitLink = () => {
    navigator.clipboard.writeText(window.location.origin + `/creator/${profile?.username}`);
    toast.success('Media kit link copied to clipboard!');
  };

  const changeVisibility = (vis: 'public' | 'unlisted' | 'private') => {
    if (!profile) return;
    const updated = { ...profile, visibility: vis };
    setProfile(updated);
    mockDb.saveCreatorProfile(updated);
    toast.success(`Profile set to ${vis.toUpperCase()}!`);
  };

  const getVisibilityLabel = (vis: 'public' | 'unlisted' | 'private') => {
    if (vis === 'public') return 'Discoverable in brand directory';
    if (vis === 'unlisted') return 'Accessible via direct link only';
    return 'Hidden — for deal management only';
  };

  const getNumberFormatted = (num: number) => {
    const locale = localStorage.getItem('dealhive_number_format') || 'US';
    return locale === 'IN' ? num.toLocaleString('en-IN') : num.toLocaleString('en-US');
  };

  if (loading || !profile) {
    return (
      <div className="flex flex-col space-y-6 w-full max-w-[1140px] mx-auto py-7 px-8">
        <ShimmerSkeleton width="180px" height="32px" />
        <ShimmerSkeleton height="400px" />
      </div>
    );
  }

  const completenessScore = calculateProfileCompleteness(profile, rateCard, pastPartners);
  const circRadius = 36;
  const circStroke = 4;
  const circLen = 2 * Math.PI * circRadius;
  const circOffset = circLen - (completenessScore / 100) * circLen;

  const activeRates = [rateCard.integration, rateCard.dedicated, rateCard.shorts, rateCard.social_package].filter(r => r > 0);
  const minRate = activeRates.length > 0 ? Math.min(...activeRates) : 1500;
  const maxRateVal = activeRates.length > 0 ? Math.max(...activeRates) : 7000;

  return (
    <div className="w-full max-w-[1140px] mx-auto py-7 px-8 animate-stagger-item select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Left main pane */}
        <div className="lg:col-span-8 space-y-6">
          {/* Profile Completeness card */}
          <Card variant="standard" className="flex items-center space-x-6 p-5">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r={circRadius} stroke="var(--color-border)" strokeWidth={circStroke} fill="transparent" />
                <circle
                  cx="40"
                  cy="40"
                  r={circRadius}
                  stroke="var(--color-brand)"
                  strokeWidth={circStroke}
                  fill="transparent"
                  strokeDasharray={circLen}
                  strokeDashoffset={circOffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-sm font-bold text-text-primary">{completenessScore}%</span>
              </div>
            </div>
            <div className="flex flex-col leading-tight select-none">
              <h3 className="text-sm font-bold text-text-primary sora-heading">Media Kit Completeness</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Your profile is {completenessScore}% complete. A complete rate card and synced YouTube analytics will elevate your platform discoverability index.
              </p>
            </div>
          </Card>

          {/* YouTube Sync Integration card */}
          <Card variant="standard" className="p-6 space-y-4 select-none">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-primary sora-heading uppercase tracking-wider flex items-center space-x-2">
                <Youtube className="w-5 h-5 text-red-600 fill-current" />
                <span>YouTube Stats Integration</span>
              </h3>
            </div>
            {profile.youtube_connected ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface-2/45 p-4 border border-border rounded-xl leading-none">
                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-text-muted uppercase">Subscribers</span>
                    <span className="font-mono text-sm font-bold text-text-primary mt-1.5">
                      {getNumberFormatted(profile.youtube_stats?.subscriber_count || 385000)}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-text-muted uppercase">Avg Views</span>
                    <span className="font-mono text-sm font-bold text-text-primary mt-1.5">
                      {getNumberFormatted(profile.youtube_stats?.avg_views || 125000)}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-text-muted uppercase">Engagement</span>
                    <span className="font-mono text-sm font-bold text-text-primary mt-1.5">
                      {profile.youtube_stats?.engagement_rate || 4.8}%
                    </span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-text-muted uppercase">Top Country</span>
                    <span className="text-xs font-bold text-text-primary mt-2 flex items-center">
                      🇺🇸 {profile.youtube_stats?.top_countries?.[0] || 'United States'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-4 leading-none select-none">
                  <span className="text-[10px] text-text-muted font-mono">Synced 2h ago</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toast.success('Stats refreshed successfully!')}
                      className="text-xs font-bold text-brand hover:text-brand-dark transition-all flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Refresh Stats</span>
                    </button>
                    <button onClick={handleDisconnectYoutube} className="text-xs font-bold text-red-500 hover:text-red-600 transition-all">
                      Disconnect Channel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 py-2 text-center items-center justify-center">
                <div className="w-11 h-11 bg-red-50 border border-red-200 rounded-full flex items-center justify-center text-red-600">
                  <Youtube className="w-5 h-5 fill-current" />
                </div>
                <span className="text-sm font-bold text-text-primary sora-heading">Connect your YouTube channel</span>
                <p className="text-xs text-text-muted max-w-[340px] leading-relaxed">
                  Sync your subscriber metrics and demographic insights automatically so sponsors verify accurate channel metadata.
                </p>
                <Button
                  variant="primary"
                  onClick={handleConnectYoutube}
                  loading={connectingYoutube}
                  className="bg-red-600 hover:bg-red-700 border-red-600 text-white font-bold"
                >
                  Connect YouTube Channel
                </Button>
              </div>
            )}
          </Card>

          {/* Instagram Sync Integration card */}
          <Card variant="standard" className="p-6 space-y-4 select-none">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-primary sora-heading uppercase tracking-wider flex items-center space-x-2">
                <span className="w-5 h-5 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 rounded flex items-center justify-center text-white text-[10px] font-extrabold">
                  IG
                </span>
                <span>Instagram Stats Integration</span>
              </h3>
            </div>
            {profile.instagram_connected ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface-2/45 p-4 border border-border rounded-xl leading-none">
                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-text-muted uppercase">Followers</span>
                    <span className="font-mono text-sm font-bold text-text-primary mt-1.5">
                      {getNumberFormatted(profile.instagram_stats?.follower_count || 852000)}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-text-muted uppercase">Engagement Rate</span>
                    <span className="font-mono text-sm font-bold text-text-primary mt-1.5">
                      {profile.instagram_stats?.avg_engagement_rate || 6.8}%
                    </span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-text-muted uppercase">Top Region</span>
                    <span className="text-xs font-bold text-text-primary mt-2 flex items-center">
                      🇺🇸 {profile.instagram_stats?.top_countries?.[0] || 'United States'}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-text-muted uppercase">Audience Split</span>
                    <span className="text-[10px] font-bold text-text-primary mt-1.5">
                      👩 {profile.instagram_stats?.demographics?.gender?.Female || 62}% Female
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-4 leading-none select-none">
                  <span className="text-[10px] text-text-muted font-mono">Synced 1h ago</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toast.success('Instagram stats refreshed!')}
                      className="text-xs font-bold text-brand hover:text-brand-dark transition-all flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Refresh Stats</span>
                    </button>
                    <button onClick={handleDisconnectInstagram} className="text-xs font-bold text-red-500 hover:text-red-600 transition-all">
                      Disconnect Profile
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 py-2 text-center items-center justify-center">
                <div className="w-11 h-11 bg-pink-50 border border-pink-200 rounded-full flex items-center justify-center text-pink-600 font-extrabold text-sm">
                  IG
                </div>
                <span className="text-sm font-bold text-text-primary sora-heading">Connect your Instagram account</span>
                <p className="text-xs text-text-muted max-w-[340px] leading-relaxed">
                  Sync your Instagram Graph metrics and engagement trends automatically.
                </p>
                <Button
                  variant="primary"
                  onClick={handleConnectInstagram}
                  loading={connectingInstagram}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 border-none text-white font-bold"
                >
                  Connect Instagram Profile
                </Button>
              </div>
            )}
          </Card>

          {/* Rate Card editing table card */}
          <Card variant="standard" className="p-6 space-y-4 select-none">
            <div className="flex flex-col leading-none">
              <h3 className="text-sm font-bold text-text-primary sora-heading uppercase tracking-wider">Your Rate Card</h3>
              <span className="text-[11px] text-text-muted mt-1">Configure rates sheet parameters. Click on cells to edit rates inline.</span>
            </div>
            
            <div className="border border-border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-2/45 border-b border-border font-bold text-text-muted leading-none">
                    <th className="p-3.5">Deal Type</th>
                    <th className="p-3.5">Your Rate</th>
                    <th className="p-3.5">Market Median</th>
                    <th className="p-3.5">Rate Intelligence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {[
                    { field: 'integration' as const, label: 'Integration video', suffix: '$', median: 3500 },
                    { field: 'dedicated' as const, label: 'Dedicated video', suffix: '$', median: 7000 },
                    { field: 'shorts' as const, label: 'YouTube Shorts', suffix: '$', median: 1500 },
                    { field: 'social_package' as const, label: 'Social package (cross-post)', suffix: '$', median: 9500 },
                    { field: 'exclusivity_premium' as const, label: 'Exclusivity premium (%)', suffix: '%', median: 25 }
                  ].map(row => {
                    const isEditing = editingRateField === row.field;
                    const value = rateCard[row.field] || 0;
                    const ratio = row.median > 0 ? value / row.median : 1;
                    
                    let tag = { text: 'Not Set', color: 'text-text-muted bg-surface-2 border-border/40' };
                    if (value > 0) {
                      if (ratio < 0.85) {
                        tag = { text: 'Undercharging', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
                      } else if (ratio >= 0.85 && ratio <= 1.15) {
                        tag = { text: 'Sweet Spot', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
                      } else {
                        tag = { text: 'Premium Range', color: 'text-brand bg-brand/10 border-brand/20' };
                      }
                    }

                    return (
                      <tr key={row.field} className="hover:bg-surface-2/15 transition-colors">
                        <td className="p-3.5 font-semibold text-text-secondary">{row.label}</td>
                        <td className="p-3.5 cursor-pointer" onClick={() => !isEditing && startEditingRate(row.field)}>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editingRateValue}
                              onChange={(e) => setEditingRateValue(e.target.value)}
                              onBlur={saveEditingRate}
                              onKeyDown={(e) => e.key === 'Enter' && saveEditingRate()}
                              autoFocus
                              className="w-24 h-7 px-2 border border-brand bg-surface rounded text-xs font-mono outline-none"
                            />
                          ) : (
                            <span className="font-mono font-bold text-brand hover:underline">
                              {row.suffix === '$' ? `$${(rateCard[row.field] || 0).toLocaleString()}` : `+${rateCard[row.field]}%`}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-text-muted">
                          {row.suffix === '$' ? `$${row.median.toLocaleString()}` : `+${row.median}%`}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tag.color}`}>
                            {tag.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-brand/5 border border-brand/10 rounded-lg text-[10px] leading-relaxed text-text-secondary flex items-start space-x-1.5">
              <Sliders className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
              <span>
                <strong>Exclusivity Premium:</strong> Added on top of base rate when brand requests exclusive marketing rights.
              </span>
            </div>
          </Card>

          {/* Niches selection card */}
          <Card variant="standard" className="p-6 space-y-4 select-none">
            <h3 className="text-sm font-bold text-text-primary sora-heading uppercase tracking-wider">Your Niches (Max 5)</h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_NICHES.map(niche => {
                const isSelected = profile.niche_tags.includes(niche);
                return (
                  <button
                    key={niche}
                    onClick={() => handleToggleNiche(niche)}
                    className={`h-8 px-4 rounded-full text-xs font-semibold border flex items-center space-x-1.5 transition-all ${
                      isSelected ? 'bg-brand border-brand text-white shadow-sm' : 'bg-surface border-border text-text-secondary hover:border-text-muted'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{niche}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Past partners grid card */}
          <Card variant="standard" className="p-6 space-y-4 select-none">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-primary sora-heading uppercase tracking-wider">Past Partners Logos Grid</h3>
              <Button
                variant="secondary"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setIsAddPartnerModalOpen(true)}
                className="text-[10px] py-1.5 px-3 font-semibold"
              >
                Add Partner
              </Button>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 pt-2">
              {pastPartners.map((url, idx) => (
                <div key={idx} className="group relative w-16 h-16 bg-surface border border-border hover:border-brand-dark/25 rounded-xl shadow-sm flex items-center justify-center transition-all duration-200 overflow-hidden">
                  <PartnerLogo url={url} className="w-12 h-12" imgClassName="w-12 h-12 object-contain" initialsSizeClass="text-sm font-extrabold" />
                  <button
                    onClick={() => removePartner(idx)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 shadow transition-opacity select-none cursor-pointer z-20"
                    title="Remove Partner"
                  >
                    ×
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white h-5 flex items-center justify-between px-1 opacity-0 group-hover:opacity-100 transition-opacity select-none">
                    <button
                      onClick={() => reorderPartners(idx, 'left')}
                      disabled={idx === 0}
                      className="hover:text-brand disabled:opacity-30"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => reorderPartners(idx, 'right')}
                      disabled={idx === pastPartners.length - 1}
                      className="hover:text-brand disabled:opacity-30"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Audience Bio pitch card */}
          <Card variant="standard" className="p-6 space-y-4 select-none">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-primary sora-heading uppercase tracking-wider">Audience Bio Pitch Outline</h3>
              <span className="text-[10px] font-mono text-text-muted">{bioOutline.length}/300 characters</span>
            </div>
            <textarea
              value={bioOutline}
              onChange={(e) => e.target.value.length <= 300 && setBioOutline(e.target.value)}
              onBlur={saveBioOutline}
              placeholder="Outline audience metrics, demographics categories, primary channels focuses, and past campaign track parameters..."
              rows={4}
              maxLength={300}
              className="w-full p-3 bg-surface border border-border rounded-xl text-[13px] leading-relaxed outline-none focus:border-brand text-text-secondary transition-all"
            />
          </Card>

          {/* Visibility Discoverability card */}
          <Card variant="standard" className="p-6 space-y-4 select-none">
            <h3 className="text-sm font-bold text-text-primary sora-heading uppercase tracking-wider">Profile Discoverability Control</h3>
            <div className="grid grid-cols-3 gap-2 border border-border p-1 bg-surface-2/45 rounded-xl">
              {[
                { id: 'public' as const, label: 'Public', icon: <Globe className="w-3.5 h-3.5" /> },
                { id: 'unlisted' as const, label: 'Unlisted', icon: <Globe className="w-3.5 h-3.5" /> },
                { id: 'private' as const, label: 'Private', icon: <Lock className="w-3.5 h-3.5" /> }
              ].map(item => {
                const isActive = profile.visibility === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => changeVisibility(item.id)}
                    className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all select-none ${
                      isActive ? 'bg-surface border border-border shadow-sm text-brand' : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-text-muted font-semibold pl-1 leading-none transition-all">
              💡 Current State: {getVisibilityLabel(profile.visibility)}
            </p>
          </Card>
        </div>

        {/* Right Preview column */}
        <div className="lg:col-span-4 h-full space-y-4 sticky top-6">
          <div className="flex items-center justify-between border-b border-border pb-3 select-none leading-none">
            <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Your Public Media Kit</h3>
            <span className="text-[10px] text-text-muted font-semibold">Live Preview</span>
          </div>

          <Card
            variant="standard"
            className="p-6 border border-border/80 rounded-2xl shadow-lg relative bg-surface select-none space-y-6 flex flex-col justify-between"
            style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}
          >
            <div className="flex flex-col items-center text-center space-y-3.5 border-b border-border/50 pb-5">
              <div className="w-18 h-18 rounded-full border-2 border-brand p-0.5 overflow-hidden flex-shrink-0">
                <img
                  src={profile.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="flex flex-col leading-none">
                <h2 className="text-lg font-bold text-text-primary sora-heading leading-tight flex items-center justify-center space-x-1.5">
                  <span>{profile.full_name}</span>
                  {profile.youtube_connected && <Check className="w-4 h-4 text-blue-500" />}
                </h2>
                <span className="text-[11px] text-text-muted mt-1 leading-none">@{profile.username}</span>
                {(profile.youtube_connected || profile.instagram_connected) && (
                  <div className="mt-2.5 flex justify-center">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[8px] font-bold uppercase tracking-wider animate-pulse shadow shadow-emerald-500/10">
                      <Sparkles className="w-2.5 h-2.5 mr-1 text-emerald-500 fill-current" />
                      <span>Verified API Analytics</span>
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-1">
                {profile.niche_tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-brand-light border border-brand/5 text-[9px] font-bold text-brand rounded-sm uppercase tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {profile.youtube_connected && (
              <div className="grid grid-cols-2 gap-4 border-b border-border/50 pb-5 select-none leading-none">
                <div className="flex flex-col leading-none">
                  <span className="text-[8px] font-bold uppercase text-text-muted">Subscribers</span>
                  <span className="font-mono text-sm font-bold text-text-primary mt-1.5">
                    {getNumberFormatted(profile.youtube_stats?.subscriber_count || 385000)}
                  </span>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[8px] font-bold uppercase text-text-muted">Avg Views</span>
                  <span className="font-mono text-sm font-bold text-text-primary mt-1.5">
                    {getNumberFormatted(profile.youtube_stats?.avg_views || 125000)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col leading-none select-none border-b border-border/50 pb-5">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Estimated Sponsorship Range</span>
              <span className="font-mono text-lg font-bold text-brand mt-2 leading-none">
                ${minRate.toLocaleString()} – ${maxRateVal.toLocaleString()}
              </span>
            </div>

            <div className="space-y-3 pt-1 border-b border-border/50 pb-5">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block text-left">
                Available Sponsorship Packages
              </span>
              <div className="flex flex-col gap-2">
                {(Object.keys(packages) as Array<keyof typeof packages>).map(pkgKey => {
                  const item = packages[pkgKey];
                  const isSelected = selectedPackage === pkgKey;
                  return (
                    <div
                      key={pkgKey}
                      onClick={() => setSelectedPackage(pkgKey)}
                      className={`p-3 border rounded-xl cursor-pointer text-left transition-all active:scale-95 duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                        isSelected ? 'border-brand bg-brand-light/20 shadow-sm' : 'border-border hover:border-text-muted bg-surface'
                      }`}
                    >
                      <div className="flex justify-between items-center leading-none">
                        <span className="text-xs font-bold text-text-primary">{item.name}</span>
                        <span className="font-mono text-xs font-bold text-brand">${item.price.toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-text-secondary mt-1.5 leading-relaxed">{item.desc}</p>
                      <span className="text-[9px] text-text-muted font-mono mt-1 block">Est. Delivery: {item.delivery}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {bioOutline.trim().length > 0 && (
              <div className="space-y-1.5 select-none border-b border-border/50 pb-5">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Bio pitch outline</span>
                <p className="text-[11.5px] text-text-secondary leading-relaxed">{bioOutline}</p>
              </div>
            )}

            {pastPartners.length > 0 && (
              <div className="space-y-3 pt-1 select-none">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Rostered Past Partners</span>
                <div className="flex flex-wrap gap-2">
                  {pastPartners.map((url, i) => (
                    <div key={i} className="w-9 h-9 border border-border/50 rounded bg-surface flex items-center justify-center flex-shrink-0">
                      <PartnerLogo url={url} className="w-7 h-7 rounded" imgClassName="w-7 h-7 object-contain" initialsSizeClass="text-[9px] font-extrabold" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 select-none flex flex-col space-y-2">
              <Button
                variant="primary"
                onClick={() => toast.success(`Booking initiated for ${packages[selectedPackage].name}!`)}
                className="w-full text-xs font-bold leading-none py-2.5 bg-brand text-white hover:bg-brand-dark"
              >
                Book {packages[selectedPackage].name.split(' (')[0]} - ${packages[selectedPackage].price.toLocaleString()}
              </Button>
              <Button
                variant="secondary"
                onClick={copyMediaKitLink}
                icon={<Copy className="w-3.5 h-3.5" />}
                className="w-full text-xs font-bold leading-none py-2.5 border border-border-strong text-text-primary bg-surface"
              >
                Copy Media Kit Link
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Partner Modal */}
      {isAddPartnerModalOpen && (
        <Modal
          isOpen={isAddPartnerModalOpen}
          onClose={() => setIsAddPartnerModalOpen(false)}
          title="Add Past Brand Partner Logo"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsAddPartnerModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddPartner}>
                Import Logo
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <InputField
              label="Brand / Company Name"
              value={newPartnerName}
              onChange={(e) => setNewPartnerName(e.target.value)}
              placeholder="e.g. Samsung, NordVPN, Shopify, Figma..."
            />
            <p className="text-[10px] text-text-muted leading-relaxed leading-normal">
              DealHive uses Clearbit's API integrations to pull verified SVG company logos based on domain names automatically.
            </p>
          </div>
        </Modal>
      )}

      {/* Channel Sync API Modal */}
      {isConnectingModalOpen && (
        <Modal
          isOpen={isConnectingModalOpen}
          onClose={() => setIsConnectingModalOpen(false)}
          title={`Sync ${connectingServiceType === 'youtube' ? 'YouTube Channel' : 'Instagram Profile'}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => completeChannelSync(true)}>
                Connect OAuth Demo Flow
              </Button>
              <Button variant="primary" onClick={() => completeChannelSync(false)}>
                Sync API Key
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <InputField
              label={`${connectingServiceType === 'youtube' ? 'YouTube Data' : 'Instagram Graph'} API Key`}
              value={connectingApiKey}
              onChange={(e) => setConnectingApiKey(e.target.value)}
              placeholder="Paste secure developer API credentials key..."
            />
            <p className="text-[10px] text-text-muted leading-relaxed leading-normal">
              Enter your Google Developer Console Youtube API Key or Facebook Graph Token to sync stats. Alternatively, select "Connect OAuth Demo Flow" to auto-simulate oauth tokens setup.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};