import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ExternalLink, 
  Download, 
  ShieldCheck, 
  Clock, 
  Video,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { convexClient as supabaseClient } from '../services/convex';
import { Card } from '../components';

interface AssetVaultItem {
  id: string;
  deal_id: string;
  campaignTitle: string;
  fileName: string;
  fileUrl: string;
  durationMonths: number;
  channels: string[];
  exclusivityMonths: number;
  createdAt: string;
  expiresAt: string;
  brandLogo: string;
}

const INITIAL_ASSETS: AssetVaultItem[] = [
  {
    id: 'asset_samsung_1',
    deal_id: 'deal_samsung_galaxy',
    campaignTitle: 'Galaxy S26 Ultra Launch Integration',
    fileName: 'Galaxy_S26_Ultra_Unboxing_SarahCreates.mp4',
    fileUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    durationMonths: 12,
    channels: ['YouTube Organic', 'Instagram organic', 'Samsung Ads'],
    exclusivityMonths: 1,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 330 * 24 * 60 * 60 * 1000).toISOString(),
    brandLogo: 'https://logo.clearbit.com/samsung.com'
  },
  {
    id: 'asset_nord_1',
    deal_id: 'deal_nordvpn_protect',
    campaignTitle: 'Cybersecurity Dedicated Review',
    fileName: 'NordVPN_Sponsorship_Draft_Final.mp4',
    fileUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    durationMonths: 6,
    channels: ['YouTube Organic', 'Organic Social Cuts'],
    exclusivityMonths: 1,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 170 * 24 * 60 * 60 * 1000).toISOString(),
    brandLogo: 'https://logo.clearbit.com/nordvpn.com'
  },
  {
    id: 'asset_lumen_1',
    deal_id: 'deal_lumen_morning',
    campaignTitle: 'Morning Routine Lifestyle Integration',
    fileName: 'Lumen_Metabolism_Vlog_Sarah_Jenkins.mp4',
    fileUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    durationMonths: 3,
    channels: ['YouTube Organic'],
    exclusivityMonths: 0,
    createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Expiring in 5 days!
    brandLogo: 'https://logo.clearbit.com/lumen.me'
  }
];

export const ContentLibrary: React.FC = () => {
  const [assets, setAssets] = useState<AssetVaultItem[]>(INITIAL_ASSETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('all');

  useEffect(() => {
    const syncUploadedAssets = async () => {
      try {
        const dbAssets = await supabaseClient.contentLibrary.list();
        if (dbAssets && dbAssets.length > 0) {
          const formattedDbAssets: AssetVaultItem[] = dbAssets.map((asset: any) => {
            const dealName = asset.deal_id === 'deal_nordvpn_protect' 
              ? 'Cybersecurity Dedicated Review' 
              : 'Lifestyle Campaign Integration';
            const brandLogo = asset.deal_id === 'deal_nordvpn_protect'
              ? 'https://logo.clearbit.com/nordvpn.com'
              : 'https://logo.clearbit.com/adobe.com';

            return {
              id: asset.id,
              deal_id: asset.deal_id,
              campaignTitle: dealName,
              fileName: asset.file_name,
              fileUrl: asset.asset_url,
              durationMonths: asset.usage_duration_months,
              channels: asset.usage_channels,
              exclusivityMonths: asset.exclusivity_period_months,
              createdAt: asset.created_at,
              expiresAt: asset.expires_at,
              brandLogo
            };
          });
          // Merge lists cleanly
          setAssets(prev => {
            const existingIds = new Set(prev.map(a => a.id));
            const fresh = formattedDbAssets.filter(f => !existingIds.has(f.id));
            return [...fresh, ...prev];
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    syncUploadedAssets();
  }, []);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = selectedChannel === 'all' || 
                           asset.channels.some(c => c.toLowerCase().includes(selectedChannel.toLowerCase()));
    return matchesSearch && matchesChannel;
  });

  const getDaysRemaining = (expiryDate: string) => {
    const remaining = new Date(expiryDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24)));
  };

  const handleRenewRights = (_assetId: string) => {
    toast.success('Licensing extension request sent successfully to co-partner!');
  };

  return (
    <div className="w-full max-w-[1140px] mx-auto py-7 px-8 space-y-7 animate-stagger-item select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex flex-col select-none">
          <h2 className="text-xl font-bold text-text-primary sora-heading leading-none flex items-center">
            <FolderOpen className="w-5 h-5 mr-2 text-brand" />
            Sponsorship Deliverables Vault & Content Library
          </h2>
          <p className="text-xs text-text-muted mt-1.5 leading-none">
            Auto-archive approved deliverables, review exclusive licensing terms, and track active usage rights expiration alerts.
          </p>
        </div>

        <span className="text-[10px] bg-brand-light/30 border border-brand/10 text-brand px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
          Legal Compliance Vault Active
        </span>
      </div>

      {/* Active Alerts for Expiring Rights */}
      {(() => {
        const expiringAssets = assets.filter(a => getDaysRemaining(a.expiresAt) <= 15);
        if (expiringAssets.length === 0) return null;
        return (
          <div className="rounded-xl p-4 border bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-200 backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between transition-spring hover:-translate-y-0.5 shadow-sm duration-300">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500 animate-bounce" />
              <div className="flex flex-col">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-500">Rights Expiring Alert</h4>
                <span className="text-sm font-bold text-red-950 dark:text-red-50 mt-1.5 sora-heading">
                  Sponsorship usage rights for {expiringAssets.length} deliverables expire within 15 days!
                </span>
                <span className="text-xs text-red-800/90 dark:text-red-200/90 mt-1">
                  Using deliverable assets on active social ads channels beyond licensing windows violates IP contracts. Propose extensions immediately.
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface border border-border p-4 rounded-xl shadow-sm">
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search assets or campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-surface border border-border rounded-lg text-xs outline-none focus:border-brand font-semibold shadow-inner"
          />
        </div>

        {/* Channels pills */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold text-text-secondary uppercase">Usage Filter:</span>
          <div className="flex bg-surface-2/60 border border-border p-0.5 rounded-lg select-none">
            {(['all', 'youtube', 'instagram', 'ads'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedChannel(tab)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                  selectedChannel === tab 
                    ? 'bg-surface shadow text-brand' 
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map(asset => {
          const daysLeft = getDaysRemaining(asset.expiresAt);
          const isCritical = daysLeft <= 15;
          return (
            <Card 
              key={asset.id} 
              variant="standard"
              className="p-5 border border-border hover:border-brand/20 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 bg-surface flex flex-col justify-between"
            >
              <div className="space-y-4">
                
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded overflow-hidden border border-border bg-surface-2 flex items-center justify-center flex-shrink-0">
                      <img src={asset.brandLogo} alt="Logo" className="w-6 h-6 object-contain" />
                    </div>
                    <div className="flex flex-col leading-tight select-none">
                      <span className="text-xs font-bold text-text-primary truncate max-w-[150px]">
                        {asset.campaignTitle}
                      </span>
                      <span className="text-[9px] text-text-muted mt-0.5 font-semibold">Asset ID: #{asset.id}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider border select-none ${
                    isCritical 
                      ? 'text-red-500 bg-red-500/10 border-red-500/20' 
                      : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                    {isCritical ? `${daysLeft} Days Left` : 'Active License'}
                  </span>
                </div>

                {/* File info card */}
                <div className="flex items-start space-x-2.5 bg-surface-2/30 border border-border/40 p-3 rounded-lg">
                  <Video className="w-7 h-7 text-brand mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col min-w-0 leading-tight select-none">
                    <span className="text-xs font-bold text-text-secondary truncate pr-2">
                      {asset.fileName}
                    </span>
                    <span className="text-[9.5px] text-text-muted mt-1 font-mono font-bold">Format: MP4 (H.264)</span>
                  </div>
                </div>

                {/* Licensing Details */}
                <div className="space-y-2 border-t border-border/40 pt-3 select-none">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Usage Rights terms</span>
                  
                  <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold text-text-secondary leading-tight pt-1">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-text-muted mr-1" />
                      <span>Duration: {asset.durationMonths} Months</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-text-muted mr-1" />
                      <span>Exclusivity: {asset.exclusivityMonths} Mo</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-1">Approved Channels</span>
                    <div className="flex flex-wrap gap-1">
                      {asset.channels.map((chan, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-brand-light/30 border border-brand/10 text-brand text-[8.5px] font-bold rounded">
                          {chan}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="border-t border-border/40 pt-4 mt-4 flex justify-between items-center select-none">
                <button
                  onClick={() => window.open(asset.fileUrl, '_blank')}
                  className="px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-border text-[10px] font-bold text-text-secondary rounded-lg flex items-center space-x-1.5 active:scale-95 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
                  <span>Preview</span>
                </button>

                <div className="flex space-x-1.5">
                  {isCritical && (
                    <button
                      onClick={() => handleRenewRights(asset.id)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[10px] font-bold text-amber-600 rounded-lg active:scale-95 transition-all"
                    >
                      Renew
                    </button>
                  )}
                  <button
                    onClick={() => {
                      toast.success('Download initialized successfully!');
                    }}
                    className="px-3 py-1.5 bg-brand hover:bg-brand-dark text-white text-[10px] font-bold rounded-lg flex items-center space-x-1 shadow active:scale-95 transition-spring hover:-translate-y-0.5"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
export default ContentLibrary;

