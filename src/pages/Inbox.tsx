import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Send, Paperclip, MessageSquare, FileText, Download, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import { convexClient as supabaseClient, mockDb } from '../services/convex';
import { rateLimiter } from '../utils/rateLimiter';
import { 
  Button, 
  Card,
  InputField,
  Modal
} from '../components';

interface MockPitch {
  id: string;
  brandName: string;
  logo: string;
  campaignTitle: string;
  budgetRange: string;
  date: string;
  brief: string;
  terms: {
    rate: number;
    type: string;
    timeline: string;
    exclusivity: string;
  };
  status: 'unread' | 'read' | 'accepted' | 'declined' | 'countered';
}

interface ChatMessage {
  id: string;
  sender: 'creator' | 'brand';
  text: string;
  attachment?: {
    name: string;
    size: string;
    type: 'pdf' | 'doc' | 'image' | 'xlsx';
  };
  time: string;
}

const INITIAL_PITCHES: MockPitch[] = [
  {
    id: 'p_1',
    brandName: 'Samsung',
    logo: 'https://logo.clearbit.com/samsung.com',
    campaignTitle: 'Galaxy S26 Ultra launch',
    budgetRange: '$4,000 - $5,000',
    date: 'May 30',
    brief: "We want to launch an immersive campaign around the new S26 Ultra's astronomical zoom features. We are targeting creators with high tech engagement to showcase daily lifestyle vlog integrations.",
    terms: {
      rate: 4200,
      type: 'Integration',
      timeline: 'Net 30',
      exclusivity: 'Smartphone brands for 15 days'
    },
    status: 'unread'
  },
  {
    id: 'p_2',
    brandName: 'Lumen Health',
    logo: 'https://logo.clearbit.com/lumen.me',
    campaignTitle: 'Morning Wellness routine',
    budgetRange: '$3,000 - $3,500',
    date: 'May 28',
    brief: 'Promote the Lumen hand-held metabolic tracker in your morning routine vlogs. Focus on biofeedback readings and daily metabolic scores.',
    terms: {
      rate: 3500,
      type: 'Integration',
      timeline: 'Net 30',
      exclusivity: 'Wellness devices for 7 days'
    },
    status: 'accepted'
  }
];

const INITIAL_CHATS: Record<string, ChatMessage[]> = {
  p_1: [
    { id: '1', sender: 'brand', text: "Hi Sarah, we are thrilled to initiate this campaign pitch. Let us know if the proposed rate card works for your integration schedule!", time: '11:05 AM' }
  ],
  p_2: [
    { id: '1', sender: 'brand', text: "Hello Sarah, your wellness channel is a perfect fit. Looking forward to locking the morning metabolic review vlogs!", time: '2:15 PM' },
    { id: '2', sender: 'creator', text: "Awesome, terms agreed and signed in the deal room!", time: '2:30 PM' }
  ]
};

export const Inbox: React.FC = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [pitches, setPitches] = useState<MockPitch[]>(INITIAL_PITCHES);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'accepted' | 'declined'>('all');
  const [detailTab, setDetailTab] = useState<'brief' | 'chat'>('brief');

  // Chat state
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(INITIAL_CHATS);
  const [chatInput, setChatInput] = useState('');
  
  // Attachments picker
  const [attachedFile, setAttachedFile] = useState<{name: string, size: string, type: 'pdf' | 'doc' | 'image' | 'xlsx'} | null>(null);

  // Counter offer modal inputs
  const [isCounterOpen, setIsCounterOpen] = useState(false);
  const [counterRate, setCounterRate] = useState(0);
  const [counterTimeline, setCounterTimeline] = useState('');
  const [counterExclusivity, setCounterExclusivity] = useState('');

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ counterRate: number, rationale: string, confidence: 'conservative' | 'moderate' | 'aggressive' } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const activePitch = pitches[selectedIdx];

  useEffect(() => {
    // Auto scroll chat to bottom when switching tabs or receiving messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [detailTab, chats, selectedIdx]);

  const handleSelectPitch = (idx: number) => {
    setSelectedIdx(idx);
    setDetailTab('brief');
    setAttachedFile(null);
    
    // Mark as read
    const updated = [...pitches];
    if (updated[idx].status === 'unread') {
      updated[idx].status = 'read';
      setPitches(updated);
    }
  };

  const handleAcceptPitch = async () => {
    if (!activePitch) return;
    try {
      const newDeal = await supabaseClient.deals.create({
        brand_id: 'brand_samsung',
        title: activePitch.campaignTitle,
        deal_type: activePitch.terms.type as any,
        agreed_rate: activePitch.terms.rate,
        payment_terms: activePitch.terms.timeline,
        exclusivity: activePitch.terms.exclusivity
      });

      const updated = [...pitches];
      updated[selectedIdx].status = 'accepted';
      setPitches(updated);

      toast.success('Campaign Pitch Accepted! Deal Room initialized.');
      navigate(`/deals/${newDeal.id}`);
    } catch (e) {
      toast.error('Accept pitch failed.');
    }
  };

  const handleDeclinePitch = () => {
    const updated = [...pitches];
    updated[selectedIdx].status = 'declined';
    setPitches(updated);
    toast.success('Campaign pitch declined.');
  };

  const handleOpenCounter = () => {
    if (!activePitch) return;
    setCounterRate(activePitch.terms.rate);
    setCounterTimeline(activePitch.terms.timeline);
    setCounterExclusivity(activePitch.terms.exclusivity);
    setIsCounterOpen(true);
  };

  const handleSendCounter = () => {
    const updated = [...pitches];
    updated[selectedIdx].status = 'countered';
    updated[selectedIdx].terms.rate = counterRate;
    updated[selectedIdx].terms.timeline = counterTimeline;
    updated[selectedIdx].terms.exclusivity = counterExclusivity;
    setPitches(updated);
    
    setIsCounterOpen(false);
    toast.success('Counter offer dispatched to Brand sponsor review!');
  };

  const handleAiSuggestCounter = async () => {
    if (!activePitch) return;
    try {
      rateLimiter.checkAndThrow('ai_suggest');
      setIsAiLoading(true);
      setAiResult(null);
      
      // Simulate Edge Function API latency
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsAiLoading(false);
      
      // Check subscription plan tier (Paywall check)
      const profile = mockDb.getCreatorProfile();
      if (profile && profile.subscription_plan === 'free') {
        setShowUpgradeModal(true);
        return;
      }
      
      const isSamsung = activePitch.brandName.toLowerCase().includes('samsung');
      const recommendedRate = isSamsung ? 4600 : 3800;
      const recommendedRationale = isSamsung
        ? "Sarah's channel Tech engagement rate is 4.8% which exceeds the 100k-500k category average of 3.2%. Samsung has solid budget depth for product launches."
        : "Lumen's baseline offer is near the category median, but your lifestyle routine niche segment commands a 10% premium for specialized wellness topics.";
      
      const confidenceLevel = isSamsung ? 'moderate' : 'conservative';
      
      setAiResult({
        counterRate: recommendedRate,
        rationale: recommendedRationale,
        confidence: confidenceLevel
      });
      setCounterRate(recommendedRate);
      toast.success('AI counter offer analysis compiled successfully!');
    } catch (err) {
      setIsAiLoading(false);
      console.warn('AI suggestions blocked by rate limiter', err);
    }
  };



  // Chat message sending with paperclip attachment simulation
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePitch || (!chatInput.trim() && !attachedFile)) return;

    const pitchId = activePitch.id;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'creator',
      text: chatInput,
      time: timeStr,
      attachment: attachedFile || undefined
    };

    setChats(prev => ({
      ...prev,
      [pitchId]: [...(prev[pitchId] || []), newMsg]
    }));

    setChatInput('');
    setAttachedFile(null);
    toast.success('Message sent to sponsor brand!');

    // Delayed brand manager response simulation
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        sender: 'brand',
        text: `Hey Sarah, thanks for coordinating! Our sponsorship team is reviewing these specific parameters. Your terms look reasonable. Let's lock this campaign!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats(prev => ({
        ...prev,
        [pitchId]: [...(prev[pitchId] || []), replyMsg]
      }));
    }, 2000);
  };

  const handleSimulateAttachment = () => {
    const mockFiles = [
      { name: 'Sarah_MediaKit_2026.pdf', size: '1.2 MB', type: 'pdf' as const },
      { name: 'Video_Integration_Outline.doc', size: '420 KB', type: 'doc' as const },
      { name: 'Channel_Subscribers_Stats.xlsx', size: '85 KB', type: 'xlsx' as const },
      { name: 'Thumbnail_Draft_Mock.png', size: '2.4 MB', type: 'image' as const }
    ];
    const chosen = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    setAttachedFile(chosen);
    toast.success(`${chosen.name} attached! Hit send.`);
  };

  // Filtered lists
  const filteredPitches = pitches.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'unread') return p.status === 'unread';
    if (filter === 'accepted') return p.status === 'accepted';
    return p.status === 'declined';
  });

  return (
    <div className="w-full flex h-screen overflow-hidden bg-bg">
      {/* 340px Left Split Panel List */}
      <div className="w-[340px] h-full border-r border-border bg-sidebar-bg flex flex-col z-0 select-none">
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-text-primary sora-heading leading-tight">
              Inbox / Pitches
            </h2>
            <span className="text-[11px] text-text-muted mt-1 leading-none">
              Manage incoming campaign briefs.
            </span>
          </div>

          {/* Filter tabs */}
          <div className="flex space-x-1.5 border-b border-border pb-1">
            {([
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'accepted', label: 'Accepted' }
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors ${
                  filter === tab.id 
                    ? 'bg-brand text-white' 
                    : 'text-text-muted hover:text-text-secondary hover:bg-surface-2'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {filteredPitches.map((pitch, idx) => {
            const isSelected = activePitch?.id === pitch.id;
            return (
              <div
                key={pitch.id}
                onClick={() => handleSelectPitch(idx)}
                className={`p-4 cursor-pointer transition-all flex flex-col relative ${
                  isSelected ? 'bg-brand-light/35 text-brand' : 'hover:bg-surface-2/30 text-text-secondary'
                }`}
              >
                {pitch.status === 'unread' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand" />
                )}
                
                <div className="flex justify-between items-center select-none leading-none">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">{pitch.brandName}</span>
                  <span data-type="number" className="font-mono text-[10px] text-text-muted">{pitch.date}</span>
                </div>
                
                <span className="text-xs font-bold text-text-primary mt-2 sora-heading truncate leading-tight">
                  {pitch.campaignTitle}
                </span>

                <div className="flex justify-between items-center mt-3 select-none leading-none">
                  <span data-type="number" className="font-mono text-[10px] text-text-muted">Budget: {pitch.budgetRange}</span>
                  <span className="text-[9px] font-bold uppercase border border-border px-1 py-0.5 rounded">
                    {pitch.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Details Panel split */}
      <div className="flex-1 h-full overflow-hidden bg-bg flex flex-col justify-between">
        {activePitch ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Header info */}
            <div className="p-4 border-b border-border flex items-center justify-between select-none bg-surface flex-shrink-0">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center font-bold text-sm text-brand border border-brand/10">
                  {activePitch.brandName.substring(0,2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xs font-bold text-text-primary sora-heading leading-tight">
                    {activePitch.campaignTitle}
                  </h2>
                  <span className="text-[9.5px] text-text-muted mt-1 leading-none">{activePitch.brandName} Sponsor Proposal</span>
                </div>
              </div>

              {/* Sub-tab view switchers */}
              <div className="flex space-x-1.5 bg-surface-2 border border-border p-0.5 rounded-md">
                <button
                  onClick={() => setDetailTab('brief')}
                  className={`px-3 py-1 text-[11px] font-bold rounded ${detailTab === 'brief' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
                >
                  Campaign Brief
                </button>
                <button
                  onClick={() => setDetailTab('chat')}
                  className={`px-3 py-1 text-[11px] font-bold rounded flex items-center space-x-1 ${detailTab === 'chat' ? 'bg-surface text-brand shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Direct Chat</span>
                </button>
              </div>
            </div>

            {/* Sub-tab Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-bg">
              
              {detailTab === 'brief' ? (
                // TAB A: PITCH DETAILED BRIEF LAYOUT
                <div className="p-6 space-y-6">
                  
                  {/* Campaign Outline */}
                  <Card variant="standard" className="space-y-3 p-5">
                    <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider block">Campaign Outline Description</span>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {activePitch.brief}
                    </p>
                  </Card>

                  {/* Proposed Terms */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-text-primary sora-heading uppercase tracking-wider select-none">Proposed Terms Sheet</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card 
                        variant="secondary" 
                        className="flex flex-col p-3 border-l-[3px] border-l-[#16A34A] rounded-l-none"
                      >
                        <span className="font-sans font-semibold text-[10px] uppercase tracking-[0.08em] text-[#16A34A]">BUDGET OFFER</span>
                        <span data-type="number" className="font-mono text-sm font-bold text-text-primary mt-1.5">${activePitch.terms.rate.toLocaleString()}</span>
                      </Card>

                      <Card 
                        variant="secondary" 
                        className="flex flex-col p-3 border-l-[3px] border-l-brand rounded-l-none"
                      >
                        <span className="font-sans font-semibold text-[10px] uppercase tracking-[0.08em] text-brand">SPONSORSHIP TYPE</span>
                        <span className="text-xs font-bold text-text-primary mt-1.5 truncate">{activePitch.terms.type}</span>
                      </Card>

                      <Card 
                        variant="secondary" 
                        className="flex flex-col p-3 border-l-[3px] border-l-[#2563EB] rounded-l-none"
                      >
                        <span className="font-sans font-semibold text-[10px] uppercase tracking-[0.08em] text-[#2563EB]">PAYMENT TIMELINE</span>
                        <span className="text-xs font-bold text-text-primary mt-1.5 truncate">{activePitch.terms.timeline}</span>
                      </Card>

                      <Card 
                        variant="secondary" 
                        className="flex flex-col p-3 border-l-[3px] border-l-[#D97706] rounded-l-none"
                      >
                        <span className="font-sans font-semibold text-[10px] uppercase tracking-[0.08em] text-[#D97706]">EXCLUSIVITY PERIOD</span>
                        <span className="text-xs font-bold text-text-primary mt-1.5 truncate">{activePitch.terms.exclusivity}</span>
                      </Card>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  {activePitch.status !== 'accepted' && activePitch.status !== 'declined' ? (
                    <div className="pt-6 border-t border-border flex justify-end space-x-3 select-none">
                      <Button variant="danger" icon={<X className="w-4 h-4" />} onClick={handleDeclinePitch} className="text-xs py-2 px-4">
                        Decline Pitch
                      </Button>
                      <Button variant="secondary" onClick={handleOpenCounter} className="text-xs py-2 px-4">
                        Counter Offer
                      </Button>
                      <Button variant="primary" icon={<Check className="w-4 h-4" />} onClick={handleAcceptPitch} className="text-xs py-2 px-4">
                        Accept Sponsor Brief â†’
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-text-muted block border-t border-border pt-6 select-none">
                      âœ“ Negotiation loop finalized. Brief status set to: <span className="text-brand capitalize font-bold">{activePitch.status}</span>
                    </span>
                  )}
                </div>
              ) : (
                // TAB B: INTERACTIVE NEGOTIATION CHAT STREAM WITH ATTACHMENTS
                <div className="h-full flex flex-col justify-between bg-surface">
                  
                  {/* Messages Bubble Stack */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 pr-2 min-h-0">
                    {(chats[activePitch.id] || []).map((msg) => {
                      const isCreator = msg.sender === 'creator';
                      return (
                        <div 
                          key={msg.id} 
                          className={`flex flex-col max-w-[70%] ${isCreator ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                        >
                          <div 
                            className={`p-3 text-xs leading-relaxed ${
                              isCreator 
                                ? 'bg-brand text-white rounded-[16px_16px_4px_16px] shadow-sm'
                                : 'bg-surface-2 border border-border text-text-primary rounded-[16px_16px_16px_4px]'
                            }`}
                          >
                            {msg.text}

                            {/* Render Chat Attachment Card if present */}
                            {msg.attachment && (
                              <div className={`mt-2.5 p-2 rounded-lg border flex items-center justify-between text-[11px] leading-none ${
                                isCreator 
                                  ? 'bg-brand-dark/45 border-white/20 text-white' 
                                  : 'bg-surface border-border text-text-secondary'
                              }`}>
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4.5 h-4.5 text-brand-light" />
                                  <div className="flex flex-col leading-tight">
                                    <span className="font-bold truncate max-w-[120px]">{msg.attachment.name}</span>
                                    <span className="text-[9px] opacity-75 mt-0.5">{msg.attachment.size}</span>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => toast.success(`Simulating file download: ${msg.attachment?.name}`)}
                                  className="p-1 hover:bg-brand-light/10 rounded transition-colors"
                                  aria-label="Download Attachment"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                          <span data-type="number" className="font-mono text-[9px] text-text-muted mt-1 px-1">{msg.time}</span>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat input box and simulation controls */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-border flex flex-col space-y-2 bg-surface-2/20 flex-shrink-0">
                    
                    {/* Inline Attachment indicator */}
                    {attachedFile && (
                      <div className="flex items-center justify-between bg-brand/5 border border-brand/10 p-1.5 px-3 rounded-lg text-xs leading-none">
                        <div className="flex items-center space-x-2 font-semibold text-brand">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>Attached: {attachedFile.name} ({attachedFile.size})</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setAttachedFile(null)}
                          className="text-text-muted hover:text-text-secondary"
                        >
                          âœ•
                        </button>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 select-none">
                      {/* Attachment trigger */}
                      <button 
                        type="button"
                        onClick={handleSimulateAttachment}
                        className="p-2.5 rounded-full hover:bg-surface-2 text-text-secondary border border-border bg-surface transition-colors"
                        title="Simulate File Attachment"
                        aria-label="Simulate File Attachment"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>

                      {/* Input bar */}
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Negotiate rates, address requirements, ask questions..."
                        className="flex-1 h-10 px-4 bg-surface border border-border rounded-full text-xs text-text-primary outline-none focus:border-brand shadow-sm"
                      />

                      {/* Submit */}
                      <button 
                        type="submit"
                        className="p-2.5 rounded-full bg-brand text-white shadow-sm hover:scale-[1.03] active:scale-[0.98] transition-all"
                        aria-label="Send Message"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-text-faint select-none">
            No campaign pitches selected in inbox.
          </div>
        )}
      </div>

      {/* Counter offer side-by-side Modal */}
      {isCounterOpen && activePitch && (
        <Modal
          isOpen={true}
          onClose={() => setIsCounterOpen(false)}
          title="Side-by-Side Pitch Counter Offer"
          size="wide"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsCounterOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSendCounter}>
                Send Counter Offer
              </Button>
            </>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
            {/* Left: Original offer */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Their Offer</span>
              <div className="bg-surface-2 p-4 border border-border rounded-xl space-y-4 opacity-75">
                <InputField label="Agreed Rate ($)" value={activePitch.terms.rate} disabled />
                <InputField label="Payment Terms" value={activePitch.terms.timeline} disabled />
                <InputField label="Exclusivity Period" value={activePitch.terms.exclusivity} disabled />
              </div>
            </div>

            {/* Right: Counter offer */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-brand uppercase tracking-wider block">Your Counter</span>
              <div className="bg-surface p-4 border border-brand/20 rounded-xl space-y-4">
                <button
                  type="button"
                  onClick={handleAiSuggestCounter}
                  disabled={isAiLoading}
                  className="w-full h-10 border border-brand bg-brand-light/20 text-brand rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-brand-light/35 transition-all select-none disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-brand animate-pulse" />
                  <span>{isAiLoading ? 'Analyzing benchmarks...' : aiResult ? 'âœ¨ Re-suggest' : 'âœ¨ AI Suggest'}</span>
                </button>

                {aiResult && (
                  <div 
                    className="p-3.5 border border-brand/20 rounded-lg text-xs space-y-2 select-none animate-stagger-item"
                    style={{ backgroundColor: 'var(--color-brand-light)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-semibold text-[10px] text-brand uppercase tracking-[0.08em]">AI Suggestion Insight</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        aiResult.confidence === 'conservative'
                          ? 'bg-surface-2 text-text-secondary border border-border'
                          : aiResult.confidence === 'moderate'
                          ? 'bg-warning-bg text-warning border border-warning-border'
                          : 'bg-brand-light text-brand border border-brand/20'
                      }`}>
                        {aiResult.confidence === 'conservative' ? 'Conservative' : aiResult.confidence === 'moderate' ? 'Balanced' : 'Ambitious'}
                      </span>
                    </div>
                    <p className="font-sans font-normal text-sm text-brand leading-relaxed">
                      âœ¨ AI Insight: {aiResult.rationale}
                    </p>
                  </div>
                )}

                <InputField 
                  label="Proposed Rate ($)" 
                  type="number"
                  value={counterRate} 
                  onChange={(e) => setCounterRate(Number(e.target.value))}
                />
                
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-[0.04em]">
                    Proposed Payment Timeline
                  </label>
                  <select
                    value={counterTimeline}
                    onChange={(e) => setCounterTimeline(e.target.value)}
                    className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm text-text-primary outline-none focus:border-brand"
                  >
                    <option value="Net 30">Net 30 Days (Standard)</option>
                    <option value="Net 15">Net 15 Days (Express)</option>
                    <option value="50/50 Split">50% upfront, 50% on completion</option>
                  </select>
                </div>

                <InputField 
                  label="Proposed Exclusivity Scope" 
                  value={counterExclusivity} 
                  onChange={(e) => setCounterExclusivity(e.target.value)}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {showUpgradeModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowUpgradeModal(false)}
          title="Creator Pro Upgrade Required"
          footer={
            <Button variant="primary" onClick={() => { setShowUpgradeModal(false); navigate('/settings'); }}>
              Upgrade Now
            </Button>
          }
        >
          <div className="p-6 text-center space-y-4">
            <Sparkles className="w-12 h-12 text-brand mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-text-primary sora-heading">Unlock AI Counter Suggestions</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Negotiate like a pro. Get access to verified audience demographic rates benchmarks and real-time counter-offer optimization powered by AI.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default Inbox;

