import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  Check, 
  X, 
  Users, 
  DollarSign, 
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { convexClient as supabaseClient, mockDb } from '../services/convex';
import { Card } from '../components';

interface CreatorOffer {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_username: string;
  creator_avatar: string;
  creator_subscribers: string;
  creator_niche: string[];
  brand_id: string;
  brand_name: string;
  title: string;
  message: string;
  requested_rate: number;
  creative_freedom: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  rejected_at?: string;
}

export const IncomingOffers: React.FC = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<CreatorOffer[]>([]);
  const [acceptsIncoming, setAcceptsIncoming] = useState<boolean>(() => 
    localStorage.getItem('dealhive_brand_brand_samsung_accepts_incoming') !== 'false'
  );

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = () => {
    try {
      const stored = localStorage.getItem('dealhive_db_incoming_offers');
      if (stored) {
        const list = JSON.parse(stored) as CreatorOffer[];
        setOffers(list.filter(o => o.status === 'pending'));
      } else {
        const defaultOffers: CreatorOffer[] = [
          {
            id: 'offer_mock_1',
            creator_id: 'creator_sarah',
            creator_name: 'Sarah Jenkins',
            creator_username: 'sarah_creates',
            creator_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            creator_subscribers: '385K',
            creator_niche: ['Tech', 'Lifestyle', 'Productivity'],
            brand_id: 'brand_samsung',
            brand_name: 'Samsung',
            title: 'Samsung Galaxy Tab Dedicated Review Vlog',
            message: "Hey Samsung Team! I would love to make a dedicated productivity vlog reviewing the new Galaxy Tab. I'll showcase the split-screen multitasking tools and integrations with the S-Pen. My audience is highly creative and productivity-oriented!",
            requested_rate: 4500,
            creative_freedom: 80,
            status: 'pending',
            created_at: new Date(Date.now() - 14400000).toISOString()
          }
        ];
        localStorage.setItem('dealhive_db_incoming_offers', JSON.stringify(defaultOffers));
        setOffers(defaultOffers);
      }
    } catch (err) {
      console.error('Failed to load inbound offers', err);
    }
  };

  const handleToggleAcceptsIncoming = (val: boolean) => {
    setAcceptsIncoming(val);
    localStorage.setItem('dealhive_brand_brand_samsung_accepts_incoming', String(val));
    toast.success(val ? 'Inbound creator pitches enabled!' : 'Inbound pitches paused. Creators cannot send new proposals.');
  };

  const handleAcceptProposal = async (offer: CreatorOffer) => {
    try {
      const deals = mockDb.getDeals();
      const newDealId = 'deal_' + Math.random().toString(36).substring(2, 11);
      const newDeal = {
        id: newDealId,
        creator_id: offer.creator_id,
        brand_id: offer.brand_id,
        title: offer.title,
        deal_type: 'Integration' as any,
        stage: 'negotiating' as const,
        agreed_rate: offer.requested_rate,
        currency: 'USD',
        payment_terms: 'Net 30',
        exclusivity: 'No competitor brand placements for 15 days',
        usage_rights: 'Standard digital rights',
        kill_fee: Number((offer.requested_rate * 0.25).toFixed(0)),
        term_change_history: [],
        creator_agreed: true,
        brand_agreed: true,
        last_viewed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      deals.unshift(newDeal);
      mockDb.saveDeals(deals);

      const messages = mockDb.getMessages();
      messages.push({
        id: 'msg_' + Math.random().toString(36).substring(2, 11),
        deal_id: newDealId,
        sender_id: offer.brand_id,
        message_text: `Hi ${offer.creator_name}! We loved your partnership proposal: "${offer.title}". We've accepted it and initiated a negotiated Term Sheet in the Deal Room. Let's start collaborating!`,
        attachments: [],
        created_at: new Date().toISOString()
      });
      mockDb.saveMessages(messages);

      await supabaseClient.notifications.trigger(
        offer.creator_id,
        'check',
        'Offer Accepted! 🤝',
        `${offer.brand_name} accepted your pitch: "${offer.title}" for $${offer.requested_rate.toLocaleString()}.`,
        `/deals/${newDealId}`
      );

      const stored = localStorage.getItem('dealhive_db_incoming_offers');
      const allOffers = stored ? (JSON.parse(stored) as CreatorOffer[]) : [];
      const updatedOffers = allOffers.map(o => o.id === offer.id ? { ...o, status: 'accepted' as const } : o);
      localStorage.setItem('dealhive_db_incoming_offers', JSON.stringify(updatedOffers));
      setOffers(updatedOffers.filter(o => o.status === 'pending'));

      toast.success(`Proposal accepted! A campaign deal room has been created for ${offer.creator_name}.`);
      navigate(`/deals/${newDealId}`);
    } catch (err) {
      toast.error('Failed to accept creator offer.');
    }
  };

  const handleDeclineProposal = (id: string, name: string) => {
    try {
      const stored = localStorage.getItem('dealhive_db_incoming_offers');
      const allOffers = stored ? (JSON.parse(stored) as CreatorOffer[]) : [];
      const updatedOffers = allOffers.map(o => 
        o.id === id ? { ...o, status: 'rejected' as const, rejected_at: new Date().toISOString() } : o
      );
      localStorage.setItem('dealhive_db_incoming_offers', JSON.stringify(updatedOffers));
      setOffers(updatedOffers.filter(o => o.status === 'pending'));
      toast.success(`Declined collaboration proposal from ${name}.`);
    } catch (err) {
      toast.error('Failed to decline creator offer.');
    }
  };

  return (
    <div className="w-full max-w-[1140px] mx-auto py-7 px-8 space-y-7 animate-stagger-item select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 gap-4">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <Inbox className="w-5 h-5 text-brand" />
            <h2 className="text-xl font-bold text-text-primary sora-heading leading-none pt-0.5">
              Incoming Creator Proposals
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-2">
            Review, accept, or decline inbound pitches submitted directly by premium Pro-tier creators seeking partnerships.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-surface border border-border px-4 py-2.5 rounded-full shadow-sm">
          <span className="text-xs font-bold text-text-secondary">Accept Creator Proposals</span>
          <button
            onClick={() => handleToggleAcceptsIncoming(!acceptsIncoming)}
            className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              acceptsIncoming ? 'bg-brand' : 'bg-surface-3 border border-border'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                acceptsIncoming ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {!acceptsIncoming && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold backdrop-blur-md">
          <span>
            ⚠️ Inbound pitches are currently PAUSED. Creators cannot view your briefs or submit new partnership requests until this is toggled back on.
          </span>
          <button
            onClick={() => handleToggleAcceptsIncoming(true)}
            className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 rounded-lg font-bold text-[10.5px] uppercase"
          >
            Enable Pitches
          </button>
        </div>
      )}

      {offers.length === 0 ? (
        <Card variant="standard" className="p-16 text-center border border-dashed border-border bg-surface-2/15">
          <Inbox className="w-12 h-12 mx-auto text-text-faint animate-bounce" />
          <h4 className="text-sm font-bold text-text-primary mt-4 sora-heading">No Incoming Proposals Yet</h4>
          <p className="text-xs text-text-muted mt-2 leading-relaxed max-w-sm mx-auto">
            When creators on the premium tier send partnership pitches to your brand active campaigns, they will be listed here.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {offers.map(offer => (
            <Card
              key={offer.id}
              variant="standard"
              className="p-6 border border-border hover:border-brand/25 transition-all bg-surface flex flex-col md:flex-row gap-6 justify-between items-start"
            >
              {/* Creator details panel */}
              <div className="w-full md:w-1/4 space-y-3 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-border/80 flex-shrink-0 bg-surface">
                    <img src={offer.creator_avatar} alt={offer.creator_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-xs font-bold text-text-primary sora-heading flex items-center">
                      {offer.creator_name}
                      <Check className="w-3.5 h-3.5 ml-1 text-brand animate-pulse" />
                    </span>
                    <span className="text-[10px] text-text-muted mt-1">@{offer.creator_username}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {offer.creator_niche.map(n => (
                    <span key={n} className="px-2 py-0.5 bg-surface-2 border border-border text-[9px] font-bold text-text-secondary rounded">
                      {n}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] font-semibold text-text-secondary flex items-center space-x-1.5 py-1">
                  <Users className="w-3.5 h-3.5 text-brand" />
                  <span>{offer.creator_subscribers} Subscribers</span>
                </div>
              </div>

              {/* Offer description panel */}
              <div className="flex-1 space-y-3 w-full">
                <div className="space-y-1">
                  <span className="text-[9px] bg-brand-light/30 border border-brand/10 text-brand px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    PRO Creator Proposal
                  </span>
                  <h3 className="text-sm font-bold text-text-primary sora-heading mt-1.5">{offer.title}</h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed font-medium bg-surface-2/40 p-3 rounded-xl border border-border/40">
                  {offer.message}
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-sm py-1">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-text-secondary">
                    <DollarSign className="w-4 h-4 text-brand" />
                    <span>
                      Requested Rate:{' '}
                      <span className="font-mono text-brand font-extrabold">${offer.requested_rate.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-text-secondary">
                    <TrendingUp className="w-4 h-4 text-brand" />
                    <span>
                      Creative Freedom:{' '}
                      <span className="font-mono text-brand font-extrabold">{offer.creative_freedom}%</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons panel */}
              <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto justify-end self-stretch md:self-center md:items-end">
                <button
                  onClick={() => handleAcceptProposal(offer)}
                  className="flex-1 md:flex-none px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-extrabold flex items-center justify-center space-x-1.5 shadow transition-all active:scale-95 hover:-translate-y-0.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept Proposal</span>
                </button>
                <button
                  onClick={() => handleDeclineProposal(offer.id, offer.creator_name)}
                  className="flex-1 md:flex-none px-4 py-2 bg-surface-2 hover:bg-red-500/10 border border-border hover:border-red-500/20 text-text-secondary hover:text-red-500 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all active:scale-95"
                >
                  <X className="w-4 h-4" />
                  <span>Decline</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};