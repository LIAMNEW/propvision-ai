import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './Layout';
import Discover from './pages/Discover';
import SuburbIntelligence from './pages/SuburbIntelligence';
import Portfolio from './pages/Portfolio';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import PropertyDetail from './pages/PropertyDetail';
import Onboarding from './pages/Onboarding';

const LayoutWrapper = ({ children, currentPageName }) => 
  <Layout currentPageName={currentPageName}>{children}</Layout>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Discover" replace />} />
      <Route path="/Onboarding" element={<Onboarding />} />
      <Route path="/Discover" element={<LayoutWrapper currentPageName="Discover"><Discover /></LayoutWrapper>} />
      <Route path="/SuburbIntelligence" element={<LayoutWrapper currentPageName="SuburbIntelligence"><SuburbIntelligence /></LayoutWrapper>} />
      <Route path="/Portfolio" element={<LayoutWrapper currentPageName="Portfolio"><Portfolio /></LayoutWrapper>} />
      <Route path="/Alerts" element={<LayoutWrapper currentPageName="Alerts"><Alerts /></LayoutWrapper>} />
      <Route path="/Settings" element={<LayoutWrapper currentPageName="Settings"><Settings /></LayoutWrapper>} />
      <Route path="/PropertyDetail/:id" element={<LayoutWrapper currentPageName="PropertyDetail"><PropertyDetail /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App