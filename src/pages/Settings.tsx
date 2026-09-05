import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  DollarSign, 
  Bell, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  CreditCard,
  User,
  Shield,
  FileText,
  Sliders,
  Cpu,
  Eye,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Lock,
  CheckCircle,
  HelpCircle,
  Plus,
  Trash2,
  Users,
  Video,
  Globe,
  Trash,
  Mail,
  Zap,
  Activity,
  Terminal,
  Play,
  EyeOff,
  UserPlus,
  Check,
  ChevronRight,
  PlusCircle,
  Heart,
  SlidersHorizontal,
  FolderLock,
  Instagram,
  Share2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { convexClient as supabaseClient, mockDb } from '../services/convex';
import { rateLimiter } from '../utils/rateLimiter';
import { Card, Button, InputField, Modal } from '../components';

// YouTube & Instagram mock connection utilities
const dv = {
  subscriber_count: 385000,
  avg_views: 125000,
  engagement_rate: 4.8,
  top_countries: ["United States", "Canada", "United Kingdom"],
  age_gender_split: {
    age: { "18-24": 45, "25-34": 38, "35-44": 12, "45+": 5 },
    gender: { Female: 58, Male: 39, Other: 3 }
  }
};

const PR = {
  getSavedKey: () => localStorage.getItem("dealhive_youtube_api_key"),
  startConnection: async () => "/youtube-connect-mock-flow",
  completeConnection: async (key?: string) => {
    await new Promise(r => setTimeout(r, 1000));
    let stats = { ...dv };
    let chanId = "UC_sarah_jenkins_creates";
    if (key) {
      localStorage.setItem("dealhive_youtube_api_key", key);
      chanId = `UC_live_api_${key.substring(0, 8)}`;
      stats.subscriber_count = 524000;
      stats.avg_views = 195000;
      stats.engagement_rate = 5.6;
    } else {
      localStorage.removeItem("dealhive_youtube_api_key");
    }
    await supabaseClient.profiles.updateCreator({
      youtube_connected: true,
      youtube_channel_id: chanId,
      youtube_stats: stats
    } as any);
    return stats;
  }
};

const uv = {
  follower_count: 852000,
  avg_engagement_rate: 6.8,
  top_countries: ["United States", "Brazil", "India"],
  demographics: {
    age: { "18-24": 35, "25-34": 45, "35-44": 15, "45+": 5 },
    gender: { Female: 62, Male: 35, Other: 3 }
  }
};

const ER = {
  getSavedKey: () => localStorage.getItem("dealhive_instagram_api_key"),
  startConnection: async () => "/instagram-connect-mock-flow",
  completeConnection: async (key?: string) => {
    await new Promise(r => setTimeout(r, 1000));
    let stats = { ...uv };
    if (key) {
      localStorage.setItem("dealhive_instagram_api_key", key);
      stats.follower_count = 920000;
      stats.avg_engagement_rate = 7.4;
    } else {
      localStorage.removeItem("dealhive_instagram_api_key");
    }
    await supabaseClient.profiles.updateCreator({
      instagram_connected: true,
      instagram_stats: stats
    } as any);
    return stats;
  }
};

interface Webhook {
  id: string;
  url: string;
  event: string;
  created: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsed: string;
  created: string;
}

interface NotificationPreference {
  pitchReceived: boolean;
  pitchAccepted: boolean;
  brandReplied: boolean;
  draftSubmitted: boolean;
  draftApproved: boolean;
  revisionRequested: boolean;
  contractReady: boolean;
  contractSigned: boolean;
  invoiceSent: boolean;
  paymentReceived: boolean;
  paymentOverdue: boolean;
  weeklyDigest: boolean;
}

export const Settings: React.FC = () => {
  const [role, setRole] = useState<string>('creator');
  const [activeTab, setActiveTab] = useState<string>('account');
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [rateLimiterStats, setRateLimiterStats] = useState<Record<string, any>>({
    ai: rateLimiter.getStats('ai_suggest'),
    auth: rateLimiter.getStats('auth_action'),
    db: rateLimiter.getStats('db_write')
  });

  // Account details
  const [accountDetails, setAccountDetails] = useState({
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@dealhive.io',
    handle: 'sarah_creates',
    timezone: 'Asia/Kolkata',
    currency: 'USD',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  });
  
  // Buffers for form editing
  const [fullName, setFullName] = useState(accountDetails.name);
  const [contactEmail, setContactEmail] = useState(accountDetails.email);
  const [creatorHandle, setCreatorHandle] = useState(accountDetails.handle);
  const [timezone, setTimezone] = useState(accountDetails.timezone);
  const [currency, setCurrency] = useState(accountDetails.currency);
  const [profilePhoto, setProfilePhoto] = useState(accountDetails.profilePhoto);

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(() => localStorage.getItem('dealhive_2fa_enabled') === 'true');

  // Integrations states
  const [isYoutubeConnected, setIsYoutubeConnected] = useState(true);
  const [youtubeLastSynced, setYoutubeLastSynced] = useState('10 minutes ago');
  const [youtubeSubscribers, setYoutubeSubscribers] = useState('385K');
  
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);
  const [instagramLastSynced, setInstagramLastSynced] = useState('Not connected');
  const [instagramFollowers, setInstagramFollowers] = useState('852K');

  const [isConnectingModalOpen, setIsConnectingModalOpen] = useState(false);
  const [connectingServiceType, setConnectingServiceType] = useState<'youtube' | 'instagram'>('youtube');
  const [connectingApiKey, setConnectingApiKey] = useState('');

  // Delete account modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Notification states
  const initialNotifications: NotificationPreference = {
    pitchReceived: true,
    pitchAccepted: true,
    brandReplied: true,
    draftSubmitted: true,
    draftApproved: true,
    revisionRequested: true,
    contractReady: true,
    contractSigned: true,
    invoiceSent: true,
    paymentReceived: true,
    paymentOverdue: true,
    weeklyDigest: false
  };

  const [emailNotifications, setEmailNotifications] = useState<NotificationPreference>({ ...initialNotifications });
  const [appNotifications, setAppNotifications] = useState<NotificationPreference>({ ...initialNotifications });
  const [emailNotificationsBuffer, setEmailNotificationsBuffer] = useState<NotificationPreference>({ ...initialNotifications });
  const [appNotificationsBuffer, setAppNotificationsBuffer] = useState<NotificationPreference>({ ...initialNotifications });
  const [digestFrequency, setDigestFrequency] = useState('immediately');
  const [digestFrequencyBuffer, setDigestFrequencyBuffer] = useState('immediately');

  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  const [quietHours, setQuietHours] = useState({ enabled: true, start: '22:00', end: '08:00' });

  // Payouts & Billing states
  const [payoutSchedule, setPayoutSchedule] = useState('weekly');
  const [payoutScheduleBuffer, setPayoutScheduleBuffer] = useState('weekly');
  const [payoutMethod, setPayoutMethod] = useState('Chase Bank (•••• 4821)');
  const [payoutStatus, setPayoutStatus] = useState('verified');
  const [taxVerificationStatus, setTaxVerificationStatus] = useState('verified');
  const [taxFormType, setTaxFormType] = useState('w9');
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [taxEinSsn, setTaxEinSsn] = useState('');
  const [taxSignature, setTaxSignature] = useState('');

  // Alternative Payouts
  const [altPayoutType, setAltPayoutType] = useState(() => localStorage.getItem('dealhive_alt_payout_type') || 'none');
  const [upiId, setUpiId] = useState(() => localStorage.getItem('dealhive_upi_id') || 'sarahCreates@okhdfcbank');
  const [grabPhone, setGrabPhone] = useState(() => localStorage.getItem('dealhive_grab_phone') || '+65 9123 4567');

  // Invoice presets
  const [invoicePrefix, setInvoicePrefix] = useState('INV');
  const [invoiceTerms, setInvoiceTerms] = useState('Net 15');
  const [invoiceBusinessName, setInvoiceBusinessName] = useState('Sarah Jenkins Media LLC');
  const [invoiceAddress, setInvoiceAddress] = useState('1244 Creative Blvd, Suite 400, Los Angeles, CA 90028');
  const [invoiceDefaults, setInvoiceDefaults] = useState({
    prefix: 'INV',
    terms: 'Net 15',
    businessName: 'Sarah Jenkins Media LLC',
    address: '1244 Creative Blvd, Suite 400, Los Angeles, CA 90028'
  });

  // Subscription plan
  const [currentPlan, setCurrentPlan] = useState('pro');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const mockTransactions = [
    { id: 'TXN-9021', date: 'May 15, 2026', amount: 29, plan: 'Creator Pro' },
    { id: 'TXN-8311', date: 'Apr 15, 2026', amount: 29, plan: 'Creator Pro' },
    { id: 'TXN-7194', date: 'Mar 15, 2026', amount: 29, plan: 'Creator Pro' }
  ];

  // Discoverability Visibilities
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [profileVisibilityBuffer, setProfileVisibilityBuffer] = useState('public');
  const [profileSubdomain, setProfileSubdomain] = useState('sarah');
  const [profileSubdomainBuffer, setProfileSubdomainBuffer] = useState('sarah');
  const [discoverabilityType, setDiscoverabilityType] = useState('range');
  const [discoverabilityTypeBuffer, setDiscoverabilityTypeBuffer] = useState('range');
  const [discoverabilityNiches, setDiscoverabilityNiches] = useState<string[]>(['Tech', 'Lifestyle', 'Productivity']);
  const [discoverabilityNichesBuffer, setDiscoverabilityNichesBuffer] = useState<string[]>(['Tech', 'Lifestyle', 'Productivity']);
  const [discoverabilityConsent, setDiscoverabilityConsent] = useState(true);
  const [discoverabilityConsentBuffer, setDiscoverabilityConsentBuffer] = useState(true);

  // Deal Defaults
  const [dealDefaultsKillFee, setDealDefaultsKillFee] = useState(25);
  const [dealDefaultsExclusivity, setDealDefaultsExclusivity] = useState(14);
  const [dealDefaultsUsageRights, setDealDefaultsUsageRights] = useState(12);
  const [dealDefaultsFormat, setDealDefaultsFormat] = useState('dedicated');
  const [dealDefaultsRevisions, setDealDefaultsRevisions] = useState(2);
  const [dealDefaultsAutoInvoice, setDealDefaultsAutoInvoice] = useState(true);
  const [dealDefaultsAutoPopulate, setDealDefaultsAutoPopulate] = useState(true);
  const [dealDefaults, setDealDefaults] = useState({
    killFee: 25,
    exclusivityWindow: 14,
    usageRightsMonths: 12,
    template: 'dedicated',
    revisions: 2,
    autoInvoice: true,
    autoPopulate: true
  });

  // Webhooks developer routes & keys
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.zapier.com/hooks/catch/19294/x82819');
  const [webhookRoutes, setWebhookRoutes] = useState<Webhook[]>([
    { id: 'WH-001', url: 'https://hooks.zapier.com/hooks/catch/19294/x82819', event: 'Deal Stage Change', created: '3 weeks ago' }
  ]);
  const [developerApiKeys, setDeveloperApiKeys] = useState<ApiKey[]>([
    { id: 'KEY-001', name: 'Production Dashboard Notion', key: 'dh_live_••••••••2819', lastUsed: '5 minutes ago', created: '2 weeks ago' }
  ]);
  const [newApiKeyName, setNewApiKeyName] = useState('');

  // Display Layout Aesthetics
  const [themePreference, setThemePreference] = useState(() => localStorage.getItem('dealhive_theme_pref') || 'light');
  const [themePreferenceBuffer, setThemePreferenceBuffer] = useState(themePreference);
  const [sidebarLayout, setSidebarLayout] = useState('expanded');
  const [sidebarLayoutBuffer, setSidebarLayoutBuffer] = useState('sidebarLayout');
  const [dashboardWidget, setDashboardWidget] = useState('schedule');
  const [dashboardWidgetBuffer, setDashboardWidgetBuffer] = useState('schedule');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [dateFormatBuffer, setDateFormatBuffer] = useState('DD/MM/YYYY');
  const [numberFormat, setNumberFormat] = useState('abbreviated');
  const [numberFormatBuffer, setNumberFormatBuffer] = useState('abbreviated');
  const [localeNumberFormat, setLocaleNumberFormat] = useState(() => localStorage.getItem('dealhive_number_format') || 'US');
  const [localeNumberFormatBuffer, setLocaleNumberFormatBuffer] = useState(localeNumberFormat);
  const [languagePreference, setLanguagePreference] = useState(() => localStorage.getItem('dealhive_language_pref') || 'en');
  const [languagePreferenceBuffer, setLanguagePreferenceBuffer] = useState(languagePreference);

  // Privacy & GDPR
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [consentAnalytics, setConsentAnalytics] = useState(true);
  const [isExportingData, setIsExportingData] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Team & Templates list variables
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamInvites, setTeamInvites] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isAddTeamMemberOpen, setIsAddTeamMemberOpen] = useState(false);
  const [newTeamMemberEmail, setNewTeamMemberEmail] = useState('');
  const [newTeamMemberRole, setNewTeamMemberRole] = useState('editor');
  const [newTeamMemberTitle, setNewTeamMemberTitle] = useState('');

  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [dealTemplates, setDealTemplates] = useState<any[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDealType, setNewTemplateDealType] = useState('Integration');
  const [newTemplateRate, setNewTemplateRate] = useState(3500);
  const [newTemplateExclusivity, setNewTemplateExclusivity] = useState(15);
  const [newTemplateUsageRights, setNewTemplateUsageRights] = useState(3);
  const [newTemplateRevisions, setNewTemplateRevisions] = useState(2);
  const [newTemplateKillFee, setNewTemplateKillFee] = useState(20);
  const [newTemplateDescription, setNewTemplateDescription] = useState('');

  useEffect(() => {
    const roleVal = localStorage.getItem('dealhive_auth_role') || 'creator';
    setRole(roleVal);

    const loadCreatorData = async () => {
      try {
        const profileData = await supabaseClient.profiles.getCreator();
        if (profileData) {
          setIsYoutubeConnected(profileData.youtube_connected);
          setIsInstagramConnected(profileData.instagram_connected || false);
          if (profileData.youtube_stats) {
            setYoutubeSubscribers((profileData.youtube_stats.subscriber_count / 1000).toFixed(0) + 'K');
          }
          if (profileData.instagram_stats) {
            setInstagramFollowers((profileData.instagram_stats.follower_count / 1000).toFixed(0) + 'K');
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadCreatorData();
  }, []);

  // Fetch team & template lists on tab focus
  useEffect(() => {
    if (activeTab === 'team' || activeTab === 'templates') {
      const fetchTeamTemplates = async () => {
        try {
          const members = await supabaseClient.teams.listMembers();
          const invites = await supabaseClient.teams.listInvites();
          const logs = await supabaseClient.teams.getActivityLogs();
          const templatesList = await supabaseClient.templates.list();
          setTeamMembers(members);
          setTeamInvites(invites);
          setAuditLogs(logs);
          setDealTemplates(templatesList);
        } catch (err) {
          console.error(err);
        }
      };
      fetchTeamTemplates();
    }
  }, [activeTab]);

  // Real-time diagnostics event listener
  useEffect(() => {
    const fetchErrorLogs = async () => {
      const logsList = await supabaseClient.errorLog.list();
      setErrorLogs(logsList);
      setRateLimiterStats({
        ai: rateLimiter.getStats('ai_suggest'),
        auth: rateLimiter.getStats('auth_action'),
        db: rateLimiter.getStats('db_write')
      });
    };
    fetchErrorLogs();

    const handleLoggedError = () => fetchErrorLogs();
    window.addEventListener('dealhive-error-logged', handleLoggedError);
    return () => window.removeEventListener('dealhive-error-logged', handleLoggedError);
  }, [activeTab]);

  // Account Detail Actions
  const handleSaveAccountDetails = () => {
    setAccountDetails({
      name: fullName,
      email: contactEmail,
      handle: creatorHandle,
      timezone,
      currency,
      profilePhoto
    });
    toast.success("Personal details successfully updated!");
  };

  const handleResetAccountDetails = () => {
    setFullName(accountDetails.name);
    setContactEmail(accountDetails.email);
    setCreatorHandle(accountDetails.handle);
    setTimezone(accountDetails.timezone);
    setCurrency(accountDetails.currency);
    setProfilePhoto(accountDetails.profilePhoto);
    toast("Account changes reset", { icon: "🔄" });
  };

  // 2FA action
  const handleToggle2FA = (val: boolean) => {
    setIs2FAEnabled(val);
    localStorage.setItem('dealhive_2fa_enabled', val ? 'true' : 'false');
    window.dispatchEvent(new Event('2fa-change'));
    toast.success(val ? "2FA Enabled! Authenticator token synced." : "2FA disabled. Please secure your account.");
  };

  // Disconnect Service
  const handleDisconnectService = async (service: 'youtube' | 'instagram') => {
    if (window.confirm(`Are you sure you want to disconnect your ${service === 'youtube' ? 'YouTube channel' : 'Instagram profile'} sync?`)) {
      if (service === 'youtube') {
        const creatorProfile = await supabaseClient.profiles.getCreator();
        const updated = { ...creatorProfile, youtube_connected: false, youtube_channel_id: '', youtube_stats: null };
        localStorage.removeItem('dealhive_youtube_api_key');
        await supabaseClient.profiles.updateCreator(updated);
        setIsYoutubeConnected(false);
        setYoutubeLastSynced('Not synced');
        toast.success("YouTube channel link removed successfully.");
      } else {
        const creatorProfile = await supabaseClient.profiles.getCreator();
        const updated = { ...creatorProfile, instagram_connected: false, instagram_stats: null };
        localStorage.removeItem('dealhive_instagram_api_key');
        await supabaseClient.profiles.updateCreator(updated);
        setIsInstagramConnected(false);
        setInstagramLastSynced('Not synced');
        toast.success("Instagram profile link removed successfully.");
      }
    }
  };

  const handleConnectYoutube = () => {
    setConnectingServiceType('youtube');
    setConnectingApiKey(localStorage.getItem('dealhive_youtube_api_key') || '');
    setIsConnectingModalOpen(true);
  };

  const handleConnectInstagram = () => {
    setConnectingServiceType('instagram');
    setConnectingApiKey(localStorage.getItem('dealhive_instagram_api_key') || '');
    setIsConnectingModalOpen(true);
  };

  // Complete service API key sync modal flow
  const completeServiceSync = async (skipKey = false) => {
    setIsConnectingModalOpen(false);
    const keyVal = skipKey ? '' : connectingApiKey.trim();

    if (connectingServiceType === 'youtube') {
      const waitToast = toast.loading("Establishing secure YouTube Data API connection...");
      try {
        const stats = await PR.completeConnection(keyVal || undefined);
        setIsYoutubeConnected(true);
        setYoutubeLastSynced('Just now');
        setYoutubeSubscribers((stats.subscriber_count / 1000).toFixed(0) + 'K');
        toast.dismiss(waitToast);
        toast.success(keyVal ? "YouTube synced using Developer API key!" : "YouTube Channel synced via Google OAuth!");
      } catch {
        toast.dismiss(waitToast);
        toast.error("Failed to sync YouTube integration.");
      }
    } else {
      const waitToast = toast.loading("Establishing secure Instagram Graph API connection...");
      try {
        const stats = await ER.completeConnection(keyVal || undefined);
        setIsInstagramConnected(true);
        setInstagramLastSynced('Just now');
        setInstagramFollowers((stats.follower_count / 1000).toFixed(0) + 'K');
        toast.dismiss(waitToast);
        toast.success(keyVal ? "Instagram synced using Graph API key!" : "Instagram synced via Graph API!");
      } catch {
        toast.dismiss(waitToast);
        toast.error("Failed to sync Instagram integration.");
      }
    }
  };

  // Delete account deactivation
  const handleDeleteAccount = () => {
    if (deleteConfirmText.toUpperCase() !== "DELETE") {
      toast.error("Type DELETE exactly to confirm.");
      return;
    }
    toast.loading("Purging databases details...");
    setTimeout(() => {
      toast.dismiss();
      toast.success("Account deactivated. Redirecting to home...");
      supabaseClient.auth.signOut().then(() => {
        window.location.href = '/';
      });
    }, 2000);
  };

  // Reset to first-run creator states
  const handleResetToFirstRun = () => {
    if (!window.confirm("Are you sure you want to reset workspace to a pristine first-run state? This will wipe all mock database tables (deals, invoices, deliverables), disconnect connected services, and restore your creator profile to a fresh blank state.")) {
      return;
    }

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('dealhive_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Provision fresh profile
    const freshProfile = {
      id: 'creator_sarah',
      username: 'sarah_creates',
      full_name: 'Sarah Jenkins',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bio: '',
      niche_tags: [],
      rate_card: { integration: 0, dedicated: 0, shorts: 0, social_package: 0, exclusivity_premium: 0 },
      youtube_connected: false,
      youtube_channel_id: '',
      youtube_stats: {
        subscriber_count: 0,
        avg_views: 0,
        engagement_rate: 0,
        top_countries: [],
        age_gender_split: { age: {}, gender: {} }
      },
      stripe_connected_id: '',
      stripe_status: 'inactive',
      subscription_plan: 'free',
      visibility: 'private',
      created_at: new Date().toISOString()
    };
    localStorage.setItem('dealhive_db_creator_profile', JSON.stringify(freshProfile));
    localStorage.setItem('dealhive_db_deals', JSON.stringify([]));
    localStorage.setItem('dealhive_db_invoices', JSON.stringify([]));
    localStorage.setItem('dealhive_db_deliverables', JSON.stringify([]));
    localStorage.setItem('dealhive_auth_role', 'creator');

    toast.success("Workspace reset to first-run state successfully!", { duration: 3000 });
    setTimeout(() => {
      window.location.href = '/';
    }, 1200);
  };

  // Notification Preferences
  const handleSaveNotificationPreferences = () => {
    setEmailNotifications({ ...emailNotificationsBuffer });
    setAppNotifications({ ...appNotificationsBuffer });
    setDigestFrequency(digestFrequencyBuffer);
    setQuietHours({
      enabled: quietHoursEnabled,
      start: quietHoursStart,
      end: quietHoursEnd
    });
    toast.success("Notification preferences updated!");
  };

  const handleResetNotificationPreferences = () => {
    setEmailNotificationsBuffer({ ...emailNotifications });
    setAppNotificationsBuffer({ ...appNotifications });
    setDigestFrequencyBuffer(digestFrequency);
    setQuietHoursEnabled(quietHours.enabled);
    setQuietHoursStart(quietHours.start);
    setQuietHoursEnd(quietHours.end);
    toast("Notification settings reset", { icon: "🔄" });
  };

  // Payments & Payout details
  const handleConnectStripe = () => {
    const loadingToast = toast.loading("Opening secure Stripe Connect terminal...");
    setTimeout(() => {
      toast.dismiss(loadingToast);
      setPayoutMethod("Silicon Valley Bank (•••• 9988)");
      setPayoutStatus("verified");
      toast.success("Stripe Connect payment method verified!");
    }, 1500);
  };

  const handleFileTaxForm = () => {
    if (!taxEinSsn || !taxSignature) {
      toast.error("Fill in all legal tax fields.");
      return;
    }
    setIsTaxModalOpen(false);
    setTaxVerificationStatus("verified");
    toast.success(`Tax form ${taxFormType.toUpperCase()} has been verified!`);
  };

  const handleSaveInvoicePresets = () => {
    setInvoiceDefaults({
      prefix: invoicePrefix,
      terms: invoiceTerms,
      businessName: invoiceBusinessName,
      address: invoiceAddress
    });
    toast.success("Invoice templates and legal defaults updated!");
  };

  const handleResetInvoicePresets = () => {
    setInvoicePrefix(invoiceDefaults.prefix);
    setInvoiceTerms(invoiceDefaults.terms);
    setInvoiceBusinessName(invoiceDefaults.businessName);
    setInvoiceAddress(invoiceDefaults.address);
    toast("Invoice settings reset", { icon: "🔄" });
  };

  // Plan Subscription Adjustments
  const handleAdjustSubscriptionPlan = () => {
    setIsPlanModalOpen(false);
    setCurrentPlan(selectedPlan);
    toast.success(`Subscription adjusted to Creator ${selectedPlan.toUpperCase()}!`);
  };

  // Discoverability Control
  const handleSaveDiscoverability = () => {
    setProfileVisibility(profileVisibilityBuffer);
    setProfileSubdomain(profileSubdomainBuffer);
    setDiscoverabilityType(discoverabilityTypeBuffer);
    setDiscoverabilityNiches([...discoverabilityNichesBuffer]);
    setDiscoverabilityConsent(discoverabilityConsentBuffer);
    toast.success("Public discoverability preferences saved!");
  };

  const handleResetDiscoverability = () => {
    setProfileVisibilityBuffer(profileVisibility);
    setProfileSubdomainBuffer(profileSubdomain);
    setDiscoverabilityTypeBuffer(discoverabilityType);
    setDiscoverabilityNichesBuffer([...discoverabilityNiches]);
    setDiscoverabilityConsentBuffer(discoverabilityConsent);
    toast("Discoverability changes reset", { icon: "🔄" });
  };

  // Deal Defaults
  const handleSaveDealDefaults = () => {
    setDealDefaults({
      killFee: dealDefaultsKillFee,
      exclusivityWindow: dealDefaultsExclusivity,
      usageRightsMonths: dealDefaultsUsageRights,
      template: dealDefaultsFormat,
      revisions: dealDefaultsRevisions,
      autoInvoice: dealDefaultsAutoInvoice,
      autoPopulate: dealDefaultsAutoPopulate
    });
    toast.success("Deal legal defaults updated successfully!");
  };

  const handleResetDealDefaults = () => {
    setDealDefaultsKillFee(dealDefaults.killFee);
    setDealDefaultsExclusivity(dealDefaults.exclusivityWindow);
    setDealDefaultsUsageRights(dealDefaults.usageRightsMonths);
    setDealDefaultsFormat(dealDefaults.template);
    setDealDefaultsRevisions(dealDefaults.revisions);
    setDealDefaultsAutoInvoice(dealDefaults.autoInvoice);
    setDealDefaultsAutoPopulate(dealDefaults.autoPopulate);
    toast("Deal defaults reset", { icon: "🔄" });
  };

  // Appearance Prefs
  const handleSaveAppearance = () => {
    setThemePreference(themePreferenceBuffer);
    setSidebarLayout(sidebarLayoutBuffer);
    setDashboardWidget(dashboardWidgetBuffer);
    setDateFormat(dateFormatBuffer);
    setNumberFormat(numberFormatBuffer);
    setLocaleNumberFormat(localeNumberFormatBuffer);
    setLanguagePreference(languagePreferenceBuffer);

    if (themePreferenceBuffer === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('dealhive_theme', 'dark');
    } else if (themePreferenceBuffer === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('dealhive_theme', 'light');
    } else {
      const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', sysDark ? 'dark' : 'light');
    }
    localStorage.setItem('dealhive_theme_pref', themePreferenceBuffer);
    localStorage.setItem('dealhive_number_format', localeNumberFormatBuffer);
    localStorage.setItem('dealhive_language_pref', languagePreferenceBuffer);
    toast.success("Display layout and themes successfully updated!");
  };

  const handleResetAppearance = () => {
    setThemePreferenceBuffer(themePreference);
    setSidebarLayoutBuffer(sidebarLayout);
    setDashboardWidgetBuffer(dashboardWidget);
    setDateFormatBuffer(dateFormat);
    setNumberFormatBuffer(numberFormat);
    setLocaleNumberFormatBuffer(localeNumberFormat);
    setLanguagePreferenceBuffer(languagePreference);
    toast("Appearance changes reset", { icon: "🔄" });
  };

  // GDPR Export Data simulation
  const handleExportData = () => {
    setIsExportingData(true);
    setExportProgress(5);
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExportingData(false);

          // Build mock JSON file download
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
            JSON.stringify({
              profile: { name: accountDetails.name, handle: accountDetails.handle, role },
              deals: [{ id: 'deal_1', title: 'Samsung Galaxy Launch', status: 'signed' }],
              settings: { timezone, currency }
            }, null, 2)
          );
          const dlAnchor = document.createElement('a');
          dlAnchor.setAttribute("href", dataStr);
          dlAnchor.setAttribute("download", `dealhive_backup_${accountDetails.handle}.json`);
          document.body.appendChild(dlAnchor);
          dlAnchor.click();
          dlAnchor.remove();
          toast.success("GDPR Export complete! backup ZIP compiled.");
          return 100;
        }
        return prev + 15;
      });
    }, 300);
  };

  // Team Member Workspaces
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamMemberEmail) {
      toast.error("Please enter an email address.");
      return;
    }
    try {
      await supabaseClient.teams.inviteMember(newTeamMemberEmail, newTeamMemberRole, newTeamMemberTitle);
      toast.success(`Invitation successfully dispatched to ${newTeamMemberEmail}!`);
      setIsAddTeamMemberOpen(false);
      setNewTeamMemberEmail('');
      setNewTeamMemberTitle('');

      const invites = await supabaseClient.teams.listInvites();
      const logs = await supabaseClient.teams.getActivityLogs();
      setTeamInvites(invites);
      setAuditLogs(logs);
    } catch {
      toast.error("Failed to send invitation.");
    }
  };

  const handleCancelInvite = async (id: string) => {
    try {
      await supabaseClient.teams.cancelInvite(id);
      toast.success("Invitation successfully revoked.");
      const invites = await supabaseClient.teams.listInvites();
      setTeamInvites(invites);
    } catch {
      toast.error("Failed to cancel invite.");
    }
  };

  const handleResendInvite = async (id: string) => {
    try {
      await supabaseClient.teams.resendInvite(id);
      toast.success("Invitation expiration window extended for 48 hours!");
    } catch {
      toast.error("Failed to resend invite.");
    }
  };

  const handleRemoveMember = async (email: string) => {
    try {
      await supabaseClient.teams.removeMember(email);
      toast.success("Team member workspace privileges revoked.");
      const members = await supabaseClient.teams.listMembers();
      setTeamMembers(members);
    } catch {
      toast.error("Failed to remove member.");
    }
  };

  const handleUpdateMemberRole = async (email: string, role: string) => {
    try {
      await supabaseClient.teams.updateMemberRole(email, role);
      toast.success("Team member permissions updated successfully!");
      const members = await supabaseClient.teams.listMembers();
      setTeamMembers(members);
    } catch {
      toast.error("Failed to update role.");
    }
  };

  // Deal Templates
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName) {
      toast.error("Template name is required.");
      return;
    }
    try {
      await supabaseClient.templates.create({
        name: newTemplateName,
        deal_type: newTemplateDealType,
        default_rate: newTemplateRate,
        default_currency: 'USD',
        default_payment_terms: 'Net 30',
        default_exclusivity_days: newTemplateExclusivity,
        default_usage_rights_months: newTemplateUsageRights,
        default_revision_rounds: newTemplateRevisions,
        default_kill_fee_percent: newTemplateKillFee,
        description: newTemplateDescription,
        is_default: dealTemplates.length === 0
      });
      toast.success("Deal template saved successfully!");
      setIsCreateTemplateOpen(false);
      setNewTemplateName('');
      setNewTemplateDescription('');
      
      const list = await supabaseClient.templates.list();
      setDealTemplates(list);
    } catch {
      toast.error("Failed to save template.");
    }
  };

  const handleSetDefaultTemplate = async (id: string) => {
    try {
      await supabaseClient.templates.setDefault(id);
      toast.success("Default deal template updated.");
      const list = await supabaseClient.templates.list();
      setDealTemplates(list);
    } catch {
      toast.error("Failed to set default.");
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await supabaseClient.templates.delete(id);
      toast.success("Deal template deleted.");
      const list = await supabaseClient.templates.list();
      setDealTemplates(list);
    } catch {
      toast.error("Failed to delete template.");
    }
  };

  // Developer Hub Webhooks
  const handleRegisterWebhook = () => {
    if (!webhookUrl) {
      toast.error("Provide a webhook capture endpoint URL.");
      return;
    }
    const route = {
      id: `WH-00${webhookRoutes.length + 1}`,
      url: webhookUrl,
      event: 'Deal Stage Change',
      created: 'Just now'
    };
    setWebhookRoutes([...webhookRoutes, route]);
    toast.success("Zapier Webhook successfully registered!");
  };

  const handleRemoveWebhook = (id: string) => {
    setWebhookRoutes(prev => prev.filter(r => r.id !== id));
    toast.success("Webhook route revoked.");
  };

  const handleTestWebhook = () => {
    const loadingToast = toast.loading("Firing mock webhook payload to endpoint...");
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success("Test status: 200 OK! Capture endpoint caught payload.", { duration: 4000 });
    }, 800);
  };

  // Developer Hub API Keys
  const handleGenerateApiKey = () => {
    if (!newApiKeyName) {
      toast.error("Enter a descriptive application label.");
      return;
    }
    const generated = {
      id: `KEY-00${developerApiKeys.length + 1}`,
      name: newApiKeyName,
      key: `dh_live_${Math.random().toString(36).substring(2, 8)}••••••••`,
      lastUsed: 'Never',
      created: 'Just now'
    };
    setDeveloperApiKeys([...developerApiKeys, generated]);
    setNewApiKeyName('');
    toast.success("Developer API token generated successfully!");
  };

  const handleRevokeApiKey = (id: string) => {
    setDeveloperApiKeys(prev => prev.filter(k => k.id !== id));
    toast.success("Developer API token permanently revoked.");
  };

  // Flags for dirty states to show Save controls
  const isAccountDirty = fullName !== accountDetails.name || contactEmail !== accountDetails.email || creatorHandle !== accountDetails.handle || timezone !== accountDetails.timezone || currency !== accountDetails.currency || profilePhoto !== accountDetails.profilePhoto;
  const isNotificationsDirty = JSON.stringify(emailNotifications) !== JSON.stringify(emailNotificationsBuffer) || JSON.stringify(appNotifications) !== JSON.stringify(appNotificationsBuffer) || digestFrequency !== digestFrequencyBuffer || quietHoursEnabled !== quietHours.enabled || quietHoursStart !== quietHours.start || quietHoursEnd !== quietHours.end;
  const isInvoiceDirty = invoicePrefix !== invoiceDefaults.prefix || invoiceTerms !== invoiceDefaults.terms || invoiceBusinessName !== invoiceDefaults.businessName || invoiceAddress !== invoiceDefaults.address;
  const isDiscoverabilityDirty = profileVisibility !== profileVisibilityBuffer || profileSubdomain !== profileSubdomainBuffer || discoverabilityType !== discoverabilityTypeBuffer || JSON.stringify(discoverabilityNiches) !== JSON.stringify(discoverabilityNichesBuffer) || discoverabilityConsent !== discoverabilityConsentBuffer;
  const isDefaultsDirty = dealDefaultsKillFee !== dealDefaults.killFee || dealDefaultsExclusivity !== dealDefaults.exclusivityWindow || dealDefaultsUsageRights !== dealDefaults.usageRightsMonths || dealDefaultsFormat !== dealDefaults.template || dealDefaultsRevisions !== dealDefaults.revisions || dealDefaultsAutoInvoice !== dealDefaults.autoInvoice || dealDefaultsAutoPopulate !== dealDefaults.autoPopulate;
  const isAppearanceDirty = themePreference !== themePreferenceBuffer || sidebarLayout !== sidebarLayoutBuffer || dashboardWidget !== dashboardWidgetBuffer || dateFormat !== dateFormatBuffer || numberFormat !== numberFormatBuffer || localeNumberFormat !== localeNumberFormatBuffer || languagePreference !== languagePreferenceBuffer;

  const tabs = [
    { id: 'account', label: 'Account & Security', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications Feed', icon: <Bell className="w-4 h-4" /> },
    { id: 'payments', label: 'Payments & Billing', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'plan', label: 'Workspace Plan', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'profile', label: role === 'creator' ? 'Creator Profile' : 'Brand Profile', icon: <User className="w-4 h-4" /> },
    { id: 'defaults', label: role === 'creator' ? 'Deal Defaults' : 'Campaign Defaults', icon: <Sliders className="w-4 h-4" /> },
    role === 'creator' ? { id: 'templates', label: 'Deal Templates', icon: <FileText className="w-4 h-4" /> } : null,
    { id: 'team', label: 'Team Members', icon: <Users className="w-4 h-4" /> },
    { id: 'integrations', label: 'Connected Integrations', icon: <Cpu className="w-4 h-4" /> },
    { id: 'appearance', label: 'Display & Aesthetics', icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy & Data Protection', icon: <Lock className="w-4 h-4" /> },
    { id: 'security_logs', label: 'Security & System Logs', icon: <Shield className="w-4 h-4" /> }
  ].filter(Boolean) as { id: string; label: string; icon: React.ReactNode }[];

  return (
    <div className="w-full max-w-[1140px] mx-auto py-7 px-8 space-y-6 select-none animate-stagger-item">
      {/* 2FA Warning Banner */}
      {!is2FAEnabled && (
        <div className="rounded-xl p-4 border border-warning-border border-l-4 border-l-warning bg-warning-bg flex flex-col md:flex-row md:items-center md:justify-between transition-spring hover:-translate-y-0.5 hover:shadow-md shadow-sm duration-300">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 flex-shrink-0 text-warning animate-pulse">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-xs font-bold uppercase tracking-wider text-warning font-sans">Security Warning</h4>
              <span className="text-sm font-bold text-text-primary mt-1.5 sora-heading">Two-Factor Authentication (2FA) is Disabled</span>
              <span className="text-xs text-text-secondary mt-1 leading-normal">
                Your DealHive account manages financial contracts and payment direct deposits. We recommend enabling 2FA immediately inside security settings.
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('account');
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
            className="mt-3 md:mt-0 px-4 py-2 bg-warning hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-md active:scale-95 transition-spring hover:-translate-y-0.5"
          >
            Go to Security
          </button>
        </div>
      )}

      {/* Settings Header */}
      <div className="flex flex-col select-none border-b border-border pb-4">
        <h2 className="text-xl font-bold text-text-primary sora-heading leading-none flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-brand" />
          <span>System Configurations Workspace</span>
        </h2>
        <p className="text-xs text-text-muted mt-1.5 leading-none">
          Configure API webhooks, contract templates presets, payment triggers, timezones alignment, and quiet schedules settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Navigation Sidebar panel */}
        <div className="lg:col-span-3 bg-surface border border-border rounded-xl p-2.5 space-y-1 shadow-sm sticky top-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-spring active:scale-98 hover:-translate-y-0.5 ${
                activeTab === tab.id ? 'bg-brand-light text-brand shadow-sm' : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Configurations Body panels */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: Account Details & Security */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Personal Information</h3>
                <Card variant="standard" className="p-5 space-y-4">
                  <div className="flex items-center space-x-4">
                    <img src={profilePhoto} alt="Sarah Avatar" className="w-14 h-14 rounded-full object-cover border border-border" />
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs font-bold text-text-primary">Creator Avatar Picture</span>
                      <div className="flex space-x-2">
                        <Button variant="secondary" className="px-2.5 py-1 text-[10px]" onClick={() => toast("Direct file upload connected in production database", { icon: "🔒" })}>
                          Change Photo
                        </Button>
                        <Button variant="secondary" className="px-2.5 py-1 text-[10px]" onClick={() => setProfilePhoto("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")}>
                          Reset Demo
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Full Display Name" value={fullName} onChange={e => setFullName(e.target.value)} />
                    <InputField label="Contact Email Address" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Creator Handle (@)" value={creatorHandle} onChange={e => setCreatorHandle(e.target.value)} />
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Local Timezone Preset</label>
                      <select value={timezone} onChange={e => setTimezone(e.target.value)} className="h-9 px-2 border border-border bg-surface text-xs rounded-lg outline-none font-semibold text-text-primary">
                        <option value="Asia/Kolkata">Asia/Kolkata (GMT+05:30) — Mumbai</option>
                        <option value="America/New_York">America/New_York (GMT-05:00) — New York</option>
                        <option value="Europe/London">Europe/London (GMT+00:00) — London</option>
                        <option value="Europe/Paris">Europe/Paris (GMT+01:00) — Paris</option>
                      </select>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Default Preferred Currency</label>
                      <select value={currency} onChange={e => setCurrency(e.target.value)} className="h-9 px-2 border border-border bg-surface text-xs rounded-lg outline-none font-semibold text-text-primary">
                        <option value="USD">USD ($) — United States Dollar</option>
                        <option value="INR">INR (₹) — Indian Rupee</option>
                        <option value="EUR">EUR (€) — Euro Zone</option>
                        <option value="GBP">GBP (£) — British Pound</option>
                      </select>
                    </div>
                  </div>

                  {isAccountDirty && (
                    <div className="flex justify-end space-x-2 pt-3 border-t border-border mt-3 animate-stagger-item">
                      <Button variant="secondary" onClick={handleResetAccountDetails}>Cancel</Button>
                      <Button variant="primary" onClick={handleSaveAccountDetails}>Save changes</Button>
                    </div>
                  )}
                </Card>
              </div>

              {/* Password & Session Security */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Password & Security</h3>
                <Card variant="standard" className="p-5 space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-border/60">
                    <div className="flex flex-col space-y-0.5 leading-tight select-none">
                      <span className="text-xs font-bold text-text-primary flex items-center space-x-1.5">
                        <Shield className="w-4 h-4 text-brand" />
                        <span>Two-Factor Authentication (2FA)</span>
                      </span>
                      <span className="text-[10px] text-text-muted mt-1 leading-normal">
                        Secure payouts and contracts by enforcing Google Authenticator or SMS token logins.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={is2FAEnabled} onChange={e => handleToggle2FA(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    <InputField label="Current password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                    <InputField label="New password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    <InputField label="Confirm new password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] text-text-muted">Password must include capital letters and a symbol.</span>
                    <Button
                      variant="primary"
                      disabled={!currentPassword || !newPassword || !confirmPassword}
                      onClick={() => {
                        if (newPassword !== confirmPassword) {
                          toast.error("Passwords do not match.");
                          return;
                        }
                        toast.success("Security password successfully updated!");
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                    >
                      Update Password
                    </Button>
                  </div>

                  <div className="pt-3 border-t border-border/60 space-y-2">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Active Logged Sessions</span>
                    <div className="border border-border rounded-xl bg-surface-2/10 overflow-hidden divide-y divide-border select-none">
                      <div className="flex justify-between items-center p-3 text-xs leading-none">
                        <div className="flex flex-col">
                          <span className="font-bold text-text-primary">Safari on macOS (Silicon Valley)</span>
                          <span className="text-[9px] text-text-muted mt-1">IP: 192.170.82.9 · Last Active: Just now</span>
                        </div>
                        <span className="px-2 py-0.5 bg-success-bg border border-success-border rounded text-[9px] font-bold text-success uppercase">Current Session</span>
                      </div>
                      <div className="flex justify-between items-center p-3 text-xs leading-none">
                        <div className="flex flex-col">
                          <span className="font-bold text-text-primary">Chrome on iPhone 15 Pro (Mumbai, India)</span>
                          <span className="text-[9px] text-text-muted mt-1">IP: 103.88.22.91 · Last Active: 4 hours ago</span>
                        </div>
                        <button className="text-[9.5px] font-bold text-danger hover:underline" onClick={() => toast.success("iPhone mobile session closed")}>
                          Revoke Session
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Danger Zone triggers */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-red-500 sora-heading uppercase tracking-wider">Danger Zone</h3>
                <Card variant="standard" className="p-5 border border-red-100 bg-red-500/[0.02] flex items-center justify-between">
                  <div className="flex flex-col space-y-1 select-none max-w-[70%]">
                    <span className="text-xs font-bold text-text-primary">Permanently Deactivate Account</span>
                    <span className="text-[10px] text-text-muted leading-relaxed">
                      This action will cancel active platform sponsorships, cease pending Stripe Connect payouts, and lock access to cryptographically signed agreement ledgers.
                    </span>
                  </div>
                  <Button variant="secondary" className="text-red-500 border border-red-200 hover:bg-red-50" onClick={() => setIsDeleteModalOpen(true)}>
                    Delete Account
                  </Button>
                </Card>

                {/* Account Reset Button */}
                <Card variant="standard" className="p-5 border flex items-center justify-between transition-all duration-300 bg-warning-bg/10 border-warning-border/30">
                  <div className="flex flex-col space-y-1 select-none max-w-[70%]">
                    <span className="text-xs font-bold text-warning">Reset Workspace to First-Run Empty State</span>
                    <span className="text-[10px] text-text-muted leading-relaxed">
                      Wipe all deals, invoices, and deliverables arrays, disconnect all social integrations, and restore a fresh blank Creator Profile.
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    className="font-bold border whitespace-nowrap hover:opacity-90 transition-all text-xs border-warning text-warning"
                    onClick={handleResetToFirstRun}
                  >
                    Reset Workspace
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: Notifications granular matrix */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Granular Alerts Feeds</h3>
                  <span className="text-[10px] text-text-muted">Separate toggles for inboxes and emails</span>
                </div>
                <Card variant="standard" className="p-5 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-border/50 gap-4">
                    <div className="flex flex-col leading-tight select-none">
                      <span className="text-xs font-bold text-text-primary">Notification Digest Frequency</span>
                      <span className="text-[9.5px] text-text-muted mt-1 leading-relaxed">
                        Control how often update emails are batched to avoid inbox flooding.
                      </span>
                    </div>
                    <select
                      value={digestFrequencyBuffer}
                      onChange={e => setDigestFrequencyBuffer(e.target.value)}
                      className="h-9 px-3 border border-border bg-surface text-xs rounded-lg outline-none font-bold text-text-primary"
                    >
                      <option value="immediately">Immediately (Per Event)</option>
                      <option value="2hours">Batch Hourly (Every 2 Hours)</option>
                      <option value="daily">Daily Digest Batching</option>
                    </select>
                  </div>

                  <div className="pb-4 border-b border-border/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col leading-tight select-none">
                        <span className="text-xs font-bold text-text-primary">Enforce Silent Quiet Hours</span>
                        <span className="text-[9.5px] text-text-muted mt-1">Suspend transactional email alert push vectors overnight.</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={quietHoursEnabled} onChange={e => setQuietHoursEnabled(e.target.checked)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand" />
                      </label>
                    </div>

                    {quietHoursEnabled && (
                      <div className="grid grid-cols-2 gap-4 max-w-[280px] animate-stagger-item">
                        <div className="flex flex-col space-y-1">
                          <span className="text-[9px] font-bold text-text-muted uppercase">Silence Start Time</span>
                          <input type="time" value={quietHoursStart} onChange={e => setQuietHoursStart(e.target.value)} className="h-8 px-2 border border-border rounded bg-surface text-xs text-text-primary font-bold" />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-[9px] font-bold text-text-muted uppercase">Silence End Time</span>
                          <input type="time" value={quietHoursEnd} onChange={e => setQuietHoursEnd(e.target.value)} className="h-8 px-2 border border-border rounded bg-surface text-xs text-text-primary font-bold" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Notification Channels Breakdown</span>
                    <div className="border border-border rounded-xl bg-surface-2/10 overflow-hidden select-none">
                      <div className="grid grid-cols-12 bg-surface p-3 font-bold text-[9.5px] uppercase tracking-wider text-text-muted border-b border-border">
                        <div className="col-span-6">Triggering Platform Event</div>
                        <div className="col-span-3 text-center">Send Email</div>
                        <div className="col-span-3 text-center">In-App alert</div>
                      </div>
                      {[
                        { key: 'pitchReceived' as const, label: 'New sponsorship deal pitch received' },
                        { key: 'pitchAccepted' as const, label: 'Deal pitch proposal accepted' },
                        { key: 'brandReplied' as const, label: 'Brand manager sent reply message' },
                        { key: 'draftSubmitted' as const, label: 'Deliverables drafts submitted for review' },
                        { key: 'draftApproved' as const, label: 'Deliverables drafts approved as final' },
                        { key: 'revisionRequested' as const, label: 'Revision comments requested on assets' },
                        { key: 'contractReady' as const, label: 'Legal contracts ready to e-sign' },
                        { key: 'contractSigned' as const, label: 'Contracts e-signature finalized' },
                        { key: 'invoiceSent' as const, label: 'Invoices sent/dispatched' },
                        { key: 'paymentReceived' as const, label: 'Sponsorship payments disbursed' },
                        { key: 'paymentOverdue' as const, label: 'Escrow payment reminders overdue notifications' },
                        { key: 'weeklyDigest' as const, label: 'Weekly channel summary digest (Sundays)' }
                      ].map(row => (
                        <div key={row.key} className="grid grid-cols-12 p-3 items-center text-xs leading-none border-b border-border/50 hover:bg-surface-2/20 transition-colors last:border-0">
                          <div className="col-span-6 font-semibold text-text-secondary leading-tight">{row.label}</div>
                          <div className="col-span-3 flex justify-center">
                            <input
                              type="checkbox"
                              checked={emailNotificationsBuffer[row.key]}
                              onChange={e => setEmailNotificationsBuffer({ ...emailNotificationsBuffer, [row.key]: e.target.checked })}
                              className="rounded text-brand focus:ring-brand w-4 h-4 cursor-pointer"
                            />
                          </div>
                          <div className="col-span-3 flex justify-center">
                            <input
                              type="checkbox"
                              checked={appNotificationsBuffer[row.key]}
                              onChange={e => setAppNotificationsBuffer({ ...appNotificationsBuffer, [row.key]: e.target.checked })}
                              className="rounded text-brand focus:ring-brand w-4 h-4 cursor-pointer"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isNotificationsDirty && (
                    <div className="flex justify-end space-x-2 pt-3 border-t border-border mt-3 animate-stagger-item">
                      <Button variant="secondary" onClick={handleResetNotificationPreferences}>Cancel</Button>
                      <Button variant="primary" onClick={handleSaveNotificationPreferences}>Save changes</Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* TAB 3: Payments & Bank Routing */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Direct Bank Payout Channel</h3>
                <Card variant="standard" className="p-5 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-border/50 gap-4">
                    <div className="flex items-start space-x-3 select-none leading-none">
                      <div className="w-8 h-8 rounded bg-success-bg border border-success-border flex items-center justify-center text-success flex-shrink-0">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-bold text-text-primary">{payoutMethod}</span>
                        <span className="text-[10px] text-text-muted mt-1 leading-normal">Stripe Connected Gateway active. Invoices splits disburse here.</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <span className="px-2 py-0.5 bg-success-bg border border-success-border rounded text-[9px] font-bold text-success uppercase">{payoutStatus}</span>
                      <Button variant="secondary" className="px-3 py-1.5 text-xs font-bold" onClick={handleConnectStripe}>
                        Update Payout Channel
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between pt-1 gap-4 select-none leading-none">
                    <div className="flex flex-col leading-tight select-none">
                      <span className="text-xs font-bold text-text-primary">Payout Release Schedule</span>
                      <span className="text-[9.5px] text-text-muted mt-1 leading-normal">Control cash flow clearance periods. Instant payments incur a 1.5% Stripe card fee.</span>
                    </div>
                    <select
                      value={payoutScheduleBuffer}
                      onChange={e => setPayoutScheduleBuffer(e.target.value)}
                      className="h-9 px-3 border border-border bg-surface text-xs rounded-lg outline-none font-bold text-text-primary"
                    >
                      <option value="instant">Instant Clearance (1.5% Fee)</option>
                      <option value="daily">Daily Sweep Settlements</option>
                      <option value="weekly">Weekly Releases (Default)</option>
                      <option value="monthly">Monthly Net Accumulations</option>
                    </select>
                  </div>

                  <div className="pt-3 border-t border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col leading-tight select-none">
                      <span className="text-xs font-bold text-text-primary flex items-center space-x-1.5">
                        <FileText className="w-4 h-4 text-brand" />
                        <span>Annual Tax Document Verification</span>
                      </span>
                      <span className="text-[9.5px] text-text-muted mt-1 leading-normal">Necessary for 1099 annual filings (US W-9, international W-8BEN).</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        taxVerificationStatus === 'verified' ? 'bg-success-bg border border-success-border text-success' : 'bg-red-50 border border-red-200 text-red-600'
                      }`}>
                        {taxVerificationStatus.replace('_', ' ')}
                      </span>
                      <Button variant="secondary" className="px-3 py-1.5 text-xs font-bold" onClick={() => setIsTaxModalOpen(true)}>
                        File Tax Form
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Localized Alternative Payouts */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Alternative Localized Payout Roster</h3>
                <Card variant="standard" className="p-5 space-y-5">
                  <p className="text-xs text-text-muted leading-relaxed select-none">
                    Configure localized electronic payout options for South East Asia (GrabPay) and India (UPI). These options bypass wire delays and map splits automatically.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* UPI Box */}
                    <div
                      className={`p-4 border rounded-2xl cursor-pointer transition-all duration-300 relative ${
                        altPayoutType === 'upi' ? 'border-brand bg-brand-light/10 shadow-md' : 'border-border hover:border-text-muted bg-surface'
                      }`}
                      onClick={() => {
                        const next = altPayoutType === 'upi' ? 'none' : 'upi';
                        setAltPayoutType(next);
                        localStorage.setItem('dealhive_alt_payout_type', next);
                        if (next === 'upi') toast.success("UPI connected successfully as default alternative channel! 🇮🇳");
                      }}
                    >
                      <div className="flex justify-between items-center select-none">
                        <span className="text-xs font-bold text-text-primary flex items-center">🇮🇳 UPI Direct (India Real-time)</span>
                        {altPayoutType === 'upi' && <span className="text-[9px] bg-brand text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Active</span>}
                      </div>
                      <p className="text-[10px] text-text-secondary mt-2 leading-relaxed">Simulate instant cash clearing using Unified Payments Interface protocols.</p>
                      <div className="mt-3" onClick={e => e.stopPropagation()}>
                        <InputField
                          label="UPI Address VPA"
                          value={upiId}
                          onChange={e => { setUpiId(e.target.value); localStorage.setItem('dealhive_upi_id', e.target.value); }}
                          placeholder="username@okhdfcbank"
                        />
                      </div>
                    </div>

                    {/* GrabPay Box */}
                    <div
                      className={`p-4 border rounded-2xl cursor-pointer transition-all duration-300 relative ${
                        altPayoutType === 'grabpay' ? 'border-brand bg-brand-light/10 shadow-md' : 'border-border hover:border-text-muted bg-surface'
                      }`}
                      onClick={() => {
                        const next = altPayoutType === 'grabpay' ? 'none' : 'grabpay';
                        setAltPayoutType(next);
                        localStorage.setItem('dealhive_alt_payout_type', next);
                        if (next === 'grabpay') toast.success("GrabPay connected successfully as default alternative channel! 🇸🇬");
                      }}
                    >
                      <div className="flex justify-between items-center select-none">
                        <span className="text-xs font-bold text-text-primary flex items-center">🇸🇬 GrabPay (SEA Wallet)</span>
                        {altPayoutType === 'grabpay' && <span className="text-[9px] bg-brand text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Active</span>}
                      </div>
                      <p className="text-[10px] text-text-secondary mt-2 leading-relaxed">Synchronize splits directly with South East Asia’s most popular mobile wallet.</p>
                      <div className="mt-3" onClick={e => e.stopPropagation()}>
                        <InputField
                          label="Linked Grab Mobile Number"
                          value={grabPhone}
                          onChange={e => { setGrabPhone(e.target.value); localStorage.setItem('dealhive_grab_phone', e.target.value); }}
                          placeholder="+65 9123 4567"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Invoice settings presets */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Invoice Presets & defaults</h3>
                <Card variant="standard" className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Default Invoice Numbering Prefix" value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} />
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Default Payment Terms window</label>
                      <select value={invoiceTerms} onChange={e => setInvoiceTerms(e.target.value)} className="h-9 px-3 border border-border bg-surface text-xs rounded-lg outline-none font-bold text-text-primary">
                        <option value="Net 15">Net 15 Days</option>
                        <option value="Net 30">Net 30 Days</option>
                        <option value="Net 45">Net 45 Days</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Creator Legal Business Name (W-9)" value={invoiceBusinessName} onChange={e => setInvoiceBusinessName(e.target.value)} />
                    <InputField label="Default Billing Address" value={invoiceAddress} onChange={e => setInvoiceAddress(e.target.value)} />
                  </div>

                  {isInvoiceDirty && (
                    <div className="flex justify-end space-x-2 pt-3 border-t border-border mt-3 animate-stagger-item">
                      <Button variant="secondary" onClick={handleResetInvoicePresets}>Cancel</Button>
                      <Button variant="primary" onClick={handleSaveInvoicePresets}>Save changes</Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* TAB 4: Workspace Plans chooser */}
          {activeTab === 'plan' && (
            <div className="space-y-6 animate-stagger-item">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Workspace Plan</h3>
                <Card variant="standard" className="p-5 space-y-5 bg-gradient-to-b from-surface to-brand-light/[0.03]">
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <div className="flex flex-col select-none leading-tight">
                      <span className="text-xs font-bold text-text-primary">DealHive Subscription</span>
                      <span className="text-[9.5px] text-text-muted mt-1 leading-normal">
                        Next billing sweep: <span className="font-bold text-text-primary">June 15, 2026</span> &middot; Charged via Stripe card.
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 select-none text-brand font-bold text-xs">
                      <Sparkles className="w-4 h-4 animate-pulse text-brand" />
                      <span className="capitalize">{currentPlan} Creator Tier</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    {[
                      { id: 'free', name: 'Free Standard', price: '$0/mo', bullet1: 'Gated to 3 Active Deals limit', bullet2: '3.0% platform escrow splits fee', bullet3: 'Standard contracts & messaging' },
                      { id: 'pro', name: 'Creator Pro', price: '$29/mo', bullet1: 'Unlimited Sponsorship Deals', bullet2: '1.5% platform escrow splits fee', bullet3: 'Demographic analytics and star ratings' },
                      { id: 'business', name: 'Creator Business', price: '$99/mo', bullet1: 'Unlimited Sponsorship Deals', bullet2: '0.5% lowest split platform fee', bullet3: 'Developer API Keys Hub & Custom domain' }
                    ].map(planCard => {
                      const isActive = currentPlan === planCard.id;
                      return (
                        <div
                          key={planCard.id}
                          onClick={() => { setSelectedPlan(planCard.id); setIsPlanModalOpen(true); }}
                          className={`p-4 border rounded-2xl cursor-pointer transition-all flex flex-col leading-tight select-none hover:-translate-y-0.5 hover:shadow-sm duration-300 ${
                            isActive ? 'border-brand bg-brand-light/10 text-brand font-bold' : 'border-border bg-surface hover:bg-surface-2/10 text-text-secondary'
                          }`}
                        >
                          <div className="flex justify-between items-center leading-none">
                            <span className="text-xs font-extrabold font-sans">{planCard.name}</span>
                            <span className={`text-[10px] font-mono font-extrabold ${isActive ? 'text-brand' : 'text-text-muted'}`}>{planCard.price}</span>
                          </div>
                          <span className="text-[9.5px] text-text-secondary mt-3 font-semibold leading-relaxed">
                            • {planCard.bullet1}
                            <br />
                            • {planCard.bullet2}
                            <br />
                            • {planCard.bullet3}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Transaction history */}
                  <div className="pt-3 border-t border-border/50 space-y-2">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Past Billing Transactions Ledger</span>
                    <div className="border border-border rounded-xl bg-surface overflow-hidden divide-y divide-border/60 text-xs font-semibold text-text-secondary leading-none">
                      {mockTransactions.map(txn => (
                        <div key={txn.id} className="flex justify-between items-center p-3 hover:bg-surface-2/20 transition-colors">
                          <div className="flex items-center space-x-4">
                            <span className="font-mono text-text-muted">{txn.date}</span>
                            <span className="text-text-primary font-bold">{txn.plan}</span>
                          </div>
                          <div className="flex items-center space-x-3.5">
                            <span className="font-mono text-text-primary">${txn.amount.toFixed(2)}</span>
                            <button className="text-brand hover:underline flex items-center text-[10px]" onClick={() => toast.success("Mock invoice PDF compile complete!")}>
                              <Download className="w-3.5 h-3.5 mr-1" />
                              <span>PDF</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 5: Discoverability Subdomain Controls */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Discoverability Visibility Controls</h3>
                <Card variant="standard" className="p-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { id: 'public', title: 'Public Visibility', desc: 'Appear in the Brand public directory. Highly discoverable and indexable by verified partners.', color: 'text-brand' },
                      { id: 'unlisted', title: 'Unlisted Kit', desc: 'Hidden from search directories. Only accessible via secure direct pitch link redirects.', color: 'text-amber-500' },
                      { id: 'private', title: 'Completely Private', desc: 'Strictly for deal pipeline management. Completely hidden from directory query indexes.', color: 'text-red-500' }
                    ].map(card => {
                      const isActive = profileVisibilityBuffer === card.id;
                      return (
                        <div
                          key={card.id}
                          onClick={() => setProfileVisibilityBuffer(card.id)}
                          className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col leading-tight select-none ${
                            isActive ? 'border-brand bg-brand-light/10' : 'border-border hover:bg-surface-2/10'
                          }`}
                        >
                          <span className="text-xs font-bold text-text-primary flex items-center space-x-1">
                            <Globe className={`w-3.5 h-3.5 ${card.color}`} />
                            <span>{card.title}</span>
                          </span>
                          <span className="text-[10px] text-text-muted mt-2.5 leading-relaxed">{card.desc}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-border/60 gap-4">
                    <div className="flex flex-col select-none leading-tight max-w-[70%]">
                      <span className="text-xs font-bold text-text-primary flex items-center space-x-1">
                        <span>Personal Media Kit Subdomain</span>
                        <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-[7.5px] font-bold text-indigo-500 uppercase ml-1">Business Tier Only</span>
                      </span>
                      <span className="text-[10px] text-text-muted mt-1 leading-normal">
                        Route your public media kit to a clean vanity subdomain path (e.g. yourname.dealhive.io).
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <input
                        type="text"
                        value={profileSubdomainBuffer}
                        onChange={e => setProfileSubdomainBuffer(e.target.value)}
                        className="h-9 px-2.5 border border-border bg-surface text-xs rounded-lg outline-none font-bold text-text-primary"
                        placeholder="vanity-subdomain"
                      />
                      <span className="text-xs text-text-muted font-bold font-mono">.dealhive.io</span>
                    </div>
                  </div>

                  {isDiscoverabilityDirty && (
                    <div className="flex justify-end space-x-2 pt-3 border-t border-border mt-3 animate-stagger-item">
                      <Button variant="secondary" onClick={handleResetDiscoverability}>Cancel</Button>
                      <Button variant="primary" onClick={handleSaveDiscoverability}>Save changes</Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* TAB 6: Deal Defaults */}
          {activeTab === 'defaults' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Sponsorship Deal Defaults</h3>
                <Card variant="standard" className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Kill Fee Percent (%)" type="number" value={String(dealDefaultsKillFee)} onChange={e => setDealDefaultsKillFee(Number(e.target.value) || 0)} />
                    <InputField label="Exclusivity Window period (Days)" type="number" value={String(dealDefaultsExclusivity)} onChange={e => setDealDefaultsExclusivity(Number(e.target.value) || 0)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Usage Rights licensing window (Months)" type="number" value={String(dealDefaultsUsageRights)} onChange={e => setDealDefaultsUsageRights(Number(e.target.value) || 0)} />
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Default Deal format template</label>
                      <select value={dealDefaultsFormat} onChange={e => setDealDefaultsFormat(e.target.value)} className="h-10 px-3 border border-border bg-surface text-xs rounded-lg outline-none font-bold text-text-primary">
                        <option value="integration">Integration Segment (30-60s)</option>
                        <option value="dedicated">Dedicated Product video review</option>
                        <option value="shorts">Shorts/Reels pack</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 pt-1 select-none">
                    <label className="flex items-center space-x-2.5 text-xs font-semibold text-text-secondary cursor-pointer">
                      <input type="checkbox" checked={dealDefaultsAutoInvoice} onChange={e => setDealDefaultsAutoInvoice(e.target.checked)} className="rounded text-brand w-4 h-4" />
                      <span>Auto-generate split invoices on contract signatures</span>
                    </label>
                    <label className="flex items-center space-x-2.5 text-xs font-semibold text-text-secondary cursor-pointer">
                      <input type="checkbox" checked={dealDefaultsAutoPopulate} onChange={e => setDealDefaultsAutoPopulate(e.target.checked)} className="rounded text-brand w-4 h-4" />
                      <span>Auto-apply presets to new incoming brand offers</span>
                    </label>
                  </div>

                  {isDefaultsDirty && (
                    <div className="flex justify-end space-x-2 pt-3 border-t border-border mt-3 animate-stagger-item">
                      <Button variant="secondary" onClick={handleResetDealDefaults}>Cancel</Button>
                      <Button variant="primary" onClick={handleSaveDealDefaults}>Save changes</Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* TAB 7: Deal Templates presets */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Sponsorship Templates</h3>
                  <Button variant="primary" onClick={() => setIsCreateTemplateOpen(true)} className="text-[10px] py-1 px-2.5 leading-none">
                    + Add Preset
                  </Button>
                </div>

                <div className="divide-y divide-border border border-border rounded-xl bg-surface overflow-hidden shadow-sm">
                  {dealTemplates.length === 0 ? (
                    <div className="p-8 text-center text-xs text-text-muted">No deal templates generated yet.</div>
                  ) : (
                    dealTemplates.map(temp => (
                      <div key={temp.id} className="flex justify-between items-center p-4 hover:bg-surface-2/10 transition-colors">
                        <div className="flex flex-col leading-tight min-w-0">
                          <span className="text-xs font-bold text-text-primary flex items-center space-x-2">
                            <span>{temp.name}</span>
                            {temp.is_default && <span className="bg-brand/10 border border-brand/20 text-brand text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase leading-none">Default</span>}
                          </span>
                          <span className="text-[10px] text-text-muted mt-1 leading-normal font-semibold">
                            {temp.deal_type} &middot; ${temp.default_rate.toLocaleString()} &middot; {temp.default_payment_terms}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {!temp.is_default && (
                            <button onClick={() => handleSetDefaultTemplate(temp.id)} className="text-[10px] font-bold text-brand hover:underline">
                              Set Default
                            </button>
                          )}
                          <button onClick={() => handleDeleteTemplate(temp.id)} className="text-[10px] font-bold text-red-500 hover:underline">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: Team Roster workspace delegation */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Workspace Managers</h3>
                  <Button variant="primary" onClick={() => setIsAddTeamMemberOpen(true)} className="text-[10px] py-1 px-2.5 leading-none">
                    + Add Manager
                  </Button>
                </div>

                <div className="divide-y divide-border border border-border rounded-xl bg-surface overflow-hidden shadow-sm">
                  {teamMembers.map(member => (
                    <div key={member.email} className="flex justify-between items-center p-4 hover:bg-surface-2/10 transition-colors">
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <img src={member.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80"} alt={member.full_name} className="w-10 h-10 rounded-full object-cover border border-border" />
                        <div className="flex flex-col min-w-0 leading-tight">
                          <span className="text-xs font-bold text-text-primary truncate">{member.full_name || member.email}</span>
                          <span className="text-[10px] text-text-secondary mt-1">{member.title || 'Workspace Manager'}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3.5">
                        <select
                          value={member.role}
                          onChange={e => handleUpdateMemberRole(member.email, e.target.value)}
                          className="h-8 px-2 border border-border bg-surface text-[10.5px] rounded outline-none font-bold text-text-secondary cursor-pointer"
                        >
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="billing">Billing</option>
                        </select>
                        <button className="text-[10px] font-bold text-red-500 hover:text-red-700" onClick={() => handleRemoveMember(member.email)}>
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Invites list */}
              {teamInvites.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-bold text-text-secondary uppercase block">Dispatched Pending Invites</span>
                  <div className="divide-y divide-border border border-border rounded-xl bg-surface overflow-hidden shadow-sm">
                    {teamInvites.map(invite => (
                      <div key={invite.id} className="flex justify-between items-center p-4 hover:bg-surface-2/10 transition-colors text-xs font-semibold text-text-secondary leading-none">
                        <div className="flex flex-col leading-tight min-w-0">
                          <span className="text-text-primary font-bold truncate">{invite.email}</span>
                          <span className="text-[9.5px] text-text-muted mt-1 font-semibold uppercase tracking-wider">{invite.role} &middot; Expiring soon</span>
                        </div>
                        <div className="flex items-center space-x-3.5">
                          <button onClick={() => handleResendInvite(invite.id)} className="text-[10px] font-bold text-brand hover:underline">Resend</button>
                          <button onClick={() => handleCancelInvite(invite.id)} className="text-[10px] font-bold text-red-500 hover:underline">Cancel</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: Connected Integrations */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">API Gateways & Webhooks</h3>
                <Card variant="standard" className="p-5 space-y-4">
                  <p className="text-xs text-text-muted leading-relaxed select-none">
                    Fire live payloads to external automated endpoints (Notion databases, Slack alerts, custom CRM sheets) on deal state transitions.
                  </p>
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <InputField
                        label="Zapier Catch Webhook URL"
                        value={webhookUrl}
                        onChange={e => setWebhookUrl(e.target.value)}
                        placeholder="https://hooks.zapier.com/hooks/catch/..."
                      />
                    </div>
                    <Button variant="primary" className="h-9 text-xs mb-0.5" onClick={handleRegisterWebhook}>
                      Add Route
                    </Button>
                  </div>

                  <div className="pt-2">
                    <span className="text-[9.5px] font-bold text-text-secondary uppercase select-none">Registered Webhooks Logs</span>
                    <div className="border border-border rounded-xl bg-surface overflow-hidden divide-y divide-border/60 text-xs font-semibold text-text-secondary leading-none mt-2">
                      {webhookRoutes.map(route => (
                        <div key={route.id} className="flex justify-between items-center p-3 hover:bg-surface-2/20 transition-colors gap-4">
                          <div className="flex flex-col leading-tight min-w-0">
                            <span className="text-text-primary font-mono truncate max-w-[340px] font-bold">{route.url}</span>
                            <span className="text-[9px] text-text-muted mt-1 leading-none font-semibold">Event: {route.event}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button className="text-brand hover:underline font-bold text-[10px]" onClick={handleTestWebhook}>Test Endpoint</button>
                            <button className="text-red-500 hover:underline font-bold text-[10px]" onClick={() => handleRemoveWebhook(route.id)}>Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Developer Keys list */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Developer API Tokens</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newApiKeyName}
                      onChange={e => setNewApiKeyName(e.target.value)}
                      placeholder="API application name..."
                      className="h-8 px-2.5 border border-border bg-surface text-xs rounded-lg outline-none font-bold text-text-primary"
                    />
                    <Button variant="primary" onClick={handleGenerateApiKey} className="text-[10px] py-1 px-2.5 leading-none">
                      Generate Key
                    </Button>
                  </div>
                </div>

                <div className="border border-border rounded-xl bg-surface overflow-hidden divide-y divide-border/60 text-xs font-semibold text-text-secondary leading-none">
                  {developerApiKeys.map(key => (
                    <div key={key.id} className="flex justify-between items-center p-3.5 hover:bg-surface-2/20 transition-colors gap-4">
                      <div className="flex flex-col leading-tight min-w-0">
                        <span className="text-text-primary font-bold truncate">{key.name}</span>
                        <span className="font-mono text-[9.5px] text-text-muted mt-1.5">{key.key}</span>
                      </div>
                      <div className="flex items-center space-x-3.5 flex-shrink-0">
                        <span className="text-[9.5px] text-text-muted font-semibold">Used: {key.lastUsed}</span>
                        <button className="text-red-500 hover:underline font-bold text-[10px]" onClick={() => handleRevokeApiKey(key.id)}>Revoke</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected channels widgets */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider font-sans">Connected Integrations</h3>
                <Card variant="standard" className="p-5 space-y-4">
                  {/* YouTube Sync integration */}
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded bg-red-50 border border-red-200 flex items-center justify-center text-red-500 flex-shrink-0">
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col leading-tight select-none">
                        <span className="text-xs font-bold text-text-primary">YouTube Verified API channel</span>
                        <span className="text-[9.5px] text-text-muted mt-1 leading-normal">
                          Linked Profile: <span className="font-bold text-text-primary">Sarah Jenkins Creates ({youtubeSubscribers} Subs)</span> &middot; Last synced: {youtubeLastSynced}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        isYoutubeConnected ? 'bg-success-bg border border-success-border text-success' : 'bg-red-50 border border-red-200 text-red-600'
                      }`}>
                        {isYoutubeConnected ? 'Connected' : 'Disconnected'}
                      </span>
                      {isYoutubeConnected ? (
                        <>
                          <button onClick={handleConnectYoutube} className="p-1 hover:bg-surface-2 rounded text-text-muted hover:text-brand transition-colors" title="Reconnect YouTube API OAuth">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDisconnectService('youtube')} className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700 transition-colors" title="Disconnect YouTube Channel">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <Button variant="secondary" onClick={handleConnectYoutube} className="px-2.5 py-1 text-[9px] uppercase font-bold">Connect</Button>
                      )}
                    </div>
                  </div>

                  {/* Instagram Sync integration */}
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-500 flex-shrink-0">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-bold text-text-primary">Instagram Demographics API</span>
                        <span className="text-[9.5px] text-text-muted mt-1 leading-normal">
                          {isInstagramConnected ? `Linked Profile: @sarah_creates (${instagramFollowers} Followers) · Last synced: ${instagramLastSynced}` : "Unlock demographics analysis directly via Meta Graph API."}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        isInstagramConnected ? 'bg-success-bg border border-success-border text-success' : 'bg-red-50 border border-red-200 text-red-600'
                      }`}>
                        {isInstagramConnected ? 'Connected' : 'Disconnected'}
                      </span>
                      {isInstagramConnected ? (
                        <>
                          <button onClick={handleConnectInstagram} className="p-1 hover:bg-surface-2 rounded text-text-muted hover:text-brand transition-colors" title="Reconnect Instagram API">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDisconnectService('instagram')} className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700 transition-colors" title="Disconnect Instagram Profile">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <Button variant="secondary" onClick={handleConnectInstagram} className="px-2.5 py-1 text-[9px] uppercase font-bold">Connect</Button>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 10: Aesthetics theme layout configuration */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Display Settings</h3>
                <Card variant="standard" className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Color Theme Style</label>
                      <select value={themePreferenceBuffer} onChange={e => setThemePreferenceBuffer(e.target.value)} className="h-9 px-3 border border-border bg-surface text-xs rounded-lg outline-none font-bold text-text-primary">
                        <option value="light">Light Slate Mode (Standard)</option>
                        <option value="dark">Dark HSL Lavender Mode (Sleek)</option>
                        <option value="system">Follow System Defaults</option>
                      </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Locale Number Formatting</label>
                      <select value={localeNumberFormatBuffer} onChange={e => setLocaleNumberFormatBuffer(e.target.value)} className="h-9 px-3 border border-border bg-surface text-xs rounded-lg outline-none font-bold text-text-primary">
                        <option value="US">US Formatting (e.g. 100,000.00)</option>
                        <option value="IN">Indian Formatting (e.g. 1,00,000.00)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Date Layout Formats</label>
                      <select value={dateFormatBuffer} onChange={e => setDateFormatBuffer(e.target.value)} className="h-9 px-3 border border-border bg-surface text-xs rounded-lg outline-none font-bold text-text-primary">
                        <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 15/05/2026)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 05/15/2026)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-05-15)</option>
                      </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Language Preference</label>
                      <select value={languagePreferenceBuffer} onChange={e => setLanguagePreferenceBuffer(e.target.value)} className="h-9 px-3 border border-border bg-surface text-xs rounded-lg outline-none font-bold text-text-primary">
                        <option value="en">English (US)</option>
                        <option value="es">Spanish (Español)</option>
                        <option value="de">German (Deutsch)</option>
                      </select>
                    </div>
                  </div>

                  {isAppearanceDirty && (
                    <div className="flex justify-end space-x-2 pt-3 border-t border-border mt-3 animate-stagger-item">
                      <Button variant="secondary" onClick={handleResetAppearance}>Cancel</Button>
                      <Button variant="primary" onClick={handleSaveAppearance}>Save changes</Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* TAB 11: Privacy & GDPR */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">GDPR & Data Protection tools</h3>
                <Card variant="standard" className="p-5 space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-border/50">
                    <div className="flex flex-col select-none leading-tight max-w-[70%]">
                      <span className="text-xs font-bold text-text-primary flex items-center space-x-1">
                        <span>Anonymize Usage Diagnostics Analytics</span>
                      </span>
                      <span className="text-[10px] text-text-muted mt-1 leading-normal">
                        Prevent tracking of page clicks, navigation paths, and load speed metrics to prioritize user privacy.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={consentAnalytics} onChange={e => setConsentAnalytics(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand" />
                    </label>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between pt-1 gap-4 select-none leading-none">
                    <div className="flex flex-col leading-tight select-none">
                      <span className="text-xs font-bold text-text-primary">Download All Personal Database Data</span>
                      <span className="text-[9.5px] text-text-muted mt-1 leading-normal">
                        Obtain a structured backup JSON file of your profile settings, transactions history, and contract parameters (GDPR compliant).
                      </span>
                    </div>
                    <Button variant="secondary" className="px-4 py-2 font-bold text-xs" onClick={handleExportData} loading={isExportingData}>
                      Export Settings Data
                    </Button>
                  </div>

                  {isExportingData && (
                    <div className="w-full bg-surface-2 rounded-full h-1.5 mt-2 overflow-hidden border border-border">
                      <div className="bg-brand h-1.5 transition-all duration-300" style={{ width: `${exportProgress}%` }} />
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* TAB 12: Security & System Diagnostics error logs */}
          {activeTab === 'security_logs' && (
            <div className="space-y-6">
              {/* Rate Limits diagnostics */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Sliding Window Rate Limit stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'ai', title: 'AI counters queries', stats: rateLimiterStats.ai },
                    { key: 'auth', title: 'Auth rate limiter', stats: rateLimiterStats.auth },
                    { key: 'db', title: 'DB Writes rate limit', stats: rateLimiterStats.db }
                  ].map(stat => (
                    <Card key={stat.key} variant="standard" className="p-4 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">{stat.title}</span>
                      <div className="flex justify-between items-baseline mt-3 select-none">
                        <span className="text-2xl font-bold font-mono text-text-primary">
                          {stat.stats?.remaining}/{stat.stats?.max}
                        </span>
                        <span className="text-[10px] font-semibold text-text-muted">Quota Remaining</span>
                      </div>
                      <div className="w-full bg-surface-2 rounded-full h-1 mt-2.5 overflow-hidden">
                        <div
                          className={`h-1 transition-all ${
                            (stat.stats?.remaining / stat.stats?.max) < 0.3 ? 'bg-red-500' : 'bg-brand'
                          }`}
                          style={{ width: `${(stat.stats?.remaining / stat.stats?.max) * 100}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-text-muted mt-2 block font-mono">
                        Sliding window: {stat.stats?.windowSecs}s
                      </span>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Diagnostic Error Logs */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider flex items-center space-x-1.5">
                    <Terminal className="w-4 h-4 text-brand animate-pulse" />
                    <span>Diagnostics Live Error Log console</span>
                  </h3>
                  <button
                    onClick={async () => {
                      await supabaseClient.errorLog.clear();
                      toast.success("Error diagnostics log successfully cleared!");
                    }}
                    className="text-[10px] font-extrabold text-red-500 hover:text-red-700 uppercase tracking-wide leading-none"
                  >
                    Clear Logs [x]
                  </button>
                </div>

                <Card variant="standard" className="p-4 border border-border bg-[#0d0d0f] shadow-inner select-text h-[300px] overflow-y-auto no-scrollbar font-mono">
                  <span className="text-[10px] font-bold text-brand uppercase tracking-widest leading-none border-b border-border/20 pb-2 block select-none">
                    [SYSTEM EXCEPTIONS TRACKING LOGS]
                  </span>
                  {errorLogs.length === 0 ? (
                    <div className="text-[10.5px] text-[#8e8e93] leading-relaxed select-none py-12 text-center">
                      No diagnostics logged exception errors recorded. System operates nominally.
                    </div>
                  ) : (
                    errorLogs.map(log => (
                      <div key={log.id} className="py-2.5 border-b border-border/10 last:border-0 font-mono text-[10.5px] leading-relaxed">
                        <div className="flex justify-between text-[9px] text-text-muted select-none">
                          <span className="text-red-500 font-bold">[{log.id.toUpperCase()}]</span>
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-red-400 font-bold mt-1 select-text">{log.error_message}</p>
                        {log.error_stack && (
                          <pre className="text-[9px] text-[#8e8e93] leading-normal select-text mt-1 max-h-[80px] overflow-y-auto border border-border/5 rounded p-1.5 bg-[#09090b]">
                            {log.error_stack}
                          </pre>
                        )}
                        <p className="text-[9px] text-text-muted mt-1 select-none">URL: {log.url} &middot; UA: {log.user_agent}</p>
                      </div>
                    ))
                  )}
                </Card>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Invite Manager Modal */}
      {isAddTeamMemberOpen && (
        <Modal
          isOpen={isAddTeamMemberOpen}
          onClose={() => setIsAddTeamMemberOpen(false)}
          title="Add Team Workspace Manager"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsAddTeamMemberOpen(false)}>Cancel</Button>
              <Button variant="primary" type="submit" form="invite-member-form">Send Invite</Button>
            </>
          }
        >
          <form id="invite-member-form" onSubmit={handleInviteMember} className="space-y-4">
            <InputField
              label="Manager Email Address"
              value={newTeamMemberEmail}
              onChange={e => setNewTeamMemberEmail(e.target.value)}
              placeholder="e.g. manager@samsung.com"
              required
            />
            <InputField
              label="Job Title / Assignment"
              value={newTeamMemberTitle}
              onChange={e => setNewTeamMemberTitle(e.target.value)}
              placeholder="e.g. Director of Campaign Splits"
            />
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Workspace Access Privileges Role</label>
              <select
                value={newTeamMemberRole}
                onChange={e => setNewTeamMemberRole(e.target.value)}
                className="h-10 px-2 border border-border bg-surface text-xs rounded-md outline-none font-semibold text-text-secondary"
              >
                <option value="admin">Admin (Full delegation privileges)</option>
                <option value="editor">Editor (Negotiate term sheets only)</option>
                <option value="billing">Billing (Disperse Stripe Connect payouts)</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Template Modal */}
      {isCreateTemplateOpen && (
        <Modal
          isOpen={isCreateTemplateOpen}
          onClose={() => setIsCreateTemplateOpen(false)}
          title="Generate Deal Presets Template"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsCreateTemplateOpen(false)}>Cancel</Button>
              <Button variant="primary" type="submit" form="create-template-form">Save Template</Button>
            </>
          }
        >
          <form id="create-template-form" onSubmit={handleCreateTemplate} className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            <InputField
              label="Preset Name label"
              value={newTemplateName}
              onChange={e => setNewTemplateName(e.target.value)}
              placeholder="e.g. YouTube Dedicated Video template"
              required
            />
            <InputField
              label="Template Description"
              value={newTemplateDescription}
              onChange={e => setNewTemplateDescription(e.target.value)}
              placeholder="Explain the structure of this preset deal terms..."
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Deal format</label>
                <select
                  value={newTemplateDealType}
                  onChange={e => setNewTemplateDealType(e.target.value)}
                  className="h-10 px-2 border border-border bg-surface text-xs rounded-md outline-none font-semibold text-text-secondary"
                >
                  <option value="Integration">YouTube Integration segment</option>
                  <option value="Dedicated Video">Dedicated YouTube Video</option>
                  <option value="Shorts">YouTube Shorts package</option>
                </select>
              </div>
              <InputField
                label="Agreed Rate ($)"
                type="number"
                value={String(newTemplateRate)}
                onChange={e => setNewTemplateRate(Number(e.target.value) || 0)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Exclusivity (Days)" type="number" value={String(newTemplateExclusivity)} onChange={e => setNewTemplateExclusivity(Number(e.target.value) || 0)} />
              <InputField label="Usage Rights (Months)" type="number" value={String(newTemplateUsageRights)} onChange={e => setNewTemplateUsageRights(Number(e.target.value) || 0)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Revisions Rounds" type="number" value={String(newTemplateRevisions)} onChange={e => setNewTemplateRevisions(Number(e.target.value) || 0)} />
              <InputField label="Kill Fee (%)" type="number" value={String(newTemplateKillFee)} onChange={e => setNewTemplateKillFee(Number(e.target.value) || 0)} />
            </div>
          </form>
        </Modal>
      )}

      {/* Adjust Subscription plan Modal */}
      {isPlanModalOpen && (
        <Modal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          title="Adjust Workspace Subscription Tier"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsPlanModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAdjustSubscriptionPlan}>Confirm Change</Button>
            </>
          }
        >
          <div className="space-y-3 select-none">
            <span className="text-xs text-text-secondary leading-relaxed block">
              You are about to adjust your active subscription billing. Pro-tier features (such as Zapier integrations hub, unlimited deals pipelines, and verified demographics data) adapt in real-time to your selected limits.
            </span>
            <div className="p-3.5 bg-brand-light/20 border border-brand/20 rounded-xl leading-none">
              <span className="text-[10px] text-text-muted uppercase font-bold">Selected Subscription Plan</span>
              <span className="text-sm font-bold text-text-primary capitalize mt-2 block">
                Creator {selectedPlan} plan
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* File Tax Form Modal */}
      {isTaxModalOpen && (
        <Modal
          isOpen={isTaxModalOpen}
          onClose={() => setIsTaxModalOpen(false)}
          title="File Annual Payout Tax Form"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsTaxModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleFileTaxForm}>Submit verification</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5 select-none">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Document Type</label>
              <select value={taxFormType} onChange={e => setTaxFormType(e.target.value)} className="h-10 px-2 border border-border bg-surface text-xs rounded-md outline-none font-bold text-text-secondary">
                <option value="w9">W-9 (United States Resident / Entity)</option>
                <option value="w8ben">W-8BEN (International individual)</option>
              </select>
            </div>
            <InputField
              label="EIN or SSN Tax Identification number"
              value={taxEinSsn}
              onChange={e => setTaxEinSsn(e.target.value)}
              placeholder="XX-XXXXXXX"
              required
            />
            <InputField
              label="Legal Signature Certificate (Type full name)"
              value={taxSignature}
              onChange={e => setTaxSignature(e.target.value)}
              placeholder="Sarah Jenkins"
              required
            />
          </div>
        </Modal>
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Permanently Deactivate Account"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
                onClick={handleDeleteAccount}
              >
                Permanently Deactivate
              </Button>
            </>
          }
        >
          <div className="space-y-4 select-none">
            <p className="text-xs text-text-secondary leading-relaxed">
              ⚠️ Warning: This deactivation is irreversible. Wiping databases will permanently delete contracts audit trails, release escrows funds splits back to sponsors, and purge connected accounts credentials.
            </p>
            <InputField
              label='Type "DELETE" to authorize account purge'
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              required
            />
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
              <Button variant="secondary" onClick={() => completeServiceSync(true)}>
                Connect OAuth Demo Flow
              </Button>
              <Button variant="primary" onClick={() => completeServiceSync(false)}>
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