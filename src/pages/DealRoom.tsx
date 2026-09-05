import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  MoreVertical, 
  Paperclip, 
  Send, 
  Check, 
  Upload, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Download, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Users, 
  Trash2, 
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

import { convexClient as supabaseClient, mockDb } from '../services/convex';
import { stripeService } from '../services/stripe';
import { Deal, DealMessage, Deliverable, Contract, Invoice, BrandProfile } from '../types/supabase.types';
import { 
  Button, 
  Card, 
  InputField, 
  ShimmerSkeleton, 
  Modal, 
  StatusBadge, 
  DealStageProgressBar
} from '../components';
import { usePlanGate } from '../hooks/usePlanGate';

// Confetti Particle Component
interface ConfettiProps {
  active: boolean;
}

const Confetti: React.FC<ConfettiProps> = ({ active }) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    let timer: any;
    if (active) {
      const colors = ["var(--color-brand)", "#EF4444", "#10B981", "#F59E0B", "#3B82F6", "#EC4899"];
      const generated = Array.from({ length: 80 }).map((_, idx) => ({
        id: idx,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2.5,
        size: Math.random() * 6 + 6
      }));
      setParticles(generated);
      timer = setTimeout(() => {
        setParticles([]);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti rounded-sm"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            top: "-20px"
          }}
        />
      ))}
    </div>
  );
};

export const DealRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messageEndRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [uploadingDeliverableId, setUploadingDeliverableId] = useState<string | null>(null);
  
  // Compliance Checklist Modal states
  const [complianceChecked, setComplianceChecked] = useState({
    hook: false,
    restrict: false,
    points: false,
    guidelines: false
  });

  // Review states
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [overallRating, setOverallRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [paymentRating, setPaymentRating] = useState(5);
  const [creativeFreedomRating, setCreativeFreedomRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [timelinessRating, setTimelinessRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitAnonymously, setSubmitAnonymously] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Entities
  const [deal, setDeal] = useState<Deal | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [messages, setMessages] = useState<DealMessage[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [internalNotes, setInternalNotes] = useState<any[]>([]);
  
  // Form states
  const [newInternalNote, setNewInternalNote] = useState('');
  const [showColleaguesDropdown, setShowColleaguesDropdown] = useState(false);
  const userRole = supabaseClient.auth.getRole();
  const [activeTab, setActiveTab] = useState('messages');
  
  // splits
  const [coCreators, setCoCreators] = useState<any[]>([
    { id: "1", name: "Sarah Jenkins (You)", role: "Lead Creator", share: 80 },
    { id: "2", name: "Alex Riverstone", role: "Video Editor", share: 20 }
  ]);

  const [newMessageText, setNewMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [proposeFieldName, setProposeFieldName] = useState<string | null>(null);
  const [proposeValue, setProposeValue] = useState('');
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [uploadingProgressDeliverableId, setUploadingProgressDeliverableId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const contractsEsignLimit = usePlanGate("contracts_esign");

  useEffect(() => {
    if (id) {
      setReviewSubmitted(localStorage.getItem("dealhive_review_done_" + id) === "true");
      loadDealDetails();
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = supabaseClient.messages.subscribe(id, (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    });
    return () => {
      unsubscribe();
    };
  }, [id]);

  const loadDealDetails = async () => {
    if (!id) return;
    try {
      const d = await supabaseClient.deals.get(id);
      if (!d) {
        toast.error("Deal not found");
        navigate("/deals");
        return;
      }
      setDeal(d);

      const brand = mockDb.getBrands().find(b => b.id === d.brand_id) || mockDb.getBrands()[0];
      setBrandProfile(brand);

      const msgs = await supabaseClient.messages.list(id);
      setMessages(msgs);

      const delivs = await supabaseClient.deliverables.list(id);
      setDeliverables(delivs);

      const contr = await supabaseClient.contracts.get(id);
      setContract(contr);

      const inv = (await supabaseClient.invoices.list()).find(i => i.deal_id === id) || null;
      setInvoice(inv);

      if (userRole === 'brand') {
        const notes = await supabaseClient.notes.list(id);
        setInternalNotes(notes);
      }

      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !newMessageText.trim()) return;
    try {
      const txt = newMessageText;
      setNewMessageText('');
      await supabaseClient.messages.send(id, txt);
    } catch {
      toast.error("Message failed to send.");
    }
  };

  const handleSaveInternalNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !newInternalNote.trim()) return;
    try {
      const txt = newInternalNote;
      setNewInternalNote('');
      await supabaseClient.notes.create(id, txt);
      const notes = await supabaseClient.notes.list(id);
      setInternalNotes(notes);
      toast.success("Internal team note saved!");
    } catch {
      toast.error("Failed to save note.");
    }
  };

  const handleFileSelect = (deliverableId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadingDeliverableId(deliverableId);
      setComplianceChecked({ hook: false, restrict: false, points: false, guidelines: false });
    }
  };

  const handleUploadCertified = async () => {
    if (!uploadingDeliverableId || !selectedFile || !id) return;
    const delivId = uploadingDeliverableId;
    const fileObj = selectedFile;
    setSelectedFile(null);
    setUploadingDeliverableId(null);

    try {
      setUploadingProgressDeliverableId(delivId);
      setUploadProgress(0);

      const mockUrl = `https://sample-videos.com/${fileObj.name}`;
      await supabaseClient.deliverables.upload(delivId, mockUrl, (p) => {
        setUploadProgress(p);
      });

      await supabaseClient.contentLibrary.add({
        deal_id: id,
        asset_url: mockUrl,
        file_name: fileObj.name,
        usage_duration_months: 6,
        usage_channels: ["YouTube Organic", "Instagram Repost"],
        exclusivity_period_months: 1,
        expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
      });

      toast.success("Draft certified and uploaded successfully!");

      const delivs = await supabaseClient.deliverables.list(id);
      setDeliverables(delivs);

      await supabaseClient.messages.send(id, `[System Activity] Sarah certified & uploaded draft document "${fileObj.name}" complying with all campaign brief terms!`);
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploadingProgressDeliverableId(null);
      setUploadProgress(0);
    }
  };

  const handleProposeChange = async () => {
    if (!id || !proposeFieldName) return;
    try {
      const newDeal = await supabaseClient.deals.proposeChange(id, proposeFieldName, proposeValue);
      setDeal(newDeal);
      setProposeFieldName(null);
      toast.success("Term change proposed successfully!");
    } catch {
      toast.error("Propose change failed.");
    }
  };

  const handleAgreeToTerms = async () => {
    if (!id || !deal) return;
    try {
      const isCreator = supabaseClient.auth.getRole() === 'creator';
      const updatePayload = {
        creator_agreed: isCreator ? true : deal.creator_agreed,
        brand_agreed: isCreator ? deal.brand_agreed : true
      };
      const updatedDeal = await supabaseClient.deals.update(id, updatePayload);
      setDeal(updatedDeal);
      toast.success("Terms agreed! Outlined changes locked.");
      if (updatedDeal.creator_agreed && updatedDeal.brand_agreed) {
        await supabaseClient.deals.update(id, { stage: 'contracted' });
        toast.success("Both parties agreed! Contract generation unlocked.");
        setActiveTab("contract");
        loadDealDetails();
      }
    } catch {
      toast.error("Failed to agree.");
    }
  };

  const handleGenerateContract = async () => {
    if (!id) return;
    if (contractsEsignLimit.upgradeRequired) {
      toast.error("Embedded Dropbox Sign contract automation is locked under Creator Pro.");
      return;
    }
    try {
      setIsGeneratingContract(true);
      setGeneratingStep(0);
      const steps = ["Building contract details...", "Compiling negotiated rate parameters...", "Preparing Dropbox Sign embedded signing iframe..."];
      for (let i = 0; i < steps.length; i++) {
        setGeneratingStep(i);
        await new Promise((r) => setTimeout(r, 600));
      }
      const newContract = await supabaseClient.contracts.generate(id);
      setContract(newContract);
      toast.success("Contract compiled and signature frame requested!");
    } catch {
      toast.error("Error compiling contract.");
    } finally {
      setIsGeneratingContract(false);
    }
  };

  const handlePlaceESignature = async () => {
    if (!id) return;
    try {
      const role = supabaseClient.auth.getRole();
      const signedContract = await supabaseClient.contracts.sign(id, role);
      setContract(signedContract);
      toast.success("Successfully e-signed document!");
      if (signedContract.status === 'fully_signed') {
        setIsConfettiActive(true);
      }
      loadDealDetails();
    } catch {
      toast.error("Signature failed.");
    }
  };

  const handleSendInvoice = async () => {
    if (!id || !deal) return;
    try {
      const newInvoice = await supabaseClient.invoices.create(
        id, 
        deal.agreed_rate, 
        new Date(Date.now() + 2592000000).toISOString().split('T')[0]
      );
      setInvoice(newInvoice);
      await supabaseClient.invoices.send(newInvoice.id);
      toast.success("Invoice successfully issued to brand billing email!");
      loadDealDetails();
    } catch {
      toast.error("Invoice generation failed.");
    }
  };

  const handleSimulatePayment = async () => {
    if (!invoice) return;
    try {
      toast.loading("Processing mock payment intent...", { id: "payment-process" });
      await stripeService.processBrandPayment(invoice.id);
      toast.success("Mock payment processed! Platform fee split successful.", { id: "payment-process" });
      setIsConfettiActive(true);
      loadDealDetails();
    } catch {
      toast.error("Payment simulation failed.");
    }
  };

  const handleSubmitReview = async () => {
    if (!id || !deal) return;
    try {
      setIsSubmittingReview(true);
      if (userRole === 'creator') {
        await supabaseClient.reviews.create(deal.brand_id, id, {
          overall: overallRating,
          payment: paymentRating,
          communication: communicationRating,
          fairness: creativeFreedomRating
        }, reviewText, submitAnonymously);
      } else {
        await supabaseClient.creatorReviews.create(deal.creator_id, id, {
          overall: overallRating,
          quality: qualityRating,
          communication: communicationRating,
          timeliness: timelinessRating
        }, reviewText, submitAnonymously);
      }
      await supabaseClient.deals.update(id, { stage: 'completed' });
      localStorage.setItem("dealhive_review_done_" + id, "true");
      setReviewSubmitted(true);
      toast.success("Bilateral mutual review submitted! Reputation scores updated.");
      loadDealDetails();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddCollaborator = () => {
    setCoCreators((prev) => [...prev, { id: Math.random().toString(), name: "", role: "", share: 0 }]);
  };

  const handleDeleteCollaborator = (collabId: string) => {
    setCoCreators((prev) => prev.filter((c) => c.id !== collabId));
  };

  const handleUpdateShare = (collabId: string, share: number) => {
    setCoCreators((prev) => prev.map((c) => c.id === collabId ? { ...c, share } : c));
  };

  const handleUpdateCollaboratorField = (collabId: string, field: string, val: string) => {
    setCoCreators((prev) => prev.map((c) => c.id === collabId ? { ...c, [field]: val } : c));
  };

  if (loading || !deal || !brandProfile) {
    return (
      <div className="flex flex-col space-y-6 w-full max-w-[1140px] mx-auto py-7 px-8">
        <ShimmerSkeleton width="180px" height="32px" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <ShimmerSkeleton height="400px" />
          </div>
          <div className="lg:col-span-4">
            <ShimmerSkeleton height="320px" />
          </div>
        </div>
      </div>
    );
  }

  const isCompletedOrPaid = (invoice?.status === 'paid' || deal.stage === 'completed');

  return (
    <div className="w-full flex flex-col h-screen overflow-hidden bg-bg">
      <div className="h-16 px-6 bg-surface border-b border-border flex items-center justify-between z-10 flex-shrink-0 select-none">
        <div className="flex items-center space-x-4">
          <Button variant="icon" onClick={() => navigate('/deals')} aria-label="Back to My Deals">
            <ChevronLeft className="w-4.5 h-4.5" />
          </Button>
          <div className="h-5 w-px bg-border" />
          {brandProfile.logo_url ? (
            <img src={brandProfile.logo_url} alt={brandProfile.company_name} className="w-6 h-6 rounded-full border border-border" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-brand-light flex items-center justify-center font-bold text-[10px] text-brand border border-brand/10">
              {brandProfile.company_name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold text-text-primary sora-heading truncate max-w-[160px]">{brandProfile.company_name}</span>
            <span className="text-[9px] font-bold text-text-muted mt-1 uppercase tracking-wider">{deal.deal_type}</span>
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center flex-1 mx-8">
          <DealStageProgressBar currentStage={deal.stage} />
        </div>
        <div className="flex items-center space-x-3">
          <span data-type="number" className="font-mono text-base font-bold text-text-primary">
            ${deal.agreed_rate.toLocaleString()}
          </span>
          <Button variant="icon" aria-label="Action Menu">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Interactive Section */}
        <div className="w-[62%] h-full flex flex-col border-r border-border bg-surface">
          <div className="h-11 px-6 border-b border-border flex items-center space-x-6 select-none bg-surface-2/20">
            {[
              { id: "messages", label: "Messages" },
              { id: "deliverables", label: "Deliverables" },
              { id: "terms", label: "Term Sheet" },
              { id: "contract", label: "Contract" },
              { id: "escrow", label: "Escrow & Splits" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-full text-xs font-bold transition-spring active:scale-95 hover:-translate-y-0.5 relative ${
                  activeTab === tab.id 
                    ? "text-brand border-b-2 border-brand font-semibold" 
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-surface">
            {/* Bilateral Mutual Review Card */}
            {isCompletedOrPaid && !reviewSubmitted && (
              <Card variant="standard" className="mb-6 p-5 border border-brand bg-gradient-to-r from-surface to-brand/[0.02] space-y-4 select-none relative shadow-lg">
                <div className="flex items-center space-x-2 border-b border-border pb-2.5">
                  <Sparkles className="w-5 h-5 text-brand animate-bounce" />
                  <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">⚡ Campaign Complete: Bilateral Mutual Review</h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Both creator and brand have settled all payouts! Provide feedback to update community reputation scores and calculate profile trust badges.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-text-secondary">Overall Partnership</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setOverallRating(star)}
                            className={`text-sm focus:outline-none transition-transform active:scale-95 ${star <= overallRating ? "text-amber-400" : "text-text-faint"}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-text-secondary">Communication</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setCommunicationRating(star)}
                            className={`text-sm focus:outline-none transition-transform active:scale-95 ${star <= communicationRating ? "text-amber-400" : "text-text-faint"}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    {userRole === 'creator' ? (
                      <>
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-text-secondary">Payment Promptness</span>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setPaymentRating(star)}
                                className={`text-sm focus:outline-none transition-transform active:scale-95 ${star <= paymentRating ? "text-amber-400" : "text-text-faint"}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-text-secondary">Creative Freedom Latitude</span>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setCreativeFreedomRating(star)}
                                className={`text-sm focus:outline-none transition-transform active:scale-95 ${star <= creativeFreedomRating ? "text-amber-400" : "text-text-faint"}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-text-secondary">Content Quality</span>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setQualityRating(star)}
                                className={`text-sm focus:outline-none transition-transform active:scale-95 ${star <= qualityRating ? "text-amber-400" : "text-text-faint"}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-text-secondary">Timeliness / Turnaround</span>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setTimelinessRating(star)}
                                className={`text-sm focus:outline-none transition-transform active:scale-95 ${star <= timelinessRating ? "text-amber-400" : "text-text-faint"}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="space-y-3 flex flex-col justify-between">
                    <textarea
                      placeholder="Share your experience working together..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                      className="w-full p-2 bg-surface border border-border rounded-lg text-xs outline-none focus:border-brand font-semibold text-text-secondary"
                    />
                    <div className="flex justify-between items-center">
                      <label className="flex items-center space-x-1.5 cursor-pointer text-[10px] font-bold uppercase text-text-secondary">
                        <input
                          type="checkbox"
                          checked={submitAnonymously}
                          onChange={(e) => setSubmitAnonymously(e.target.checked)}
                          className="w-3.5 h-3.5 accent-brand border-border rounded"
                        />
                        <span>Submit Anonymously</span>
                      </label>
                      <Button
                        onClick={handleSubmitReview}
                        loading={isSubmittingReview}
                        className="px-3.5 py-1.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-[10px] font-bold flex items-center active:scale-95 transition-spring shadow"
                      >
                        Submit Review
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'messages' && (
              <div className="h-full flex flex-col justify-between">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {messages.map((msg) => {
                    const isSenderCreator = msg.sender_id === 'creator_sarah';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[72%] ${isSenderCreator ? "ml-auto items-end" : "mr-auto items-start"}`}
                      >
                        <div
                          className={`p-3 text-xs leading-relaxed ${
                            isSenderCreator 
                              ? "bg-brand text-white rounded-[16px_16px_4px_16px] shadow-[0_2px_8px_rgba(108,99,255,0.2)]" 
                              : "bg-surface-2 border border-border text-text-primary rounded-[16px_16px_16px_4px]"
                          }`}
                        >
                          {msg.message_text}
                        </div>
                        <span data-type="number" className="font-mono text-[9px] text-text-muted mt-1 px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messageEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="pt-4 border-t border-border flex items-center space-x-3 mt-4 flex-shrink-0 select-none">
                  <Button type="button" variant="icon">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <input
                    type="text"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder="Type negotiation terms, deliverables updates..."
                    className="flex-1 h-9 px-4 bg-surface-2 border border-border rounded-full text-xs outline-none focus:border-brand focus:ring-focus"
                  />
                  <button
                    type="submit"
                    className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand-dark transition-all flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                {userRole === 'brand' && (
                  <div className="mt-6 pt-5 border-t border-dashed border-border/80 bg-[#FFFBEB]/30 rounded-2xl p-4 select-none space-y-4">
                    <div className="flex items-center justify-between border-b border-amber-200/50 pb-2.5">
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-none">⚠️ Brand Internal Workspace Notes</span>
                      <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider leading-none">Private to Brand Team Members only</span>
                    </div>
                    <div className="max-h-[140px] overflow-y-auto space-y-3 pr-1 no-scrollbar text-xs font-semibold text-text-secondary leading-none">
                      {internalNotes.length > 0 ? (
                        internalNotes.map((note) => (
                          <div key={note.id} className="flex items-start space-x-2.5 leading-tight select-none">
                            <div className="w-6 h-6 rounded-full bg-amber-600/10 border border-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                              {note.author_name.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[10.5px] font-bold text-text-primary">{note.author_name}</span>
                                <span data-type="number" className="font-mono text-[9px] text-text-faint">
                                  {new Date(note.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              <p className="text-[11px] text-text-secondary mt-1 font-medium leading-relaxed break-words">{note.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-[10.5px] text-amber-700/60 font-semibold select-none">
                          No internal notes left for this deal. Use notes to align with team members privately.
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSaveInternalNote} className="relative pt-2 border-t border-amber-200/50 flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newInternalNote}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewInternalNote(val);
                            if (val.endsWith('@') || (val.includes('@') && !val.split('@').pop()?.includes(' '))) {
                              setShowColleaguesDropdown(true);
                            } else {
                              setShowColleaguesDropdown(false);
                            }
                          }}
                          placeholder="Add an internal note (use @ to mention colleagues)..."
                          className="w-full h-8 px-3 bg-surface border border-amber-200 focus:border-amber-400 rounded-lg text-xs outline-none text-text-primary"
                        />
                        {showColleaguesDropdown && (
                          <div className="absolute bottom-9 left-0 w-56 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-border text-[10.5px] font-semibold text-text-secondary">
                            <div className="px-2.5 py-1.5 bg-surface-2 text-[9px] font-bold text-text-muted uppercase tracking-wider">Mention Colleague</div>
                            {[
                              { name: "Jessica Miller", desc: "Budget Officer" },
                              { name: "Michael Chang", desc: "PR Coordinator" },
                              { name: "Sarah Jenkins", desc: "Sponsorship Owner" }
                            ].map((person) => (
                              <div
                                key={person.name}
                                onClick={() => {
                                  const parts = newInternalNote.split('@');
                                  parts.pop();
                                  setNewInternalNote(parts.join('@') + '@' + person.name + ' ');
                                  setShowColleaguesDropdown(false);
                                }}
                                className="px-2.5 py-2 hover:bg-brand-light/20 cursor-pointer flex items-center justify-between transition-colors"
                              >
                                <span className="font-bold text-text-primary">{person.name}</span>
                                <span className="text-[9px] text-text-muted">{person.desc}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button type="submit" className="h-8 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10.5px] font-bold uppercase tracking-wider flex-shrink-0 transition-colors shadow-sm">
                        Add Note
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'deliverables' && (
              <div className="space-y-4">
                <div className="flex flex-col select-none mb-2">
                  <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Sponsorship Deliverables</h3>
                  <p className="text-[11px] text-text-muted mt-0.5">Submit video drafts for review and request approval feedback loops.</p>
                </div>
                {deliverables.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-4 bg-surface border border-border hover:border-border-strong rounded-xl select-none">
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${d.status === 'approved' ? "bg-brand border-brand text-white" : "border-border-strong bg-transparent"}`}>
                        {d.status === 'approved' && <Check className="w-3 h-3 fill-current" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-primary">{d.name}</span>
                        <span className="text-[10px] text-text-muted mt-0.5 leading-none">
                          Deadline: <span data-type="number" className="font-mono">{d.due_date}</span> &middot; Revisions: {d.revision_count}/2 allowed
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {d.status === 'submitted' && (
                        <span className="text-[10px] text-brand bg-brand-light font-bold px-2 py-0.5 border border-brand/10 rounded uppercase">Under Review</span>
                      )}
                      
                      {uploadingProgressDeliverableId === d.id ? (
                        <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-brand" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      ) : d.status !== 'approved' ? (
                        <label className="cursor-pointer">
                          <input type="file" className="hidden" onChange={(e) => handleFileSelect(d.id, e)} />
                          <div className="inline-flex items-center px-3 py-1.5 bg-surface border border-border hover:border-brand rounded-md text-[10px] font-bold text-text-primary transition-all">
                            <Upload className="w-3 h-3 mr-1.5" />
                            UPLOAD DRAFT
                          </div>
                        </label>
                      ) : (
                        <span className="inline-flex items-center text-xs font-semibold text-success">✓ APPROVED</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-4">
                <Card variant="standard" className="p-4 bg-brand-light/10 border border-brand/20 rounded-xl flex items-start space-x-3 select-none shadow-sm">
                  <Sparkles className="w-5 h-5 text-brand mt-0.5 animate-pulse flex-shrink-0" />
                  <div className="flex flex-col leading-tight select-none">
                    <span className="text-xs font-bold text-text-primary sora-heading">DealHive Rate Intelligence</span>
                    <span className="text-[11px] text-text-muted mt-1 leading-normal font-semibold">
                      For standard <strong>{deal.deal_type}</strong> sponsorships in Tech/Lifestyle niches, medians fall around <strong>$3,500</strong> (Sweet range: $2,500 – $4,200). Your negotiated rate of <strong>${deal.agreed_rate.toLocaleString()}</strong> falls in the{" "}
                      <span className={`font-bold uppercase ${deal.agreed_rate < 3000 ? "text-amber-500" : deal.agreed_rate <= 4500 ? "text-emerald-500" : "text-brand"}`}>
                        {deal.agreed_rate < 3000 ? "Undercharging Range" : deal.agreed_rate <= 4500 ? "Sweet Spot" : "Premium Range"}
                      </span>.
                    </span>
                  </div>
                </Card>

                <div className="flex items-center justify-between pb-3 border-b border-border select-none">
                  <div className="flex flex-col">
                    <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Agreed Terms Sheet</h3>
                    <p className="text-[11px] text-text-muted mt-0.5">Negotiate rates, usage premium packages, and exclusivity scopes.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase text-text-muted">Agreement Status:</span>
                    <span className="text-[10px] bg-surface-2 border border-border rounded font-bold px-1.5 py-0.5">
                      {deal.creator_agreed ? "Sarah: Agreed ✓" : "Sarah: Pending"}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden shadow-sm bg-surface">
                  {[
                    { field: "agreed_rate" as keyof Deal, label: "Agreed Rate", val: `$${deal.agreed_rate.toLocaleString()}`, editable: true },
                    { field: "payment_terms" as keyof Deal, label: "Payment Terms", val: deal.payment_terms, editable: true },
                    { field: "exclusivity" as keyof Deal, label: "Exclusivity Period", val: deal.exclusivity || "None declared", editable: true },
                    { field: "usage_rights" as keyof Deal, label: "Usage Rights", val: deal.usage_rights || "None declared", editable: true },
                    { field: "kill_fee" as keyof Deal, label: "Kill Fee ($)", val: `$${(deal.kill_fee || 0).toLocaleString()}`, editable: true }
                  ].map((item) => (
                    <div
                      key={item.field}
                      onClick={() => {
                        if (item.editable) {
                          setProposeFieldName(item.field);
                          setProposeValue(String(deal[item.field] || ''));
                        }
                      }}
                      className="flex items-center justify-between h-13 px-5 hover:bg-surface-2/20 cursor-pointer transition-colors"
                    >
                      <span className="text-xs font-semibold text-text-muted">{item.label}</span>
                      <span className="text-xs font-bold text-text-primary">{item.val}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 flex justify-end items-center space-x-3">
                  <Button
                    variant={deal.creator_agreed ? "secondary" : "primary"}
                    onClick={handleAgreeToTerms}
                    disabled={deal.creator_agreed}
                  >
                    {deal.creator_agreed ? "Agreed to Terms ✓" : "Agree to Terms"}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'contract' && (
              <div className="space-y-4">
                <div className="flex flex-col select-none mb-4">
                  <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">HelloSign Embedded Contract Signing</h3>
                  <p className="text-[11px] text-text-muted mt-0.5">Generate the legal sponsorship contract and embedded Dropbox Sign request.</p>
                </div>

                {contractsEsignLimit.upgradeRequired ? (
                  <div className="p-6 border-2 border-dashed border-border rounded-xl text-center">
                    <span className="text-xs font-bold block text-text-primary uppercase mb-2">Contracts Gated</span>
                    <p className="text-xs text-text-muted mb-4 font-medium">Dropbox Sign e-signatures are reserved for Creator Pro subscribers.</p>
                  </div>
                ) : contract ? (
                  contract.status !== 'fully_signed' ? (
                    <div className="border border-border rounded-xl overflow-hidden bg-surface-2">
                      <div className="bg-surface border-b border-border px-4 py-3 flex justify-between items-center select-none">
                        <span className="text-xs font-semibold text-text-secondary flex items-center">
                          <ShieldCheck className="w-4 h-4 mr-2 text-brand" />
                          Dropbox Sign Request #{contract.hellosign_request_id}
                        </span>
                        <StatusBadge status={contract.status} />
                      </div>
                      <div className="p-12 flex flex-col items-center justify-center text-center">
                        <p className="text-xs text-text-secondary max-w-[340px] mb-6 font-medium leading-relaxed">
                          Embedded HelloSign Iframe active. Please sign below to authorize standard terms legal contract.
                        </p>
                        <Button variant="primary" onClick={handlePlaceESignature}>
                          Place E-Signature ✓
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 border border-success-border bg-success-bg/10 rounded-xl flex items-center justify-between select-none">
                      <div className="flex items-center space-x-3.5">
                        <CheckCircle2 className="w-8 h-8 text-success" />
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs font-bold text-text-primary">Contract Fully Signed!</span>
                          <span className="text-[10px] text-text-muted mt-0.5 font-medium">
                            Authorized e-signatures verified and stored in contract/ bucket.
                          </span>
                        </div>
                      </div>
                      <Button variant="secondary" icon={<Download className="w-3.5 h-3.5" />}>
                        Download Signed PDF
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="p-8 border border-border bg-surface-2/30 rounded-xl text-center flex flex-col items-center select-none">
                    <FileText className="w-10 h-10 text-text-muted mb-3" />
                    <span className="text-xs font-bold text-text-primary sora-heading mb-2">Legal Contract Ready</span>
                    <p className="text-xs text-text-muted max-w-[280px] mb-6 font-medium leading-relaxed">
                      Once both creator and brand agree on the terms sheet, the e-signature contract can be auto-generated.
                    </p>
                    <Button variant="primary" onClick={handleGenerateContract} loading={isGeneratingContract}>
                      {isGeneratingContract ? `Generating Step ${generatingStep + 1}...` : "Generate legal contract"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'escrow' && (
              <div className="space-y-6">
                <div className="flex flex-col select-none mb-2">
                  <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Escrow & Revenue Splits Ledger</h3>
                  <p className="text-[11px] text-text-muted mt-0.5">Monitor secure escrowed funds, platform fee calculations, and set up dynamic payouts to co-creators.</p>
                </div>

                <div className="p-5 border border-border bg-surface rounded-2xl select-none shadow-sm">
                  <span className="text-text-muted text-[10px] font-bold uppercase tracking-wider block mb-4">Escrow Clearance Milestones</span>
                  <div className="relative flex items-center justify-between mb-6 px-4">
                    <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-2 progress-track-hatch rounded-full z-0" />
                    <div 
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-2 bg-success rounded-full z-0 transition-all duration-500 ease-out" 
                      style={{
                        width: invoice?.status === 'paid' || deal.stage === 'completed'
                          ? "calc(100% - 32px)" 
                          : deal.stage === 'approved' || deal.stage === 'published' 
                            ? "calc(75% - 24px)" 
                            : invoice 
                              ? "calc(50% - 16px)" 
                              : deal.stage !== 'negotiating' 
                                ? "calc(25% - 8px)" 
                                : "0%"
                      }}
                    />
                    {[
                      { label: "Terms Locked", desc: "Contract & Legal approved", active: deal.stage !== 'negotiating' },
                      { label: "Funds Escrowed", desc: "Secured via Stripe Connect", active: !!invoice || deal.stage === 'completed' },
                      { label: "Deliverables OK", desc: "Work approved by Brand", active: ["approved", "published", "payment_pending", "completed"].includes(deal.stage) },
                      { label: "Payout Cleared", desc: "Split payout disbursed", active: invoice?.status === 'paid' || deal.stage === 'completed' }
                    ].map((step, idx) => (
                      <div key={idx} className="relative z-10 flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          step.active ? "bg-success border-success text-white" : "bg-surface border-border-strong text-text-muted"
                        }`}>
                          {step.active ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <span className="text-[10px] font-bold">{idx + 1}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center select-none font-medium">
                    {[
                      { label: "Terms Locked", status: deal.stage !== 'negotiating' ? "Locked" : "Pending", color: deal.stage !== 'negotiating' ? "text-success" : "text-text-muted" },
                      { label: "Funds Escrowed", status: invoice ? "Secured" : "Awaiting Payment", color: invoice ? "text-success" : "text-text-muted" },
                      { label: "Deliverables OK", status: ["approved", "published", "payment_pending", "completed"].includes(deal.stage) ? "Approved" : "Pending Review", color: ["approved", "published", "payment_pending", "completed"].includes(deal.stage) ? "text-success" : "text-text-muted" },
                      { label: "Payout Cleared", status: invoice?.status === 'paid' || deal.stage === 'completed' ? "Disbursed" : "In Escrow", color: invoice?.status === 'paid' || deal.stage === 'completed' ? "text-success" : "text-brand" }
                    ].map((step, idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-[10px] font-bold text-text-primary leading-tight">{step.label}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${step.color}`}>{step.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 border border-border bg-surface rounded-2xl select-none shadow-sm">
                  <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider block mb-3">Payment Breakdown & Platform Service Fee</span>
                  <div className="divide-y divide-border border border-border rounded-xl overflow-hidden font-sans bg-surface">
                    <div className="flex items-center justify-between h-11 px-4 hover:bg-surface-2/10 transition-colors">
                      <span className="text-xs font-semibold text-text-secondary flex items-center">
                        <DollarSign className="w-3.5 h-3.5 text-text-muted mr-2" />
                        Gross Campaign Deal Rate
                      </span>
                      <span data-type="number" className="text-xs font-bold text-text-primary">${deal.agreed_rate.toLocaleString()}.00</span>
                    </div>
                    <div className="flex items-center justify-between h-11 px-4 hover:bg-surface-2/10 transition-colors">
                      <span className="text-xs font-semibold text-text-secondary flex items-center">
                        <TrendingUp className="w-3.5 h-3.5 text-danger mr-2" />
                        DealHive Platform Fee (2.5%)
                      </span>
                      <span data-type="number" className="text-xs font-bold text-danger">-${(deal.agreed_rate * 0.025).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between h-12 px-4 bg-brand-light/30 transition-colors font-bold">
                      <span className="text-xs text-brand flex items-center font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand mr-2 animate-pulse" />
                        Net Creator Payout Pool
                      </span>
                      <span data-type="number" className="text-sm text-brand font-extrabold">${(deal.agreed_rate * 0.975).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 border border-border bg-surface rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider block">Co-Creator & Collaborator Revenue Splits</span>
                    <div className="flex items-center space-x-1.5 text-text-secondary">
                      <Users className="w-3.5 h-3.5 text-text-muted" />
                      <span className="text-[10.5px] font-bold">Collaborators</span>
                    </div>
                  </div>
                  <p className="text-[10.5px] text-text-muted mb-4">Allocate payout percentages dynamically. Net funds will automatically route to connected Stripe accounts upon milestone release.</p>
                  
                  <div className="space-y-3">
                    {coCreators.map((c) => {
                      const allocatedShare = deal.agreed_rate * 0.975 * (c.share / 100);
                      return (
                        <div key={c.id} className="p-3.5 border border-border/80 bg-surface-2/20 hover:bg-surface-2/30 rounded-xl flex flex-col space-y-3 transition-all duration-300">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <input
                                type="text"
                                placeholder="Collaborator Name"
                                value={c.name}
                                onChange={(e) => handleUpdateCollaboratorField(c.id, 'name', e.target.value)}
                                className="w-full h-8 px-2.5 bg-surface border border-border focus:border-brand rounded-lg text-xs font-semibold text-text-primary"
                              />
                            </div>
                            <div className="w-[120px] md:w-[150px] flex-shrink-0">
                              <input
                                type="text"
                                placeholder="Role/Contribution"
                                value={c.role}
                                onChange={(e) => handleUpdateCollaboratorField(c.id, 'role', e.target.value)}
                                className="w-full h-8 px-2.5 bg-surface border border-border focus:border-brand rounded-lg text-xs font-semibold text-text-secondary"
                              />
                            </div>
                            <div className="w-[75px] flex-shrink-0 flex items-center space-x-1 bg-surface border border-border rounded-lg px-1.5 h-8">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={c.share}
                                onChange={(e) => handleUpdateShare(c.id, parseInt(e.target.value) || 0)}
                                className="w-full bg-transparent text-xs font-mono font-bold text-right outline-none border-none p-0 focus:ring-0"
                              />
                              <span className="text-[10px] font-bold text-text-muted">%</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteCollaborator(c.id)}
                              className="w-8 h-8 rounded-lg border border-border text-text-muted hover:text-danger hover:border-danger/30 hover:bg-danger-bg/20 flex items-center justify-center transition-all duration-300 active:scale-95 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                              title="Delete split"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center space-x-4 pt-1">
                            <div className="flex-1 flex items-center">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={c.share}
                                onChange={(e) => handleUpdateShare(c.id, parseInt(e.target.value) || 0)}
                                className="w-full accent-brand h-1 cursor-pointer bg-border rounded-full outline-none"
                              />
                            </div>
                            <div className="flex-shrink-0 flex items-center space-x-1 font-sans">
                              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Allocation:</span>
                              <span data-type="number" className="font-mono text-xs font-bold text-success bg-success-bg border border-success-border px-2 py-0.5 rounded leading-none">
                                ${allocatedShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                    <div>
                      <Button
                        type="button"
                        variant="secondary"
                        icon={<Plus className="w-3.5 h-3.5 text-brand" />}
                        onClick={handleAddCollaborator}
                        className="rounded-full"
                      >
                        ADD COLLABORATOR
                      </Button>
                    </div>
                    <div className="flex flex-col md:flex-row items-end md:items-center space-y-2 md:space-y-0 md:space-x-4">
                      <div className="text-right leading-none">
                        <span className="text-[9px] font-bold uppercase text-text-muted tracking-wider block">Total Revenue Allocated</span>
                        <div className="flex items-center space-x-1.5 mt-1.5 justify-end">
                          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                            coCreators.reduce((acc, curr) => acc + curr.share, 0) === 100 
                              ? "bg-success-bg border-success-border text-success" 
                              : "bg-warning-bg border-warning-border text-warning"
                          }`}>
                            {coCreators.reduce((acc, curr) => acc + curr.share, 0)}%
                          </span>
                          <span className="text-[10.5px] font-bold text-text-secondary leading-none">
                            {coCreators.reduce((acc, curr) => acc + curr.share, 0) === 100 ? "✓ Fully allocated" : "(requires exactly 100%)"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const total = coCreators.reduce((acc, curr) => acc + curr.share, 0);
                          if (total !== 100) {
                            toast.error(`Invalid Split Share Total: Sum must equal exactly 100% (currently ${total}%).`);
                            return;
                          }
                          toast.success("Revenue split allocations updated and saved to smart contract successfully!");
                        }}
                        disabled={coCreators.reduce((acc, curr) => acc + curr.share, 0) !== 100}
                        className={`px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                          coCreators.reduce((acc, curr) => acc + curr.share, 0) === 100
                            ? "bg-brand hover:bg-brand-dark text-white"
                            : "bg-surface-2 text-text-muted border border-border cursor-not-allowed"
                        }`}
                      >
                        Save Splits & Locks
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Info Section */}
        <div className="w-[38%] h-full overflow-y-auto bg-surface-2 p-6 space-y-6">
          <Card variant="standard" className="flex flex-col p-5 select-none bg-surface">
            <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider">Current Stage</span>
            <div className="mt-3.5">
              <StatusBadge status={deal.stage} />
            </div>
            <h3 className="text-sm font-bold text-text-primary sora-heading mt-4 leading-tight">{deal.title}</h3>
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-border">
              <div className="w-[28px] h-[28px] rounded-full bg-brand-light flex items-center justify-center font-bold text-xs text-brand">
                {brandProfile.company_name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-semibold text-text-primary">{brandProfile.company_name} Sponsor</span>
                <span className="text-[9px] text-text-muted mt-1">{(brandProfile.website || "").replace("https://", "")}</span>
              </div>
            </div>
          </Card>

          <Card variant="standard" className="flex flex-col p-5 select-none bg-surface">
            <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider select-none">Sponsorship Timeline Milestones</span>
            <div className="mt-5 space-y-4 select-none relative">
              <div className="absolute top-2 bottom-2 left-[5px] w-0.5 border-r border-dashed border-border-strong z-0" />
              {[
                { node: "Concept Draft Due", due: "May 31", passed: true },
                { node: "Video Production Draft", due: "June 05", passed: false },
                { node: "Sponsorship Video Publication", due: "June 10", passed: false },
                { node: "Payment Invoice Disbursement", due: "July 10", passed: false }
              ].map((m, idx) => (
                <div key={idx} className="relative z-10 flex items-center justify-between text-xs leading-none">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${m.passed ? "bg-brand" : "bg-surface border-2 border-border-strong"}`} />
                    <span className={`font-semibold ${m.passed ? "text-text-primary" : "text-text-secondary"}`}>{m.node}</span>
                  </div>
                  <span data-type="number" className="font-mono text-text-muted text-[10px]">{m.due}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="standard" className="flex flex-col p-5 select-none bg-surface" style={{ backgroundColor: "var(--color-brand-light)", border: "1px solid rgba(108, 99, 255, 0.20)", borderTop: "3px solid var(--color-brand)" }}>
            <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider">Escrow / Payout Details</span>
            <div className="mt-3.5 flex flex-col">
              <span data-type="number" className="font-mono text-[28px] font-bold text-text-primary leading-tight">${deal.agreed_rate.toLocaleString()}</span>
              <span className="text-[10px] text-text-muted mt-1 leading-none">Due Term: {deal.payment_terms}</span>
            </div>
            <div className="mt-5 border-t border-border pt-4">
              {invoice ? (
                invoice.status === 'invoice_sent' ? (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-brand block">✓ Invoice {invoice.id} Sent</span>
                    <Button variant="secondary" onClick={handleSimulatePayment}>
                      Simulate Payment (Stripe Connect Mock)
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-success block">✓ Payment Settled! Payout Released.</span>
                )
              ) : (
                <Button 
                  variant="primary" 
                  onClick={handleSendInvoice} 
                  disabled={deal.stage === 'negotiating' || deal.stage === 'contracted'}
                >
                  Send Invoice
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Propose Term Change Modal */}
      {proposeFieldName && (
        <Modal
          isOpen={true}
          onClose={() => setProposeFieldName(null)}
          title={`Propose Term Change: ${proposeFieldName.replace('_', ' ').toUpperCase()}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setProposeFieldName(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleProposeChange}>
                Propose Change
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-xs text-text-muted">Outline changes will update the Term Sheet, requiring both party agreements to lock.</p>
            <InputField
              label="Proposed Value"
              value={proposeValue}
              onChange={(e) => setProposeValue(e.target.value)}
            />
          </div>
        </Modal>
      )}

      {/* Upload Compliance Self-Certification Modal */}
      {uploadingDeliverableId && selectedFile && (
        <Modal
          isOpen={true}
          onClose={() => {
            setUploadingDeliverableId(null);
            setSelectedFile(null);
          }}
          title="Sponsorship Compliance Self-Certification"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setUploadingDeliverableId(null);
                  setSelectedFile(null);
                }}
              >
                Cancel Submission
              </Button>
              <button
                onClick={handleUploadCertified}
                disabled={!(complianceChecked.hook && complianceChecked.restrict && complianceChecked.points && complianceChecked.guidelines)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  complianceChecked.hook && complianceChecked.restrict && complianceChecked.points && complianceChecked.guidelines
                    ? "bg-brand hover:bg-brand-dark text-white active:scale-95 shadow shadow-brand/10"
                    : "bg-surface-2 border border-border text-text-muted cursor-not-allowed"
                }`}
              >
                ✓ Certify & Submit Draft
              </button>
            </>
          }
        >
          <div className="space-y-4 select-none">
            <div className="p-3.5 bg-brand-light/10 border border-brand/20 rounded-xl leading-relaxed text-[11px] text-text-secondary">
              ⚠️ <strong>Brand Scripting Guardrails Enforced:</strong> Before uploading your sponsorship draft, you must self-certify compliance against standard campaign brief terms. This minimizes revision loops and protects creative integrity.
            </div>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer p-2 hover:bg-surface-2/15 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={complianceChecked.hook}
                  onChange={(e) => setComplianceChecked((prev) => ({ ...prev, hook: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 accent-brand border-border rounded"
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-bold text-text-primary">Integration Hook Focus</span>
                  <span className="text-[10px] text-text-muted mt-1 leading-normal">
                    My segment unboxing features an organic attention hook complying with brief outline rules.
                  </span>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer p-2 hover:bg-surface-2/15 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={complianceChecked.restrict}
                  onChange={(e) => setComplianceChecked((prev) => ({ ...prev, restrict: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 accent-brand border-border rounded"
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-bold text-text-primary">Brand Restriction Safeguards</span>
                  <span className="text-[10px] text-text-muted mt-1 leading-normal">
                    I did not display competing electronics logos or violate designated formatting prohibitions.
                  </span>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer p-2 hover:bg-surface-2/15 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={complianceChecked.points}
                  onChange={(e) => setComplianceChecked((prev) => ({ ...prev, points: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 accent-brand border-border rounded"
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-bold text-text-primary">Mandatory USPs & Talking Points</span>
                  <span className="text-[10px] text-text-muted mt-1 leading-normal">
                    I actively mentioned nightography generative highlights, AI instant transcription, and promo links.
                  </span>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer p-2 hover:bg-surface-2/15 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={complianceChecked.guidelines}
                  onChange={(e) => setComplianceChecked((prev) => ({ ...prev, guidelines: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 accent-brand border-border rounded"
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-bold text-text-primary">Formatting & Overlay Outlines</span>
                  <span className="text-[10px] text-text-muted mt-1 leading-normal">
                    Promo link and discount codes displays are formatted according to the exact brief duration specifications.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </Modal>
      )}

      <Confetti active={isConfettiActive} />
    </div>
  );
};