import { useSubscription } from './useSubscription';

export type GatedFeature = 'rate_benchmarking' | 'contracts_esign' | 'team_VA_seat' | 'billing_reminders' | 'public_api' | 'custom_subdomain';

export const usePlanGate = (feature: GatedFeature) => {
  const { isProOrAbove, isBusinessOrAbove } = useSubscription();

  const getGateDetails = () => {
    switch (feature) {
      case 'rate_benchmarking':
        return {
          allowed: isProOrAbove,
          requiredPlan: 'Creator Pro'
        };
      case 'contracts_esign':
        return {
          allowed: isProOrAbove,
          requiredPlan: 'Creator Pro'
        };
      case 'billing_reminders':
        return {
          allowed: isProOrAbove,
          requiredPlan: 'Creator Pro'
        };
      case 'team_VA_seat':
        return {
          allowed: isBusinessOrAbove,
          requiredPlan: 'Creator Business'
        };
      case 'public_api':
        return {
          allowed: isBusinessOrAbove,
          requiredPlan: 'Creator Business'
        };
      case 'custom_subdomain':
        return {
          allowed: isBusinessOrAbove,
          requiredPlan: 'Creator Business'
        };
      default:
        return { allowed: true, requiredPlan: 'Free' };
    }
  };

  const gate = getGateDetails();

  return {
    allowed: gate.allowed,
    upgradeRequired: !gate.allowed,
    requiredPlan: gate.requiredPlan
  };
};
export default usePlanGate;
