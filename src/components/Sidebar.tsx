import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  Calendar,
  FileText,
  CreditCard,
  UserCircle,
  Settings,
  Building2,
  Search,
  Bell,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { convexClient as supabaseClient } from '../services/convex';
import { Deal, DealHiveNotification } from '../types/supabase.types';
import { Modal } from './Modal';
import { StatusBadge } from './StatusBadge';
import { toast } from 'react-hot-toast';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeDeals, setActiveDeals] = useState<Deal[]>([]);
  const [role, setRole] = useState<'creator' | 'brand'>('creator');
  const [subscribers, setSubscribers] = useState('385K');
  const [dealsExpanded, setDealsExpanded] = useState<boolean>(() => localStorage.getItem('dealhive_sidebar_active_deals_expanded') !== 'false');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<DealHiveNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [teamRole, setTeamRole] = useState<string | null>(localStorage.getItem('dealhive_team_role'));
  const [theme, setTheme] = useState<string>(localStorage.getItem('dealhive_theme') || 'light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<DealHiveNotification>;
      setNotifications(prev => [customEvent.detail, ...prev].slice(0, 20));
    };
    window.addEventListener('notification-triggered', handleNotification);
    return () => window.removeEventListener('notification-triggered', handleNotification);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dealhive_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!showNotifications) return;
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notifications-popup') && !target.closest('.bell-trigger')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [showNotifications]);

  const loadSessionDetails = async () => {
    try {
      const allDeals = await supabaseClient.deals.list();
      setActiveDeals(allDeals.filter(d => d.stage !== 'completed').slice(0, 5));
      const profile = await supabaseClient.profiles.getCreator();
      if (profile) {
        setSubscribers(profile.subscription_plan === 'free' ? 'Free Plan' : Math.round((profile.youtube_stats?.subscriber_count || 0) / 1000) + 'K');
      }
      setRole(supabaseClient.auth.getRole());
      setTeamRole(localStorage.getItem('dealhive_team_role'));
      const notifs = await supabaseClient.notifications.list();
      setNotifications(notifs.slice(0, 20));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSessionDetails();
    const handleAuthChange = () => {
      loadSessionDetails();
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleRoleToggle = () => {
    const newRole = role === 'creator' ? 'brand' : 'creator';
    supabaseClient.auth.setRole(newRole);
    navigate(newRole === 'creator' ? '/' : '/brand/dashboard');
  };

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    navigate('/');
  };

  // Nav Groups matching design spec Section 5.3
  const creatorNavGroups = [
    {
      label: "Main",
      items: [
        { label: "Dashboard", path: "/", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Inbox", path: "/inbox", icon: <Inbox className="w-4 h-4" />, badge: 1 }
      ]
    },
    {
      label: "Deals",
      items: [
        { label: "My Deals", path: "/deals", icon: <Briefcase className="w-4 h-4" /> },
        { label: "Calendar", path: "/calendar", icon: <Calendar className="w-4 h-4" /> }
      ]
    },
    {
      label: "Brands & Money",
      items: [
        { label: "Contracts", path: "/contracts", icon: <FileText className="w-4 h-4" /> },
        { label: "Payments", path: "/payments", icon: <CreditCard className="w-4 h-4" /> },
        { label: "Explore Brands", path: "/creator/explore", icon: <Building2 className="w-4 h-4" /> }
      ]
    },
    {
      label: "Profile",
      items: [
        { label: "My Profile", path: "/profile", icon: <UserCircle className="w-4 h-4" /> },
        { label: "Settings", path: "/settings", icon: <Settings className="w-4 h-4" /> }
      ]
    }
  ];

  const brandNavGroups = [
    {
      label: "Main Command",
      items: [
        { label: "Campaigns Dashboard", path: "/brand/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Inbox Pitches", path: "/inbox", icon: <Inbox className="w-4 h-4" /> }
      ]
    },
    {
      label: "Discovery & Partners",
      items: [
        { label: "Creator Marketplace", path: "/brand/directory", icon: <Building2 className="w-4 h-4" /> },
        { label: "Incoming Offers", path: "/brand/offers", icon: <Inbox className="w-4 h-4" /> },
        { label: "Team Management", path: "/brand/team", icon: <UserCircle className="w-4 h-4" /> }
      ]
    },
    {
      label: "Campaign Assets",
      items: [
        { label: "Sponsorship Briefs", path: "/brand/briefs", icon: <FileText className="w-4 h-4" /> }
      ]
    },
    {
      label: "Legal & Finance",
      items: [
        { label: "Contracts Ledger", path: "/contracts", icon: <FileText className="w-4 h-4" /> },
        { label: "Spends & Payments", path: "/payments", icon: <CreditCard className="w-4 h-4" /> },
        { label: "Settings", path: "/brand/settings", icon: <Settings className="w-4 h-4" /> }
      ]
    }
  ];

  // Filtering based on role permissions
  const filteredCreatorGroups = creatorNavGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      // Basic role constraints
      if (teamRole === 'va' && (item.path === '/settings' || item.path === '/profile')) return false;
      if (teamRole === 'accountant' && (item.path === '/inbox' || item.path === '/deals' || item.path === '/profile' || item.path === '/settings' || item.path === '/calendar')) return false;
      return true;
    })
  })).filter(group => group.items.length > 0);

  const activeGroups = role === 'creator' ? filteredCreatorGroups : brandNavGroups;

  const getStageColorClass = (stage: string) => {
    switch (stage) {
      case 'completed': return 'bg-success';
      case 'negotiating': return 'bg-brand';
      case 'revisions': return 'bg-danger';
      case 'draft_submitted': return 'bg-purple-500';
      case 'approved': return 'bg-emerald-500';
      default: return 'bg-warning';
    }
  };

  return (
    <div className="w-[240px] h-screen bg-sidebar-bg border-r border-border flex flex-col flex-shrink-0 relative select-none">
      {/* Brand Header */}
      <div className="h-14 px-5 border-b border-border flex items-center space-x-2.5">
        <div 
          className="w-[22px] h-[22px] bg-brand flex items-center justify-center flex-shrink-0"
          style={{ clipPath: "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)" }}
        >
          <div 
            className="w-[14px] h-[14px] bg-sidebar-bg"
            style={{ clipPath: "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)" }}
          />
        </div>
        <span className="text-base font-bold text-text-primary sora-heading leading-none pt-0.5 tracking-tight">
          DealHive
        </span>
      </div>

      {/* Search Input Button */}
      <div className="px-4 py-3 border-b border-border">
        <div 
          onClick={() => setShowSearch(true)}
          className="relative h-[34px] w-full bg-surface-2 border border-border rounded-md px-3 flex items-center justify-between group hover:border-brand-dark transition-colors duration-150 cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-text-muted">
            <Search className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium tracking-[0.01em]">Search...</span>
          </div>
          <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 border border-border rounded bg-surface text-text-muted">
            ⌘K
          </span>
        </div>
      </div>

      {/* Navigation Links List */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-5 no-scrollbar">
        {activeGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-col space-y-1">
            <span className="px-3.5 pb-1 text-[9px] font-bold text-text-muted uppercase tracking-[0.08em]">
              {group.label}
            </span>
            {group.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `group relative h-[34px] flex items-center justify-between px-3.5 mx-1.5 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-md text-xs font-semibold leading-none ${
                    isActive 
                      ? "bg-surface shadow-sm border border-border/40 text-brand font-bold" 
                      : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                  }`
                }
                style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-2.5">
                      <span className={isActive ? "text-brand" : "text-text-muted group-hover:text-text-secondary transition-colors"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {(item as any).badge && (item as any).badge > 0 ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono bg-brand text-white rounded-full leading-none scale-90">
                        {(item as any).badge}
                      </span>
                    ) : null}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}

        {/* Creator Active Deals Sub-menu */}
        {role === 'creator' && activeDeals.length > 0 && (
          <div className="pt-2 flex flex-col space-y-1 border-t border-border mt-4">
            <div 
              onClick={() => {
                const newVal = !dealsExpanded;
                setDealsExpanded(newVal);
                localStorage.setItem('dealhive_sidebar_active_deals_expanded', String(newVal));
              }}
              className="px-3.5 pb-1.5 flex items-center justify-between cursor-pointer group select-none text-[9px] font-bold text-text-muted uppercase tracking-[0.08em] hover:text-text-primary"
            >
              <span>Active Deals</span>
              {dealsExpanded ? <ChevronUp className="w-3 h-3 text-text-muted" /> : <ChevronDown className="w-3 h-3 text-text-muted" />}
            </div>
            
            {dealsExpanded && activeDeals.map(deal => (
              <NavLink
                key={deal.id}
                to={`/deals/${deal.id}`}
                className="group flex items-center justify-between h-[30px] px-3.5 mx-1.5 text-[11px] font-semibold text-text-secondary hover:bg-surface-2 hover:text-text-primary rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-md truncate"
                style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
              >
                <div className="flex items-center space-x-2 truncate">
                  <div className={`w-2 h-2 rounded-full ${getStageColorClass(deal.stage)}`} />
                  <span className="truncate max-w-[140px]">{deal.title}</span>
                </div>
                <span className="text-[10px] text-text-faint group-hover:text-brand transition-colors">→</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Role Switcher Action */}
      <div className="p-3 border-t border-border">
        <button
          onClick={handleRoleToggle}
          className="w-full flex items-center justify-between px-3 py-2 bg-surface-2 hover:bg-brand-light/30 border border-border hover:border-brand/20 rounded-md transition-all text-left text-[11px] font-bold uppercase tracking-wider text-text-secondary select-none"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>Switch to {role === 'creator' ? 'Brand' : 'Creator'}</span>
          </div>
        </button>
      </div>

      {/* User Footer Profile Panel */}
      <div className="h-14 px-4 border-t border-border flex items-center justify-between bg-surface-2/40">
        <div className="flex items-center space-x-2.5 truncate">
          <div className="w-[28px] h-[28px] rounded-full overflow-hidden bg-brand-light flex items-center justify-center font-bold text-xs text-brand border border-brand/10 flex-shrink-0">
            {role === 'creator' ? (
              teamRole ? (
                <div className="w-full h-full bg-brand flex items-center justify-center text-white font-bold text-[10px]">
                  {teamRole.substring(0, 2).toUpperCase()}
                </div>
              ) : (
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" alt="Sarah" />
              )
            ) : "S"}
          </div>
          <div className="flex flex-col truncate leading-tight select-none">
            <span className="text-xs font-semibold text-text-primary leading-tight truncate">
              {teamRole ? localStorage.getItem('dealhive_user_name') || 'Jane Doe' : (role === 'creator' ? 'Sarah Jenkins' : 'Samsung')}
            </span>
            <span className="text-[9.5px] text-text-muted mt-1 leading-none font-medium truncate">
              {teamRole ? `${teamRole} at ${role === 'creator' ? 'Sarah Jenkins' : 'Samsung'}` : (role === 'creator' ? `${subscribers} Subscribers` : 'Enterprise Partner')}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0">
          <button 
            onClick={() => setShowNotifications(prev => !prev)}
            className="bell-trigger text-text-muted hover:text-brand p-1 rounded-full hover:bg-surface-2 transition-colors relative"
            title="Notifications Feed"
          >
            <Bell className="w-4 h-4" />
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 ring-2 ring-surface animate-pulse" />
            )}
          </button>
          
          <button 
            onClick={toggleTheme}
            className="text-text-muted hover:text-brand p-1 rounded-full hover:bg-surface-2 transition-colors active:scale-90"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>

          <button 
            onClick={handleSignOut}
            className="text-text-muted hover:text-danger p-1 rounded-full hover:bg-surface-2 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications Popup */}
      {showNotifications && (
        <div className="notifications-popup absolute bottom-16 left-4 w-72 bg-surface border border-border rounded-xl shadow-xl z-50 p-4 select-none animate-stagger-item">
          <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
            <span className="text-xs font-bold text-text-primary sora-heading">Notifications Feed</span>
            <button 
              onClick={async () => {
                await supabaseClient.notifications.markAllRead();
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                toast.success("All marked as read!");
              }}
              className="text-[9px] font-bold text-brand uppercase tracking-wider hover:text-brand-dark"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-[220px] overflow-y-auto divide-y divide-border no-scrollbar space-y-2 text-left">
            {notifications.length > 0 ? (
              notifications.map(n => (
                <div 
                  key={n.id}
                  onClick={() => {
                    if (n.link) navigate(n.link);
                    setShowNotifications(false);
                  }}
                  className={`flex items-start space-x-2.5 pt-2 cursor-pointer transition-colors relative ${n.is_read ? "text-text-secondary" : "text-text-primary font-semibold"}`}
                >
                  {!n.is_read && <div className="absolute left-[-8px] top-4 w-1.5 h-1.5 bg-brand rounded-full" />}
                  <div className="flex flex-col text-[11px] leading-tight pb-2">
                    <span className="font-bold truncate max-w-[220px]">{n.title}</span>
                    <span className="text-[10px] text-text-muted mt-0.5 leading-normal">{n.message}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-[11px] text-text-muted">No recent notifications logs.</div>
            )}
          </div>
          <div className="pt-2 border-t border-border mt-3 text-center flex justify-center">
            <button 
              onClick={() => {
                navigate("/notifications");
                setShowNotifications(false);
              }}
              className="text-[10px] font-bold text-brand uppercase tracking-wider hover:text-brand-dark flex items-center space-x-1"
            >
              <span>View all notifications</span>
            </button>
          </div>
        </div>
      )}

      {/* Command Palette Modal */}
      {showSearch && (
        <Modal 
          isOpen={true} 
          onClose={() => {
            setShowSearch(false);
            setSearchQuery('');
          }}
          title="Command Search Palette"
        >
          <div className="space-y-4 select-none">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Type a command or search deals, pages, creators..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-surface border border-border rounded-lg text-xs outline-none focus:border-brand shadow-sm font-semibold"
                autoFocus
              />
            </div>
            <div className="max-h-[220px] overflow-y-auto divide-y divide-border border border-border rounded-lg bg-surface-2/10">
              {/* Filter and show matches based on searchQuery */}
              {[
                { category: "General", label: "Go to Dashboard", path: role === 'creator' ? "/" : "/brand/dashboard" },
                { category: "General", label: "Go to Inbox & Pitches", path: "/inbox" },
                { category: "General", label: "Go to My Deals Pipeline", path: "/deals" },
                { category: "General", label: "Go to Payments Center", path: "/payments" },
                { category: "General", label: "Go to Profile settings", path: "/profile" },
                { category: "General", label: "Go to Settings", path: role === 'creator' ? "/settings" : "/brand/settings" }
              ].filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase())).map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setShowSearch(false);
                    setSearchQuery('');
                  }}
                  className="flex justify-between items-center px-4 py-2.5 text-xs font-semibold text-text-secondary hover:bg-brand-light/20 cursor-pointer"
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] text-text-muted font-normal uppercase tracking-wider">{item.category}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};