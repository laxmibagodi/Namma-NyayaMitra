import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  getAnalysisHistory, 
  deleteAnalysisResult, 
  getContractsDraftHistory, 
  deleteContractDraft,
  SavedAnalysis,
  SavedContract,
  getAppointments,
  SavedAppointment,
  saveAnalysisResult
} from "../services/firebase";
import { 
  Building2, 
  User, 
  Globe, 
  FileSearch, 
  FileText, 
  Trash2, 
  ArrowRight, 
  LogOut, 
  Lock, 
  Unlock,
  Check, 
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  SlidersHorizontal,
  FolderOpen,
  PieChart,
  CalendarDays,
  Hammer,
  ChevronRight,
  RefreshCw,
  UserCheck,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
import LoadingOverlay from "../components/LoadingOverlay";
import { hashPin } from "../utils/security";
import { extractPDFText } from "../services/pdfExtractor";
import { generateAnalysisPDF } from "../services/pdfGenerator";

interface DashboardProps {
  viewMode: "both" | "en" | "hi";
  setActivePage: (page: string) => void;
  onLoadSavedAnalysis: (analysis: SavedAnalysis) => void;
  onLoadSavedContract: (contract: SavedContract) => void;
  forcedTab?: "vault" | "profile";
}

export default function Dashboard({ 
  viewMode, 
  setActivePage, 
  onLoadSavedAnalysis, 
  onLoadSavedContract,
  forcedTab
}: DashboardProps) {
  const { user, userProfile, updateProfile, login, logout } = useAuth();
  
  // Tab control: "vault" | "profile"
  const [activeTabSec, setActiveTabSec] = useState<"vault" | "profile">(forcedTab || "vault");

  useEffect(() => {
    if (forcedTab) {
      setActiveTabSec(forcedTab);
    }
  }, [forcedTab]);

  // PIN Protection state (Fully removed PIN passcode requirement; always unlocked)
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(true);
  const [hasPinState, setHasPinState] = useState(false);
  const [typedPin, setTypedPin] = useState("");
  const [pinSetupMode, setPinSetupMode] = useState(false);
  const [setupPinValue, setSetupPinValue] = useState("");
  const [pinSetupConfirm, setPinSetupConfirm] = useState("");
  const [pinError, setPinError] = useState("");

  // Lists fetched from DB
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [contracts, setContracts] = useState<SavedContract[]>([]);
  const [appointments, setAppointments] = useState<SavedAppointment[]>([]);
  
  // Search & Filter state for vault documents
  const [vaultSearchQuery, setVaultSearchQuery] = useState("");
  const [filterDocType, setFilterDocType] = useState("All");
  const [filterVendor, setFilterVendor] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "riskDesc" | "riskAsc">("newest");

  // Loading indicator triggers
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Profile fields state
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editFirmName, setEditFirmName] = useState("");
  const [editLanguage, setEditLanguage] = useState<"both" | "en" | "hi">("both");
  const [profileSuccessNotice, setProfileSuccessNotice] = useState(false);

  // Pre-configured list of known vendor tags
  const [availableVendors, setAvailableVendors] = useState<string[]>([]);

  // --- Risk Audit States ---
  const [selectedAuditDoc, setSelectedAuditDoc] = useState<SavedAnalysis | null>(null);
  const [auditSelectedFile, setAuditSelectedFile] = useState<File | null>(null);
  const [auditDocType, setAuditDocType] = useState<string>("vendor");
  const [isAuditingDoc, setIsAuditingDoc] = useState<boolean>(false);
  const [auditError, setAuditError] = useState<string>("");
  const [auditFilterLevel, setAuditFilterLevel] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");

  // Local helper tools for image transformations inside client
  const compressAndExtractImageBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          resolve(compressed.split(",")[1]);
        };
        img.onerror = (err) => reject(err);
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        resolve(res.split(",")[1]);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleRunRiskAudit = async () => {
    if (!auditSelectedFile || !auditDocType) return;

    setIsAuditingDoc(true);
    setAuditError("");
    setSelectedAuditDoc(null);

    try {
      let textContent = "";
      let imageData: { mimeType: string; data: string } | null = null;

      const ext = auditSelectedFile.name.split(".").pop()?.toLowerCase();
      const isPdfValue = ext === "pdf";

      if (isPdfValue) {
        textContent = await extractPDFText(auditSelectedFile);
        if (textContent.length > 8000) {
          textContent = textContent.substring(0, 8000);
        }
      } else {
        if (auditSelectedFile.size > 2 * 1024 * 1024) {
          const compressedBase64 = await compressAndExtractImageBase64(auditSelectedFile);
          imageData = { mimeType: "image/jpeg", data: compressedBase64 };
        } else {
          const base64 = await fileToBase64(auditSelectedFile);
          imageData = { mimeType: auditSelectedFile.type, data: base64 };
        }
      }

      const payload = {
        documentType: auditDocType,
        text: textContent || undefined,
        image: imageData || undefined,
        nativeLanguage: userProfile?.nativeLanguage || "Hindi"
      };

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Server audit review encountered an issue.");
      }

      const result = await res.json();
      
      const scanId = "scan_" + Date.now();
      const auditResultObject: SavedAnalysis = {
        id: scanId,
        userId: user?.uid || "anonymous",
        fileName: auditSelectedFile.name,
        documentType: auditDocType,
        overallRiskScore: result.overallRiskScore,
        overallVerdict: result.overallVerdict || { english: "Review Verdict", hindi: "समीक्षा परिणाम" },
        partiesInvolved: result.partiesInvolved || [],
        riskFlags: result.riskFlags || [],
        keyObligations: result.keyObligations || [],
        importantDeadlines: result.importantDeadlines || [],
        negotiationTips: result.negotiationTips || [],
        analyzedAt: new Date().toISOString()
      };

      setSelectedAuditDoc(auditResultObject);

      if (user) {
        try {
          await saveAnalysisResult(auditResultObject);
          setAnalyses(prev => [auditResultObject, ...prev]);
        } catch (dbErr) {
          console.warn("Could not save audit to Cloud Vault DB:", dbErr);
        }
      }

    } catch (err: any) {
      console.error(err);
      setAuditError(err.message || "AI review service temporarily offline. Please retry soon.");
    } finally {
      setIsAuditingDoc(false);
    }
  };

  useEffect(() => {
    if (userProfile) {
      setEditDisplayName(userProfile.displayName || "");
      setEditFirmName(userProfile.firmName || "");
      setEditLanguage(userProfile.prefLanguage || "both");
    }
  }, [userProfile]);

  useEffect(() => {
    if (user) {
      loadHistory();
      checkPinConfiguration();
    }
  }, [user]);

  const checkPinConfiguration = async () => {
    // PIN passcode is completely removed from secure locker - vault is always unlocked
    setHasPinState(false);
    setPinSetupMode(false);
    setIsVaultUnlocked(true);
  };

  const loadHistory = async () => {
    setIsSyncing(true);
    try {
      const listA = await getAnalysisHistory();
      const listC = await getContractsDraftHistory();
      const listAppts = await getAppointments();
      setAnalyses(listA);
      setContracts(listC);
      setAppointments(listAppts);

      // Extract unique list of parties/vendors
      const uniqueParties = new Set<string>();
      listA.forEach(a => {
        if (a.partiesInvolved) {
          a.partiesInvolved.forEach(p => uniqueParties.add(p));
        }
      });
      setAvailableVendors(Array.from(uniqueParties));

    } catch (err) {
      console.error("Failed to sync vault records:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Cryptographic Pin Verification
  const handlePinSubmitKeyboard = async (char: string) => {
    if (typedPin.length >= 4) return;
    const newPin = typedPin + char;
    setTypedPin(newPin);
    setPinError("");

    if (newPin.length === 4) {
      setIsSyncing(true);
      try {
        const trueHash = localStorage.getItem(`nyayaai_vault_pin_hash_${user?.uid}`);
        const userHashed = await hashPin(newPin);
        
        if (userHashed === trueHash) {
          setIsVaultUnlocked(true);
          setTypedPin("");
        } else {
          setPinError("INCORRECT PIN. Security lock remains enforced.");
          setTypedPin("");
        }
      } catch (err) {
        setPinError("Cryptographic engine failed to verify PIN.");
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleSetupPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupPinValue.length !== 4) {
      setPinError("PIN must be exactly 4 digits.");
      return;
    }
    if (setupPinValue !== pinSetupConfirm) {
      setPinError("PIN confirmations do not match.");
      return;
    }

    setIsSyncing(true);
    try {
      const finalHash = await hashPin(setupPinValue);
      localStorage.setItem(`nyayaai_vault_pin_hash_${user?.uid}`, finalHash);
      setHasPinState(true);
      setPinSetupMode(false);
      setIsVaultUnlocked(true);
      setSetupPinValue("");
      setPinSetupConfirm("");
      setPinError("");
    } catch {
      setPinError("Failed to store encrypted PIN hash.");
    } finally {
      setIsSyncing(false);
    }
  };

  const clearKeyboardPin = () => {
    setTypedPin("");
    setPinError("");
  };

  const deleteKeyboardLastChar = () => {
    setTypedPin(prev => prev.slice(0, -1));
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessNotice(false);
    try {
      await updateProfile({
        displayName: editDisplayName,
        firmName: editFirmName,
        prefLanguage: editLanguage
      });
      setProfileSuccessNotice(true);
      setTimeout(() => setProfileSuccessNotice(false), 3000);
    } catch (err) {
      alert("Failed to update proprietor credentials.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteAnalysis = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this analysis record from your Secure Vault?")) return;
    try {
      await deleteAnalysisResult(id);
      setAnalyses((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("Could not remove analysis.");
    }
  };

  const handleDeleteContract = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this agreement draft?")) return;
    try {
      await deleteContractDraft(id);
      setContracts((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("Could not delete contract draft.");
    }
  };

  // Re-Analyze Saved analysis payload handler
  const handleInstantReAnalyze = (item: SavedAnalysis, e: React.MouseEvent) => {
    e.stopPropagation();
    onLoadSavedAnalysis(item);
  };

  // Fitler / Search results matching
  const filteredAnalyses = analyses.filter(item => {
    const matchesSearch = item.fileName.toLowerCase().includes(vaultSearchQuery.toLowerCase()) || 
                          (item.overallVerdict?.english || "").toLowerCase().includes(vaultSearchQuery.toLowerCase());
    
    const matchesDocType = filterDocType === "All" || item.documentType.toLowerCase().includes(filterDocType.toLowerCase());
    
    const matchesVendor = filterVendor === "All" || (item.partiesInvolved && item.partiesInvolved.includes(filterVendor));
    
    return matchesSearch && matchesDocType && matchesVendor;
  }).sort((a, b) => {
    if (sortBy === "newest") return new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime();
    if (sortBy === "oldest") return new Date(a.analyzedAt).getTime() - new Date(b.analyzedAt).getTime();
    if (sortBy === "riskDesc") return b.overallRiskScore - a.overallRiskScore;
    if (sortBy === "riskAsc") return a.overallRiskScore - b.overallRiskScore;
    return 0;
  });

  const filteredContracts = contracts.filter(item => {
    return item.documentTitle.toLowerCase().includes(vaultSearchQuery.toLowerCase()) || 
           item.plainEnglishSummary.toLowerCase().includes(vaultSearchQuery.toLowerCase());
  }).sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return 0;
  });

  // Analytics helper stats logic (aggregations)
  const totalDossiersAnalyzed = analyses.length;
  const avgRiskScore = totalDossiersAnalyzed > 0 
    ? Math.round(analyses.map(a => a.overallRiskScore).reduce((sum, current) => sum + current, 0) / totalDossiersAnalyzed)
    : 0;

  const countSign = analyses.filter(a => (a.overallRiskScore < 35)).length;
  const countNegotiate = analyses.filter(a => (a.overallRiskScore >= 35 && a.overallRiskScore < 70)).length;
  const countReject = analyses.filter(a => (a.overallRiskScore >= 70)).length;

  if (!user) {
    /* Login prompt card if user is signed out */
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in text-center flex flex-col items-center justify-center min-h-[70vh]">
        <div className="p-4 bg-surface border-2 border-gold/30 rounded-full shadow-[0_0_30px_rgba(212,160,23,0.15)] mb-6 animate-pulse">
          <Lock className="h-12 w-12 text-gold" />
        </div>

        <h2 className="text-3xl font-serif font-bold text-navy mb-2">
          Unlock Your Legal Vault
        </h2>
        <p className="text-sm text-gold font-medium italic mb-6">अपना सुरक्षित लॉकर खोलें</p>
        
        <p className="text-xs text-muted max-w-md leading-relaxed mb-8">
          Sign in to store your contracts securely, manage your company credentials, schedule certified lawyer consultations, and retrieve cumulative risk analytical reports.
        </p>

        <button
          onClick={login}
          className="px-8 py-4 bg-gold hover:bg-gold-light text-navy font-bold rounded-xl shadow-lg hover:scale-105 transition-all text-xs uppercase tracking-wide cursor-pointer flex items-center justify-center gap-2"
        >
          🔑 Log In with Google / गूगल से लॉगिन करें
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in space-y-8 text-xs text-left">
      
      {/* Sync indicator */}
      <LoadingOverlay isVisible={isSyncing} type="sync" />

      {/* Hero Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/15 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-navy flex items-center gap-3">
            {activeTabSec === "vault" && (
              <>
                <ShieldCheck className="h-8 w-8 text-gold" strokeWidth={2.5} />
                <span>Secure Vault</span>
              </>
            )}

            {activeTabSec === "profile" && (
              <>
                <Building2 className="h-8 w-8 text-gold" strokeWidth={2.5} />
                <span>Company Profile Setup</span>
              </>
            )}
          </h2>
          <p className="text-sm text-gold mt-1 font-semibold italic">
            {activeTabSec === "vault" && "सुरक्षित तिजोरी • MSME Encrypted Records"}

            {activeTabSec === "profile" && "प्रोफ़ाइलसेटअप • Proprietor Firm Registry Details"}
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-surface p-2.5 rounded-2xl border border-border/10 shadow-sm">
          <div className="text-right text-xs pr-2">
            <p className="font-bold text-navy leading-tight">{userProfile?.displayName || user.displayName}</p>
            <p className="text-[10px] text-muted italic mt-0.5">{userProfile?.firmName || "Verified Proprietor"}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 bg-rose-500/15 text-rose-600 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl transition-colors cursor-pointer text-[10px] font-black uppercase flex items-center gap-1"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Out</span>
          </button>
        </div>
      </div>

      {/* Dynamic Main Section Tabs - Only shown if not separated by forcedTab */}
      {!forcedTab && (
        <div className="grid grid-cols-2 bg-surface p-1.5 border border-border/10 rounded-2xl shadow-md gap-1 text-center">
          {[
            { id: "vault", icon: ShieldCheck, title: "🔒 Secure Vault", labelHi: "सुरक्षित तिजोरी" },
            { id: "profile", icon: UserCheck, title: "💼 Company Profile", labelHi: "प्रोफ़ाइल सेटअप" }
          ].map((sec) => {
            const works = activeTabSec === sec.id;
            const IconComp = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTabSec(sec.id as any)}
                className={`py-3 px-1 rounded-xl cursor-not-allowed select-all transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  works 
                    ? "bg-navy text-gold font-bold shadow-lg" 
                    : "text-muted hover:text-navy hover:bg-surface-2/65"
                }`}
              >
                <IconComp className={`h-4.5 w-4.5 ${works ? "text-gold" : "text-muted"}`} />
                <span className="text-[11px] font-bold leading-none">{sec.title}</span>
                <span className="text-[9px] opacity-70 leading-none font-normal italic mt-0.5 hidden sm:block">{sec.labelHi}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* --- RENDER TAB VIEW: 1st SECURE VAULT --- */}
      {activeTabSec === "vault" && (
        <div className="space-y-6 animate-fade-in text-left">
          
          {/* Toolbar search sorting and parameters layout */}
          <div className="bg-surface p-4 border border-border/10 rounded-3xl shadow-md grid md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-4 relative">
              <SlidersHorizontal className="absolute left-3.5 top-3.5 h-4 w-4 text-gold" />
              <input
                type="text"
                value={vaultSearchQuery}
                onChange={(e) => setVaultSearchQuery(e.target.value)}
                placeholder="Search title, parties, summaries..."
                className="w-full bg-surface-2 border border-border/15 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-gold font-medium text-navy"
              />
            </div>

            <div className="md:col-span-8 grid sm:grid-cols-3 gap-2 text-xs font-semibold">
              <div>
                <select
                  value={filterDocType}
                  onChange={(e) => setFilterDocType(e.target.value)}
                  className="w-full bg-surface-2 border border-border/15 rounded-xl py-3 px-2 text-xs font-bold text-navy focus:outline-none focus:border-gold cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="vendor">Vendor Deals</option>
                  <option value="rental">Rental Deeds</option>
                  <option value="nda">NDAs</option>
                  <option value="employment">Employment Agreements</option>
                  <option value="partnership">Partnerships</option>
                </select>
              </div>

              <div>
                <select
                  value={filterVendor}
                  onChange={(e) => setFilterVendor(e.target.value)}
                  className="w-full bg-surface-2 border border-border/15 rounded-xl py-3 px-2 text-xs font-bold text-navy focus:outline-none focus:border-gold cursor-pointer"
                >
                  <option value="All">All Vendors</option>
                  {availableVendors.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-surface-2 border border-border/15 rounded-xl py-3 px-2 text-xs font-extrabold text-navy focus:outline-none focus:border-gold cursor-pointer"
                >
                  <option value="newest">Newest Date</option>
                  <option value="oldest">Oldest Date</option>
                  <option value="riskDesc">Risk: High First</option>
                  <option value="riskAsc">Risk: Low First</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION A: Saved Contract Scan Analyses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/10 pb-2">
              <h3 className="text-base font-serif font-extrabold text-navy flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-gold animate-bounce" />
                Verified Legal Audits ({filteredAnalyses.length})
              </h3>
              <span className="text-[10px] bg-gold/15 text-gold px-2.5 py-1 rounded-full font-bold">Secure Cloud Storage</span>
            </div>

            {filteredAnalyses.length === 0 ? (
              <div className="text-center p-12 bg-surface/40 border border-dashed border-border/15 rounded-3xl text-muted text-xs">
                No matching contract analyses found in security vault.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAnalyses.map((item) => {
                  const isHigh = item.overallRiskScore >= 70;
                  const isMed = item.overallRiskScore >= 35 && item.overallRiskScore < 70;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onLoadSavedAnalysis(item)}
                      className="bg-surface border border-border/10 rounded-3xl p-5 shadow-lg hover:border-gold hover:shadow-[0_0_20px_rgba(212,160,23,0.12)] transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="px-2.5 py-1 bg-surface-2 border border-border/10 rounded-lg text-[8px] font-black uppercase text-text max-w-[120px] truncate">
                            {item.documentType}
                          </span>
                          
                          <button
                            onClick={(e) => handleDeleteAnalysis(item.id, e)}
                            className="p-1 px-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white rounded-lg cursor-pointer transition-colors shrink-0"
                            title="Delete from Secure Vault"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-navy line-clamp-2">
                            {item.fileName}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted font-bold font-mono">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{new Date(item.analyzedAt).toLocaleDateString("en-IN", { weekday: 'short', month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-text/80 line-clamp-3 leading-relaxed">
                          {item.overallVerdict?.english}
                        </p>
                      </div>

                      <div className="border-t border-border/5 pt-3.5 mt-4 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-muted uppercase font-bold">Score:</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                              isHigh ? "bg-rose-500/15 text-rose-600" : isMed ? "bg-amber-500/15 text-amber-600" : "bg-emerald-500/15 text-emerald-600"
                            }`}>
                              {item.overallRiskScore}/100 Risk
                            </span>
                          </div>

                          <span className="text-[9px] text-gold font-bold uppercase tracking-wider flex items-center gap-0.5">
                            Read Report <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>

                        {/* Re-analysis action */}
                        <div className="pt-1.5 border-t border-dashed border-border/5">
                          <button
                            onClick={(e) => handleInstantReAnalyze(item, e)}
                            className="w-full py-2 px-1 bg-surface-2 hover:bg-surface-3 text-text border border-border/10 font-bold uppercase rounded-lg text-[8.5px] cursor-pointer"
                          >
                            Re-Analyze
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION B: Saved drafted agreement cards */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-border/10 pb-2">
              <h3 className="text-base font-serif font-extrabold text-navy flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal" />
                Drafted Agreements Vault ({filteredContracts.length})
              </h3>
              <span className="text-[10px] text-muted italic">हस्ताक्षरित ड्राफ्ट फाइलें</span>
            </div>

            {filteredContracts.length === 0 ? (
              <div className="text-center p-12 bg-surface/40 border border-dashed border-border/15 rounded-3xl text-muted text-xs">
                No drafted agreement dossiers locked down.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredContracts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onLoadSavedContract(item)}
                    className="bg-surface border border-border/10 rounded-3xl p-5 shadow-lg hover:border-teal hover:shadow-[0_0_20px_rgba(45,212,191,0.12)] transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="px-2.5 py-1 bg-surface-2 border border-border/10 rounded-lg text-[8px] font-black uppercase text-teal shrink-0">
                          {item.contractType || "Contract"} Template
                        </span>
                        
                        <button
                          onClick={(e) => handleDeleteContract(item.id, e)}
                          className="p-1 px-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white rounded-lg cursor-pointer transition-colors shrink-0"
                          title="Delete from Secure Vault"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-navy line-clamp-1">
                          {(item.contractType || "Contract").toUpperCase()} - {item.formValues?.proprietorName || "Direct Deed"}
                        </h4>
                        
                        <div className="flex items-center gap-1.5 text-[10px] text-muted font-bold font-mono">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{new Date(item.createdAt).toLocaleDateString("en-IN", { weekday: 'short', month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-text/80 line-clamp-3 leading-relaxed">
                        {item.plainEnglishSummary}
                      </p>
                    </div>

                    <div className="border-t border-border/5 pt-3.5 mt-4 flex items-center justify-between">
                      <span className="text-[9px] text-muted font-bold block max-w-[120px] truncate leading-none">
                        By: {item.formValues?.proprietorName || "Owner"}
                      </span>

                      <span className="text-[9px] text-teal font-black uppercase tracking-wider flex items-center gap-1 leading-none">
                        Review Draft <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Lawyer Consultation tab removed */}

      {/* --- RENDER TAB VIEW: 3rd INTERACTIVE ANALYSES INSIGHTS --- */}
      {false && (
        <div className="space-y-6 animate-fade-in text-xs text-left">
          {selectedAuditDoc ? (
            // DETAILED RISK AUDIT REPORT FOR SELECTED DOCUMENT
            <div className="space-y-6">
              
              {/* Back button and report download buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface border border-border/10 p-4 rounded-2xl gap-3">
                <button
                  onClick={() => {
                    setSelectedAuditDoc(null);
                    setAuditSelectedFile(null);
                    setAuditError("");
                  }}
                  className="flex items-center gap-2 text-gold font-bold bg-navy hover:bg-navy/90 text-[10.5px] uppercase tracking-wide px-4 py-2.5 rounded-xl cursor-pointer shadow-sm transition-all"
                >
                  &larr; Audit Another Document / Back
                </button>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      generateAnalysisPDF(selectedAuditDoc, `${selectedAuditDoc.fileName} Risk Audit`);
                    }}
                    className="w-full sm:w-auto py-2.5 px-4 bg-teal hover:bg-teal-light text-navy font-black text-[10px] uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FileText className="h-4 w-4" /> Download PDF Report
                  </button>
                </div>
              </div>

              {/* Top Banner stats and gauges */}
              <div className="grid md:grid-cols-3 gap-5">
                {/* Visual Gauge */}
                <div className="bg-surface border border-border/10 rounded-3xl p-5 shadow-lg text-center flex flex-col items-center justify-center space-y-4">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">Document Risk Score</span>
                  
                  <div className="relative w-36 h-36 flex items-center justify-center pt-2">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="8" fill="transparent"/>
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        stroke={selectedAuditDoc.overallRiskScore >= 70 ? "#EF4444" : selectedAuditDoc.overallRiskScore >= 35 ? "#F59E0B" : "#10B981"} 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * selectedAuditDoc.overallRiskScore) / 100}
                        className="transition-all duration-1000"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 leading-none select-none">
                      <span className="text-4xl font-black text-navy">{selectedAuditDoc.overallRiskScore}</span>
                      <span className="text-[8px] uppercase text-muted font-bold mt-1 tracking-wider">0-100 score</span>
                    </div>
                  </div>

                  <span className={`px-3 py-1 text-[9px] font-black rounded-full inline-block ${
                    selectedAuditDoc.overallRiskScore >= 70 ? "bg-rose-500/15 text-rose-600" : selectedAuditDoc.overallRiskScore >= 35 ? "bg-amber-500/15 text-amber-600" : "bg-emerald-500/15 text-emerald-600"
                  }`}>
                    {selectedAuditDoc.overallRiskScore >= 70 ? "🔥 HEAVY RISK BURDEN" : selectedAuditDoc.overallRiskScore >= 35 ? "⚠️ MODERATE ISSUES / NEGOTIABLE" : "✅ EXCELLENT COVERAGE"}
                  </span>
                </div>

                {/* Audit summary panel */}
                <div className="bg-surface border border-border/10 rounded-3xl p-5 shadow-lg md:col-span-2 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 bg-surface-2 border border-border/10 rounded-lg text-[8.5px] font-black uppercase text-text">
                        {(selectedAuditDoc.documentType || "Document").toUpperCase()}
                      </span>
                      <span className="text-[9px] text-muted font-bold font-mono">
                        Analyzed on: {new Date(selectedAuditDoc.analyzedAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    
                    <h3 className="text-sm font-serif font-black text-navy">{selectedAuditDoc.fileName}</h3>
                    
                    <div className="space-y-2 mt-2 bg-surface-2 p-3.5 rounded-2xl border border-border/5">
                      <div className="flex items-center gap-1.5 font-bold text-navy">
                        <ShieldAlert className="h-4 w-4 text-gold shrink-0" />
                        <span>Bespoke NyayaAI Safety Verdict:</span>
                      </div>
                      <p className="text-[11px] text-text/95 leading-relaxed font-semibold text-navy">
                        {viewMode === "hi" ? selectedAuditDoc.overallVerdict?.hindi : selectedAuditDoc.overallVerdict?.english}
                      </p>
                      {viewMode === "both" && selectedAuditDoc.overallVerdict?.hindi && (
                        <p className="text-[10px] text-muted italic border-t border-dashed border-border/10 pt-1 mt-1 leading-relaxed">
                          {selectedAuditDoc.overallVerdict?.hindi}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/5 text-center mt-4">
                    <div className="bg-surface-2 rounded-xl py-2">
                      <span className="text-[8px] text-muted uppercase font-bold block">HAZARD CLAUSES</span>
                      <span className="text-sm font-black text-rose-600">{selectedAuditDoc.riskFlags?.filter(f => f.riskLevel === "HIGH").length || 0}</span>
                    </div>
                    <div className="bg-surface-2 rounded-xl py-2">
                      <span className="text-[8px] text-muted uppercase font-bold block">NEGOTIABLE ITEMS</span>
                      <span className="text-sm font-black text-amber-600">{selectedAuditDoc.riskFlags?.filter(f => f.riskLevel === "MEDIUM").length || 0}</span>
                    </div>
                    <div className="bg-surface-2 rounded-xl py-2">
                      <span className="text-[8px] text-muted uppercase font-bold block">LEGAL PARTIES</span>
                      <span className="text-sm font-black text-teal">{selectedAuditDoc.partiesInvolved?.length || 1}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clauses filters & Clause-by-clause detailed colored grid */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/10 pb-3 gap-3">
                  <h4 className="text-xs uppercase font-extrabold text-navy tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="h-4 w-4 text-gold" /> Clause-by-Clause Audit Assessment
                  </h4>
                  
                  {/* Filter tabs */}
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: "ALL", label: "All Items" },
                      { id: "HIGH", label: "🔴 High Risks" },
                      { id: "MEDIUM", label: "🟡 Medium Risks" },
                      { id: "LOW", label: "🟢 Minor Risks" }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setAuditFilterLevel(f.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold cursor-pointer transition-all ${
                          auditFilterLevel === f.id
                            ? "bg-navy text-gold font-extrabold shadow-sm"
                            : "bg-surface border border-border/10 text-muted hover:text-navy hover:bg-surface-2"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audit clause mapping lists */}
                <div className="space-y-4">
                  {(selectedAuditDoc.riskFlags || [])
                    .filter(flag => auditFilterLevel === "ALL" || flag.riskLevel === auditFilterLevel)
                    .map((flag, idx) => {
                      const isHigh = flag.riskLevel === "HIGH";
                      const isMed = flag.riskLevel === "MEDIUM";
                      const borderCol = isHigh 
                        ? "border-l-rose-500 bg-rose-500/[0.02]" 
                        : isMed 
                        ? "border-l-amber-500 bg-amber-500/[0.02]" 
                        : "border-l-emerald-500 bg-emerald-500/[0.02]";
                      const tagColors = isHigh
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        : isMed
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
                      const iconComp = isHigh 
                        ? <ShieldAlert className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                        : isMed
                        ? <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                        : <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />;

                      return (
                        <div 
                          key={idx}
                          className={`border border-border/10 border-l-4 rounded-2xl p-4.5 p-5 shadow-sm space-y-4 ${borderCol}`}
                        >
                          <div className="flex justify-between items-center pb-2.5 border-b border-border/5">
                            <span className="text-[10px] font-black text-navy uppercase tracking-wider">
                              Clause Review #{idx+1}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border ${tagColors}`}>
                              {flag.riskLevel || "Low"} Risk Level
                            </span>
                          </div>

                          {/* Verbatim quote clause text focus */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted">Original Term / Summary under scrutiny:</span>
                            <div className="p-3 bg-surface-2 text-[11px] font-mono text-navy font-medium rounded-xl border border-border/5 border-l-2 border-l-navy select-text">
                              "{flag.clauseText}"
                            </div>
                          </div>

                          {/* Detailed explanation and fixes */}
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Explanation (Why it is a threat) */}
                            <div className="space-y-1.5 justify-self-stretch">
                              <span className="text-[9px] uppercase tracking-wider font-extrabold text-navy flex items-center gap-1">
                                {iconComp} <span>Critical Hazard Warning:</span>
                              </span>
                              <div className="space-y-1.5 leading-relaxed text-[11px] text-text/90 font-medium">
                                <p>{viewMode === "hi" ? flag.riskExplanation?.hindi : flag.riskExplanation?.english}</p>
                                {viewMode === "both" && flag.riskExplanation?.hindi && (
                                  <p className="text-[10px] text-muted italic border-t border-dashed border-border/10 pt-1 mt-1 leading-normal">
                                    {flag.riskExplanation?.hindi}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Fix Suggestions (How to protect yourself) */}
                            <div className="space-y-1.5 bg-white/70 rounded-xl p-3 border border-border/10 justify-self-stretch">
                              <span className="text-[9px] uppercase tracking-wider font-black text-rose-900 flex items-center gap-1.5">
                                <Hammer className="h-4.5 w-4.5 text-rose-500" /> Actionable Correction / Fix Offer:
                              </span>
                              <div className="space-y-1.5 leading-relaxed text-[11px] font-semibold text-rose-950">
                                <p>{viewMode === "hi" ? flag.whatToDo?.hindi : flag.whatToDo?.english}</p>
                                {viewMode === "both" && flag.whatToDo?.hindi && (
                                  <p className="text-[10px] text-rose-900/60 font-normal italic border-t border-dashed border-rose-950/15 pt-1 mt-1 leading-normal">
                                    {flag.whatToDo?.hindi}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })}

                  {/* Empty Filter State */}
                  {(selectedAuditDoc.riskFlags || []).filter(flag => auditFilterLevel === "ALL" || flag.riskLevel === auditFilterLevel).length === 0 && (
                    <div className="text-center p-8 bg-surface/50 border border-dashed border-border/15 rounded-2xl text-muted text-xs">
                      No matching audit items found for filter {auditFilterLevel}.
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            // DUAL-WORK AREA FOR DALL / UPLOAD OR SELECT FROM VAULT
            <div className="space-y-6">
              
              {/* Top explanation text */}
              <div className="bg-navy border border-gold/20 p-5 rounded-3xl text-white space-y-1.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 transform translate-x-3 -translate-y-3 opacity-10 pointer-events-none">
                  <PieChart className="h-32 w-32 text-gold" />
                </div>
                <h3 className="text-sm font-serif font-black text-gold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-gold animate-pulse" />
                  Enterprise Risk & Corrections Audit Workspace
                </h3>
                <p className="text-[11px] leading-relaxed text-slate-200">
                  Select an analyzed contract from your Secure Vault to perform a detailed clause-by-clause assessment, or upload a new contract or image scan of any agreement. Our certified legal AI instantly calculates risk scores, extracts hazardous loopholes, and generates protective fix alternatives tailored to MSMEs under Indian commercial law.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                
                {/* COLUMN A: SELECT FILE FROM VAULT */}
                <div className="bg-surface border border-border/10 rounded-3xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="border-b border-border/15 pb-2.5">
                      <h4 className="text-navy font-bold text-xs flex items-center gap-2 uppercase tracking-wide">
                        <FolderOpen className="h-5 w-5 text-gold" />
                        Select Document from Secure Vault
                      </h4>
                      <p className="text-[9.5px] text-muted italic mt-0.5">तिजोरी में पहले विश्लेषित किए गए दस्तावेज़ों से चुनें</p>
                    </div>

                    {analyses.length === 0 ? (
                      <div className="text-center py-10 px-4 bg-surface-2/70 border border-dashed border-border/10 rounded-2xl space-y-3.5">
                        <Lock className="h-8 w-8 text-gold/45 mx-auto" strokeWidth={1.5} />
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted font-bold font-serif">Encrypted Vault is Empty</p>
                          <p className="text-[9px] text-muted max-w-[200px] mx-auto leading-relaxed">
                            {user ? "No processed reports found in database. Compile your first contract on the right-hand panel." : "🔒 Sign In to select documents from your Secure Vault."}
                          </p>
                        </div>
                        {!user && (
                          <button 
                            onClick={login}
                            className="py-1.5 px-3 bg-gold hover:bg-gold-light text-navy text-[9.5px] uppercase font-bold rounded-lg cursor-pointer"
                          >
                            Sign In for Cloud Vault
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 select-none scrollbar-thin">
                        {analyses.map((item) => {
                          const isHigh = item.overallRiskScore >= 70;
                          const isMed = item.overallRiskScore >= 35 && item.overallRiskScore < 70;
                          const scoreColor = isHigh 
                            ? "bg-rose-500/15 text-rose-600 border-rose-500/20" 
                            : isMed 
                            ? "bg-amber-500/15 text-amber-600 border-amber-500/20" 
                            : "bg-emerald-500/15 text-emerald-600 border-emerald-500/20";
                          
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setSelectedAuditDoc(item);
                                setAuditError("");
                              }}
                              className="p-3.5 bg-surface hover:bg-surface-2 border border-border/10 hover:border-gold/30 rounded-2xl cursor-pointer transition-all flex justify-between items-center group shadow-sm shrink-0"
                            >
                              <div className="text-left space-y-1 max-w-[70%]">
                                <h5 className="text-[10.5px] text-navy font-black truncate leading-none group-hover:text-gold block pr-1.5" title={item.fileName}>
                                  {item.fileName}
                                </h5>
                                <div className="flex gap-2 items-center text-[8.5px] text-muted font-mono leading-none pt-0.5">
                                  <span>{item.documentType}</span>
                                  <span>•</span>
                                  <span>{new Date(item.analyzedAt).toLocaleDateString("en-IN")}</span>
                                </div>
                              </div>

                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wider ${scoreColor} shrink-0`}>
                                {item.overallRiskScore}/100 Risk
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="text-[9.5px] text-muted italic select-none text-center bg-surface-2 p-2.5 rounded-xl border border-border/5">
                    Clicking on any vault item triggers direct interactive risk assessment logs retrieval and correction modeling.
                  </div>
                </div>

                {/* COLUMN B: UPLOAD NEW DOCUMENT OF ANY TYPE */}
                <div className="bg-surface border border-border/10 rounded-3xl p-5 shadow-lg space-y-4 text-left">
                  <div className="border-b border-border/15 pb-2.5">
                    <h4 className="text-navy font-bold text-xs flex items-center gap-2 uppercase tracking-wide">
                      <Upload className="h-5 w-5 text-gold animate-bounce" />
                      Upload New File for Instant Audit
                    </h4>
                    <p className="text-[9.5px] text-muted italic mt-0.5">किसी भी नए दस्तावेज़ को आयात करें और सीधे ऑडिट करें</p>
                  </div>

                  <div className="space-y-4">
                    {/* File Drop/Pick zone */}
                    {!auditSelectedFile ? (
                      <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            setAuditSelectedFile(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = ".pdf,.jpg,.jpeg,.png";
                          input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files;
                            if (files && files[0]) {
                              setAuditSelectedFile(files[0]);
                            }
                          };
                          input.click();
                        }}
                        className="border-2 border-dashed border-border/15 hover:border-gold/30 bg-surface-2/50 hover:bg-surface-2/80 rounded-2xl py-8 px-4 text-center cursor-pointer transition-all space-y-2.5 select-none animate-pulse"
                      >
                        <Upload className="h-8 w-8 text-gold/60 mx-auto" />
                        <div className="space-y-1 animate-none">
                          <p className="text-[10px] text-navy font-black tracking-wide uppercase">DRAG & DROP CONTRACT FILE HERE</p>
                          <p className="text-[9px] text-muted">Supports legal PDF files or physical document scan images (PNG, JPG, JPEG) up to 10MB.</p>
                        </div>
                        <span className="inline-block px-3 py-1.5 bg-navy hover:bg-navy/90 text-gold font-bold text-[9px] uppercase tracking-wide rounded-lg shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all">
                          Browse Local Files
                        </span>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-surface-2 border border-border/15 rounded-2xl flex justify-between items-center">
                        <div className="flex items-center gap-3 truncate">
                          <FileText className="h-8 w-8 text-gold shrink-0" />
                          <div className="text-left leading-none">
                            <p className="text-[10.5px] text-navy font-black truncate max-w-[150px]" title={auditSelectedFile.name}>
                              {auditSelectedFile.name}
                            </p>
                            <span className="text-[8.5px] text-muted font-mono block mt-1">
                              {(auditSelectedFile.size / (1024 * 1024)).toFixed(2)} MB file
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setAuditSelectedFile(null);
                            setAuditError("");
                          }}
                          className="py-1 px-2.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 rounded-lg text-[9px] font-bold cursor-pointer transition-all"
                        >
                          Change File
                        </button>
                      </div>
                    )}

                    {/* Document Options and Trigger Selection */}
                    <div className="space-y-3.5">
                      <div className="space-y-1.5">
                        <label className="font-bold text-navy block select-none">Target Document Category (दस्तावेज़ का प्रकार):</label>
                        <select
                          value={auditDocType}
                          onChange={(e) => setAuditDocType(e.target.value)}
                          className="w-full bg-surface-2 border border-border/15 rounded-xl px-3 py-2.5 text-xs font-bold text-navy focus:outline-none focus:border-gold cursor-pointer"
                        >
                          <option value="vendor">Vendor / Supplier Agreement (विक्रेता अनुबंध)</option>
                          <option value="rental">Shop Lease / Rental Agreement (किराया अनुबंध)</option>
                          <option value="nda">Non-Disclosure Agreement (NDAs - गोपनीयता अनुबंध)</option>
                          <option value="loan">Loan / Credit Agreement (ऋण अनुबंध)</option>
                          <option value="partnership">Partnership Deed / Legal Deeds (साझेदारी विलेख)</option>
                          <option value="employment">Employment / Labour Agreements (रोज़गार अनुबंध)</option>
                          <option value="service">Service Agreement (सेवा अनुबंध)</option>
                          <option value="other">Other Legal Document (अन्य दस्तावेज़)</option>
                        </select>
                      </div>

                      {auditError && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl font-bold text-[10px] flex items-center gap-1.5 leading-normal">
                          <AlertCircle className="h-4 w-4 shrink-0 stroke-[2.5]" />
                          <span>{auditError}</span>
                        </div>
                      )}

                      <button
                        onClick={handleRunRiskAudit}
                        disabled={!auditSelectedFile || isAuditingDoc}
                        className={`w-full py-4 bg-gold hover:bg-gold-light text-navy font-black rounded-xl text-[10.5px] uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                          (!auditSelectedFile || isAuditingDoc) ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {isAuditingDoc ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin text-navy" />
                            <span>AI Auditing & Assessing Loophole Matrices...</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="h-4.5 w-4.5 text-navy animate-pulse" />
                            <span>Run AI Deep Risk Audit & Corrections</span>
                          </>
                        )}
                      </button>

                      {isAuditingDoc && (
                        <p className="text-[10px] text-muted italic text-center select-none animate-pulse">
                          Reading text parameters through OCR, executing semantic evaluation models on Gemini-3.5...
                        </p>
                      )}
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

      {/* --- RENDER TAB VIEW: 4th COMPANY PROFILE EDIT SETUP --- */}
      {activeTabSec === "profile" && (
        <div className="max-w-2xl mx-auto bg-surface border border-gold/20 rounded-3xl p-6 shadow-xl space-y-6 animate-fade-in text-left">
          
          <div className="border-b border-border/15 pb-3">
            <h3 className="font-serif font-black text-sm text-navy flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gold" />
              Manage Company Proprietorship Registry
            </h3>
            <p className="text-[10px] text-muted italic mt-0.5">अनुबंध निर्माण के लिए व्यावसायिक विवरण</p>
          </div>

          <form onSubmit={handleUpdateProfileSubmit} className="space-y-5 text-xs text-text">
            
            <div className="space-y-1.5">
              <label className="font-bold block text-navy">Proprietor Name (मालिक का नाम)</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="Enter owner name"
                  className="w-full bg-surface-2 border border-border/15 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-gold font-medium text-navy"
                />
              </div>
            </div>

            <div className="space-y-1.5 font-bold">
              <label className="font-bold block text-navy">Business / Firm Title (व्यवसाय का नाम)</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
                <input
                  type="text"
                  value={editFirmName}
                  onChange={(e) => setEditFirmName(e.target.value)}
                  placeholder="e.g. Laxmi Kirana Store"
                  className="w-full bg-surface-2 border border-border/15 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-gold font-medium text-navy"
                />
              </div>
              <p className="text-[10px] text-muted font-normal leading-normal italic select-none">
                This is utilized as standard parameters inside contract generation and is shared with advising advocates.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold block text-navy">Preferred Interface Language (भाषा प्राथमिकता)</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
                <select
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value as any)}
                  className="w-full bg-surface-2 border border-border/15 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-navy focus:outline-none focus:border-gold appearance-none cursor-pointer"
                >
                  <option value="both">English + Hindi (दोनों भाषाएं)</option>
                  <option value="en">English Only (केवल अंग्रेज़ी)</option>
                  <option value="hi">हिंदी केवल (Hindi Only)</option>
                </select>
              </div>
            </div>

            {profileSuccessNotice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-bold rounded-xl text-[10px] flex items-center gap-1.5">
                <Check className="h-4 w-4 stroke-[3]" /> Profile credentials saved to Firestore!
              </div>
            )}

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full py-4.5 bg-gold hover:bg-gold-light text-navy font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              {isSavingProfile ? "Saving Details..." : "⚡ Save Firm Profile / सहेजें"}
            </button>

          </form>

        </div>
      )}

    </div>
  );
}
