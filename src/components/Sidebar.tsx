import React from "react";
import { 
  Home, 
  Scale, 
  Sparkles, 
  Award, 
  ShieldAlert, 
  Lock, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  LogIn,
  CalendarDays,
  PieChart,
  UserCheck,
  BookOpen
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { translate } from "../utils/translations";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Home,
  Scale,
  Sparkles,
  Award,
  ShieldAlert,
  Lock,
  Info,
  CalendarDays,
  PieChart,
  UserCheck,
  BookOpen
};

export default function Sidebar({
  activePage,
  setActivePage,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}: SidebarProps) {
  const { user, userProfile, login, nativeLanguage } = useAuth();

  const allNavLinks = [
    { id: "home", translationKey: "navHome", iconName: "Home", requireAuth: true },
    { id: "analyzer", translationKey: "navAnalyzer", iconName: "Scale", requireAuth: true },
    { id: "generator", translationKey: "navGenerator", iconName: "Sparkles", requireAuth: true },
    { id: "awareness", translationKey: "navAwareness", iconName: "BookOpen", requireAuth: true },
    { id: "schemes", translationKey: "navSchemes", iconName: "Award", requireAuth: true },
  ];

  // Filter links by authentication status
  const navLinks = allNavLinks.filter(
    (link) => !link.requireAuth || user
  );

  const handleNavClick = (pageId: string) => {
    setActivePage(pageId);
    setMobileOpen(false); // Close mobile drawer when link is clicked
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderNavItems = () => {
    return navLinks.map((link) => {
      const isActive = activePage === link.id;
      const IconComponent = iconMap[link.iconName] || Info;
      const label = translate(link.translationKey, nativeLanguage);
      const enLabel = translate(link.translationKey, "English");

      return (
        <button
          key={link.id}
          id={`sidebar-link-${link.id}`}
          onClick={() => handleNavClick(link.id)}
          title={collapsed ? `${label} (${enLabel})` : undefined}
          className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all relative group cursor-pointer ${
            isActive
              ? "bg-surface-2 border border-gold/45 text-gold shadow-[0_0_12px_rgba(212,160,23,0.12)] font-bold"
              : "text-text hover:bg-surface-2 hover:text-gold-light border border-transparent"
          }`}
        >
          {/* Active selection dot indicator */}
          {isActive && (
            <span className="absolute left-1.5 w-1.5 h-6 bg-gold rounded-full" />
          )}

          {/* Icon rendering */}
          <div className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-gold" : "text-stone-500 group-hover:text-gold"}`}>
            <IconComponent className="h-[21px] w-[21px]" />
          </div>

          {/* Labels - hidden if sidebar is collapsed on desktop */}
          <div className={`flex flex-col text-left transition-all duration-300 origin-left ${collapsed ? "md:hidden md:w-0 md:opacity-0" : "opacity-100"}`}>
            <span className="text-[13px] tracking-wide font-black leading-none uppercase">
              {label}
            </span>
            {nativeLanguage !== "English" && (
              <span className="text-[9px] text-muted italic font-normal mt-0.5 opacity-60">
                {enLabel}
              </span>
            )}
          </div>

          {/* Hover tooltip when collapsed */}
          {collapsed && (
            <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-navy border border-gold/30 text-gold text-[10px] font-black uppercase tracking-wider rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-lg hidden md:block whitespace-nowrap z-50">
              {label}
              {nativeLanguage !== "English" && (
                <span className="block text-[8px] text-muted font-normal italic lowercase mt-0.5">
                  ({enLabel})
                </span>
              )}
            </div>
          )}
        </button>
      );
    });
  };

  const renderUserInfoSection = () => {
    if (collapsed) {
      return user ? (
        <button 
          onClick={() => handleNavClick("locker")}
          className="mx-auto w-10 h-10 rounded-full bg-gold/15 border border-gold/30 text-gold flex items-center justify-center text-sm font-black hover:bg-gold/25 transition-all cursor-pointer"
          title={userProfile?.displayName || user.displayName || "Secure Profile"}
        >
          {user.displayName?.charAt(0) || <User className="h-4 w-4" />}
        </button>
      ) : (
        <button
          onClick={login}
          className="mx-auto p-2 bg-gold text-navy rounded-full hover:bg-gold-light transition-all cursor-pointer"
          title="Sign In"
        >
          <LogIn className="h-4 w-4" />
        </button>
      );
    }

    return (
      <div className="bg-surface border border-gold/15 p-4 rounded-2xl shadow-sm">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 text-gold border border-gold/30 flex items-center justify-center text-sm font-black shrink-0">
              {user.displayName?.charAt(0) || <User className="h-4 w-4" />}
            </div>
            <div className="text-left leading-none min-w-0">
              <p className="font-bold text-xs text-navy tracking-tight truncate">
                {userProfile?.displayName || user.displayName}
              </p>
              <p className="text-[9px] text-muted italic font-medium mt-1 truncate">
                {userProfile?.firmName || "MSME Leader"}
              </p>
              <button 
                onClick={() => handleNavClick("locker")}
                className="text-[9px] text-gold font-bold hover:underline mt-1.5 block cursor-pointer"
              >
                {nativeLanguage === "Kannada" ? "ತಿಜೋರಿ ವೀಕ್ಷಿಸಿ" 
                 : nativeLanguage === "Hindi" ? "तिजोरी खोलें" 
                 : nativeLanguage === "Telugu" ? "తిజోరి తెరవండి"
                 : "Open Secure Vault"} &rarr;
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-[10px] text-muted font-medium mb-3 italic">
              {nativeLanguage === "Kannada" ? "ಖಾತೆ ಸೃಜಿಸಿ ವರದಿಗಳನ್ನು ಸಂರಕ್ಷಿಸಿ"
               : nativeLanguage === "Hindi" ? "सुरक्षित तिजोरी खोलने के लिए लॉग इन करें"
               : nativeLanguage === "Telugu" ? "మరింత సమాచారం కొరకు లాగిన్ అవ్వండి"
               : "Access full encrypted vault and documents"}
            </p>
            <button
              onClick={login}
              className="w-full py-2.5 bg-gold hover:bg-gold-light text-navy font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>{translate("navSignIn", nativeLanguage)}</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* 1. DESKTOP SIDEBAR - Persistent layout side panel */}
      <aside 
        id="desktop-sidebar"
        className={`hidden md:flex flex-col justify-between bg-light-bg border-r border-border shrink-0 transition-all duration-300 h-[calc(100vh-64px)] sticky top-16 z-30 p-4 ${
          collapsed ? "w-20" : "w-64 lg:w-72"
        }`}
      >
        {/* Main Nav Section */}
        <div className="space-y-6 flex-1 overflow-y-auto pr-1 select-none max-h-[calc(100vh-270px)] scrollbar-none md:scrollbar-thin">
          <div className={`text-[10px] uppercase font-bold text-muted/60 tracking-widest pl-3 transition-opacity ${collapsed ? "opacity-0" : "opacity-100"}`}>
            {nativeLanguage === "Kannada" ? "ಕಾನೂನು ವ್ಯವಸ್ಥೆ"
             : nativeLanguage === "Hindi" ? "कानूनी उपकरण"
             : nativeLanguage === "Telugu" ? "న్యాయ సాధనాలు"
             : "Legal Solutions"}
          </div>
          <nav className="space-y-1.5">
            {renderNavItems()}
          </nav>
        </div>

        {/* Bottom Panel: Profile & Expand/Collapse toggle button */}
        <div className="space-y-4 pt-4 border-t border-border/10">
          {renderUserInfoSection()}

          {/* Width Toggle Trigger */}
          <button
            id="sidebar-collapse-toggle"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl bg-surface hover:bg-surface-2 border border-border/10 text-stone-500 hover:text-gold transition-all cursor-pointer"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : (
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted hover:text-gold">
                <ChevronLeft className="h-4 w-4 text-gold shrink-0" />
                <span>Collapse</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* 2. MOBILE SIDEBAR DRAWER - Overlay overlay structure */}
      <div 
        id="mobile-sidebar-overlay"
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <aside
          id="mobile-sidebar-drawer"
          onClick={(e) => e.stopPropagation()} // Prevent overlay close when interaction occurs
          className={`fixed top-0 bottom-0 left-0 w-72 bg-light-bg border-r border-border p-5 flex flex-col justify-between shadow-2xl z-50 transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-6 flex-1 overflow-y-auto pr-1 max-h-[calc(100vh-140px)] scrollbar-thin select-none">
            {/* Header branding details logo */}
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/10">
              <Scale className="h-5 w-5 text-gold" />
              <div className="flex flex-col text-left">
                <span className="font-serif font-bold text-lg text-gold leading-none">Namma NyayaMitra</span>
                <span className="text-[9px] text-muted italic font-medium leading-none mt-1">
                  {nativeLanguage === "Kannada" ? "ಉಚಿತ ರಕ್ಷಾ ಕವಚ" 
                   : nativeLanguage === "Hindi" ? "निःशुल्क कानूनी कवच" 
                   : nativeLanguage === "Telugu" ? "లీగల్ షీల్డ్"
                   : "Legal Shield"}
                </span>
              </div>
            </div>

            {/* Nav List */}
            <nav className="space-y-1.5 text-left">
              {renderNavItems()}
            </nav>
          </div>

          {/* User Profile Info section of drawer */}
          <div className="space-y-4 pt-4 border-t border-border/10">
            {renderUserInfoSection()}
          </div>
        </aside>
      </div>
    </>
  );
}
