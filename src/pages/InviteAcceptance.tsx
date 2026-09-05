import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { convexClient as supabaseClient } from '../services/convex';
import { Card, Button, InputField } from '../components';

export const InviteAcceptance: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<any | null>(null);
  
  // Registration form
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) return;
      try {
        const data = await supabaseClient.teams.validateInviteToken(token);
        setInvite(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!fullName) {
      toast.error('Please enter your full name.');
      return;
    }
    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      const loader = toast.loading('Accepting invite & provisioning member workspace...');
      await supabaseClient.teams.acceptInvite(token, fullName, password);
      toast.dismiss(loader);
      toast.success(`Welcome to DealHive, ${fullName}! Your role permissions are active.`);
      
      // Navigate based on account type
      if (invite.account_type === 'creator') {
        navigate('/');
      } else {
        navigate('/brand/dashboard');
      }
      
      // Trigger full layout re-sync
      window.dispatchEvent(new Event('auth-change'));
    } catch (err) {
      toast.error('Could not accept invitation.');
    }
  };

  const getRolePermissionsDescription = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'manager':
        return [
          'View all deals and deal rooms',
          'Send messages and upload deliverable drafts',
          'Accept, decline, and counter brand pitches',
          'Generate and send invoicing/payments requests',
          'Access and review contractual agreements'
        ];
      case 'va':
        return [
          'View active deals and deal rooms',
          'Send messages and upload deliverable drafts',
          'Read incoming pitches (read-only)',
          'Read payments ledger (read-only)',
          'No permissions to accept deals, edit terms, sign contracts, or manage team'
        ];
      case 'accountant':
        return [
          'View invoices and payouts history',
          'Download invoice PDFs',
          'Export payment spreadsheets reports (CSV)',
          'No access to messages, contracts, profile tags, or rate cards'
        ];
      case 'campaign_manager':
        return [
          'Create and manage advertising campaigns',
          'Access assigned creator Deal Rooms',
          'Approve/request revisions on deliverable drafts',
          'Send outbound pitch sponsorships to creators'
        ];
      case 'finance':
        return [
          'Read-only access to all campaign metrics',
          'Approve payment releases triggers',
          'Download invoices and finance spreadsheets',
          'No messaging or creator negotiation access'
        ];
      default:
        return ['Read-only view access to explicitly shared workspaces'];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6 select-none">
        <Card variant="standard" className="w-[420px] p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-brand border-t-transparent animate-spin mx-auto" />
          <span className="text-xs font-bold text-text-secondary">Validating Invitation Credentials...</span>
        </Card>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6 select-none">
        <Card variant="standard" className="w-[420px] p-8 text-center space-y-5">
          <AlertTriangle className="w-12 h-12 text-danger mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-text-primary sora-heading">Invitation Link Invalid</h3>
            <p className="text-xs text-text-muted">
              This invitation token has expired, already been claimed, or does not exist. Please contact your account administrator to receive a new link.
            </p>
          </div>
          <Button variant="primary" className="w-full" onClick={() => navigate('/')}>
            Back to home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 select-none">
      <div className="w-[520px] space-y-6">
        
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2.5">
          <div className="w-[26px] h-[26px] bg-brand flex items-center justify-center flex-shrink-0" 
               style={{ clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)' }}>
            <div className="w-[16px] h-[16px] bg-bg" 
                 style={{ clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)' }} />
          </div>
          <span className="text-lg font-bold text-text-primary sora-heading tracking-tight">
            DealHive Teams Connect
          </span>
        </div>

        <Card variant="standard" className="p-8 space-y-6 border border-border shadow-xl">
          
          {/* Header info */}
          <div className="text-center space-y-2 border-b border-border pb-5 select-none">
            <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand mx-auto">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-text-primary sora-heading mt-2">
              Workspace Invitation
            </h3>
            <p className="text-xs text-text-muted max-w-[340px] mx-auto leading-relaxed">
              You have been invited to help manage the DealHive account for{' '}
              <span className="font-bold text-text-primary">{invite.email}</span>.
            </p>
          </div>

          {/* Role details box */}
          <div className="p-4 bg-brand-light/35 border border-brand-dark/10 rounded-2xl space-y-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-brand" />
              <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
                Role Assignment: {invite.role.toUpperCase()}
              </span>
            </div>
            <ul className="space-y-1.5 pt-1 pl-1">
              {getRolePermissionsDescription(invite.role).map((perm, idx) => (
                <li key={idx} className="text-[11px] text-text-secondary flex items-start space-x-2">
                  <span className="text-brand font-bold mt-0.5">â€¢</span>
                  <span>{perm}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Form */}
          <form onSubmit={handleAccept} className="space-y-4">
            <InputField
              label="Your Full Display Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jessica Thompson"
              required
            />

            <InputField
              label="Choose secure password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              required
            />

            <InputField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              required
            />

            <Button variant="primary" type="submit" className="w-full h-10 mt-3 flex items-center justify-center font-bold text-xs uppercase tracking-wider">
              Create Account & Accept
            </Button>
          </form>

        </Card>
      </div>
    </div>
  );
};
export default InviteAcceptance;

