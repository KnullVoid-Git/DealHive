import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Briefcase,
  Inbox,
  AlertCircle,
  Youtube,
  DollarSign,
  Eye,
  Lock,
  Globe
} from 'lucide-react';
import { convexClient as supabaseClient } from '../services/convex';
import { Deal, DealHiveNotification, Deliverable, CreatorProfile } from '../types/supabase.types';
import { 
  Card, 
  ShimmerSkeleton,
  Button,
  Modal
} from '../components';
import { useDashboardEntrance } from '../hooks/useDashboardEntrance';
import { useCountUp } from '../hooks/useCountUp';
import { toast } from 'react-hot-toast';

// Inline Calendar Widget from compiled 'az' component
interface CalendarWidgetProps {
  deliverables: Deliverable[];
  onSelectDate: (date: string) => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ deliverables, onSelectDate }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const startDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const days: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  return (
    <div className="w-[180px] bg-surface select-none text-[10px]">
      <div className="font-bold text-center mb-1 text-text-primary sora-heading uppercase tracking-wider text-[9px]">
        {months[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-text-muted text-[8px] mb-1">
        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((day, idx) => {
          if (day === null) return <div key={idx} className="h-4" />;
          
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hasDeliverable = deliverables.some(d => d.due_date && d.due_date.startsWith(dateStr));
          const isToday = day === today.getDate();

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(dateStr)}
              className={`relative cursor-pointer py-0.5 rounded-sm flex flex-col items-center justify-center font-mono ${
                isToday 
                  ? "bg-brand text-white font-bold" 
                  : "hover:bg-surface-2 text-text-secondary"
              }`}
            >
              <span>{day}</span>
              {hasDeliverable && !isToday && (
                <span className="absolute bottom-[1px] w-1 h-1 rounded-full bg-brand" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [notifications, setNotifications] = useState<DealHiveNotification[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [attentionCount, setAttentionCount] = useState(3);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  
  // Onboarding Wizard States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [ytUrl, setYtUrl] = useState("https://youtube.com/@sarah_creates");
  const [linkingChannel, setLinkingChannel] = useState(false);
  const [rateCard, setRateCard] = useState({ integration: 3500, dedicated: 7000, shorts: 1500 });
  const [profileVisibility, setProfileVisibility] = useState<"public" | "private">("public");
  
  // Security Checks
  const [is2faEnabled, setIs2faEnabled] = useState<boolean>(localStorage.getItem("dealhive_2fa_enabled") === "true");

  useEffect(() => {
    const handle2faChange = () => {
      setIs2faEnabled(localStorage.getItem("dealhive_2fa_enabled") === "true");
    };
    window.addEventListener("2fa-change", handle2faChange);
    return () => window.removeEventListener("2fa-change", handle2faChange);
  }, []);

  // Stagger entrance transitions
  useDashboardEntrance();

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      try {
        const d = await supabaseClient.deals.list();
        setDeals(d);
        const n = await supabaseClient.notifications.list();
        setNotifications(n);

        const activeDeals = d.filter(dl => dl.stage !== 'completed');
        let allDels: Deliverable[] = [];
        for (const dl of activeDeals) {
          const ds = await supabaseClient.deliverables.list(dl.id);
          allDels = [...allDels, ...ds];
        }
        setDeliverables(allDels);

        const pendingDels = allDels.filter(ds => ds.status === 'pending');
        const unreadNotifs = n.filter(no => !no.is_read);
        setAttentionCount(pendingDels.length + unreadNotifs.length);

        const profile = await supabaseClient.profiles.getCreator();
        setCreatorProfile(profile);

        if (profile && !profile.youtube_connected && localStorage.getItem("dealhive_onboarded") !== "true") {
          setShowOnboarding(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleOnboardingSubmit = async () => {
    if (onboardingStep === 1) {
      setLinkingChannel(true);
      setTimeout(() => {
        setLinkingChannel(false);
        setOnboardingStep(2);
        toast.success("Successfully linked YouTube statistics channel!");
      }, 1200);
    } else if (onboardingStep === 2) {
      setOnboardingStep(3);
    } else {
      try {
        if (creatorProfile) {
          await supabaseClient.profiles.updateCreator({
            youtube_connected: true,
            rate_card: {
              ...creatorProfile.rate_card,
              integration: rateCard.integration,
              dedicated: rateCard.dedicated,
              shorts: rateCard.shorts,
              social_package: rateCard.integration + rateCard.shorts,
              exclusivity_premium: 20
            },
            visibility: profileVisibility
          });
        }
        localStorage.setItem("dealhive_onboarded", "true");
        setShowOnboarding(false);
        toast.success("Onboarding complete! Your profile is ready.");
      } catch (e) {
        console.error(e);
        toast.error("Failed to save profile configurations.");
      }
    }
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    return hr >= 5 && hr < 12 ? "Good morning" : hr >= 12 && hr < 17 ? "Good afternoon" : hr >= 17 && hr < 21 ? "Good evening" : "Hey";
  };

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString("en-US", options);
  };

  const activeCount = deals.filter(d => d.stage !== 'completed').length;
  const inboxPitchesCount = notifications.filter(n => n.title.toLowerCase().includes("pitch") && !n.is_read).length;

  const totalEarningsVal = deals.length === 0 ? 0 : 48200;
  const pendingInvoicesVal = deals.length === 0 ? 0 : 6400;
  const activeSponsorshipsVal = deals.length === 0 ? 0 : 12100;
  const projectedEarningsVal = deals.length === 0 ? 0 : 19800;

  // Animate numbers using useCountUp
  const earningsCount = useCountUp(loading ? 0 : totalEarningsVal);
  const pendingCount = useCountUp(loading ? 0 : pendingInvoicesVal);
  const sponsorshipsCount = useCountUp(loading ? 0 : activeSponsorshipsVal);
  const projectedCount = useCountUp(loading ? 0 : projectedEarningsVal);

  const scheduleEvents = [
    { time: "10:00 AM", type: "Brand call/meeting", title: "Samsung S26 Brief alignment", subtitle: "Brand manager · Samsung", tag: "Call", color: "var(--color-info)" },
    ...deliverables.map(d => ({
      time: "04:00 PM",
      type: d.status === 'pending' ? 'Draft deadline' : 'Internal review',
      title: d.name,
      subtitle: "Deal Deliverable · Due Today",
      tag: d.status === 'pending' ? 'Draft Due' : 'Review',
      color: d.status === 'pending' ? 'var(--color-warning)' : 'var(--color-brand)'
    }))
  ].slice(0, 3);

  const getTopPriorityAction = () => {
    const negotiatingOrRevisionDeals = deals.filter(d => d.stage === 'negotiating' || d.stage === 'revisions');
    if (negotiatingOrRevisionDeals.length > 0) {
      const topDeal = negotiatingOrRevisionDeals[0];
      return {
        isUrgent: true,
        title: `Action Required: Brand proposal for "${topDeal.title}"`,
        subtitle: "Review terms changes and e-sign signature parameters.",
        link: `/deals/${topDeal.id}`
      };
    }
    return {
      isUrgent: false,
      title: "You're all caught up",
      subtitle: "No urgent deliverables due today. Nice work!",
      link: null
    };
  };

  const priorityAction = getTopPriorityAction();

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'completed': return 'var(--color-success)';
      case 'negotiating': return 'var(--color-brand)';
      case 'revisions': return 'var(--color-danger)';
      case 'draft_submitted': return '#7C3AED';
      case 'approved': return '#059669';
      default: return 'var(--color-warning)';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-6 w-full max-w-[1140px] mx-auto py-7 px-8">
        <ShimmerSkeleton width="340px" height="32px" />
        <ShimmerSkeleton width="220px" height="18px" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <ShimmerSkeleton height="80px" />
          <ShimmerSkeleton height="80px" />
          <ShimmerSkeleton height="80px" />
          <ShimmerSkeleton height="80px" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          <div className="lg:col-span-8 space-y-6">
            <ShimmerSkeleton height="280px" />
            <ShimmerSkeleton height="220px" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <ShimmerSkeleton height="180px" />
            <ShimmerSkeleton height="240px" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1140px] mx-auto py-7 px-8 space-y-6 select-none">
      {/* Greetings Block */}
      <div className="animate-stagger-item flex flex-col">
        <h2 className="text-2xl font-bold text-text-primary sora-heading leading-tight flex items-center">
          {getGreeting()}, Sarah 👋
        </h2>
        <p className="text-xs text-text-muted mt-1.5 flex items-center leading-none">
          {getFormattedDate()} <span className="mx-2 text-text-faint">·</span>
          <span data-type="number" className="font-mono text-brand font-bold mr-1">{attentionCount}</span> items need your attention today
        </p>
      </div>

      {/* 2FA Warning Banner */}
      {!is2faEnabled && (
        <div className="animate-stagger-item rounded-xl p-4 border border-warning-border border-l-4 border-l-warning bg-warning-bg flex flex-col md:flex-row md:items-center md:justify-between transition-spring hover:-translate-y-0.5 hover:shadow-md shadow-sm duration-300">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 flex-shrink-0 text-warning animate-pulse">
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-xs font-bold uppercase tracking-wider text-warning">Security Warning</h4>
              <span className="text-sm font-bold text-text-primary mt-1.5 sora-heading">Two-Factor Authentication (2FA) is Disabled</span>
              <span className="text-xs text-text-secondary mt-1">Your account handles legal contracts and sponsor payouts. We strongly recommend enabling 2FA immediately inside settings.</span>
            </div>
          </div>
          <button 
            onClick={() => navigate("/settings")}
            className="mt-3 md:mt-0 px-4 py-2 bg-warning hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-md shadow-warning/20 active:scale-95 transition-spring hover:-translate-y-0.5"
          >
            Enable 2FA
          </button>
        </div>
      )}

      {/* Stats Widgets */}
      <div className="animate-stagger-item grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface border border-border p-4 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3 px-2 border-r border-border last:border-0">
          <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand flex-shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span data-type="number" className="font-mono text-sm font-bold text-text-primary leading-tight">
              {deals.length === 0 ? 0 : activeCount}
            </span>
            <span className="text-[10px] text-text-muted mt-0.5 leading-none">Active Deals</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 px-2 md:border-r border-border last:border-0">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
            <Inbox className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span data-type="number" className="font-mono text-sm font-bold text-text-primary leading-tight">
              {deals.length === 0 ? 0 : inboxPitchesCount || 3}
            </span>
            <span className="text-[10px] text-text-muted mt-0.5 leading-none">Inbox Pitches</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 px-2 border-r border-border last:border-0">
          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span data-type="number" className="font-mono text-sm font-bold text-text-primary leading-tight">
              {deals.length === 0 ? 0 : 2}
            </span>
            <span className="text-[10px] text-text-muted mt-0.5 leading-none">Due This Week</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 px-2 last:border-0">
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span data-type="number" className="font-mono text-sm font-bold text-text-primary leading-tight">
              {deals.length === 0 ? 0 : 5}
            </span>
            <span className="text-[10px] text-text-muted mt-0.5 leading-none">Shipped Deals</span>
          </div>
        </div>
      </div>

      {/* Priority Action Status Card */}
      <div className={`animate-stagger-item rounded-xl p-4 border border-l-4 flex flex-col md:flex-row md:items-center md:justify-between transition-all duration-300 ${
        deals.length > 0 && priorityAction.isUrgent 
          ? "bg-warning-bg border-warning-border border-l-warning" 
          : "bg-success-bg border-success-border border-l-success"
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`mt-0.5 flex-shrink-0 ${deals.length > 0 && priorityAction.isUrgent ? "text-warning" : "text-success"}`}>
            {deals.length > 0 && priorityAction.isUrgent ? (
              <AlertCircle className="w-4.5 h-4.5 fill-current" />
            ) : (
              <CheckCircle2 className="w-4.5 h-4.5" />
            )}
          </div>
          <div className="flex flex-col">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${deals.length > 0 && priorityAction.isUrgent ? "text-warning" : "text-success"}`}>
              {deals.length > 0 && priorityAction.isUrgent ? "Top Priority Today" : "All Clear"}
            </h4>
            <span className="text-sm font-bold text-text-primary mt-1.5 sora-heading">
              {deals.length === 0 ? "You're all caught up" : priorityAction.title}
            </span>
            <span className="text-xs text-text-secondary mt-1">
              {deals.length === 0 ? "No urgent deliverables due today. Nice work!" : priorityAction.subtitle}
            </span>
          </div>
        </div>
        {deals.length > 0 && priorityAction.link && (
          <button 
            onClick={() => navigate(priorityAction.link!)}
            className="mt-3 md:mt-0 flex items-center text-brand font-semibold hover:text-brand-dark transition-colors text-xs leading-none"
          >
            View Deal <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        )}
      </div>

      {/* Pinned / Recent Deals */}
      <div className="animate-stagger-item space-y-3">
        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-text-primary leading-tight select-none">Pinned & Recent</h3>
          <span className="text-[11px] text-text-muted mt-0.5">Quickly jump back into the deals you opened recently</span>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-2 scroll-smooth no-scrollbar">
          {deals.length === 0 ? (
            <div 
              onClick={() => navigate("/deals")}
              className="flex-shrink-0 w-[200px] h-[104px] border border-dashed border-border hover:border-brand/40 hover:bg-brand-light/10 cursor-pointer rounded-xl flex flex-col items-center justify-center p-4 transition-all duration-150 select-none group"
            >
              <div className="w-8 h-8 rounded-full border border-dashed border-border group-hover:border-brand/40 flex items-center justify-center text-text-muted group-hover:text-brand transition-colors mb-2">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-text-secondary group-hover:text-brand transition-colors">
                + Start a Campaign
              </span>
            </div>
          ) : (
            deals.slice(0, 5).map(deal => (
              <div 
                key={deal.id}
                onClick={() => navigate(`/deals/${deal.id}`)}
                className="flex-shrink-0 w-[200px] bg-surface hover:bg-surface-2/30 border border-border hover:border-border-strong hover:shadow-md cursor-pointer rounded-xl p-4 transition-all duration-150"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-md bg-brand-light flex items-center justify-center font-bold text-[9px] text-brand border border-brand/10 flex-shrink-0">
                    {deal.title.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-text-primary truncate">{deal.title}</span>
                </div>
                <p className="text-[10px] text-text-muted mt-3 font-semibold truncate leading-none">
                  Stage: <span className="capitalize font-bold" style={{ color: getStageColor(deal.stage) }}>
                    {deal.stage.replace("_", " ")}
                  </span>
                </p>
                <p data-type="number" className="font-mono text-[9px] text-text-faint mt-1.5 leading-none">
                  Opened 3h ago
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Bottom Section: Earnings Snapshot + Schedule Widget */}
      <div className="animate-stagger-item grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Earnings Card (Left Column) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-text-primary sora-heading">Earnings Snapshot Overview</h3>
            <span className="text-[11px] text-text-muted mt-0.5">Summary of revenue streams and projected earnings</span>
          </div>

          <Card variant="standard" className="p-6">
            {deals.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 select-none">
                <div className="w-12 h-12 rounded-full bg-brand-light/30 flex items-center justify-center text-brand mb-3">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">
                  Sponsorship Earnings Overview (Empty State)
                </h4>
                <p className="text-[11px] text-text-muted mt-1 max-w-[280px] leading-relaxed">
                  Your sponsorship earnings overview is currently empty. Once deals are finalized and payouts are processed, your financials will show here.
                </p>
                <Button 
                  variant="primary" 
                  className="mt-4 text-xs" 
                  onClick={() => navigate("/deals")}
                >
                  + Create First Deal
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Earnings</span>
                    <span data-type="number" className="font-mono text-lg font-bold text-text-primary mt-1">
                      ${earningsCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Pending Invoices</span>
                    <span data-type="number" className="font-mono text-lg font-bold text-text-primary mt-1">
                      ${pendingCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Active Deals Value</span>
                    <span data-type="number" className="font-mono text-lg font-bold text-text-primary mt-1">
                      ${sponsorshipsCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Projected Revenue</span>
                    <span data-type="number" className="font-mono text-lg font-bold text-text-primary mt-1">
                      ${projectedCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Calendar & Schedule Widget (Right Column) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-text-primary sora-heading">Today's Schedule</h3>
              <span className="text-[11px] text-text-muted mt-0.5">
                {deals.length === 0 ? 0 : scheduleEvents.length} events · Sunday, May 31
              </span>
            </div>
            <button 
              onClick={() => navigate("/calendar")}
              className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
            >
              View all
            </button>
          </div>

          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
            {deals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center select-none">
                <div className="w-12 h-12 rounded-full bg-brand-light/30 flex items-center justify-center text-brand mb-3">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">
                  Clear Schedule Today
                </h4>
                <p className="text-[11px] text-text-muted mt-1 max-w-[280px] leading-relaxed">
                  No deliverables, script approvals, or integration content publication deadlines are scheduled for today.
                </p>
                <button 
                  onClick={() => navigate("/calendar")}
                  className="mt-3 text-[10px] font-bold text-brand hover:underline"
                >
                  Go to Calendar
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {scheduleEvents.map((evt, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between h-[60px] pr-5 pl-4 hover:bg-surface-2/20 transition-colors leading-none"
                    style={{ borderLeft: `3px solid ${evt.color}` }}
                  >
                    <div className="flex items-center">
                      <span data-type="number" className="font-mono text-xs font-bold text-text-muted w-14 flex-shrink-0">
                        {evt.time}
                      </span>
                      <div className="flex flex-col ml-3">
                        <span className="text-xs font-bold text-text-primary leading-tight">
                          {evt.title}
                        </span>
                        <span className="text-[10px] text-text-muted mt-1">
                          {evt.subtitle}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mini Calendar Widget Card */}
          <div className="flex justify-center bg-surface border border-border rounded-xl p-4 shadow-sm">
            <CalendarWidget 
              deliverables={deliverables} 
              onSelectDate={(date) => navigate(`/calendar?date=${date}`)} 
            />
          </div>
        </div>
      </div>

      {/* Onboarding Setup Modal (Step 1 of 3) */}
      {showOnboarding && (
        <Modal
          isOpen={true}
          onClose={() => {}}
          title={`DealHive Creator Onboarding Setup (Step ${onboardingStep} of 3)`}
          footer={
            <div className="flex justify-between items-center w-full">
              <div>
                {onboardingStep > 1 && (
                  <Button 
                    variant="secondary" 
                    onClick={() => setOnboardingStep(prev => prev - 1)}
                  >
                    Back
                  </Button>
                )}
              </div>
              <Button 
                variant="primary" 
                onClick={handleOnboardingSubmit}
                disabled={linkingChannel}
              >
                {linkingChannel ? "Linking Channel..." : onboardingStep === 3 ? "Launch Dashboard" : "Next Step"}
              </Button>
            </div>
          }
        >
          <div className="space-y-5 py-2 select-none">
            {/* Step Indicators */}
            <div className="flex items-center justify-between border-b border-border pb-3 mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${onboardingStep >= 1 ? "text-brand" : "text-text-muted"}`}>
                1. YT Link
              </span>
              <div className="w-6 h-px bg-border" />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${onboardingStep >= 2 ? "text-brand" : "text-text-muted"}`}>
                2. Rate Configuration
              </span>
              <div className="w-6 h-px bg-border" />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${onboardingStep >= 3 ? "text-brand" : "text-text-muted"}`}>
                3. Kit Visibility
              </span>
            </div>

            {/* Step 1: YT Link */}
            {onboardingStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-brand">
                  <Youtube className="w-5 h-5" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Connect YouTube Statistics</h4>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Integrate your active channel data to dynamically import subscribers count, average views, and content demographic indexes. This provides verified stats to top-tier brands automatically.
                </p>
                <div>
                  <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">
                    YouTube Channel Handle / URL
                  </label>
                  <input
                    type="text"
                    value={ytUrl}
                    onChange={e => setYtUrl(e.target.value)}
                    placeholder="@sarah_creates or https://youtube.com/..."
                    className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-xs outline-none focus:border-brand shadow-sm font-semibold"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleOnboardingSubmit}
                  className="w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all transform active:scale-98"
                >
                  <Youtube className="w-4.5 h-4.5 animate-pulse" />
                  <span>{linkingChannel ? "Linking with OAuth Protocol..." : "Authenticate Channel via OAuth"}</span>
                </button>
              </div>
            )}

            {/* Step 2: Rate Card Configuration */}
            {onboardingStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-brand">
                  <DollarSign className="w-5 h-5" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Configure Rate Cards</h4>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Set baseline sponsorship pricing ranges for campaigns. These rates will populate contract terms and brand pitch proposals automatically.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">Integration Rate ($)</label>
                    <input 
                      type="number" 
                      value={rateCard.integration} 
                      onChange={e => setRateCard({ ...rateCard, integration: Number(e.target.value) })}
                      className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-xs outline-none focus:border-brand shadow-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">Dedicated Video ($)</label>
                    <input 
                      type="number" 
                      value={rateCard.dedicated} 
                      onChange={e => setRateCard({ ...rateCard, dedicated: Number(e.target.value) })}
                      className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-xs outline-none focus:border-brand shadow-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">Shorts / Reels ($)</label>
                    <input 
                      type="number" 
                      value={rateCard.shorts} 
                      onChange={e => setRateCard({ ...rateCard, shorts: Number(e.target.value) })}
                      className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-xs outline-none focus:border-brand shadow-sm font-semibold"
                    />
                  </div>
                </div>
                <div className="p-3 bg-brand/5 border border-brand/10 rounded-lg text-[10px] leading-relaxed text-text-secondary flex items-start space-x-2">
                  <TrendingUp className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                  <span>
                    <span className="font-bold text-brand">AI Suggested Rates:</span> Based on your Tech / Lifestyle niche benchmarks in the 100k-500k tier, we recommend starting with an Integration rate of <span className="font-bold text-text-primary">$3,500</span> and Dedicated rate of <span className="font-bold text-text-primary">$7,000</span>.
                  </span>
                </div>
              </div>
            )}

            {/* Step 3: Visibility Configuration */}
            {onboardingStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-brand">
                  <Eye className="w-5 h-5" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Set Directory Visibility</h4>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Decide who can discover your creator profile and linked stats channels in the DealHive public discovery directory.
                </p>
                <div className="space-y-3">
                  <div 
                    onClick={() => setProfileVisibility("public")}
                    className={`p-4 border rounded-xl cursor-pointer transition-all flex items-start space-x-3 ${
                      profileVisibility === "public" ? "border-brand bg-brand-light/10" : "border-border hover:bg-surface-2/30"
                    }`}
                  >
                    <Globe className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col leading-tight select-none">
                      <span className="text-xs font-bold text-text-primary">Public Visibility (Recommended)</span>
                      <span className="text-[10px] text-text-muted mt-1 leading-normal">
                        Showcase your media kit and rate cards in DealHive's public search directory. Allows verified brands to search and pitch directly.
                      </span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setProfileVisibility("private")}
                    className={`p-4 border rounded-xl cursor-pointer transition-all flex items-start space-x-3 ${
                      profileVisibility === "private" ? "border-brand bg-brand-light/10" : "border-border hover:bg-surface-2/30"
                    }`}
                  >
                    <Lock className="w-5 h-5 text-text-secondary flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col leading-tight select-none">
                      <span className="text-xs font-bold text-text-primary">Private Visibility</span>
                      <span className="text-[10px] text-text-muted mt-1 leading-normal">
                        Only accessible via direct deal pitch invite link. Hide stats channel from search listings and discovery algorithms.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};