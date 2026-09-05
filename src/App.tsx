import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { WifiOff, ChevronRight } from 'lucide-react';

import { 
  Sidebar,
  ErrorBoundary
} from './components';
import { Dashboard } from './pages/Dashboard';
import { Deals } from './pages/Deals';
import { DealRoom } from './pages/DealRoom';
import { Payments } from './pages/Payments';
import { Profile } from './pages/Profile';
import { Inbox } from './pages/Inbox';
import { BrandDashboard } from './pages/BrandDashboard';
import { Contracts } from './pages/Contracts';
import { TeamManagement } from './pages/TeamManagement';
import { CampaignBriefs } from './pages/CampaignBriefs';
import { Settings } from './pages/Settings';
import { Calendar } from './pages/Calendar';
import { InviteAcceptance } from './pages/InviteAcceptance';
import { CreatorMarketplace } from './pages/CreatorMarketplace';
import { ContentLibrary } from './pages/ContentLibrary';
import { IntegrationHub } from './pages/IntegrationHub';
import { ExploreBrands } from './pages/ExploreBrands';
import { IncomingOffers } from './pages/IncomingOffers';

const queryClient = new QueryClient();

// Dynamic Breadcrumb Header per Section 4.4 / 8.0
const BreadcrumbHeader: React.FC = () => {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(x => x);
    if (paths.length === 0) {
      return [{ label: 'Dashboard', path: '/' }];
    }
    
    return paths.map((path, idx) => {
      const routePath = `/${paths.slice(0, idx + 1).join('/')}`;
      
      // Capitalize label nicely
      let label = path.replace(/[-_]/g, ' ');
      if (label.startsWith('deal_')) {
        label = 'Deal Room';
      } else {
        label = label.charAt(0).toUpperCase() + label.slice(1);
      }
      
      return { label, path: routePath };
    });
  };

  const breadcrumbs = getBreadcrumbs();
  const teamRole = localStorage.getItem('dealhive_team_role');
  const role = localStorage.getItem('dealhive_auth_role') || 'creator';
  const accountOwner = role === 'creator' ? 'Sarah Jenkins' : 'Samsung';

  return (
    <div className="h-12 px-8 bg-sidebar-bg border-b border-border flex items-center justify-between text-xs font-semibold select-none flex-shrink-0">
      <div className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-text-faint" />}
            <Link 
              to={crumb.path}
              className={idx === breadcrumbs.length - 1 ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary transition-colors'}
            >
              {crumb.label}
            </Link>
          </React.Fragment>
        ))}
      </div>

      {teamRole && (
        <div className="text-xs font-bold text-text-muted flex items-center space-x-2 select-none">
          <span className="dm-sans">{accountOwner}'s DealHive</span>
          <span className="px-2 py-0.5 bg-brand-light border border-brand/20 text-brand rounded text-[10px] font-bold uppercase tracking-wider">
            You are: {teamRole}
          </span>
        </div>
      )}
    </div>
  );
};

// Global Layout wrapper
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isDealRoom = location.pathname.includes('/deals/deal_');

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-bg">
      {/* Network offline alert banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 h-9 bg-danger text-white flex items-center justify-center space-x-2 text-xs font-bold z-50 animate-pulse">
          <WifiOff className="w-4 h-4" />
          <span>You're offline â€” changes will sync when reconnected</span>
        </div>
      )}

      {/* Main Layout Sidebar */}
      <Sidebar />

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Render breadcrumbs (omit on full-bleed Deal Room pages!) */}
        {!isDealRoom && <BreadcrumbHeader />}
        
        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppLayout>
          <ErrorBoundary>
            <Routes>
              {/* Creator routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/deals/:id" element={<DealRoom />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/creator/content-library" element={<ContentLibrary />} />
              <Route path="/creator/explore" element={<ExploreBrands />} />
              <Route path="/invite/:token" element={<InviteAcceptance />} />
              
              {/* Brand routes */}
              <Route path="/brand/dashboard" element={<BrandDashboard />} />
              <Route path="/brand/directory" element={<CreatorMarketplace />} />
              <Route path="/brand/marketplace" element={<CreatorMarketplace />} />
              <Route path="/brand/content-library" element={<ContentLibrary />} />
              <Route path="/brand/team" element={<TeamManagement />} />
              <Route path="/brand/briefs" element={<CampaignBriefs />} />
              <Route path="/brand/settings" element={<Settings />} />
              <Route path="/brand/integrations" element={<IntegrationHub />} />
              <Route path="/brand/offers" element={<IncomingOffers />} />
            </Routes>
          </ErrorBoundary>
        </AppLayout>
      </Router>
      
      {/* Toast notifications */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          success: {
            duration: 3000,
            style: {
              background: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              border: '1px solid var(--color-success-border)',
              fontSize: '13px',
              fontWeight: '600'
            }
          },
          error: {
            duration: 5000,
            style: {
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              border: '1px solid var(--color-danger-border)',
              fontSize: '13px',
              fontWeight: '600'
            }
          }
        }}
      />
    </QueryClientProvider>
  );
};
export default App;

