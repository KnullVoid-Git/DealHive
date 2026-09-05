import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, 
  MessageSquare, 
  Send, 
  Search, 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  Users, 
  DollarSign, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

import { convexClient as supabaseClient, mockDb } from '../services/convex';
import { Deal, Deliverable, BrandProfile, DealStage } from '../types/supabase.types';
import { 
  Button, 
  Card,
  InputField,
  StatusBadge,
  Modal
} from '../components';
import { useCountUp } from '../hooks/useCountUp';

interface DirectoryCreator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  niche: string[];
  subscribers: string;
  avgViews: number;
  priceIndicator: string;
  youtube_connected: boolean;
  pitch_response_rate: number;
  completed_deals: number;
  avg_brand_rating: number;
}

const MOCK_DIRECTORY: DirectoryCreator[] = [
  {
    id: 'creator_sarah',
    name: 'Sarah Jenkins',
    username: 'sarah_creates',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    niche: ['Tech', 'Lifestyle', 'Productivity'],
    subscribers: '385K',
    avgViews: 125000,
    priceIndicator: '$$',
    youtube_connected: true,
    pitch_response_rate: 92,
    completed_deals: 6,
    avg_brand_rating: 4.8
  },
  {
    id: 'creator_marques',
    name: 'Marques K.',
    username: 'mkbhd_mock',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    niche: ['Tech', 'Gadgets'],
    subscribers: '16M',
    avgViews: 4500000,
    priceIndicator: '$$$$',
    youtube_connected: false,
    pitch_response_rate: 70,
    completed_deals: 12,
    avg_brand_rating: 4.9
  },
  {
    id: 'creator_emma',
    name: 'Emma Chamberlain',
    username: 'emma_mock',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    niche: ['Lifestyle', 'Fashion', 'Travel'],
    subscribers: '12M',
    avgViews: 2800000,
    priceIndicator: '$$$$',
    youtube_connected: true,
    pitch_response_rate: 85,
    completed_deals: 4,
    avg_brand_rating: 4.6
  },
  {
    id: 'creator_alex',
    name: 'Alex Hormozi',
    username: 'alex_mock',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    niche: ['Finance', 'Business', 'Productivity'],
    subscribers: '2.5M',
    avgViews: 450000,
    priceIndicator: '$$$',
    youtube_connected: true,
    pitch_response_rate: 75,
    completed_deals: 3,
    avg_brand_rating: 4.2
  },
  {
    id: 'creator_raj',
    name: 'Rajesh Kumar',
    username: 'raj_tech',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    niche: ['Tech', 'Gaming', 'Education'],
    subscribers: '1.2M',
    avgViews: 220000,
    priceIndicator: '$$$',
    youtube_connected: true,
    pitch_response_rate: 94,
    completed_deals: 5,
    avg_brand_rating: 4.7
  }
];

export const BrandDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'crm'>('campaigns');
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [preferredCreators, setPreferredCreators] = useState<string[]>([]);
  
  // Brief Setup Wizard
  const [selectedCreator, setSelectedCreator] = useState<DirectoryCreator | null>(null);
  const [briefDetails, setBriefDetails] = useState('');
  const [briefRate, setBriefRate] = useState(3500);
  const [briefStep, setBriefStep] = useState(1);
  const [briefPackage, setBriefPackage] = useState('bronze');
  const [briefObjective, setBriefObjective] = useState('awareness');
  const [briefDate, setBriefDate] = useState('');
  const [briefHooks, setBriefHooks] = useState('');
  const [is2faEnabled, setIs2faEnabled] = useState(localStorage.getItem("dealhive_2fa_enabled") === "true");

  useEffect(() => {
    const handle2fa = () => {
      setIs2faEnabled(localStorage.getItem("dealhive_2fa_enabled") === "true");
    };
    window.addEventListener("2fa-change", handle2fa);
    return () => window.removeEventListener("2fa-change", handle2fa);
  }, []);

  useEffect(() => {
    loadCRMData();
  }, []);

  const loadCRMData = async () => {
    try {
      let parts = await supabaseClient.partnerships.list();
      if (parts.length <= 2 || !parts.some(p => p.creator_id === 'creator_raj')) {
        localStorage.removeItem("dealhive_db_crm_partnerships");
        parts = await supabaseClient.partnerships.list();
      }
      setPartnerships(parts);

      const samsung = mockDb.getBrands().find(b => b.id === 'brand_samsung');
      if (samsung) {
        setPreferredCreators(samsung.preferred_creators || ['creator_sarah']);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const dealsList = await supabaseClient.deals.list();
      const teamRole = localStorage.getItem("dealhive_team_role");

      let filtered = dealsList;
      if (teamRole === 'campaign_manager' || teamRole === 'viewer') {
        filtered = dealsList.filter(d => d.assigned_to === 'tm_michael');
      }
      setDeals(filtered);

      let allDelivs: Deliverable[] = [];
      for (const d of dealsList) {
        try {
          const list = await supabaseClient.deliverables.list(d.id);
          allDelivs = [...allDelivs, ...list];
        } catch (err) {
          console.error(err);
        }
      }
      setDeliverables(allDelivs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveDeliverable = async (deliverableId: string) => {
    try {
      await supabaseClient.deliverables.updateStatus(deliverableId, 'approved');
      toast.success("Deliverable approved successfully!");
      loadDashboardData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve deliverable.");
    }
  };

  const handleRequestRevision = async (deliverableId: string) => {
    try {
      await supabaseClient.deliverables.updateStatus(deliverableId, 'revision_requested');
      toast.success("Revision request sent to the creator.");
      loadDashboardData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to request revision.");
    }
  };

  const handleSendBriefPitch = () => {
    if (selectedCreator) {
      supabaseClient.notifications.trigger(
        selectedCreator.id,
        "mail",
        "New Pitch Proposal",
        `Samsung sent you a ${briefPackage} campaign pitch (${briefObjective}): "${briefDetails.substring(0, 40)}..."`,
        "/inbox"
      );
      toast.success(`Brief pitch successfully sent to ${selectedCreator.name}!`);
      setSelectedCreator(null);
      setBriefStep(1);
    }
  };

  const handleQuickStartRepeat = async (creatorId: string, rate: number, dealType: string) => {
    try {
      const dealsList = mockDb.getDeals();
      const dealId = "deal_" + Math.random().toString(36).substr(2, 9);
      const newDeal = {
        id: dealId,
        creator_id: creatorId,
        brand_id: "brand_samsung",
        title: `Samsung Repeat ${dealType} Sponsorship`,
        deal_type: dealType as any,
        stage: "negotiating" as DealStage,
        agreed_rate: rate,
        currency: "USD",
        payment_terms: "Net 15",
        exclusivity: "No other smartphone brands for 15 days",
        usage_rights: "Standard digital rights",
        kill_fee: Number((rate * 0.25).toFixed(0)),
        term_change_history: [],
        creator_agreed: false,
        brand_agreed: true,
        last_viewed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      dealsList.unshift(newDeal);
      mockDb.saveDeals(dealsList);

      const msgs = mockDb.getMessages();
      msgs.push({
        id: "msg_" + Math.random().toString(36).substr(2, 9),
        deal_id: dealId,
        sender_id: "brand_samsung",
        message_text: `Hi Sarah! We loved our previous collaboration and would love to quick-start a new repeat ${dealType} sponsorship with the same terms ($${rate.toLocaleString()}). Please check the new Term Sheet in the Deal Room!`,
        attachments: [],
        created_at: new Date().toISOString()
      });
      mockDb.saveMessages(msgs);

      await supabaseClient.notifications.trigger(
        creatorId,
        "sparkles",
        "Repeat Sponsorship Quick-Start! ⚡",
        `Samsung sent you a repeat sponsor quick-start pitch for $${rate.toLocaleString()}.`,
        `/deals/${dealId}`
      );

      await supabaseClient.webhooks.dispatch("deal.created", {
        deal_id: dealId,
        title: `Samsung Repeat ${dealType} Sponsorship`,
        creator_id: creatorId,
        offered_rate: rate,
        deal_type: dealType,
        is_repeat_quickstart: true
      });

      toast.success("Repeat deal quick-started and negotiated contract proposal sent!");
      loadDashboardData();
    } catch {
      toast.error("Failed to quick-start repeat deal.");
    }
  };

  const handleTogglePreferred = (creatorId: string) => {
    const isPreferred = preferredCreators.includes(creatorId);
    const updated = isPreferred 
      ? preferredCreators.filter(id => id !== creatorId) 
      : [...preferredCreators, creatorId];
    setPreferredCreators(updated);

    const brands = mockDb.getBrands();
    const idx = brands.findIndex(b => b.id === "brand_samsung");
    if (idx !== -1) {
      brands[idx].preferred_creators = updated;
      mockDb.saveBrands(brands);
    }
    toast.success(isPreferred ? "Removed creator from preferred roster" : "Added creator to preferred roster! ⭐");
  };

  const totalBudget = deals.reduce((acc, curr) => acc + curr.agreed_rate, 0);
  const activePartnerships = deals.filter(d => d.stage !== 'completed').length;
  const estViewsReach = deals.reduce((acc, curr) => {
    const c = MOCK_DIRECTORY.find(x => x.id === curr.creator_id);
    return acc + (c ? c.avgViews : 125000);
  }, 0);

  const animatedBudget = useCountUp(totalBudget);
  const animatedPartnerships = useCountUp(activePartnerships);
  const animatedViews = useCountUp(estViewsReach);

  const pendingReviewList = deliverables.filter(d => d.status === 'submitted');

  return (
    <div className="w-full max-w-[1140px] mx-auto py-7 px-8 space-y-6 animate-stagger-item select-none">
      {!is2faEnabled && (
        <Card variant="standard" className="p-4 border border-amber-500/30 bg-amber-500/10 backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between transition-spring hover:-translate-y-0.5 hover:shadow-md shadow-sm duration-300">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400 animate-pulse">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Security Warning</h4>
              <span className="text-sm font-bold text-amber-950 dark:text-amber-50 mt-1.5 sora-heading">Two-Factor Authentication (2FA) is Disabled</span>
              <span className="text-xs text-amber-800 dark:text-amber-200 mt-1 font-medium">Your account handles legal contracts and sponsor payouts. We strongly recommend enabling 2FA immediately inside settings.</span>
            </div>
          </div>
          <Button
            onClick={() => navigate('/brand/settings')}
            className="mt-3 md:mt-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-spring hover:-translate-y-0.5"
          >
            Enable 2FA
          </Button>
        </Card>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-4 gap-4">
        <div className="flex flex-col select-none">
          <h2 className="text-xl font-bold text-text-primary sora-heading leading-none">
            {activeTab === 'campaigns' ? "Campaign Command Workspace" : "Relationship-First CRM"}
          </h2>
          <p className="text-xs text-text-muted mt-1.5 leading-none">
            {activeTab === 'campaigns' 
              ? "Orchestrate sponsorship pipelines, review deliverable milestones, and track spent velocity analytics." 
              : "Track co-partner lifetime values, turnaround indexes, and quick-start repeat campaign proposals."}
          </p>
        </div>
        <div className="flex bg-surface-2/60 border border-border p-1 rounded-xl w-72 flex-shrink-0 select-none shadow-sm">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'campaigns' ? "bg-surface shadow text-brand" : "text-text-muted hover:text-text-secondary"}`}
          >
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'crm' ? "bg-surface shadow text-brand" : "text-text-muted hover:text-text-secondary"}`}
          >
            Relationship CRM
          </button>
        </div>
      </div>

      {activeTab === 'campaigns' ? (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card variant="standard" className="flex items-center space-x-4 p-4 border border-border bg-surface shadow-sm">
              <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-text-muted uppercase">Allocated Campaign Budget</span>
                <span data-type="number" className="font-mono text-lg font-bold text-text-primary mt-1.5">
                  ${animatedBudget.toLocaleString()}
                </span>
              </div>
            </Card>

            <Card variant="standard" className="flex items-center space-x-4 p-4 border border-border bg-surface shadow-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-text-muted uppercase">Active Creator Partnerships</span>
                <span data-type="number" className="font-mono text-lg font-bold text-text-primary mt-1.5">
                  {animatedPartnerships} creators
                </span>
              </div>
            </Card>

            <Card variant="standard" className="flex items-center space-x-4 p-4 border border-border bg-surface shadow-sm">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-text-muted uppercase">Est. Cumulative Views Reach</span>
                <span data-type="number" className="font-mono text-lg font-bold text-text-primary mt-1.5">
                  {animatedViews.toLocaleString()} views
                </span>
              </div>
            </Card>
          </div>

          {/* Pending Reviews Queue */}
          {pendingReviewList.length > 0 && (
            <Card variant="standard" className="p-5 border border-border space-y-4 bg-gradient-to-r from-surface to-amber-500/[0.02]">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">
                  Pending Your Review ({pendingReviewList.length})
                </h3>
              </div>
              <div className="divide-y divide-border border border-border rounded-xl bg-surface overflow-hidden shadow-sm">
                {pendingReviewList.map((d) => {
                  const deal = deals.find(x => x.id === d.deal_id);
                  const creator = MOCK_DIRECTORY.find(x => x.id === deal?.creator_id) || MOCK_DIRECTORY[0];
                  return (
                    <div key={d.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 hover:bg-surface-2/10 transition-colors">
                      <div className="flex items-start space-x-3.5">
                        <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center font-bold text-xs text-brand overflow-hidden flex-shrink-0 border border-brand/10">
                          {creator.avatar ? (
                            <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                          ) : (
                            deal?.title.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col select-none leading-tight">
                          <span className="text-xs font-bold text-text-primary leading-tight">{d.name}</span>
                          <span className="text-[10px] text-text-secondary mt-1">
                            Campaign: <span className="font-semibold text-text-primary">{deal?.title}</span> &middot; Creator:{" "}
                            <span className="font-semibold text-text-primary">{creator.name}</span>
                          </span>
                          <span className="text-[9px] text-text-muted mt-0.5 font-semibold">
                            Revision Round: {d.revision_count} &middot; Due Date: {d.due_date}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {d.file_url && (
                          <Button 
                            onClick={() => window.open(d.file_url || undefined, "_blank")} 
                            className="px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-border rounded-md text-[10px] font-bold text-text-secondary flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-text-muted" />
                            <span>Preview Draft</span>
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleApproveDeliverable(d.id)} 
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 rounded-md text-[10px] font-bold text-emerald-600 flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </Button>
                        <Button 
                          onClick={() => handleRequestRevision(d.id)} 
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-md text-[10px] font-bold text-red-500 flex items-center space-x-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Request Revision</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Grid Layout for main content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-4">
              <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Live Campaigns Command Center</h3>
              {deals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {deals.map((dealItem) => {
                    const c = MOCK_DIRECTORY.find(x => x.id === dealItem.creator_id) || MOCK_DIRECTORY[0];
                    const dealDelivs = deliverables.filter(x => x.deal_id === dealItem.id);
                    const approvedCount = dealDelivs.filter(x => x.status === 'approved').length;
                    const totalCount = dealDelivs.length || 4;
                    
                    const postDate = dealItem.created_at ? new Date(dealItem.created_at).getTime() : Date.now();
                    const daysActive = Math.max(0, Math.floor((Date.now() - postDate) / (24 * 60 * 60 * 1000))) || 12;
                    const targetDays = 30;
                    const progressPercent = Math.min(100, Math.round((daysActive / targetDays) * 100));

                    let healthColor = "#16A34A";
                    let healthText = "All deadlines on track";

                    const isOverdue = dealDelivs.some(x => x.status !== 'approved' && new Date(x.due_date).getTime() < Date.now());
                    const isUrgent = dealDelivs.some(x => x.status !== 'approved' && (new Date(x.due_date).getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000);

                    if (isOverdue) {
                      healthColor = "#DC2626";
                      healthText = "A deadline is overdue";
                    } else if (isUrgent) {
                      healthColor = "#D97706";
                      healthText = "A deadline within 3 days";
                    }

                    let labelColor = "text-text-muted";
                    if (totalCount > 0) {
                      if (isOverdue) labelColor = "text-[#DC2626]";
                      else if (approvedCount === totalCount) labelColor = "text-[#16A34A]";
                      else labelColor = "text-[#D97706]";
                    }

                    return (
                      <Card
                        key={dealItem.id}
                        variant="standard"
                        onClick={() => navigate(`/deals/${dealItem.id}`)}
                        className="p-5 space-y-4 border border-border hover:border-brand-dark/20 hover:shadow-md cursor-pointer transition-all relative bg-surface overflow-hidden group select-none flex flex-col justify-between"
                      >
                        <div className="absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: healthColor }} title={healthText} />
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-2 truncate">
                            <span className="font-sans font-semibold text-[15px] text-text-primary truncate">{dealItem.title}</span>
                            <StatusBadge status={dealItem.stage} />
                          </div>
                          <span data-type="number" className="font-mono font-semibold text-[15px] text-text-primary ml-2 flex-shrink-0">
                            ${dealItem.agreed_rate.toLocaleString()}
                          </span>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between items-center text-xs font-sans font-normal">
                            <span className="text-text-muted">Campaign Progress</span>
                            <span data-type="number" className="font-mono font-normal text-[11px] text-text-muted">
                              Day {daysActive} of {targetDays}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--color-brand)] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                          </div>
                        </div>

                        <div className={`flex items-center space-x-1.5 text-[13px] font-sans font-normal pt-1 ${labelColor}`}>
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{approvedCount} of {totalCount} deliverables approved</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/40 select-none">
                          <span className="font-sans font-normal text-xs text-text-muted">Partners</span>
                          <div className="flex items-center space-x-2">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-surface object-cover border border-border" src={c.avatar} alt={c.name} title={c.name} />
                              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-surface object-cover border border-border" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" alt="Marques K." title="Marques K." />
                            </div>
                            <span className="font-sans font-normal text-xs text-text-muted">{c.name} and 1 other</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-border/40 select-none text-[11px] font-semibold text-text-secondary mt-1" onClick={(e) => e.stopPropagation()}>
                          <span>Campaign Owner:</span>
                          <select
                            value={dealItem.assigned_to || "unassigned"}
                            onChange={async (e) => {
                              const val = e.target.value === "unassigned" ? null : e.target.value;
                              try {
                                dealItem.assigned_to = val;
                                const savedDeals = mockDb.getDeals();
                                const idx = savedDeals.findIndex(d => d.id === dealItem.id);
                                if (idx !== -1) {
                                  savedDeals[idx].assigned_to = val;
                                  mockDb.saveDeals(savedDeals);
                                }
                                toast.success("Campaign successfully reassigned!");
                                if (val) {
                                  await supabaseClient.notifications.trigger(
                                    val === "tm_michael" ? "user_va_sarah" : "creator_sarah",
                                    "users",
                                    "New Campaign Assignment",
                                    `You have been assigned as the campaign owner for "${dealItem.title}".`,
                                    `/deals/${dealItem.id}`
                                  );
                                }
                                loadDashboardData();
                              } catch {
                                toast.error("Failed to reassign campaign.");
                              }
                            }}
                            className="bg-transparent border border-border/50 text-[10.5px] rounded px-1.5 py-0.5 outline-none cursor-pointer text-text-primary"
                          >
                            <option value="unassigned">Unassigned (None)</option>
                            <option value="tm_michael">Michael Chang (PR Coordinator)</option>
                            <option value="tm_jessica">Jessica Miller (Compliance Officer)</option>
                          </select>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 bg-surface border border-dashed border-border rounded-xl text-text-muted text-xs">
                  No active sponsorship campaigns.
                </div>
              )}

              {/* Spend Velocity SVG charts */}
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Campaign ROI Analytics CMD</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Card variant="standard" className="p-5 space-y-4 bg-surface">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Spend Velocity vs Planned</span>
                      <TrendingUp className="w-3.5 h-3.5 text-brand" />
                    </div>
                    <div className="w-full flex justify-center bg-surface-2/10 border border-border/40 p-2.5 rounded-xl">
                      <svg viewBox="0 0 300 150" className="w-full h-[150px] overflow-visible">
                        <defs>
                          <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <line x1="30" y1="20" x2="280" y2="20" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3,3" />
                        <line x1="30" y1="60" x2="280" y2="60" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3,3" />
                        <line x1="30" y1="100" x2="280" y2="100" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3,3" />
                        <line x1="30" y1="130" x2="280" y2="130" stroke="var(--color-border)" strokeWidth="1" />
                        
                        <text x="10" y="24" fontSize="8" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">$10K</text>
                        <text x="10" y="64" fontSize="8" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">$5K</text>
                        <text x="10" y="104" fontSize="8" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">$2K</text>
                        <text x="15" y="134" fontSize="8" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">$0</text>
                        
                        <path d="M 30 130 Q 150 70 280 30" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="4,4" />
                        <path d="M 30 130 Q 150 90 280 40 L 280 130 Z" fill="url(#velocityGrad)" />
                        <path d="M 30 130 Q 150 90 280 40" fill="none" stroke="var(--color-brand)" strokeWidth="2.5" />
                        
                        <circle cx="160" cy="10" r="2.5" fill="#818cf8" />
                        <text x="166" y="12" fontSize="7" fill="var(--color-text-muted)" fontWeight="700">Planned Target</text>
                        
                        <circle cx="230" cy="10" r="2.5" fill="var(--color-brand)" />
                        <text x="236" y="12" fontSize="7" fill="var(--color-text-muted)" fontWeight="700">Actual Velocity</text>
                      </svg>
                    </div>
                  </Card>

                  <Card variant="standard" className="p-5 space-y-4 bg-surface">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Views Delivered Per Creator</span>
                      <Users className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="w-full flex justify-center bg-surface-2/10 border border-border/40 p-2.5 rounded-xl">
                      <svg viewBox="0 0 300 150" className="w-full h-[150px] overflow-visible">
                        <defs>
                          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-brand)" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                        <line x1="30" y1="20" x2="280" y2="20" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3,3" />
                        <line x1="30" y1="70" x2="280" y2="70" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3,3" />
                        <line x1="30" y1="120" x2="280" y2="120" stroke="var(--color-border)" strokeWidth="1" />
                        
                        <text x="10" y="24" fontSize="8" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">150K</text>
                        <text x="10" y="74" fontSize="8" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">75K</text>
                        <text x="15" y="124" fontSize="8" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">0</text>
                        
                        <rect x="65" y="45" width="28" height="75" rx="3" fill="url(#barGrad)" />
                        <text x="68" y="38" fontSize="8" fontWeight="bold" fill="var(--color-text-primary)" fontFamily="var(--font-mono)">125K</text>
                        <text x="63" y="132" fontSize="7" fontWeight="bold" fill="var(--color-text-muted)">Sarah J.</text>
                        
                        <rect x="135" y="25" width="28" height="95" rx="3" fill="url(#barGrad)" />
                        <text x="138" y="18" fontSize="8" fontWeight="bold" fill="var(--color-text-primary)" fontFamily="var(--font-mono)">4.5M</text>
                        <text x="133" y="132" fontSize="7" fontWeight="bold" fill="var(--color-text-muted)">Marques</text>
                        
                        <rect x="205" y="35" width="28" height="85" rx="3" fill="url(#barGrad)" />
                        <text x="208" y="28" fontSize="8" fontWeight="bold" fill="var(--color-text-primary)" fontFamily="var(--font-mono)">2.8M</text>
                        <text x="205" y="132" fontSize="7" fontWeight="bold" fill="var(--color-text-muted)">Emma C.</text>
                      </svg>
                    </div>
                  </Card>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-4 space-y-5">
              <Card variant="standard" className="p-5 space-y-3 bg-surface">
                <h4 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Budget Spend Over Time</h4>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { name: "Dec", actual: 4000, planned: 5000 },
                        { name: "Jan", actual: 8500, planned: 9000 },
                        { name: "Feb", actual: 12000, planned: 12000 },
                        { name: "Mar", actual: 18000, planned: 17000 },
                        { name: "Apr", actual: 25000, planned: 24000 },
                        { name: "May", actual: 48200, planned: 45000 }
                      ]}
                      margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                    >
                      <XAxis dataKey="name" tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "DM Mono" }} />
                      <YAxis tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "DM Mono" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: "8px", boxShadow: "var(--shadow-md)" }}
                        labelStyle={{ fontFamily: "DM Sans", fontWeight: "bold", color: "var(--color-text-primary)" }}
                        itemStyle={{ fontFamily: "DM Mono", fontSize: 11, color: "var(--color-brand)" }}
                      />
                      <Line type="monotone" dataKey="actual" stroke="var(--color-brand)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Actual Spend" />
                      <Line type="monotone" dataKey="planned" stroke="var(--color-text-muted)" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Planned Spend" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Active Creator Roster */}
              <Card variant="standard" className="p-5 space-y-3 bg-surface">
                <h4 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Active Creator Roster</h4>
                <div className="space-y-4">
                  {deals.map((deal) => {
                    const creator = MOCK_DIRECTORY.find(x => x.id === deal.creator_id) || MOCK_DIRECTORY[0];
                    const dealDelivs = deliverables.filter(x => x.deal_id === deal.id);
                    const approvedCount = dealDelivs.filter(x => x.status === 'approved').length;
                    const totalCount = dealDelivs.length || 4;
                    const nextDeliv = dealDelivs.find(x => x.status !== 'approved');

                    let deadlineStatusText = "No deadlines";
                    let deadlineColor = "text-emerald-600";
                    if (nextDeliv) {
                      const diffDays = Math.ceil((new Date(nextDeliv.due_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
                      if (diffDays < 0) {
                        deadlineStatusText = `Overdue by ${Math.abs(diffDays)}d`;
                        deadlineColor = "text-red-500";
                      } else if (diffDays <= 3) {
                        deadlineStatusText = `Due in ${diffDays}d`;
                        deadlineColor = "text-amber-500";
                      } else {
                        deadlineStatusText = `Due in ${diffDays}d`;
                        deadlineColor = "text-[#16A34A]";
                      }
                    }

                    return (
                      <div key={deal.id} className="flex items-start justify-between pb-3 border-b border-border/40 last:pb-0 last:border-b-0 select-none">
                        <div className="flex items-center space-x-3.5 truncate min-w-0">
                          <img src={creator.avatar} alt={creator.name} className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0" />
                          <div className="flex flex-col truncate leading-tight">
                            <span className="font-sans font-semibold text-xs text-text-primary truncate">{creator.name}</span>
                            <span className="font-sans font-normal text-[10px] text-text-muted mt-0.5">{approvedCount}/{totalCount} complete</span>
                            <span className={`font-mono text-[10px] mt-1.5 ${deadlineColor}`}>{deadlineStatusText}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1.5 flex-shrink-0">
                          <StatusBadge status={deal.stage} />
                          <button onClick={() => navigate(`/deals/${deal.id}`)} className="text-[10px] font-semibold text-brand hover:text-brand-dark transition-colors">
                            Message →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* CRM RELATIONSHIP VIEW */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card variant="standard" className="flex items-center space-x-4 p-4 border border-border bg-gradient-to-r from-surface to-brand/5 select-none shadow-sm">
              <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total LTV Spend</span>
                <span data-type="number" className="font-mono text-lg font-bold text-text-primary mt-1.5">
                  ${partnerships.reduce((acc, curr) => acc + curr.total_lifetime_value, 0).toLocaleString()}
                </span>
              </div>
            </Card>

            <Card variant="standard" className="flex items-center space-x-4 p-4 border border-border bg-gradient-to-r from-surface to-amber-500/[0.03] select-none shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Preferred Partners</span>
                <span data-type="number" className="font-mono text-lg font-bold text-text-primary mt-1.5">
                  {preferredCreators.length} creators
                </span>
              </div>
            </Card>

            <Card variant="standard" className="flex items-center space-x-4 p-4 border border-border bg-gradient-to-r from-surface to-emerald-500/[0.03] select-none shadow-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Avg Partner Rating</span>
                <span data-type="number" className="font-mono text-lg font-bold text-text-primary mt-1.5">
                  {partnerships.length > 0 ? (
                    (partnerships.reduce((acc, curr) => {
                      const c = MOCK_DIRECTORY.find(x => x.id === curr.creator_id);
                      return acc + (c ? c.avg_brand_rating : 4.7);
                    }, 0) / partnerships.length).toFixed(1)
                  ) : (
                    "4.8"
                  )} / 5.0
                </span>
              </div>
            </Card>
          </div>

          {/* CRM Creator List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partnerships.map((partner) => {
              const creator = MOCK_DIRECTORY.find(x => x.id === partner.creator_id) || {
                id: partner.creator_id,
                name: "Unknown Creator",
                username: "unknown",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                niche: ["Tech"]
              };
              const isPreferred = preferredCreators.includes(partner.creator_id);
              const isHealthy = partner.partnership_health_score >= 90;

              return (
                <Card
                  key={partner.id}
                  variant="standard"
                  className="p-5 border border-border relative overflow-hidden bg-surface hover:shadow-lg transition-spring hover:-translate-y-0.5 duration-300"
                  style={{
                    borderColor: isPreferred ? "rgba(108, 99, 255, 0.25)" : undefined,
                    boxShadow: isPreferred ? "0 0 0 3px rgba(108, 99, 255, 0.05)" : undefined
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-border/80 flex-shrink-0">
                        <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col leading-tight select-none">
                        <span className="text-sm font-bold text-text-primary sora-heading flex items-center">{creator.name}</span>
                        <span className="text-xs text-text-muted mt-0.5">@{creator.username}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTogglePreferred(partner.creator_id)}
                        className={`p-1.5 rounded-lg border transition-all active:scale-95 ${
                          isPreferred ? "bg-brand/10 border-brand text-brand shadow" : "bg-surface border-border text-text-muted hover:text-text-secondary"
                        }`}
                        title={isPreferred ? "Remove from preferred roster" : "Add to preferred roster"}
                      >
                        <Star className="w-4 h-4 fill-current animate-spring" />
                      </button>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border select-none ${
                        isHealthy ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" : "text-amber-600 bg-amber-500/10 border-amber-500/20"
                      }`}>
                        {isHealthy ? "Healthy" : "At Risk"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {creator.niche.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-surface-2 border border-border text-[9px] font-bold text-text-secondary rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/40 my-4 select-none bg-surface-2/10 rounded-xl p-2.5 text-center">
                    <div className="flex flex-col leading-none">
                      <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Lifetime Value</span>
                      <span className="font-mono text-[11.5px] font-extrabold text-text-primary mt-1.5 flex items-center justify-center">
                        <DollarSign className="w-3.5 h-3.5 text-brand" />
                        {partner.total_lifetime_value.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Collaborations</span>
                      <span className="font-mono text-[11.5px] font-extrabold text-text-primary mt-1.5 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-brand" />
                        {partner.collaborations_count} deals
                      </span>
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Turnaround</span>
                      <span className="font-mono text-[11.5px] font-extrabold text-text-primary mt-1.5 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-brand" />
                        {partner.avg_turnaround_days} days
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-1">
                    <div className="flex flex-col leading-none">
                      <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Turnaround Index</span>
                      <span className="text-[10.5px] text-text-secondary font-bold mt-1">
                        ⚡ {partner.avg_turnaround_days <= 5 ? "Elite Speed" : "Standard Speed"}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleQuickStartRepeat(partner.creator_id, Number((partner.total_lifetime_value / partner.collaborations_count).toFixed(0)), "Integration")}
                      className="px-3.5 py-1.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-[10px] font-bold flex items-center space-x-1.5 transition-all shadow-md active:scale-95 transition-spring hover:-translate-y-0.5 font-sans"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                      <span>Repeat Deal Quick-Start</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Brief Pitch Modal Wizard */}
      {selectedCreator && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedCreator(null);
            setBriefStep(1);
          }}
          title={`Campaign Sponsorship Intake: ${selectedCreator.name}`}
          footer={
            <div className="flex justify-between items-center w-full">
              <div>
                {briefStep > 1 && (
                  <Button variant="secondary" onClick={() => setBriefStep(prev => prev - 1)} className="text-xs font-bold leading-none">
                    Back
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => { setSelectedCreator(null); setBriefStep(1); }} className="text-xs font-bold leading-none">
                  Cancel
                </Button>
                {briefStep < 3 ? (
                  <Button variant="primary" onClick={() => setBriefStep(prev => prev + 1)} className="text-xs font-bold leading-none">
                    Next Step
                  </Button>
                ) : (
                  <Button variant="primary" icon={<Send className="w-3.5 h-3.5" />} onClick={handleSendBriefPitch} className="text-xs font-bold leading-none">
                    Disperse Pitch Proposal
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-5 select-none">
            <div className="flex items-center justify-between pb-4 border-b border-border select-none">
              {[
                { step: 1, label: "Sponsorship Pkg" },
                { step: 2, label: "Campaign Focus" },
                { step: 3, label: "Deliverables" }
              ].map((s, idx) => (
                <React.Fragment key={s.step}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      briefStep === s.step 
                        ? "bg-brand text-white shadow-brand ring-2 ring-brand/20" 
                        : briefStep > s.step 
                          ? "bg-emerald-500 text-white" 
                          : "bg-surface-2 text-text-muted border border-border"
                    }`}>
                      {briefStep > s.step ? "✓" : s.step}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${briefStep === s.step ? "text-brand" : "text-text-muted"}`}>{s.label}</span>
                  </div>
                  {idx < 2 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${briefStep > s.step ? "bg-emerald-500" : "bg-border"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {briefStep === 1 && (
              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold text-text-secondary block">Step 1: Select Desired Package</span>
                <div className="flex flex-col gap-2.5">
                  {[
                    { id: "bronze", name: "Bronze (30s Mid-Roll)", price: 3500, desc: "A 30-45s mid-roll integration in a standard tech/lifestyle video." },
                    { id: "silver", name: "Silver (Dedicated Video)", price: 7000, desc: "Full dedicated video focusing entirely on the sponsor's product/service." },
                    { id: "gold", name: "Gold (Social Cross-Post)", price: 9500, desc: "Dedicated video plus TikTok and YouTube Shorts cross-post packages." }
                  ].map((pkg) => {
                    const isSelected = briefPackage === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => {
                          setBriefPackage(pkg.id);
                          setBriefRate(pkg.price);
                        }}
                        className={`p-4 border rounded-2xl cursor-pointer transition-all duration-300 active:scale-98 ${
                          isSelected 
                            ? "border-brand bg-brand-light/20 shadow-md hover:-translate-y-0.5" 
                            : "border-border hover:border-text-muted bg-surface hover:-translate-y-0.5 hover:shadow-sm"
                        }`}
                        style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                      >
                        <div className="flex justify-between items-center leading-none">
                          <span className="text-xs font-bold text-text-primary">{pkg.name}</span>
                          <span className="font-mono text-xs font-bold text-brand">${pkg.price.toLocaleString()}</span>
                        </div>
                        <p className="text-[10px] text-text-secondary mt-1.5 leading-relaxed">{pkg.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {briefStep === 2 && (
              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold text-text-secondary block">Step 2: Campaign Deadlines & Focus</span>
                <InputField
                  label="Target Integration/Post Date"
                  type="date"
                  value={briefDate}
                  onChange={(e) => setBriefDate(e.target.value)}
                />
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase">Campaign Core Objective</label>
                  <select
                    value={briefObjective}
                    onChange={(e) => setBriefObjective(e.target.value)}
                    className="h-10 border border-border bg-surface rounded-xl px-3 text-xs font-semibold text-text-primary outline-none focus:border-brand"
                  >
                    <option value="awareness">Brand Awareness (Impressions)</option>
                    <option value="conversions">Direct Conversions (Sales/Leads)</option>
                    <option value="launch">Product Launch Burst</option>
                  </select>
                </div>
              </div>
            )}

            {briefStep === 3 && (
              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold text-text-secondary block">Step 3: Script Hooks & Deliverables</span>
                <InputField
                  label="Sponsorship Budget Offer ($) (Customizable)"
                  type="number"
                  value={briefRate}
                  onChange={(e) => setBriefRate(Number(e.target.value))}
                />
                <InputField
                  label="Brief Description & Details"
                  value={briefDetails}
                  onChange={(e) => setBriefDetails(e.target.value)}
                  placeholder="Outline core sponsorship brief parameters, integration details..."
                  textarea
                  rows={2}
                />
                <InputField
                  label="Script Key Hooks & Hooks Text"
                  value={briefHooks}
                  onChange={(e) => setBriefHooks(e.target.value)}
                  placeholder="e.g., Explain standard pain points and detail the product value proposition..."
                  textarea
                  rows={2}
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};