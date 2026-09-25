import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import DocumentAnalyzer from "./pages/DocumentAnalyzer";
import TemplateGenerator from "./pages/TemplateGenerator";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import GovSchemes from "./pages/GovSchemes";
import EmergencyAssistance from "./pages/EmergencyAssistance";
import Awareness from "./pages/Awareness";
import FloatingChatbot from "./components/FloatingChatbot";
import { useAuth } from "./context/AuthContext";
import { SavedAnalysis, SavedContract } from "./services/firebase";

export default function App() {
  const { user, userProfile, loading } = useAuth();
  const [activePage, setActivePage] = useState<string>("home");
  
  // Sidebar state: collapsed on desktop, toggled drawer on mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  
  // View mode state: "both" (Bilingual EN+HI) | "en" (English) | "hi" (Hindi)
  const [viewMode, setViewMode] = useState<"both" | "en" | "hi">("both");
  
  // Presets shared across Analyzer <-> Generator
  const [preSelectedDocType, setPreSelectedDocType] = useState<string>("");
  
  // Shared text passage to analyzer for "Self Analysis" loop
  const [analyzerInitialTextShare, setAnalyzerInitialTextShare] = useState<string>("");

  // Saved records selected for loaded review context
  const [loadedAnalysis, setLoadedAnalysis] = useState<SavedAnalysis | null>(null);
  const [loadedContract, setLoadedContract] = useState<SavedContract | null>(null);

  const handleLoadSavedAnalysis = (analysis: SavedAnalysis) => {
    setLoadedAnalysis(analysis);
    setActivePage("analyzer");
  };

  const handleClearSavedAnalysis = () => {
    setLoadedAnalysis(null);
  };

  const handleLoadSavedContract = (contract: SavedContract) => {
    setLoadedContract(contract);
    setActivePage("generator");
  };

  const handleClearSavedContract = () => {
    setLoadedContract(null);
  };

  const renderActiveView = () => {
    // Auth Guard: if not authenticated, restrict access to features, default back to home landing page
    const allowedPages = user ? ["home", "analyzer", "generator", "awareness", "locker", "profile", "schemes", "emergency", "about"] : ["home", "about"];
    const targetPage = allowedPages.includes(activePage) ? activePage : "home";

    switch (targetPage) {
      case "home":
        return (
          <Home
            setActivePage={setActivePage}
            viewMode={viewMode}
            setDocTypePreSelect={setPreSelectedDocType}
          />
        );
      case "analyzer":
        return (
          <DocumentAnalyzer
            viewMode={viewMode}
            setActivePage={setActivePage}
            setDocTypePreSelect={setPreSelectedDocType}
            preSelectedDocType={preSelectedDocType}
            loadedAnalysis={loadedAnalysis}
            onClearLoadedAnalysis={handleClearSavedAnalysis}
          />
        );
      case "generator":
        return (
          <TemplateGenerator
            viewMode={viewMode}
            setActivePage={setActivePage}
            preSelectedType={preSelectedDocType}
            setPreSelectedType={setPreSelectedDocType}
            setAnalyzerInitialTextShare={setAnalyzerInitialTextShare}
            loadedContract={loadedContract}
            onClearLoadedContract={handleClearSavedContract}
          />
        );
      case "locker":
        return (
          <Dashboard
            viewMode={viewMode}
            setActivePage={setActivePage}
            onLoadSavedAnalysis={handleLoadSavedAnalysis}
            onLoadSavedContract={handleLoadSavedContract}
            forcedTab="vault"
          />
        );
      case "profile":
        return (
          <Dashboard
            viewMode={viewMode}
            setActivePage={setActivePage}
            onLoadSavedAnalysis={handleLoadSavedAnalysis}
            onLoadSavedContract={handleLoadSavedContract}
            forcedTab="profile"
          />
        );
      case "schemes":
        return <GovSchemes />;
      case "awareness":
        return <Awareness />;
      case "emergency":
        return <EmergencyAssistance />;
      case "about":
        return <About />;
      default:
        return (
          <Home
            setActivePage={setActivePage}
            viewMode={viewMode}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg text-text flex flex-col items-center justify-center p-8">
        <div className="p-4 bg-surface border border-gold/30 rounded-full shadow-[0_0_20px_rgba(212,160,23,0.15)] mb-4 animate-pulse">
          <svg className="w-8 h-8 text-gold animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <p className="font-serif font-bold text-navy text-sm">Authenticating Access Credentials...</p>
        <p className="text-gold italic font-medium mt-1 text-[10px]">सुरक्षित कनेक्शन सत्यापित किया जा रहा है</p>
      </div>
    );
  }

  // Intercept user authenticated but not yet onboarded
  if (user && userProfile && !userProfile.onboarded) {
    return <Onboarding onComplete={() => setActivePage("home")} />;
  }

  return (
    <div className={`min-h-screen bg-light-bg text-text flex flex-col justify-between font-sans selection:bg-gold/30 selection:text-gold ${
      viewMode === "en" ? "theme-focus-en" : viewMode === "hi" ? "theme-focus-hi" : "theme-focus-both"
    }`}>
      
      {/* Sticky top bar navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        viewMode={viewMode}
        setViewMode={setViewMode}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />

      {/* Main flex container housing Sidebar and Page Content View */}
      <div className="flex flex-1 relative min-h-0">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        {/* Unified Main Content Viewholder & Footer component */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <main className="flex-grow">
            {renderActiveView()}
          </main>

          {/* Common Legal warning disclaimer footer */}
          <Footer />
        </div>
      </div>

      {/* Floating legal bilingual AI chatbot */}
      <FloatingChatbot />

      {/* Embedded style variables to support our EN / HI focus states */}
      <style>{`
        /* When language focus is English only: dim Hindi, make smaller */
        .theme-focus-en .text-muted.italic {
          opacity: 0.15 !important;
          transition: opacity 0.3s ease;
        }
        /* When language focus is Hindi only: maintain standard typography for text */
        .theme-focus-hi .text-text {
          color: #1E293B !important;
        }
        
        /* Smooth transitions */
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
