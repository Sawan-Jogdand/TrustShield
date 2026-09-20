import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import MediaAnalysis from './pages/MediaAnalysis';
import TextScanner from './pages/TextScanner';
import ReportPage from './pages/ReportPage';
import AuditLogs from './pages/AuditLogs';

export default function App() {
  const [activeTab, setActiveTab] = useState('media'); // Default to Media Analysis
  const [currentReport, setCurrentReport] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigateToReport = (reportData) => {
    if (reportData) {
      setCurrentReport(reportData);
    }
    setActiveTab('reports');
  };

  const handleSetCurrentReport = (reportData) => {
    setCurrentReport(reportData);
  };

  return (
    <div className="min-h-screen flex bg-[#F4F7FB] font-sans antialiased text-slate-800 overflow-x-hidden">
      {/* Responsive Left Navigation Sidebar & Mobile Drawer */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <Header 
          activeTab={activeTab} 
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 pb-16">
          {activeTab === 'dashboard' && (
            <Dashboard 
              setActiveTab={setActiveTab}
              onNavigateToReport={handleNavigateToReport}
              onSetCurrentReport={handleSetCurrentReport}
            />
          )}

          {activeTab === 'media' && (
            <MediaAnalysis 
              onNavigateToReport={handleNavigateToReport}
              onSetCurrentReport={handleSetCurrentReport}
            />
          )}

          {activeTab === 'text' && (
            <TextScanner 
              onNavigateToReport={handleNavigateToReport}
              onSetCurrentReport={handleSetCurrentReport}
            />
          )}

          {activeTab === 'reports' && (
            <ReportPage 
              currentReport={currentReport}
              onBackToScan={() => setActiveTab('media')}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogs 
              onNavigateToReport={handleNavigateToReport}
              onSetCurrentReport={handleSetCurrentReport}
            />
          )}
        </main>
      </div>
    </div>
  );
}
