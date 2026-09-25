import React from "react";
import { Scale, Menu, Globe, LogIn, User, Lock, UserCheck, ShieldAlert, Info } from "lucide-react";
import { useAuth, LanguageType } from "../context/AuthContext";
import { translate } from "../utils/translations";

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  // Bilingual view mode: "both" | "en" | "hi"
  viewMode: "both" | "en" | "hi";
  setViewMode: (mode: "both" | "en" | "hi") => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

export default function Navbar({ 
  activePage, 
  setActivePage, 
  viewMode, 
  setViewMode, 
  mobileSidebarOpen, 
  setMobileSidebarOpen 
}: NavbarProps) {
  const { user, userProfile, login, nativeLanguage, setNativeLanguage } = useAuth();

  const handleNavClick = (pageId: string) => {
    setActivePage(pageId);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="sticky top-0 bg-light-bg/90 backdrop-blur-md border-b border-border z-40 w-full animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Namma NyayaMitra logo and Mobile Toggle */}
          <div className="flex items-center gap-2">
            {/* Mobile Hamburger menu button - opens the sidebar drawer overlay */}
            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 md:hidden text-text hover:text-gold bg-surface border border-border/10 rounded-xl cursor-pointer transition-all shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Scale logo link */}
            <div className="flex items-center cursor-pointer group" onClick={() => handleNavClick("home")}>
              <div className="p-2 bg-surface border border-gold/30 rounded-xl mr-2.5 shadow-[0_0_12px_rgba(212,160,23,0.15)] group-hover:shadow-[0_0_16px_rgba(212,160,23,0.3)] transition-all">
                <Scale className="h-5 w-5 text-gold" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-serif font-bold text-lg text-gold leading-none tracking-tight">
                  Namma NyayaMitra
                </span>
                <span className="text-[9px] text-muted italic font-medium leading-normal mt-0.5 whitespace-nowrap">
                  {nativeLanguage === "Kannada" ? "ನಮ್ಮ ನ್ಯಾಯಮಿತ್ರ • ಉಚಿತ ರಕ್ಷಾ ಕವಚ"
                   : nativeLanguage === "Hindi" ? "हमारा न्यायमित्र • निःशुल्क कानूनी कवच" 
                   : nativeLanguage === "Telugu" ? "న్యాయమిత్ర • లీగల్ షీల్డ్"
                   : "Namma NyayaMitra • Legal Shield"}
                </span>
              </div>
            </div>
          </div>

          {/* Middle Navigation Links (Desktop & Tablet) */}
          <div className="hidden md:flex flex-grow items-center justify-center gap-1.5 px-4 font-sans font-semibold text-xs">
            {/* 1. Secure Vault (`locker`) */}
            {user && (
              <button
                id="nav-link-locker"
                onClick={() => handleNavClick("locker")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activePage === "locker"
                    ? "bg-gold/10 border border-gold/30 text-gold font-bold shadow-[0_0_12px_rgba(212,160,23,0.08)]"
                    : "text-text hover:bg-surface-2 hover:text-gold border border-transparent"
                }`}
              >
                <Lock className="h-3.5 w-3.5 shrink-0" />
                <span>{translate("navLocker", nativeLanguage)}</span>
              </button>
            )}

            {/* 2. Company Profile (`profile`) */}
            {user && (
              <button
                id="nav-link-profile"
                onClick={() => handleNavClick("profile")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activePage === "profile"
                    ? "bg-gold/10 border border-gold/30 text-gold font-bold shadow-[0_0_12px_rgba(212,160,23,0.08)]"
                    : "text-text hover:bg-surface-2 hover:text-gold border border-transparent"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5 shrink-0" />
                <span>{translate("navProfile", nativeLanguage)}</span>
              </button>
            )}

            {/* 3. Emergency Support (`emergency`) */}
            {user && (
              <button
                id="nav-link-emergency"
                onClick={() => handleNavClick("emergency")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activePage === "emergency"
                    ? "bg-red-500/10 border border-red-500/30 text-red-500 font-bold shadow-[0_0_12px_rgba(239,68,68,0.08)]"
                    : "text-red-500/80 hover:bg-red-500/5 hover:text-red-500 border border-transparent"
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                <span>{translate("navEmergency", nativeLanguage)}</span>
              </button>
            )}

            {/* 4. About Us (`about`) */}
            <button
              id="nav-link-about"
              onClick={() => handleNavClick("about")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activePage === "about"
                  ? "bg-gold/10 border border-gold/30 text-gold font-bold shadow-[0_0_12px_rgba(212,160,23,0.08)]"
                  : "text-text hover:bg-surface-2 hover:text-gold border border-transparent"
              }`}
            >
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>{translate("navAbout", nativeLanguage)}</span>
            </button>
          </div>

          {/* Right Area: Language Dropdown Selector & Auth Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Focus Quick Toggle (Both/En/Hi) */}
            <div className="hidden lg:flex items-center gap-1 bg-surface border border-border/15 p-1 rounded-xl text-[10px] font-black">
              <button 
                onClick={() => setViewMode("both")} 
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${viewMode === "both" ? "bg-gold text-navy" : "text-stone-500 hover:text-gold"}`}
              >
                BILINGUAL
              </button>
              <button 
                onClick={() => setViewMode("en")} 
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${viewMode === "en" ? "bg-gold text-navy" : "text-stone-500 hover:text-gold"}`}
              >
                ENGLISH
              </button>
              <button 
                onClick={() => setViewMode("hi")} 
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${viewMode === "hi" ? "bg-gold text-navy" : "text-stone-500 hover:text-gold"}`}
              >
                HINDI
              </button>
            </div>

            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1 px-2.5 py-1 bg-surface border border-gold/25 rounded-xl text-gold hover:border-gold transition-all text-xs relative">
              <Globe className="h-3.5 w-3.5 pointer-events-none text-gold shrink-0" />
              <select
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value as LanguageType)}
                className="bg-transparent text-[10px] font-extrabold uppercase tracking-wider outline-none cursor-pointer text-gold pr-1 focus:outline-none appearance-none"
              >
                <option value="English" className="bg-surface text-navy">English</option>
                <option value="Kannada" className="bg-surface text-navy">ಕನ್ನಡ (Kn)</option>
                <option value="Hindi" className="bg-surface text-navy">हिंदी (Hi)</option>
                <option value="Telugu" className="bg-surface text-navy">తెలుగు (Te)</option>
              </select>
            </div>

            {/* Authentication state */}
            {user ? (
              /* User Profile Indicator */
              <button
                onClick={() => handleNavClick("locker")}
                className={`flex items-center gap-2 p-1 px-2 rounded-xl border transition-all cursor-pointer ${
                  activePage === "locker" 
                    ? "bg-gold/10 border-gold text-gold" 
                    : "bg-surface border-border/10 hover:border-gold/40 text-text"
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center text-[11px] font-black shrink-0">
                  {user.displayName?.charAt(0) || <User className="h-3.5 w-3.5" />}
                </div>
                <div className="text-left text-[10px] hidden md:block max-w-[100px] truncate leading-none">
                  <p className="font-bold truncate">{userProfile?.displayName || user.displayName}</p>
                </div>
              </button>
            ) : (
              /* Sign In Trigger */
              <button
                onClick={login}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold hover:bg-gold-light text-navy font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{translate("navSignIn", nativeLanguage)}</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Quick Navigation Bar for Navbar items */}
      <div className="flex md:hidden items-center justify-center bg-surface-2 border-t border-border/10 py-1.5 px-3 gap-1 overflow-x-auto scrollbar-none text-[9px] font-bold">
        {user && (
          <button
            onClick={() => handleNavClick("locker")}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap min-w-0 shrink-0 cursor-pointer ${
              activePage === "locker" ? "bg-gold/15 text-gold border border-gold/30 font-extrabold" : "text-stone-400"
            }`}
          >
            <Lock className="h-3 w-3" />
            <span>{translate("navLocker", nativeLanguage)}</span>
          </button>
        )}
        {user && (
          <button
            onClick={() => handleNavClick("profile")}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap min-w-0 shrink-0 cursor-pointer ${
              activePage === "profile" ? "bg-gold/15 text-gold border border-gold/30 font-extrabold" : "text-stone-400"
            }`}
          >
            <UserCheck className="h-3 w-3" />
            <span>{translate("navProfile", nativeLanguage)}</span>
          </button>
        )}
        {user && (
          <button
            onClick={() => handleNavClick("emergency")}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-red-500 whitespace-nowrap min-w-0 shrink-0 cursor-pointer ${
              activePage === "emergency" ? "bg-red-500/15 border border-red-500/30 font-extrabold" : "text-stone-400 hover:text-red-400"
            }`}
          >
            <ShieldAlert className="h-3 w-3 text-red-500" />
            <span>{translate("navEmergency", nativeLanguage)}</span>
          </button>
        )}
        <button
          onClick={() => handleNavClick("about")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap min-w-0 shrink-0 cursor-pointer ${
            activePage === "about" ? "bg-gold/15 text-gold border border-gold/30 font-extrabold" : "text-stone-400"
          }`}
        >
          <Info className="h-3 w-3" />
          <span>{translate("navAbout", nativeLanguage)}</span>
        </button>
      </div>
    </nav>
  );
}
