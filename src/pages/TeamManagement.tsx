import React, { useState } from 'react';
import { Shield, DollarSign, Activity, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, InputField } from '../components';
import { useCountUp } from '../hooks/useCountUp';

interface TeamMember {
  name: string;
  role: string;
  email: string;
  avatar: string;
  access: 'Admin' | 'Editor' | 'Billing';
}

const INITIAL_TEAM: TeamMember[] = [
  {
    name: 'Sarah Jenkins',
    role: 'PR & Sponsorship Director',
    email: 'sarah.j@samsung.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
    access: 'Admin'
  },
  {
    name: 'Michael Chang',
    role: 'Senior PR Coordinator',
    email: 'm.chang@samsung.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
    access: 'Editor'
  },
  {
    name: 'Jessica Miller',
    role: 'Budget Compliance Officer',
    email: 'j.miller@samsung.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80',
    access: 'Billing'
  }
];

const AUDIT_LOGS = [
  { time: '2h ago', action: 'Sarah Jenkins approved "Galaxy S26 Launch Integration" draft script' },
  { time: '4h ago', action: 'Jessica Miller authorized payment invoice inv_1 ($7,500) for NordVPN campaign' },
  { time: 'Yesterday', action: 'Michael Chang dispatched direct sponsorship brief to Alex Hormozi' },
  { time: '2 days ago', action: 'System auto-provisioned standard terms contract for Samsung Galaxy S26 Ultra' }
];

export const TeamManagement: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [monthlyCap, setMonthlyCap] = useState(150000);
  const [dealLimit, setDealLimit] = useState(25000);
  
  // Add Member Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Campaign Coordinator');
  const [newAccess, setNewAccess] = useState<'Admin' | 'Editor' | 'Billing'>('Editor');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      toast.error('Please fill in all required fields.');
      return;
    }
    const newMember: TeamMember = {
      name: newName,
      role: newRole,
      email: newEmail,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
      access: newAccess
    };
    setTeam([...team, newMember]);
    toast.success(`${newName} added to the campaign team workspace!`);
    setIsModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewRole('Campaign Coordinator');
    setNewAccess('Editor');
  };

  const animatedMonthlyCap = useCountUp(monthlyCap);
  const animatedDealLimit = useCountUp(dealLimit);

  return (
    <div className="w-full max-w-[1140px] mx-auto py-7 px-8 space-y-6 select-none animate-stagger-item">
      <div className="flex items-center justify-between">
        <div className="flex flex-col select-none">
          <h2 className="text-xl font-bold text-text-primary sora-heading leading-none">Enterprise Workspace Controls</h2>
          <p className="text-xs text-text-muted mt-1.5 leading-none">
            Delegate workspace privileges, adjust department campaign budget caps, and review audit logs.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Manager
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left side: Roster and caps */}
        <div className="lg:col-span-8 space-y-6">
          {/* Team Roster */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Workspace Team Roster</h3>
            <div className="divide-y divide-border border border-border rounded-xl bg-surface overflow-hidden shadow-sm">
              {team.map((member, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 hover:bg-surface-2/10 transition-colors">
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border border-border"
                    />
                    <div className="flex flex-col min-w-0 leading-tight">
                      <span className="text-xs font-bold text-text-primary leading-tight truncate">{member.name}</span>
                      <span className="text-[10px] text-text-secondary mt-1">
                        {member.role} · <span className="font-semibold text-text-primary">{member.email}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-sm border ${
                        member.access === 'Admin'
                          ? 'bg-brand/5 border-brand/20 text-brand'
                          : member.access === 'Billing'
                          ? 'bg-amber-500/5 border-amber-500/20 text-amber-500'
                          : 'bg-text-secondary/5 border-border text-text-secondary'
                      }`}
                    >
                      {member.access}
                    </span>
                    <button
                      onClick={() => {
                        setTeam(team.filter(m => m.email !== member.email));
                        toast.success('Manager seats updated.');
                      }}
                      className="text-[10px] font-bold text-red-500 hover:text-red-700 leading-none"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spend Caps */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Campaign Spent Thresholds</h3>
            <Card variant="standard" className="p-5 space-y-5 bg-gradient-to-r from-surface to-brand-light/5 border border-border">
              {/* Monthly Cap */}
              <div className="space-y-2 select-none">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-text-secondary flex items-center space-x-1.5">
                    <DollarSign className="w-4 h-4 text-brand" />
                    <span>Monthly Department Cap Limit</span>
                  </span>
                  <span data-type="number" className="font-mono font-bold text-brand">
                    ${animatedMonthlyCap.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="500000"
                  step="10000"
                  value={monthlyCap}
                  onChange={e => setMonthlyCap(Number(e.target.value))}
                  className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-brand"
                />
              </div>

              {/* Single Deal Cap */}
              <div className="space-y-2 select-none">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-text-secondary flex items-center space-x-1.5">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span>Single Deal Authorization Threshold</span>
                  </span>
                  <span data-type="number" className="font-mono font-bold text-emerald-600">
                    ${animatedDealLimit.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="5000"
                  value={dealLimit}
                  onChange={e => setDealLimit(Number(e.target.value))}
                  className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Right side: Action logs */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Workspace Action Logs</h3>
          <Card variant="standard" className="p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-border/60 pb-2">
              <Activity className="w-4 h-4 text-brand" />
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide">Live Audit Trails</span>
            </div>
            <div className="space-y-3.5 pt-1">
              {AUDIT_LOGS.map((log, idx) => (
                <div key={idx} className="flex flex-col leading-tight select-none border-b border-border/40 last:border-0 pb-3 last:pb-0">
                  <span data-type="number" className="font-mono text-[9px] text-text-faint">{log.time}</span>
                  <span className="text-[11px] text-text-secondary mt-1.5 font-medium leading-relaxed">{log.action}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Manager Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card
            variant="standard"
            className="w-full max-w-[400px] border border-border p-6 shadow-2xl bg-surface"
          >
            <form onSubmit={handleAddMember} className="space-y-4">
              <h3 className="text-sm font-bold text-text-primary sora-heading border-b border-border pb-2.5">
                Add New Campaign Coordinator
              </h3>
              
              <InputField
                label="Manager Full Name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Alex Henderson"
                required
              />

              <InputField
                label="Professional Email"
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="e.g. a.henderson@samsung.com"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Access Role</label>
                  <select
                    value={newAccess}
                    onChange={e => setNewAccess(e.target.value as any)}
                    className="h-10 px-2 border border-border bg-surface text-xs rounded-md outline-none text-text-primary font-semibold"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Billing">Billing</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Job Title</label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="h-10 px-2 border border-border bg-surface text-xs rounded-md outline-none text-text-primary font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-border mt-2">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Provision Privileges
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};