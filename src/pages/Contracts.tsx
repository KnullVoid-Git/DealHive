import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

import { convexClient as supabaseClient, mockDb } from '../services/convex';
import { Deal, BrandProfile } from '../types/supabase.types';
import { Card, ShimmerSkeleton, StatusBadge } from '../components';

interface ContractRecord {
  id: string;
  deal: Deal;
  brand: BrandProfile;
  status: 'signed' | 'pending' | 'draft';
  statusText: string;
  signedDateStr: string;
  type: string;
}

export const Contracts: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'signed' | 'pending' | 'draft'>('all');

  useEffect(() => {
    loadContractsData();
  }, []);

  const loadContractsData = async () => {
    try {
      const dealsList = await supabaseClient.deals.list();
      const contractsList = mockDb.getContracts();
      const brandsList = mockDb.getBrands();

      const uniqueDealsMap = new Map();
      dealsList.forEach(d => {
        if (!uniqueDealsMap.has(d.id)) {
          uniqueDealsMap.set(d.id, d);
        }
      });
      const uniqueDeals = Array.from(uniqueDealsMap.values());

      const matches = uniqueDeals.map(d => {
        const con = contractsList.find(c => c.deal_id === d.id);
        const br = brandsList.find(b => b.id === d.brand_id) || brandsList[0];
        
        let status: 'signed' | 'pending' | 'draft' = 'draft';
        let statusText = 'Draft';
        let signedDateStr = 'Awaiting signature';
        
        if (d.stage === 'negotiating') {
          status = 'draft';
          statusText = 'Draft';
        } else if (con && con.status === 'fully_signed') {
          status = 'signed';
          statusText = 'Signed';
          signedDateStr = `Signed ${new Date(con.signed_at || d.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`;
        } else if (d.stage === 'contracted') {
          status = 'pending';
          statusText = 'Pending';
        } else {
          status = 'signed';
          statusText = 'Signed';
          signedDateStr = `Signed ${new Date(d.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }

        return { 
          id: con?.id || 'con_' + d.id.substring(5),
          deal: d, 
          brand: br,
          status,
          statusText,
          signedDateStr,
          type: d.deal_type
        };
      });

      setContracts(matches);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (dealTitle: string) => {
    const fileName = dealTitle.replace(/\s+/g, '_') + '_Contract.pdf';
    toast.success(`Downloading signed document: ${fileName}`);
  };

  const filteredContracts = contracts.filter(c => {
    if (activeFilter === 'all') return true;
    return c.status === activeFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col space-y-6 w-full max-w-[1140px] mx-auto py-7 px-8">
        <ShimmerSkeleton width="220px" height="32px" />
        <ShimmerSkeleton height="280px" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1140px] mx-auto py-7 px-8 space-y-6 animate-stagger-item select-none">
      
      {/* Sora 700 28px header */}
      <div className="flex flex-col select-none border-b border-border pb-4">
        <h1 className="text-[28px] font-bold text-text-primary sora-heading leading-tight">
          Contracts
        </h1>
        <p className="text-xs text-text-muted mt-1 leading-none">
          All signed agreements, stored forever in secure escrow vaults.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-1.5 border-b border-border pb-2.5 leading-none select-none">
        {([
          { id: 'all', label: 'All Agreements' },
          { id: 'signed', label: 'Signed' },
          { id: 'pending', label: 'Pending Signature' },
          { id: 'draft', label: 'Drafts' }
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded transition-all ${
              activeFilter === tab.id 
                ? 'bg-brand text-white shadow-sm' 
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-2'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredContracts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredContracts.map(record => {
            const isSigned = record.status === 'signed';
            const isPending = record.status === 'pending';
            
            return (
              <Card 
                key={record.id}
                variant="standard"
                className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-surface-2/15 transition-colors border border-border/80 shadow-sm rounded-xl gap-4 select-none"
              >
                
                {/* Left side check icon in colored circle */}
                <div className="flex items-center space-x-4 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${
                    isSigned 
                      ? 'bg-[#E8F5E9] text-[#16A34A] border-[#16A34A]/20' 
                      : isPending 
                        ? 'bg-[#FEF9EC] text-[#D97706] border-[#D97706]/20' 
                        : 'bg-surface-2 text-text-muted border-border'
                  }`}>
                    <FileCheck className="w-5 h-5" />
                  </div>

                  <div className="flex flex-col space-y-1.5 min-w-0">
                    <span className="text-[15px] font-sans font-semibold text-text-primary leading-tight truncate">
                      {record.brand.company_name} Ã— Sarah Jenkins â€” {record.type}
                    </span>
                    <span className="text-xs font-sans font-normal text-text-muted leading-tight truncate">
                      Deal: {record.deal.title}
                    </span>
                    <span data-type="number" className="font-mono text-xs text-text-muted leading-none">
                      {record.signedDateStr}
                    </span>
                  </div>
                </div>

                {/* Right side status badge and actions */}
                <div className="flex items-center space-x-4 flex-shrink-0 justify-end">
                  <StatusBadge status={record.deal.stage} />
                  
                  {/* Download PDF button (always visible) */}
                  <button 
                    onClick={() => handleDownloadPDF(record.deal.title)}
                    className="w-8 h-8 rounded-full border border-border hover:border-brand hover:bg-brand-light flex items-center justify-center text-text-muted hover:text-brand transition-all"
                    title="Download Contract PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={() => navigate(`/deals/${record.deal.id}`)}
                    className="text-xs font-bold text-brand hover:text-brand-dark transition-colors"
                  >
                    View in Deal Room â†’
                  </button>
                </div>

              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-16 bg-surface border border-dashed border-border rounded-2xl select-none text-text-muted space-y-4">
          <svg viewBox="0 0 64 64" className="w-16 h-16 text-text-faint mx-auto">
            <rect x="16" y="8" width="32" height="48" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4,4" />
            <path d="M 24 24 L 40 24 M 24 34 L 36 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-bold text-text-primary sora-heading">No contracts yet</span>
            <p className="text-xs text-text-muted max-w-[280px] leading-relaxed">
              Contracts appear here once you start a deal and reach the agreement stage.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Contracts;

