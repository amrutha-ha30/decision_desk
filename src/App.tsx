import { useState, useEffect } from 'react';
import { FinancialProvider } from '@/context/FinancialContext';
import { Navbar, type PageId } from '@/components/Navbar';
import { LandingPage } from '@/pages/LandingPage';
import { AssessmentPage } from '@/pages/AssessmentPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AffordabilityPage } from '@/pages/AffordabilityPage';
import { ComparisonPage } from '@/pages/ComparisonPage';
import { EmergencyPage } from '@/pages/EmergencyPage';
import { SimulatorPage } from '@/pages/SimulatorPage';
import { HiddenCostPage } from '@/pages/HiddenCostPage';
import { ExplainPage } from '@/pages/ExplainPage';
import { FinalPage } from '@/pages/FinalPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { AwarenessPage } from '@/pages/AwarenessPage';

function App() {
  const [page, setPage] = useState<PageId>('landing');

  const handleNavigate = (p: PageId) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const renderPage = () => {
    switch (page) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'assessment':
        return <AssessmentPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'affordability':
        return <AffordabilityPage onNavigate={handleNavigate} />;
      case 'comparison':
        return <ComparisonPage onNavigate={handleNavigate} />;
      case 'emergency':
        return <EmergencyPage onNavigate={handleNavigate} />;
      case 'simulator':
        return <SimulatorPage onNavigate={handleNavigate} />;
      case 'hidden-cost':
        return <HiddenCostPage onNavigate={handleNavigate} />;
      case 'explain':
        return <ExplainPage onNavigate={handleNavigate} />;
      case 'final':
        return <FinalPage onNavigate={handleNavigate} />;
      case 'history':
        return <HistoryPage onNavigate={handleNavigate} />;
      case 'awareness':
        return <AwarenessPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <FinancialProvider>
      <div className="min-h-screen bg-slate-950">
        <Navbar current={page} onNavigate={handleNavigate} />
        <main>{renderPage()}</main>
      </div>
    </FinancialProvider>
  );
}

export default App;
