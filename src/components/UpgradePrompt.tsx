import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { useSubscription } from '../hooks/useSubscription';
import toast from 'react-hot-toast';

export interface UpgradePromptProps {
  featureName: string;
  requiredPlan?: 'pro' | 'business';
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  featureName,
  requiredPlan = 'pro'
}) => {
  const { upgrade, loading } = useSubscription();

  const handleUpgrade = async () => {
    await upgrade(requiredPlan);
    toast.success(`Successfully upgraded to Creator ${requiredPlan.toUpperCase()}!`);
  };

  const planPrice = requiredPlan === 'pro' ? '$29/month' : '$79/month';

  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl bg-surface-2/20 text-center select-none max-w-md mx-auto my-6 transition-all">
      <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand mb-4">
        <Lock className="w-5 h-5" />
      </div>
      
      <h3 className="text-sm font-bold text-text-primary sora-heading uppercase tracking-wider mb-2">
        {featureName} Locked
      </h3>
      
      <p className="text-xs text-text-muted leading-relaxed mb-6 max-w-[280px]">
        This professional tool is reserved for members of the <span className="font-semibold text-brand">Creator {requiredPlan.toUpperCase()}</span> tier.
      </p>

      <Button
        variant="primary"
        onClick={handleUpgrade}
        loading={loading}
        icon={<Sparkles className="w-4 h-4" />}
      >
        Upgrade â€” {planPrice}
      </Button>
    </div>
  );
};
export default UpgradePrompt;

