export type CreatorRole = 'owner' | 'manager' | 'va' | 'accountant';
export type BrandRole = 'admin' | 'campaign_manager' | 'finance' | 'viewer';
export type UserRoleType = CreatorRole | BrandRole;

export type CreatorAction =
  | 'view_deal_room'
  | 'send_messages'
  | 'manage_pitches' // Accept, decline, counter
  | 'edit_term_sheet'
  | 'upload_deliverables'
  | 'manage_contracts' // Generate, sign contracts
  | 'manage_invoices' // Generate, send invoices
  | 'view_payments' // View payments, payout history
  | 'edit_payout_settings' // Change payout bank account
  | 'manage_billing' // Change subscription/billing
  | 'manage_team' // Invite, edit, remove team members
  | 'delete_account';

export type BrandAction =
  | 'create_campaign'
  | 'manage_campaigns'
  | 'view_campaigns'
  | 'view_deal_room'
  | 'send_messages'
  | 'approve_deliverables'
  | 'send_pitches'
  | 'access_billing'
  | 'approve_payments'
  | 'manage_team';

export function canDoCreator(role: CreatorRole, action: CreatorAction): boolean {
  if (role === 'owner') return true;

  switch (action) {
    case 'view_deal_room':
    case 'send_messages':
    case 'upload_deliverables':
      return role === 'manager' || role === 'va';
      
    case 'manage_pitches':
    case 'edit_term_sheet':
    case 'manage_contracts':
    case 'manage_invoices':
      return role === 'manager';
      
    case 'view_payments':
      return role === 'manager' || role === 'va' || role === 'accountant';
      
    case 'edit_payout_settings':
    case 'manage_billing':
    case 'manage_team':
    case 'delete_account':
      return false; // Only owner can do these

    default:
      return false;
  }
}

export function canDoBrand(role: BrandRole, action: BrandAction, isAssigned = true): boolean {
  if (role === 'admin') return true;

  switch (action) {
    case 'create_campaign':
      return role === 'campaign_manager';
      
    case 'manage_campaigns':
      return role === 'campaign_manager' && isAssigned;
      
    case 'view_campaigns':
      if (role === 'campaign_manager') return isAssigned;
      if (role === 'finance') return true; // read-only all
      if (role === 'viewer') return isAssigned;
      return false;

    case 'view_deal_room':
      if (role === 'campaign_manager') return isAssigned;
      if (role === 'finance') return false;
      if (role === 'viewer') return isAssigned;
      return false;
      
    case 'send_messages':
    case 'approve_deliverables':
    case 'send_pitches':
      return role === 'campaign_manager' && isAssigned;
      
    case 'access_billing':
    case 'approve_payments':
      return role === 'finance';
      
    case 'manage_team':
      return false; // Only admin can manage team

    default:
      return false;
  }
}

export function canDo(role: UserRoleType, action: string, context?: any): boolean {
  // Check if role is creator role
  const creatorRoles: CreatorRole[] = ['owner', 'manager', 'va', 'accountant'];
  if (creatorRoles.includes(role as CreatorRole)) {
    return canDoCreator(role as CreatorRole, action as CreatorAction);
  } else {
    const isAssigned = context?.isAssigned ?? true;
    return canDoBrand(role as BrandRole, action as BrandAction, isAssigned);
  }
}
