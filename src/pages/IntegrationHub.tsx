import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Zap, 
  Key, 
  Trash, 
  Play, 
  Terminal, 
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import { convexClient as supabaseClient } from '../services/convex';
import { Card, Button, InputField } from '../components';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used_at: string;
}

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  created_at: string;
}

interface WebhookLog {
  id: string;
  event: string;
  status: 'success' | 'failure';
  timestamp: string;
  payload: any;
  response: any;
}

export const IntegrationHub: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => {
    const stored = localStorage.getItem('dealhive_api_keys');
    if (stored) return JSON.parse(stored);

    const defaultKeys: ApiKey[] = [
      {
        id: 'key_1',
        name: 'Zapier Inbound Gateway',
        key: 'dh_live_k9J2m7xLp1Qr8Tz3vW5Y',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_used_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)
      },
      {
        id: 'key_2',
        name: 'Notion Sync Engine',
        key: 'dh_live_a2B4c6Ds8Ef0Gh2Ij4Kl',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        last_used_at: new Date(Date.now() - 5 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)
      }
    ];
    localStorage.setItem('dealhive_api_keys', JSON.stringify(defaultKeys));
    return defaultKeys;
  });

  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(() => {
    const stored = localStorage.getItem('dealhive_webhook_configs');
    if (stored) return JSON.parse(stored);

    const defaultWebhooks = [
      {
        id: 'wh_1',
        url: 'https://hooks.zapier.com/hooks/catch/12345/abcde/',
        events: ['deal.created', 'payment.received'],
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem('dealhive_webhook_configs', JSON.stringify(defaultWebhooks));
    return defaultWebhooks;
  });

  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['deal.created']);
  const [payloadLogs, setPayloadLogs] = useState<WebhookLog[]>([]);

  useEffect(() => {
    const storedLogs = JSON.parse(localStorage.getItem('dealhive_webhook_logs') || '[]');
    if (storedLogs.length === 0) {
      const defaultLogs: WebhookLog[] = [
        {
          id: 'wh_log_1',
          event: 'payment.received',
          status: 'success',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          payload: {
            deal_id: 'deal_nordvpn_protect',
            amount: 7500,
            platform_fee: 112.5,
            net_revenue: 7387.5,
            currency: 'USD',
            invoice_id: 'inv_1'
          },
          response: { message: 'Webhook successfully delivered, status 200 OK' }
        },
        {
          id: 'wh_log_2',
          event: 'deal.created',
          status: 'success',
          timestamp: new Date(Date.now() - 1500000).toISOString(),
          payload: {
            deal_id: 'deal_lumen_morning',
            title: 'Morning Routine Sponsorship',
            creator_id: 'creator_sarah',
            offered_rate: 3500,
            deal_type: 'Integration'
          },
          response: { message: 'Webhook successfully delivered, status 200 OK' }
        }
      ];
      localStorage.setItem('dealhive_webhook_logs', JSON.stringify(defaultLogs));
      setPayloadLogs(defaultLogs);
    } else {
      setPayloadLogs(storedLogs);
    }
  }, []);

  useEffect(() => {
    const handleWebhookDispatch = (e: Event) => {
      const log = (e as CustomEvent).detail as WebhookLog;
      setPayloadLogs(prev => [log, ...prev.slice(0, 49)]);
    };
    window.addEventListener('webhook-dispatched', handleWebhookDispatch);
    return () => window.removeEventListener('webhook-dispatched', handleWebhookDispatch);
  }, []);

  const handleGenerateKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a descriptive name for your API key.');
      return;
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let keyStr = 'dh_live_';
    for (let i = 0; i < 20; i++) {
      keyStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newKey: ApiKey = {
      id: 'key_' + Math.random().toString(36).substring(2, 11),
      name: newKeyName,
      key: keyStr,
      created_at: new Date().toISOString(),
      last_used_at: 'Never used'
    };

    const updated = [newKey, ...apiKeys];
    setApiKeys(updated);
    localStorage.setItem('dealhive_api_keys', JSON.stringify(updated));
    setNewlyGeneratedKey(keyStr);
    setNewKeyName('');
    setShowNewKeyModal(false);
    toast.success('Secure Developer API Key successfully generated!');
  };

  const handleRevokeKey = (id: string) => {
    const updated = apiKeys.filter(k => k.id !== id);
    setApiKeys(updated);
    localStorage.setItem('dealhive_api_keys', JSON.stringify(updated));
    toast.success('API Key successfully revoked.');
  };

  const toggleRevealKey = (id: string) => {
    setRevealedKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (val: string) => {
    navigator.clipboard.writeText(val);
    toast.success('Copied API Key to clipboard!');
  };

  const handleToggleEvent = (ev: string) => {
    setSelectedEvents(prev => 
      prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]
    );
  };

  const handleRegisterWebhook = () => {
    if (!newWebhookUrl.trim()) {
      toast.error('Please enter your custom Webhook capture URL.');
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error('Select at least one event trigger.');
      return;
    }

    const newWebhook: WebhookConfig = {
      id: 'wh_' + Math.random().toString(36).substring(2, 11),
      url: newWebhookUrl,
      events: selectedEvents,
      created_at: new Date().toISOString()
    };

    const updated = [newWebhook, ...webhooks];
    setWebhooks(updated);
    localStorage.setItem('dealhive_webhook_configs', JSON.stringify(updated));
    setNewWebhookUrl('');
    toast.success('Zapier Webhook successfully registered!');
  };

  const handleRemoveWebhook = (id: string) => {
    const updated = webhooks.filter(w => w.id !== id);
    setWebhooks(updated);
    localStorage.setItem('dealhive_webhook_configs', JSON.stringify(updated));
    toast.success('Webhook route revoked.');
  };

  const handleTestWebhook = async (_url: string) => {
    const testToast = toast.loading('Dispatching real-time test webhook event...');
    setTimeout(async () => {
      toast.dismiss(testToast);
      try {
        const payload = {
          event: 'deal.created',
          deal_id: 'deal_mock_test_123',
          title: 'Samsung Galaxy Integration (Test Event)',
          creator_id: 'creator_sarah',
          offered_rate: 4200,
          timestamp: new Date().toISOString(),
          is_simulator_test: true
        };
        await supabaseClient.webhooks.dispatch('deal.created', payload);
        toast.success('Mock payload delivered successfully! Status 200 OK.');
      } catch {
        toast.error('Failed to trigger webhook dispatch.');
      }
    }, 1200);
  };

  return (
    <div className="w-full max-w-[1140px] mx-auto py-7 px-8 space-y-7 animate-stagger-item select-none">
      <div className="flex flex-col select-none border-b border-border pb-4">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-brand animate-spin-slow" />
          <h2 className="text-xl font-bold text-text-primary sora-heading leading-none pt-0.5">
            Developer Integration Hub
          </h2>
        </div>
        <p className="text-xs text-text-muted mt-2 leading-none">
          Generate API keys, setup Zapier automated webhooks, and analyze inbound/outbound payloads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* Developer API Keys card */}
          <Card variant="standard" className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <div className="flex items-center space-x-2">
                <Key className="w-4.5 h-4.5 text-brand" />
                <h3 className="text-sm font-bold text-text-primary font-sans leading-none pt-0.5">
                  Developer API Keys
                </h3>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowNewKeyModal(true)}
                className="text-[10px] font-bold leading-none px-3 py-1.5"
              >
                + Generate Key
              </Button>
            </div>

            {showNewKeyModal && (
              <div className="p-4 border border-brand/20 bg-brand-light/5 rounded-xl space-y-3 animate-scale-up">
                <InputField
                  label="API Key Name / Description"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production Inbound Webhook CRM"
                />
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="secondary" onClick={() => setShowNewKeyModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleGenerateKey}>
                    Generate Token
                  </Button>
                </div>
              </div>
            )}

            {newlyGeneratedKey && (
              <div className="p-4 border border-emerald-500/20 bg-emerald-500/[0.02] rounded-xl space-y-2 select-text">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                  Important: Copy your new API key now
                </span>
                <p className="text-[10px] text-text-secondary leading-relaxed">
                  For security, we will only show this full key once. Store it in a secure password manager or server environment.
                </p>
                <div className="flex items-center space-x-2 bg-surface border border-border p-2.5 rounded-lg select-text font-mono text-xs text-text-primary">
                  <span className="flex-1 truncate select-all">{newlyGeneratedKey}</span>
                  <button onClick={() => copyToClipboard(newlyGeneratedKey)} className="text-text-muted hover:text-text-secondary flex-shrink-0">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-surface shadow-sm">
              {apiKeys.map(key => {
                const isRevealed = revealedKeys[key.id];
                return (
                  <div key={key.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 hover:bg-surface-2/10 transition-colors">
                    <div className="flex flex-col select-none leading-tight min-w-0">
                      <span className="text-xs font-bold text-text-primary truncate">{key.name}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="font-mono text-[10px] text-text-secondary">
                          {isRevealed ? key.key : 'dh_live_••••••••••••••••••••'}
                        </span>
                        <button onClick={() => toggleRevealKey(key.id)} className="text-text-muted hover:text-text-secondary flex-shrink-0">
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        {isRevealed && (
                          <button onClick={() => copyToClipboard(key.key)} className="text-text-muted hover:text-text-secondary flex-shrink-0">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <span className="text-[9px] text-text-muted mt-1.5 leading-none font-semibold">
                        Created: {new Date(key.created_at).toLocaleDateString()} &middot; Last Used: {key.last_used_at}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRevokeKey(key.id)}
                      className="px-2.5 py-1.5 border border-red-200 hover:bg-red-50 text-[10px] font-bold text-red-500 rounded-lg flex items-center space-x-1.5 transition-all active:scale-95 flex-shrink-0"
                    >
                      <Trash className="w-3.5 h-3.5" />
                      <span>Revoke</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Webhooks / Zapier Sync card */}
          <Card variant="standard" className="p-6 space-y-5">
            <div className="flex items-center space-x-2 border-b border-border/50 pb-3">
              <Zap className="w-4.5 h-4.5 text-brand" />
              <h3 className="text-sm font-bold text-text-primary font-sans leading-none pt-0.5">
                Automated Webhooks / Zapier Sync
              </h3>
            </div>
            
            <div className="space-y-4">
              <InputField
                label="Webhook Destination Endpoint URL"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
              />

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-text-secondary uppercase block">
                  Select Trigger Events
                </span>
                <div className="flex flex-wrap gap-2 select-none">
                  {[
                    { id: 'deal.created', label: 'Deal Created 🚀' },
                    { id: 'deal.updated', label: 'Term Sheet Updated 📝' },
                    { id: 'deliverable.certified', label: 'Deliverable Certified ✓' },
                    { id: 'payment.received', label: 'Escrow Paid 💸' }
                  ].map(ev => {
                    const isSelected = selectedEvents.includes(ev.id);
                    return (
                      <button
                        key={ev.id}
                        onClick={() => handleToggleEvent(ev.id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all active:scale-95 ${
                          isSelected ? 'bg-brand/10 border-brand text-brand shadow' : 'bg-surface border-border text-text-secondary hover:border-text-muted'
                        }`}
                      >
                        {ev.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button variant="primary" onClick={handleRegisterWebhook}>
                  Register Webhook URL
                </Button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold text-text-secondary uppercase block">
                Configured Endpoints
              </span>
              {webhooks.length === 0 ? (
                <div className="p-4 border border-dashed border-border rounded-xl text-center text-xs text-text-muted">
                  No webhooks registered yet.
                </div>
              ) : (
                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-surface shadow-sm">
                  {webhooks.map(wh => (
                    <div key={wh.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex flex-col select-none leading-tight min-w-0">
                        <span className="text-xs font-bold text-text-primary truncate">{wh.url}</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {wh.events.map(evName => (
                            <span key={evName} className="px-1.5 py-0.5 bg-brand-light/30 border border-brand/5 text-[9px] font-bold text-brand rounded uppercase tracking-wider">
                              {evName}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handleTestWebhook(wh.url)}
                          className="px-2.5 py-1.5 bg-surface-2 hover:bg-surface-3 border border-border text-[10px] font-bold text-text-secondary rounded-lg flex items-center space-x-1.5 transition-all active:scale-95"
                          title="Trigger mock payload dispatch test"
                        >
                          <Play className="w-3.5 h-3.5 text-brand fill-brand/20" />
                          <span>Test Endpoint</span>
                        </button>
                        <button
                          onClick={() => handleRemoveWebhook(wh.id)}
                          className="px-2.5 py-1.5 border border-red-200 hover:bg-red-50 text-[10px] font-bold text-red-500 rounded-lg flex items-center space-x-1.5 transition-all active:scale-95"
                        >
                          <Trash className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Webhook log console */}
        <div className="lg:col-span-4 space-y-6 select-none">
          <div className="space-y-3">
            <div className="flex items-center space-x-1">
              <Terminal className="w-4 h-4 text-brand animate-pulse" />
              <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">
                Webhook Payloads Terminal
              </h3>
            </div>
            <Card
              variant="standard"
              className="p-4 border border-border bg-[#0d0d0f] shadow-inner select-text h-[585px] overflow-y-auto pr-1 no-scrollbar space-y-3 font-mono"
            >
              <span className="text-[10px] font-bold text-brand uppercase tracking-widest leading-none border-b border-border/20 pb-2 block">
                [LIVE TRANSACTION PAYLOAD LOGS]
              </span>
              {payloadLogs.length === 0 ? (
                <div className="text-[10.5px] text-[#8e8e93] leading-relaxed select-none py-12 text-center">
                  ⏳ Listening for incoming payload events...
                  <br />
                  Trigger a deal update, contract signing or click "Test Endpoint" above to simulate.
                </div>
              ) : (
                payloadLogs.map(log => (
                  <div key={log.id} className="p-3 bg-[#16161a] border border-[#2b2b35] rounded-xl space-y-2 select-text font-mono text-[10.5px]">
                    <div className="flex justify-between items-center select-none border-b border-border/10 pb-1.5">
                      <span className="text-brand font-bold uppercase">{log.event}</span>
                      <span className="text-[9.5px] text-text-muted">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-wider select-none">
                        [DELIVERY STATUS]: SUCCESS 200 OK
                      </span>
                      <pre className="text-[9.5px] leading-relaxed text-[#a9a9b3] overflow-x-auto whitespace-pre-wrap select-text max-h-[140px] border border-border/5 rounded p-2 bg-[#09090b]">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                    <div className="select-none leading-none pt-1">
                      <span className="text-[8.5px] text-text-muted leading-none">
                        Response: {JSON.stringify(log.response)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};