import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';

import { convexClient as supabaseClient, mockDb } from '../services/convex';
import { Deal, DealStage, BrandProfile } from '../types/supabase.types';
import { 
  Button, 
  StatusBadge, 
  SegmentedControl, 
  DataTable, 
  DealCard, 
  Modal, 
  InputField,
  ShimmerSkeleton 
} from '../components';
import { useSubscription } from '../hooks/useSubscription';

// Enforce State Machine Transitions per PRD Section 4.5
const ALLOWED_TRANSITIONS: Record<DealStage, DealStage[]> = {
  negotiating: ['contracted'],
  contracted: ['in_production'],
  in_production: ['draft_submitted'],
  draft_submitted: ['approved', 'revisions'],
  revisions: ['draft_submitted'],
  approved: ['published'],
  published: ['payment_pending'],
  payment_pending: ['completed'],
  completed: []
};

function validateStageTransition(from: DealStage, to: DealStage): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

const PIPELINE_STAGES: { value: DealStage; label: string; color: string }[] = [
  { value: 'negotiating', label: 'Negotiating', color: 'var(--color-stage-negotiating)' },
  { value: 'contracted', label: 'Contracted', color: 'var(--color-stage-contracted)' },
  { value: 'in_production', label: 'Production', color: 'var(--color-stage-in-production)' },
  { value: 'draft_submitted', label: 'Submitted', color: 'var(--color-stage-draft-submitted)' },
  { value: 'revisions', label: 'Revisions', color: 'var(--color-stage-revisions)' },
  { value: 'approved', label: 'Approved', color: 'var(--color-stage-approved)' },
  { value: 'published', label: 'Published', color: 'var(--color-stage-published)' },
  { value: 'payment_pending', label: 'Payment', color: 'var(--color-stage-payment-pending)' },
  { value: 'completed', label: 'Completed', color: 'var(--color-stage-completed)' }
];

export const Deals: React.FC = () => {
  const navigate = useNavigate();
  const { activeDealsCount, activeDealsLimit, plan } = useSubscription();

  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // New Deal form states
  const [brandName, setBrandName] = useState('');
  const [dealType, setDealType] = useState('Integration');
  const [rate, setRate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  
  // Templates
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateAppliedFlash, setTemplateAppliedFlash] = useState(false);

  useEffect(() => {
    loadDealsData();
  }, []);

  const loadDealsData = async () => {
    try {
      const dealsData = await supabaseClient.deals.list();
      setDeals(dealsData);
      
      // Load brands
      await supabaseClient.profiles.getBrand();
      setBrands(mockDb.getBrands());

      // Load templates
      const templatesData = await supabaseClient.templates.list();
      setTemplates(templatesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const dealId = active.id as string;
    const newStage = over.id as DealStage;
    
    const deal = deals.find(d => d.id === dealId);
    if (deal && deal.stage !== newStage) {
      if (!validateStageTransition(deal.stage, newStage)) {
        toast.error(`Invalid transition! Cannot move deal directly from "${deal.stage.toUpperCase()}" to "${newStage.toUpperCase()}"`, { duration: 4000 });
        return;
      }
      try {
        const updatedDeals = deals.map(d => d.id === dealId ? { ...d, stage: newStage } : d);
        setDeals(updatedDeals);
        await supabaseClient.deals.update(dealId, { stage: newStage });
        toast.success(`Deal stage transitioned to ${newStage.replace('_', ' ').toUpperCase()}`);
      } catch {
        toast.error("Failed to transition stage.");
        loadDealsData();
      }
    }
  };

  const handleAddDeal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (plan === 'free' && activeDealsCount >= activeDealsLimit) {
      toast.error(`Upgrade required! Free accounts are limited to ${activeDealsLimit} active deals. Upgrade to Creator Pro to unlock unlimited pipelines.`, { duration: 5000 });
      setIsAddModalOpen(false);
      return;
    }

    const newErrors: Record<string, string> = {};
    if (!brandName) newErrors.brandName = "Brand name is required";
    if (!rate || Number(rate) <= 0) newErrors.agreedRate = "Agreed rate must be positive";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsCreating(true);
      const existingBrand = brands.find(b => b.company_name.toLowerCase() === brandName.toLowerCase());
      const brandId = existingBrand ? existingBrand.id : 'brand_samsung';

      const newDealId = await supabaseClient.deals.create({
        brand_id: brandId,
        title: `${brandName} ${dealType} Partnership`,
        deal_type: dealType as any,
        agreed_rate: Number(rate),
        payment_terms: paymentTerms,
        stage: 'negotiating'
      });

      toast.success("Brand deal successfully added!");
      setIsAddModalOpen(false);
      setBrandName('');
      setDealType('Integration');
      setRate('');
      setPaymentTerms('Net 30');
      setSelectedTemplateId('');
      navigate(`/deals/${newDealId}`);
    } catch {
      toast.error("Error generating deal.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleApplyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const t = templates.find(temp => temp.id === templateId);
    if (t) {
      setDealType(t.deal_type);
      setRate(String(t.default_rate));
      setPaymentTerms(t.default_payment_terms);
      setTemplateAppliedFlash(true);
      setTimeout(() => setTemplateAppliedFlash(false), 500);
      toast.success(`Applied template: ${t.name}!`);
    }
  };

  const handleResetForm = () => {
    setSelectedTemplateId('');
    setDealType('Integration');
    setRate('');
    setPaymentTerms('Net 30');
    toast("Form fields reset to default", { icon: "🔄" });
  };

  const filteredDeals = deals.filter(d => filterStage === 'all' || d.stage === filterStage);
  const getBrand = (brandId: string) => brands.find(b => b.id === brandId) || brands[0];

  return loading ? (
    <div className="flex flex-col space-y-6 w-full max-w-[1140px] mx-auto py-7 px-8">
      <ShimmerSkeleton width="220px" height="32px" />
      <div className="flex justify-between items-center mt-6">
        <ShimmerSkeleton width="180px" height="40px" />
        <ShimmerSkeleton width="140px" height="40px" />
      </div>
      <div className="grid grid-cols-4 gap-6 mt-8">
        <ShimmerSkeleton height="240px" />
        <ShimmerSkeleton height="240px" />
        <ShimmerSkeleton height="240px" />
        <ShimmerSkeleton height="240px" />
      </div>
    </div>
  ) : (
    <div className="w-full py-7 px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col select-none">
          <h2 className="text-xl font-bold text-text-primary sora-heading leading-tight">My Deals</h2>
          <p className="text-xs text-text-muted mt-1.5 leading-none">
            {deals.length} deals in pipeline &middot; {activeDealsCount} active limits
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <SegmentedControl
            options={[{ label: "Kanban", value: "kanban" }, { label: "List", value: "list" }]}
            selectedValue={viewMode}
            onChange={(val) => setViewMode(val as 'kanban' | 'list')}
          />
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            New Deal
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4 bg-surface border border-border px-4 py-2.5 rounded-lg select-none">
        <div className="flex items-center space-x-2 text-xs text-text-muted">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-semibold">Filter:</span>
        </div>
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="h-8 px-2.5 bg-surface-2 border border-border text-xs rounded font-semibold text-text-secondary outline-none focus:border-brand cursor-pointer"
        >
          <option value="all">All Stages</option>
          {PIPELINE_STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {viewMode === 'kanban' ? (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex space-x-4 overflow-x-auto pb-6 scroll-smooth select-none min-h-[500px]">
            {PIPELINE_STAGES.map((stage) => {
              const stageDeals = deals.filter((d) => d.stage === stage.value);
              const stageValue = stageDeals.reduce((acc, curr) => acc + curr.agreed_rate, 0);

              return (
                <div key={stage.value} className="w-[280px] flex-shrink-0 flex flex-col space-y-4">
                  <div className="flex flex-col border-b-2 pb-2" style={{ borderBottomColor: stage.color }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold text-text-primary uppercase tracking-[0.04em] leading-none">
                          {stage.label}
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono bg-surface-2 border border-border text-text-muted rounded-full leading-none scale-90">
                          {stageDeals.length}
                        </span>
                      </div>
                      <span data-type="number" className="font-mono text-[11px] font-bold text-text-muted">
                        ${stageValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div
                    id={stage.value}
                    className="flex flex-col space-y-3 min-h-[350px] bg-surface-2/10 rounded-lg p-1"
                  >
                    {stageDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        brand={getBrand(deal.brand_id)}
                        onClick={() => navigate(`/deals/${deal.id}`)}
                      />
                    ))}
                    <div
                      onClick={() => setIsAddModalOpen(true)}
                      className="h-14 border border-dashed border-border rounded-xl flex items-center justify-center text-xs font-semibold text-text-faint hover:text-brand hover:border-brand hover:bg-brand-light/10 cursor-pointer transition-colors"
                    >
                      + Add deal
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DndContext>
      ) : (
        <div className="w-full">
          {filteredDeals.length > 0 ? (
            <DataTable
              columns={[
                {
                  header: "Brand",
                  accessor: (deal: Deal) => {
                    const b = getBrand(deal.brand_id);
                    return (
                      <div className="flex items-center space-x-2.5">
                        <div className="w-6 h-6 rounded-full bg-brand-light flex items-center justify-center font-bold text-[10px] text-brand border border-brand/10">
                          {b.company_name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-text-primary">{b.company_name}</span>
                      </div>
                    );
                  },
                  flexRatio: "flex-[2]"
                },
                {
                  header: "Deal Type",
                  accessor: (deal: Deal) => (
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-surface-2 border border-border text-text-muted rounded-sm leading-none">
                      {deal.deal_type}
                    </span>
                  ),
                  flexRatio: "flex-[1.5]"
                },
                {
                  header: "Stage",
                  accessor: (deal: Deal) => <StatusBadge status={deal.stage} />,
                  flexRatio: "flex-[1.5]"
                },
                {
                  header: "Rate Value",
                  accessor: (deal: Deal) => (
                    <span data-type="number" className="font-mono font-bold">
                      ${deal.agreed_rate.toLocaleString()}
                    </span>
                  ),
                  align: "right",
                  flexRatio: "flex-[1]"
                },
                {
                  header: "Next Deadline",
                  accessor: (deal: Deal) => (
                    <span data-type="number" className="font-mono text-xs text-text-muted">
                      {deal.stage === 'completed' ? "Done" : "In 4 days"}
                    </span>
                  ),
                  flexRatio: "flex-[1.5]"
                }
              ]}
              data={filteredDeals}
              onRowClick={(deal) => navigate(`/deals/${deal.id}`)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-xl shadow-sm text-center">
              <h3 className="text-sm font-bold text-text-primary sora-heading mb-2">No matching deals found</h3>
              <p className="text-xs text-text-muted">Clear filters or create a new deal to expand your pipeline.</p>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Brand Deal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="new-deal-form" loading={isCreating}>
              Create Deal Room
            </Button>
          </>
        }
      >
        <form id="new-deal-form" onSubmit={handleAddDeal} className="space-y-4">
          {templates.length > 0 && (
            <div className="flex flex-col space-y-1.5 p-3.5 bg-brand-light/40 border border-brand/20 rounded-2xl select-none">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-brand uppercase tracking-wider">
                  ✨ Pre-fill terms from Template
                </label>
                {selectedTemplateId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-[9px] font-extrabold text-text-muted hover:text-brand uppercase tracking-wide leading-none"
                  >
                    Clear Template [x]
                  </button>
                )}
              </div>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleApplyTemplate(e.target.value)}
                className="w-full h-9 px-2.5 bg-surface border border-brand/20 text-brand font-semibold rounded-lg text-xs outline-none focus:border-brand mt-1.5 cursor-pointer"
              >
                <option value="">-- Apply a Saved Deal Template --</option>
                {templates.map((temp) => (
                  <option key={temp.id} value={temp.id}>
                    {temp.name} (${temp.default_rate.toLocaleString()} &middot; {temp.deal_type})
                  </option>
                ))}
              </select>
            </div>
          )}

          <InputField
            label="Brand Name"
            name="brandName"
            placeholder="e.g. Samsung, NordVPN, Adobe"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            error={errors.brandName}
            required
          />

          <div className={`space-y-4 transition-all duration-300 rounded-xl ${templateAppliedFlash ? "bg-brand-light/30 scale-[0.98] p-2 border border-brand/20" : ""}`}>
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-[0.04em]">
                Deal Format
              </label>
              <select
                name="dealType"
                value={dealType}
                onChange={(e) => setDealType(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm text-text-primary outline-none focus:border-brand cursor-pointer"
              >
                <option value="Integration">YouTube Video Integration (60-90s)</option>
                <option value="Dedicated Video">Dedicated YouTube Video (Full review)</option>
                <option value="Shorts">YouTube Shorts / TikTok Package</option>
                <option value="Social Package">Social Cross-Promotion Package</option>
              </select>
            </div>

            <InputField
              label="Agreed Rate ($)"
              name="agreedRate"
              type="number"
              placeholder="3500"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              error={errors.agreedRate}
              required
            />

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-[0.04em]">
                Payment Schedule Terms
              </label>
              <select
                name="paymentTerms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm text-text-primary outline-none focus:border-brand cursor-pointer"
              >
                <option value="Net 30">Net 30 Days (Standard)</option>
                <option value="Net 15">Net 15 Days (Express)</option>
                <option value="50/50 Split">50% upfront, 50% on completion</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};