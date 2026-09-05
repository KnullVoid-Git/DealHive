import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  CheckCircle, 
  TrendingUp, 
  Landmark, 
  ArrowRight,
  Mail,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { convexClient as supabaseClient, mockDb } from '../services/convex';

import { 
  DataTable, 
  Card,
  ShimmerSkeleton,
  StatusBadge
} from '../components';
import { useCountUp } from '../hooks/useCountUp';

interface PayoutRow {
  id: string;
  date: string;
  dealName: string;
  dealId: string;
  gross: number;
  fee: number;
  net: number;
  stripeStatus: 'paid' | 'processing' | 'failed';
}

interface ScheduledRow {
  id: string;
  dealName: string;
  brandName: string;
  expectedDate: string;
  amount: number;
  status: 'invoice_sent' | 'not_yet_invoiced';
  group: 'This Week' | 'This Month' | 'Later';
}

const MOCK_REVENUE_HISTORY = [
  { month: 'Dec', revenue: 3200 },
  { month: 'Jan', revenue: 6400 },
  { month: 'Feb', revenue: 4500 },
  { month: 'Mar', revenue: 8500 },
  { month: 'Apr', revenue: 12000 },
  { month: 'May', revenue: 14100 },
];

export const Payments: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payouts' | 'scheduled'>('invoices');

  // Inbound mocks
  const payouts: PayoutRow[] = [
    {
      id: 'po_1',
      date: '2026-05-15',
      dealName: 'Galaxy S26 Ultra Launch Integration',
      dealId: 'deal_samsung_galaxy',
      gross: 4200,
      fee: 105.00,
      net: 4095.00,
      stripeStatus: 'paid'
    },
    {
      id: 'po_2',
      date: '2026-05-02',
      dealName: 'Cybersecurity Awareness Dedicated Video',
      dealId: 'deal_nordvpn_protect',
      gross: 7500,
      fee: 187.50,
      net: 7312.50,
      stripeStatus: 'paid'
    }
  ];

  const scheduled: ScheduledRow[] = [
    {
      id: 'sch_1',
      dealName: 'Morning Routine Integration',
      brandName: 'Lumen Health',
      expectedDate: '2026-06-03',
      amount: 3500,
      status: 'invoice_sent',
      group: 'This Week'
    },
    {
      id: 'sch_2',
      dealName: 'Creative Express Review',
      brandName: 'Adobe',
      expectedDate: '2026-06-25',
      amount: 8500,
      status: 'not_yet_invoiced',
      group: 'This Month'
    },
    {
      id: 'sch_3',
      dealName: 'Fall Product launch',
      brandName: 'Samsung',
      expectedDate: '2026-07-12',
      amount: 6000,
      status: 'not_yet_invoiced',
      group: 'Later'
    }
  ];

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const invs = await supabaseClient.invoices.list();
      const dls = await supabaseClient.deals.list();
      const brs = mockDb.getBrands();

      const mapped = invs.map(inv => {
        const deal = dls.find(d => d.id === inv.deal_id);
        const brand = brs.find(b => b.id === deal?.brand_id) || brs[0];
        return {
          ...inv,
          dealName: deal?.title || 'Sponsorship Deal',
          brandName: brand?.company_name || 'Brand Sponsor',
          brandLogo: brand?.logo_url || 'https://logo.clearbit.com/samsung.com',
          dealId: deal?.id
        };
      });
      setInvoices(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = (_invoiceId: string) => {
    toast.success('Billing reminder email dispatched successfully via Resend!');
  };

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      await supabaseClient.invoices.pay(invoiceId);
      toast.success('Manual payout noted! Ledger reconciled.');
      loadInvoices();
    } catch (e) {
      toast.error('Mark paid failed.');
    }
  };

  // Summarize metrics
  const paidSum = invoices.filter(i => i.status === 'paid').reduce((sum, curr) => sum + curr.amount, 0) || 11700;
  const outstandingSum = invoices.filter(i => i.status === 'invoice_sent' || i.status === 'pending').reduce((sum, curr) => sum + curr.amount, 0) || 7500;
  const overdueSum = invoices.filter(i => i.status === 'overdue').reduce((sum, curr) => sum + curr.amount, 0);

  const countPaid = useCountUp(loading ? 0 : paidSum);
  const countOutstanding = useCountUp(loading ? 0 : outstandingSum);
  const countOverdue = useCountUp(loading ? 0 : overdueSum);

  // Payout tab sums
  const totalPayoutGross = payouts.reduce((sum, p) => sum + p.gross, 0);
  const totalPayoutFee = payouts.reduce((sum, p) => sum + p.fee, 0);
  const totalPayoutNet = payouts.reduce((sum, p) => sum + p.net, 0);

  if (loading) {
    return (
      <div className="flex flex-col space-y-6 w-full max-w-[1140px] mx-auto py-7 px-8">
        <ShimmerSkeleton width="200px" height="32px" />
        <div className="grid grid-cols-3 gap-6">
          <ShimmerSkeleton height="100px" />
          <ShimmerSkeleton height="100px" />
          <ShimmerSkeleton height="100px" />
        </div>
      </div>
    );
  }

  // Sort scheduled dates ascending
  const sortedScheduled = [...scheduled].sort((a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime());

  // Group scheduled
  const groupedScheduled = {
    'This Week': sortedScheduled.filter(s => s.group === 'This Week'),
    'This Month': sortedScheduled.filter(s => s.group === 'This Month'),
    'Later': sortedScheduled.filter(s => s.group === 'Later')
  };

  return (
    <div className="w-full max-w-[1140px] mx-auto py-7 px-8 space-y-6 select-none animate-stagger-item">
      
      {/* Header */}
      <div className="flex flex-col border-b border-border pb-4">
        <h2 className="text-xl font-bold text-text-primary sora-heading leading-none">
          Payments Ledger
        </h2>
        <p className="text-xs text-text-muted mt-1.5 leading-none">
          Reconcile sponsorships invoicing, monitor active payouts processing schedules, and sync Stripe details.
        </p>
      </div>

      {/* TOP ROW: 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Paid This Month */}
        <Card variant="standard" className="flex items-center space-x-4 p-5">
          <div className="w-10 h-10 bg-[#E8F5E9] border border-[#16A34A]/25 rounded-full flex items-center justify-center text-[#16A34A] flex-shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Paid This Month</span>
            <span data-type="number" className="font-mono text-2xl font-bold text-[#16A34A] mt-1.5">
              ${countPaid.toLocaleString()}
            </span>
            <span className="text-[10px] text-text-muted mt-1 font-sans">
              â†‘ +$2,100 vs last month
            </span>
          </div>
        </Card>

        {/* Outstanding */}
        <Card variant="standard" className="flex items-center space-x-4 p-5">
          <div className="w-10 h-10 bg-surface-2 border border-border rounded-full flex items-center justify-center text-text-primary flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Outstanding Balance</span>
            <span data-type="number" className="font-mono text-2xl font-bold text-text-primary mt-1.5">
              ${countOutstanding.toLocaleString()}
            </span>
            <span className="text-[10px] text-text-muted mt-1 font-sans">
              Due within 30 days
            </span>
          </div>
        </Card>

        {/* Overdue */}
        <Card 
          variant="standard" 
          className="flex items-center space-x-4 p-5"
          style={overdueSum > 0 ? { backgroundColor: 'var(--color-danger-bg)', borderColor: 'var(--color-danger-border)' } : undefined}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            overdueSum > 0 
              ? 'bg-red-100 text-[#DC2626]' 
              : 'bg-surface-2 border border-border text-text-muted'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Overdue Balance</span>
            <span 
              data-type="number" 
              className={`font-mono text-2xl font-bold mt-1.5 ${overdueSum > 0 ? 'text-[#DC2626]' : 'text-text-muted'}`}
            >
              ${countOverdue.toLocaleString()}
            </span>
            <span className="text-[10px] text-text-muted mt-1 font-sans">
              {overdueSum > 0 ? 'Requires immediate action' : 'No overdue accounts'}
            </span>
          </div>
        </Card>
      </div>

      {/* SECOND ROW: 70% left (Revenue Chart + Tabs), 30% right (Payout sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        
        {/* LEFT COLUMN: Ledger History & AreaChart (70%) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Recharts AreaChart (Paid Revenue Over Time) */}
          <Card variant="standard" className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">6-Month Paid Revenue Curve</span>
              <TrendingUp className="w-4 h-4 text-brand" />
            </div>

            <div className="h-[200px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_REVENUE_HISTORY} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id="paidRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontFamily: 'DM Mono' }} />
                  <YAxis domain={[0, 'dataMax + 1000']} tickCount={6} tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontFamily: 'DM Mono' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}
                    labelStyle={{ fontFamily: 'DM Sans', fontWeight: 'bold', color: 'var(--color-text-primary)' }}
                    itemStyle={{ fontFamily: 'DM Mono', fontSize: 12, color: 'var(--color-brand)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-brand)" strokeWidth={2} fillOpacity={1} fill="url(#paidRevenueGrad)" name="Paid Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Interactive tabs navigation */}
          <div className="space-y-4">
            <div className="flex border-b border-border space-x-6 pb-1.5 select-none leading-none bg-surface-2/20 px-4 py-2 rounded-t-xl">
              {([
                { id: 'invoices', label: 'Invoices' },
                { id: 'payouts', label: 'Payouts ledger' },
                { id: 'scheduled', label: 'Scheduled Timeline' }
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs font-bold transition-all relative ${
                    activeTab === tab.id
                      ? 'text-brand border-b-2 border-brand font-semibold'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT AREA */}
            <div className="bg-surface border border-border rounded-b-xl overflow-hidden shadow-sm p-4">
              
              {/* TAB 1: INVOICES TAB */}
              {activeTab === 'invoices' && (
                <DataTable
                  columns={[
                    {
                      header: 'Brand Sponsor',
                      accessor: (row) => (
                        <div className="flex items-center space-x-2 truncate">
                          <img src={row.brandLogo} alt="Logo" className="w-5 h-5 rounded-full border border-border flex-shrink-0" />
                          <span className="font-bold text-text-primary truncate">{row.brandName}</span>
                        </div>
                      ),
                      flexRatio: 'flex-[2.5]'
                    },
                    {
                      header: 'Deal Title',
                      accessor: (row) => (
                        <button 
                          onClick={() => navigate(`/deals/${row.dealId}`)}
                          className="text-xs text-text-secondary hover:text-brand font-medium truncate text-left w-full hover:underline"
                        >
                          {row.dealName}
                        </button>
                      ),
                      flexRatio: 'flex-[3]'
                    },
                    {
                      header: 'Gross Amount',
                      accessor: (row) => <span data-type="number" className="font-mono font-bold">${row.amount.toLocaleString()}</span>,
                      align: 'right',
                      flexRatio: 'flex-[1.5]'
                    },
                    {
                      header: 'Due Date',
                      accessor: (row) => {
                        const isOverdue = row.status === 'overdue';
                        return (
                          <span 
                            data-type="number" 
                            className={`font-mono ${isOverdue ? 'text-[#DC2626] font-bold' : 'text-text-muted'}`}
                          >
                            {row.due_date}
                          </span>
                        );
                      },
                      flexRatio: 'flex-[2]'
                    },
                    {
                      header: 'Status',
                      accessor: (row) => <StatusBadge status={row.status} />,
                      flexRatio: 'flex-[1.5]'
                    },
                    {
                      header: 'Actions',
                      accessor: (row) => (
                        <div className="flex items-center space-x-1 justify-end opacity-80 hover:opacity-100">
                          {row.status === 'invoice_sent' && (
                            <>
                              <button 
                                onClick={() => handleSendReminder(row.id)}
                                className="p-1 hover:bg-surface-2 text-text-muted hover:text-brand rounded"
                                title="Resend reminder"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleMarkPaid(row.id)}
                                className="p-1 hover:bg-surface-2 text-text-muted hover:text-success rounded"
                                title="Mark Manual Paid"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => toast.success('Downloading invoice PDF receipt...')}
                            className="p-1 hover:bg-surface-2 text-text-muted rounded"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ),
                      flexRatio: 'flex-[2]',
                      align: 'right'
                    }
                  ]}
                  data={invoices}
                />
              )}

              {/* TAB 2: PAYOUTS TAB */}
              {activeTab === 'payouts' && (
                <div className="space-y-4">
                  <DataTable
                    columns={[
                      {
                        header: 'Payout Date',
                        accessor: (row) => <span data-type="number" className="font-mono text-text-muted">{row.date}</span>,
                        flexRatio: 'flex-[2]'
                      },
                      {
                        header: 'Sponsorship Deal Title',
                        accessor: (row) => (
                          <button 
                            onClick={() => navigate(`/deals/${row.dealId}`)}
                            className="text-xs text-text-secondary hover:text-brand font-medium truncate text-left hover:underline"
                          >
                            {row.dealName}
                          </button>
                        ),
                        flexRatio: 'flex-[4.5]'
                      },
                      {
                        header: 'Gross Payout',
                        accessor: (row) => <span data-type="number" className="font-mono font-medium">${row.gross.toLocaleString()}</span>,
                        align: 'right',
                        flexRatio: 'flex-[2]'
                      },
                      {
                        header: 'Platform Fee (2.5%)',
                        accessor: (row) => <span data-type="number" className="font-mono text-[#DC2626] font-medium">-${row.fee.toLocaleString()}</span>,
                        align: 'right',
                        flexRatio: 'flex-[2.5]'
                      },
                      {
                        header: 'Net Payout',
                        accessor: (row) => <span data-type="number" className="font-mono font-bold text-[#16A34A]">${row.net.toLocaleString()}</span>,
                        align: 'right',
                        flexRatio: 'flex-[2]'
                      },
                      {
                        header: 'Stripe Status',
                        accessor: (row) => (
                          <span className="px-2 py-0.5 rounded font-sans font-bold text-[9px] uppercase bg-[#E8F5E9] text-[#16A34A] border border-[#16A34A]/10">
                            {row.stripeStatus}
                          </span>
                        ),
                        flexRatio: 'flex-[1.5]'
                      }
                    ]}
                    data={payouts}
                  />

                  {/* Totals Summary Row */}
                  <div className="flex justify-between items-center bg-surface-2/45 p-4 border border-border rounded-xl mt-3 font-sans font-semibold text-xs leading-none">
                    <span className="font-semibold text-text-secondary uppercase">Cumulative Totals Ledger</span>
                    <div className="flex space-x-6">
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-text-muted uppercase">Gross</span>
                        <span data-type="number" className="font-mono font-semibold text-text-primary mt-1">${totalPayoutGross.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-text-muted uppercase">Fees</span>
                        <span data-type="number" className="font-mono text-[#DC2626] font-semibold mt-1">-${totalPayoutFee.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-text-muted uppercase">Net Receipts</span>
                        <span data-type="number" className="font-mono text-[#16A34A] font-bold mt-1">${totalPayoutNet.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SCHEDULED TAB */}
              {activeTab === 'scheduled' && (
                <div className="space-y-6 p-2 select-none">
                  {([
                    { id: 'This Week', label: 'Expected This Week' },
                    { id: 'This Month', label: 'Expected This Month' },
                    { id: 'Later', label: 'Expected Later' }
                  ] as const).map(group => {
                    const groupRows = groupedScheduled[group.id];
                    if (groupRows.length === 0) return null;
                    return (
                      <div key={group.id} className="space-y-3">
                        <h4 className="font-sans font-semibold text-[10px] text-text-muted uppercase tracking-[0.06em]">
                          {group.label}
                        </h4>
                        
                        <div className="divide-y divide-border border border-border rounded-xl bg-surface shadow-sm overflow-hidden">
                          {groupRows.map(row => (
                            <div key={row.id} className="flex items-center justify-between p-3.5 text-xs leading-none hover:bg-surface-2/10 transition-colors">
                              <div className="flex flex-col leading-tight min-w-0">
                                <span className="font-bold text-text-primary truncate">{row.dealName}</span>
                                <span className="text-[10px] text-text-muted mt-1 font-medium">{row.brandName}</span>
                              </div>

                              <div className="flex items-center space-x-6 flex-shrink-0">
                                <span data-type="number" className="font-mono text-text-secondary">{row.expectedDate}</span>
                                <span data-type="number" className="font-mono font-bold text-text-primary w-14 text-right">${row.amount.toLocaleString()}</span>
                                <span className={`px-2 py-0.5 rounded font-sans font-bold text-[9px] uppercase ${
                                  row.status === 'invoice_sent' 
                                    ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/10' 
                                    : 'bg-surface-2 text-text-muted border border-border'
                                }`}>
                                  {row.status === 'invoice_sent' ? 'Invoice Sent' : 'Not Invoiced'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Payout Setup Card (30%) */}
        <div className="lg:col-span-4 space-y-4">
          
          <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider select-none leading-none border-b border-border pb-3">
            Payout Account Settings
          </h3>

          <Card variant="standard" className="p-5 space-y-4 flex flex-col justify-between select-none">
            
            {/* Stripe Connected state display */}
            <div className="space-y-3 pb-4 border-b border-border/60">
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center text-brand flex-shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-bold text-text-primary">Stripe Connected Payouts</span>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 uppercase">Active & Online</span>
                </div>
              </div>

              <div className="bg-surface-2 p-3 border border-border rounded-lg text-xs leading-normal">
                <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider">Connected Account ID</span>
                <span data-type="number" className="font-mono font-semibold text-text-primary mt-1 block">acct_1NmockStripe123</span>
              </div>
            </div>

            {/* Last Payout aggregated data */}
            <div className="space-y-1.5 select-none">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Last Dispersed Payout</span>
              <div className="flex items-baseline justify-between pt-1">
                <span data-type="number" className="font-mono text-lg font-bold text-text-primary leading-none">$7,312.50</span>
                <span data-type="number" className="font-mono text-[10px] text-text-muted">May 02, 2026</span>
              </div>
            </div>

            {/* Redirection Link */}
            <div className="pt-2">
              <button 
                onClick={() => navigate('/settings/billing')}
                className="w-full h-9 bg-surface border border-border hover:border-brand hover:bg-brand-light rounded-lg text-xs font-bold text-text-primary hover:text-brand transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Manage Payout Settings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
};

export default Payments;

