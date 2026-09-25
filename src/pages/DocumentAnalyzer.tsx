import React, { useState, useRef, useEffect } from "react";
import { Upload, FileText, Check, AlertCircle, FileSearch, Trash2, ShieldAlert, Heart, RefreshCw, Sparkles, BookOpen, Lock, Save, Volume2, VolumeX, AlertTriangle, CheckCircle2 } from "lucide-react";
import { extractTextFromFile } from "../services/documentExtractor";
import { generateAnalysisPDF } from "../services/pdfGenerator";
import RiskScoreGauge from "../components/RiskScoreGauge";
import LoadingOverlay from "../components/LoadingOverlay";
import BilingualLabel from "../components/BilingualLabel";
import { useAuth } from "../context/AuthContext";
import { saveAnalysisResult, SavedAnalysis } from "../services/firebase";

interface DocumentAnalyzerProps {
  viewMode: "both" | "en" | "hi";
  setActivePage: (page: string) => void;
  setDocTypePreSelect?: (type: string) => void;
  preSelectedDocType?: string;
  loadedAnalysis?: SavedAnalysis | null;
  onClearLoadedAnalysis?: () => void;
}

const DOCUMENT_OPTIONS = [
  { id: "vendor", labelEn: "Vendor / Supplier Agreement", labelHi: "विक्रेता अनुबंध" },
  { id: "rental", labelEn: "Shop Lease / Rental Agreement", labelHi: "दुकान किराया अनुबंध" },
  { id: "nda", labelEn: "Non-Disclosure Agreement (NDA)", labelHi: "गोपनीयता अनुबंध" },
  { id: "loan", labelEn: "Loan / Credit Agreement", labelHi: "ऋण अनुबंध" },
  { id: "partnership", labelEn: "Partnership Deed", labelHi: "साझेदारी विलेख" },
  { id: "employment", labelEn: "Employment / Labour Contract", labelHi: "रोज़गार अनुबंध" },
  { id: "service", labelEn: "Service Agreement", labelHi: "सेवा अनुबंध" },
  { id: "other", labelEn: "Other Legal Document", labelHi: "अन्य कानूनी दस्तावेज़" },
];

export default function DocumentAnalyzer({
  viewMode,
  setActivePage,
  setDocTypePreSelect,
  preSelectedDocType,
  loadedAnalysis,
  onClearLoadedAnalysis
}: DocumentAnalyzerProps) {
  const { user, userProfile } = useAuth();
  const [selectedType, setSelectedType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  
  // Truncation Notice
  const [isTruncated, setIsTruncated] = useState(false);

  // Loading Overlay states
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Analysis result holder
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"clauses" | "jargon" | "obligations">("clauses");
  const [errorText, setErrorText] = useState<string | null>(null);

  // Voice playback voice synthesis state and handler
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const handleSpeakText = (id: string, text: string, langType: "en" | "native") => {
    if (!("speechSynthesis" in window)) return;
    try {
      if (playingVoiceId === id) {
        window.speechSynthesis.cancel();
        setPlayingVoiceId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      let langCode = "en-US";
      if (langType === "native") {
        const nativeL = userProfile?.nativeLanguage || "Hindi";
        if (nativeL === "Kannada") langCode = "kn-IN";
        else if (nativeL === "Telugu") langCode = "te-IN";
        else if (nativeL === "Hindi") langCode = "hi-IN";
      }
      utterance.lang = langCode;
      utterance.rate = 0.95;
      utterance.onstart = () => setPlayingVoiceId(id);
      utterance.onend = () => setPlayingVoiceId(null);
      utterance.onerror = () => setPlayingVoiceId(null);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e);
      setPlayingVoiceId(null);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Sync loaded historical document if clicked from vault dashboard
  useEffect(() => {
    if (loadedAnalysis) {
      setAnalysisResult(loadedAnalysis);
      setSelectedType(loadedAnalysis.documentType);
      setIsSaved(true);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }, [loadedAnalysis]);

  // Sync pre-selected document from generator link
  useEffect(() => {
    if (preSelectedDocType) {
      const match = DOCUMENT_OPTIONS.find((opt) => opt.id === preSelectedDocType);
      if (match) setSelectedType(match.id);
    }
  }, [preSelectedDocType]);

  // Utility file loaders
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    
    if (file.size > 15 * 1024 * 1024) {
      setErrorText("File size exceeds the 15MB threshold limit. Please use a smaller file.");
      return;
    }

    setErrorText(null);
    setSelectedFile(file);
    setIsTruncated(false);

    // Make image preview if image
    if (["png", "jpg", "jpeg", "webp"].includes(ext || "")) {
      const reader = new FileReader();
      reader.onload = () => setFilePreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setIsTruncated(false);
    setErrorText(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Convert image to base64 with Canvas Compression if needed
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

          // Resize proportionally if dimension exceeds 1200px
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

          // Standard 80% quality image compression
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

  // Triger actual scanning API
  const handleAnalyzeDocument = async () => {
    if (!selectedFile || !selectedType) return;

    setIsLoading(true);
    setErrorText(null);
    setAnalysisResult(null);
    setIsSaved(false);

    try {
      let textContent = "";
      let imageData: { mimeType: string; data: string } | null = null;

      const ext = selectedFile.name.split(".").pop()?.toLowerCase();
      const isImageValue = ["png", "jpg", "jpeg", "webp"].includes(ext || "");

      if (isImageValue) {
        // Image client processing & compression if > 2MB
        if (selectedFile.size > 2 * 1024 * 1024) {
          const compressedBase64 = await compressAndExtractImageBase64(selectedFile);
          imageData = { mimeType: "image/jpeg", data: compressedBase64 };
        } else {
          const base64 = await fileToBase64(selectedFile);
          imageData = { mimeType: selectedFile.type, data: base64 };
        }
      } else {
        // Handle word, pdf, metadata, txt or any general document types as text content
        textContent = await extractTextFromFile(selectedFile);
        if (textContent.length > 10000) {
          textContent = textContent.substring(0, 10000);
          setIsTruncated(true);
        }
      }

      // Payload parameters
      const payload = {
        documentType: selectedType,
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
        throw new Error(errorData.error || "Server scan encountered an issue.");
      }

      const result = await res.json();
      setAnalysisResult(result);
      setActiveTab("clauses");

      // Scroll into view
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);

    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "AI review service temporarily unavailable. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDFReport = () => {
    if (!analysisResult) return;
    const docTypeInfo = DOCUMENT_OPTIONS.find((opt) => opt.id === selectedType);
    const label = docTypeInfo ? docTypeInfo.labelEn : "Contract Analysis";
    generateAnalysisPDF(analysisResult, label);
  };

  const handleSaveToVaultClick = async () => {
    if (!user) {
      alert("🔒 Please Sign In (using Google login top right) to save your report to your secure Cloud Vault!");
      return;
    }
    if (!analysisResult) return;

    setIsSavingToDb(true);
    try {
      const scanId = "scan_" + Date.now();
      const payload: SavedAnalysis = {
        id: scanId,
        userId: user.uid,
        fileName: selectedFile?.name || `${selectedType}_document_audit.pdf`,
        documentType: selectedType,
        overallRiskScore: analysisResult.overallRiskScore,
        overallVerdict: analysisResult.overallVerdict || { english: "Review Verdict", hindi: "समीक्षा परिणाम" },
        partiesInvolved: analysisResult.partiesInvolved || [],
        riskFlags: analysisResult.riskFlags || [],
        keyObligations: analysisResult.keyObligations || [],
        importantDeadlines: analysisResult.importantDeadlines || [],
        negotiationTips: analysisResult.negotiationTips || [],
        clauseByClause: analysisResult.clauseByClause || [],
        analyzedAt: new Date().toISOString()
      };
      await saveAnalysisResult(payload);
      setIsSaved(true);
    } catch (err) {
      alert("Failed to synchronize with your secure profile.");
    } finally {
      setIsSavingToDb(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setIsSaved(false);
    removeSelectedFile();
    if (onClearLoadedAnalysis) {
      onClearLoadedAnalysis();
    }
  };

  const handleNavigateToGeneratorWithPreselectOnPage = () => {
    if (setDocTypePreSelect) {
      setDocTypePreSelect(selectedType);
    }
    setActivePage("generator");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in space-y-8">
      
      {/* Dynamic spinner loader overlay popup */}
      <LoadingOverlay isVisible={isLoading || isSavingToDb} type={isSavingToDb ? "sync" : "analyze"} />

      {/* Page Header */}
      <div className="text-center md:text-left border-b border-border/15 pb-6">
        <h2 className="text-3xl font-serif font-bold text-text flex items-center justify-center md:justify-start gap-3">
          <FileSearch className="h-8 w-8 text-gold" />
          Document Analyzer
        </h2>
        <p className="text-sm text-gold mt-1 font-semibold italic">दस्तावेज़ विश्लेषक</p>
        <p className="text-xs text-muted max-w-xl mt-2">
          Upload any vendor agreement, lease deed, or MSME contract — our legal AI scans for hidden risks, severe clauses, and time-lines in plain bilingual terms.
        </p>
      </div>

      {!analysisResult ? (
        /* --- BLOCK A: UPLOAD INTERFACE --- */
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Left panel instructions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border/10 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-gold text-5xl">
                📄
              </div>
              <h4 className="text-base font-bold text-gold mb-4">How to Analyze:</h4>
              <ul className="space-y-3.5 text-xs text-text/80 leading-relaxed list-decimal list-inside pl-1">
                <li>Choose the matching contract category in the dropdown.</li>
                <li>Drag and drop your file (.pdf, .jpg, or .png).</li>
                <li>Click <strong>Analyze My Document</strong> to initiate review.</li>
                <li>Review risk cards, download a bilingual compiled report!</li>
              </ul>
            </div>

            <div className="bg-surface/50 border border-border/5 p-5 rounded-2xl">
              <h5 className="text-xs font-semibold text-muted tracking-wider uppercase mb-3 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-gold" />
                Security Guardrail Check Needed?
              </h5>
              <p className="text-[11px] text-muted leading-relaxed">
                Empowered with in-memory buffers. Your data and scanned letters are private and never uploaded to background servers permanently.
              </p>
            </div>
          </div>

          {/* Right panel interactive uploader */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* 1. Category Selection Dropdown */}
            <div className="bg-surface-2 p-5 rounded-2xl border border-border/15 space-y-2">
              <label className="text-[13px] font-bold text-text flex flex-col gap-0.5">
                <span>What type of document is this?</span>
                <span className="text-[11px] text-muted font-normal italic">यह किस प्रकार का दस्तावेज़ है? *</span>
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-surface border border-border/25 rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:border-gold transition-colors"
              >
                <option value="" disabled>-- Select Contract Type --</option>
                {DOCUMENT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.labelEn} — {opt.labelHi}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Drag and Drop Interactive Upload Target */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-surface/30 flex flex-col items-center justify-center min-h-[260px] cursor-pointer ${
                selectedFile ? "border-teal/40 bg-teal/5" : "border-gold/30 hover:border-gold/60"
              }`}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />

              {!selectedFile ? (
                <>
                  <div className="p-4 bg-surface rounded-full border border-gold/10 text-gold mb-4 shadow-[0_0_12px_rgba(212,160,23,0.1)] relative">
                    <Upload className="h-10 w-10 text-gold" />
                    <div className="absolute -bottom-1 -right-1 p-1 bg-surface-2 rounded-full border border-border/10 text-teal">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  
                  <h4 className="text-base font-bold text-text mb-0.5">Drag & drop your document here</h4>
                  <p className="text-xs text-muted mb-4 italic">अपना दस्तावेज़ यहाँ छोड़ें</p>
                  
                  <span className="text-[11px] text-muted mb-4 px-3 py-1 bg-surface-2 rounded-full border border-border/5">— or —</span>
                  
                  <div className="flex flex-wrap gap-2.5 justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.removeAttribute("accept");
                        fileInputRef.current?.click();
                      }}
                      className="px-5 py-2.5 bg-surface text-xs font-bold rounded-lg border border-border hover:border-gold text-gold cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      📁 Browse Any File / फ़ाइल चुनें
                    </button>
                  </div>
                  
                  <p className="text-[11px] text-muted mt-5">
                    Accepted: PDF, Word (DOCX), Text (TXT, MD), Images (PNG, JPG, WEBP) &mdash; Max 15MB
                  </p>
                  <p className="text-[10px] text-muted italic mt-1 font-medium">
                    स्वीकृत: PDF, Word, मूल टेक्स्ट, चित्र (PNG, JPG, WEBP) &mdash; अधिकतम 15MB
                  </p>
                </>
              ) : (
                /* Ready State preview details */
                <div className="w-full max-w-md bg-surface p-4 rounded-xl border border-teal/30 space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-teal/15 border border-teal/30 rounded-lg text-teal">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="truncate max-w-[210px]">
                        <p className="text-xs font-bold text-text truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-muted font-medium mt-0.5">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; ✅ Ready to analyze
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSelectedFile();
                      }}
                      className="p-1 px-1.5 bg-danger/10 text-danger rounded hover:bg-danger/25 text-xs flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {filePreviewUrl && (
                    <div className="border border-border/10 rounded-lg overflow-hidden max-h-40 bg-navy/20 flex items-center justify-center p-2">
                      <img src={filePreviewUrl} alt="Thumbnail preview" className="object-contain max-h-36 rounded" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error notifications */}
            {errorText && (
              <div className="p-4 bg-danger/15 border border-danger/30 rounded-xl text-danger text-xs leading-relaxed flex items-start gap-3">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">Error Scanning Document:</span>
                  <span>{errorText}</span>
                </div>
              </div>
            )}

            {/* Trigger Scanning submit button */}
            <button
              onClick={handleAnalyzeDocument}
              disabled={!selectedFile || !selectedType}
              className={`w-full py-4 rounded-xl text-[14px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                selectedFile && selectedType
                  ? "bg-gold hover:bg-gold-light text-navy hover:scale-102 hover:shadow-[0_0_20px_rgba(212,160,23,0.3)]"
                  : "bg-surface text-muted border border-border/10 cursor-not-allowed"
              }`}
            >
              <span>🔍 Analyze My Document</span>
              <span className="text-[10px] tracking-normal capitalize font-medium opacity-80">(मेरे दस्तावेज़ का विश्लेषण करें)</span>
            </button>

          </div>

        </div>
      ) : (
        /* --- BLOCK B: RESULT LAYOUT VIEW PANEL --- */
        <div ref={resultRef} className="space-y-8 animate-fade-in scroll-mt-20">
          
          {/* Truncated File notice banner */}
          {isTruncated && (
            <div className="p-4 bg-warning/15 border border-warning/30 rounded-xl text-warning text-xs flex items-center gap-3">
              <AlertCircle className="h-4 w-4 inline shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold">Long Document Detected!</span>
                <span className="italic leading-normal text-[11px]">
                  Analyzing first context block. (लंबा दस्तावेज़ मिला — पहले महत्वपूर्ण भाग का विश्लेषण किया जा रहा है)
                </span>
              </div>
            </div>
          )}

          {/* Results Summary Top Header Card */}
          <div className="bg-surface border border-gold/30 rounded-2xl p-6 shadow-xl grid md:grid-cols-5 gap-6 items-center">
            
            <div className="md:col-span-3 space-y-4">
              <div>
                <span className="px-3 py-1 bg-surface-2 border border-border text-xs rounded-full text-text font-bold uppercase tracking-wider">
                  {analysisResult.documentType || "Review Document"}
                </span>
                <h4 className="text-xl font-bold mt-2.5">
                  Scan Analysis Results
                </h4>
              </div>

              {analysisResult.partiesInvolved && analysisResult.partiesInvolved.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted uppercase font-bold tracking-wider">Parties Detected:</span>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {analysisResult.partiesInvolved.map((p: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-navy rounded-lg border border-border/10 text-text font-semibold">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* General safety Verdict calling */}
              {analysisResult.overallVerdict && (
                <div className="p-4 bg-navy/60 rounded-xl border border-gold/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-gold font-bold text-xs uppercase">
                    <BookOpen className="h-4 w-4" />
                    Overall Verdict / समग्र निर्णय
                  </div>
                  <div className="text-xs leading-relaxed space-y-1">
                    <p className="text-text font-medium">{analysisResult.overallVerdict.english}</p>
                    <p className="text-muted italic">{analysisResult.overallVerdict.hindi}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Risk Gauge Panel Column */}
            <div className="md:col-span-2 border-t md:border-t-0 md:border-l border-border/10 pt-6 md:pt-0 pl-0 md:pl-6 flex justify-center">
              <RiskScoreGauge score={analysisResult.overallRiskScore} />
            </div>

          </div>

          {/* Tab Selection Row */}
          <div className="flex flex-wrap gap-1 md:gap-2 border-b border-border/15 pb-px">
            {[
              { id: "clauses", en: "🔍 Clause Review & Risk Audit", hi: "धारा-दर-धारा समीक्षा व जोखिम ऑडिट" },
              { id: "jargon", en: "⚖️ Jargon Translator", hi: "शब्दावली अनुवादक" },
              { id: "obligations", en: "📋 Milestones & obligations", hi: "दायित्व एवं समय-सीमाएं" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 rounded-t-xl transition-all cursor-pointer flex flex-col items-center flex-1 sm:flex-initial text-center ${
                    isActive
                      ? "bg-surface border-t-2 border-x border-gold text-gold"
                      : "text-muted hover:text-text hover:bg-surface-2"
                  }`}
                >
                  <span className="text-xs font-bold leading-none">{tab.en}</span>
                  <span className="text-[10px] opacity-80 italic font-medium mt-1 leading-none">{tab.hi}</span>
                </button>
              );
            })}
          </div>

          {/* --- TAB CONTENT RENDERERS --- */}
          <div className="min-h-[220px]">

            {/* 0. Clause-by-Clause Review Tab */}
            {activeTab === "clauses" && (
              <div className="space-y-4 animate-fade-in text-xs">
                <div className="p-4 bg-surface-2 border border-gold/15 rounded-xl leading-relaxed">
                  <h5 className="font-bold text-navy flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wide">
                    🔍 Unified Clause-by-Clause Review & Risk Audit
                  </h5>
                  <p className="text-muted leading-relaxed">
                    This unified board displays each clause verbatim, pairs it with English + local translations, flags hidden traps or risks, provides fix alternatives, and supports instant 🎙️ **Voice Assistance** reads.
                  </p>
                </div>

                {(!analysisResult.clauseByClause || analysisResult.clauseByClause.length === 0) ? (
                  <div className="space-y-4">
                    {(() => {
                      const fallbacks = [
                        ...(analysisResult.riskFlags || []).map((r: any) => ({
                          clauseTitle: r.riskLevel ? `${r.riskLevel} Issue Element` : "Key Provision",
                          originalText: r.clauseText || "Contract Clause",
                          plainEnglish: "Clause breakdown covering " + (r.riskExplanation?.english || "relevant contract details"),
                          nativeLanguageExplanation: r.riskExplanation?.hindi || "प्रविष्टि विवरण",
                          riskEnglish: r.riskExplanation?.english || "Potential concerns detected.",
                          riskNative: r.riskExplanation?.hindi || "जोखिम की संभावना।",
                          suggestionEnglish: r.whatToDo?.english || "Negotiate or request clarification from partner.",
                          suggestionNative: r.whatToDo?.hindi || "शर्तों पर लिखित मोलभाव करें।",
                          verdict: r.riskLevel === "HIGH" ? "DANGEROUS" : "CONCERN"
                        })),
                        ...(analysisResult.keyObligations || []).map((o: any) => ({
                          clauseTitle: "Service Obligation Clause",
                          originalText: o.obligation || "Contract Clause",
                          plainEnglish: o.obligation || "Action item required on contract schedule",
                          nativeLanguageExplanation: o.obligationHindi || "प्रमुख दायित्व",
                          riskEnglish: o.isOnerous ? "This obligation is onerous or strict." : "Standard administrative requirement.",
                          riskNative: o.isOnerous ? "यह शर्त अत्यंत कडी या अनुचित जोखिम वाली हो सकती है।" : "साधारण प्रशासनिक आवश्यकता।",
                          suggestionEnglish: "Verify physical deliverables and timelines before signing.",
                          suggestionNative: "हस्ताक्षर से पहले काम की समय सीमा जांच लें।",
                          verdict: o.isOnerous ? "CONCERN" : "SAFE"
                        }))
                      ];

                      if (fallbacks.length === 0) {
                        return (
                          <div className="p-8 text-center text-muted bg-surface rounded-2xl border border-border/10">
                            No clauses or key elements parsed in this document.
                          </div>
                        );
                      }

                      return fallbacks.map((clause, idx) => {
                        let badgeColor = "bg-slate-500/10 text-slate-400 border-slate-500/20";
                        let borderStyle = "border-slate-500/30";
                        let statusText = "NEUTRAL";
                        
                        const verdictUpper = (clause.verdict || "NEUTRAL").toUpperCase();
                        if (verdictUpper === "SAFE" || verdictUpper === "FAIR") {
                          badgeColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                          borderStyle = "border-emerald-500/30";
                          statusText = "🟢 SAFE / सुरक्षित";
                        } else if (verdictUpper === "CONCERN" || verdictUpper === "CAUTION") {
                          badgeColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                          borderStyle = "border-amber-500/30";
                          statusText = "⚠️ CONCERN / चिंता का विषय";
                        } else if (verdictUpper === "DANGEROUS" || verdictUpper === "UNFAIR") {
                          badgeColor = "bg-rose-500/10 text-rose-500 border-rose-500/20";
                          borderStyle = "border-rose-500/30";
                          statusText = "🚨 DANGEROUS / खतरनाक";
                        } else {
                          badgeColor = "bg-blue-500/10 text-blue-500 border-blue-500/20";
                          borderStyle = "border-blue-500/30";
                          statusText = "🔵 NEUTRAL / निष्पक्ष";
                        }

                        // Generate unique IDs for TTS triggers
                        const explanationEnId = `fb-explanation-en-${idx}`;
                        const explanationNativeId = `fb-explanation-native-${idx}`;
                        const riskEnId = `fb-risk-en-${idx}`;
                        const riskNativeId = `fb-risk-native-${idx}`;
                        const sugEnId = `fb-sug-en-${idx}`;
                        const sugNativeId = `fb-sug-native-${idx}`;

                        return (
                          <div key={`fallback-clause-${idx}`} className={`bg-surface rounded-2xl border-l-[6px] ${borderStyle} border-y border-r border-border/10 shadow-lg p-5 space-y-4`}>
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/5 pb-2.5">
                              <span className="font-serif font-black text-sm text-navy">
                                {clause.clauseTitle}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest border ${badgeColor}`}>
                                {statusText}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">📜 Original Text Excerpt (मूल दस्तावेज़ की पंक्ति)</span>
                              <div className="p-3 bg-surface-2 rounded-xl border border-border/5 font-mono text-[11.5px] text-navy italic leading-normal select-all">
                                "{clause.originalText}"
                              </div>
                            </div>

                            {/* Section 1: Explanations */}
                            <div className="grid md:grid-cols-2 gap-4 pt-1">
                              <div className="space-y-1.5 bg-navy/20 p-3.5 rounded-xl border border-border/5 text-left relative group">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-navy block text-[10px] uppercase tracking-wide">🇬🇧 Plain English Translation</span>
                                  <button
                                    onClick={() => handleSpeakText(explanationEnId, clause.plainEnglish, "en")}
                                    className="p-1 rounded bg-navy/10 hover:bg-navy/20 transition-colors cursor-pointer text-navy animate-none"
                                    title="Listen to translation"
                                  >
                                    {playingVoiceId === explanationEnId ? <VolumeX className="h-3.5 w-3.5 text-rose-600 animate-pulse" /> : <Volume2 className="h-3.5 w-3.5" />}
                                  </button>
                                </div>
                                <p className="text-text leading-relaxed font-semibold text-xs mt-1">{clause.plainEnglish}</p>
                              </div>

                              <div className="space-y-1.5 bg-gold/5 p-3.5 rounded-xl border border-gold/10 text-left relative group">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-gold block text-[10px] uppercase tracking-wide">🌍 Chosen Language ({userProfile?.nativeLanguage || "Hindi"}) Translation</span>
                                  <button
                                    onClick={() => handleSpeakText(explanationNativeId, clause.nativeLanguageExplanation, "native")}
                                    className="p-1 rounded bg-gold/10 hover:bg-gold/20 transition-colors cursor-pointer text-gold"
                                    title="Listen to native translation"
                                  >
                                    {playingVoiceId === explanationNativeId ? <VolumeX className="h-3.5 w-3.5 text-rose-600 animate-pulse" /> : <Volume2 className="h-3.5 w-3.5" />}
                                  </button>
                                </div>
                                <p className="text-navy font-semibold italic leading-relaxed text-xs mt-1">{clause.nativeLanguageExplanation}</p>
                              </div>
                            </div>

                            {/* Section 2: Risks and Suggestions (Unified inside clause layout) */}
                            <div className="grid md:grid-cols-2 gap-4 border-t border-border/5 pt-3.5">
                              {/* Risks block */}
                              <div className="space-y-1.5 bg-rose-500/[0.02] border border-rose-500/10 p-3.5 rounded-xl text-left">
                                <div className="flex justify-between items-center border-b border-rose-500/10 pb-1 mb-1">
                                  <span className="font-bold text-rose-600 flex items-center gap-1 block text-[10px] uppercase tracking-wide">
                                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> 🇬🇧 Identified Risks (Traps)
                                  </span>
                                  <button
                                    onClick={() => handleSpeakText(riskEnId, clause.riskEnglish, "en")}
                                    className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer text-rose-600"
                                  >
                                    {playingVoiceId === riskEnId ? <VolumeX className="h-3 w-3 text-rose-600 animate-pulse" /> : <Volume2 className="h-3 w-3" />}
                                  </button>
                                </div>
                                <p className="text-text font-medium leading-relaxed">{clause.riskEnglish}</p>
                                <div className="border-t border-dashed border-rose-500/5 pt-1.5 mt-1.5 flex justify-between items-start gap-2">
                                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-900/60 font-mono">Native Translation:</span>
                                  <button
                                    onClick={() => handleSpeakText(riskNativeId, clause.riskNative, "native")}
                                    className="p-0.5 rounded bg-rose-500/5 hover:bg-rose-500/10 transition-colors cursor-pointer text-rose-700 shrink-0"
                                  >
                                    {playingVoiceId === riskNativeId ? <VolumeX className="h-3 w-3 text-rose-600 animate-pulse" /> : <Volume2 className="h-3 w-3" />}
                                  </button>
                                </div>
                                <p className="text-muted italic leading-relaxed text-[11px]">{clause.riskNative}</p>
                              </div>

                              {/* Suggestions block */}
                              <div className="space-y-1.5 bg-emerald-500/[0.02] border border-emerald-500/10 p-3.5 rounded-xl text-left">
                                <div className="flex justify-between items-center border-b border-emerald-500/10 pb-1 mb-1">
                                  <span className="font-bold text-teal flex items-center gap-1 block text-[10px] uppercase tracking-wide">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 🇬🇧 Recommended Fix / Suggestions
                                  </span>
                                  <button
                                    onClick={() => handleSpeakText(sugEnId, clause.suggestionEnglish, "en")}
                                    className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors cursor-pointer text-teal"
                                  >
                                    {playingVoiceId === sugEnId ? <VolumeX className="h-3 w-3 text-rose-600 animate-pulse" /> : <Volume2 className="h-3 w-3" />}
                                  </button>
                                </div>
                                <p className="text-text font-bold leading-relaxed">{clause.suggestionEnglish}</p>
                                <div className="border-t border-dashed border-emerald-500/5 pt-1.5 mt-1.5 flex justify-between items-start gap-2">
                                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-teal/60 font-mono">Native Translation:</span>
                                  <button
                                    onClick={() => handleSpeakText(sugNativeId, clause.suggestionNative, "native")}
                                    className="p-0.5 rounded bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer text-emerald-700 shrink-0"
                                  >
                                    {playingVoiceId === sugNativeId ? <VolumeX className="h-3 w-3 text-rose-600 animate-pulse" /> : <Volume2 className="h-3 w-3" />}
                                  </button>
                                </div>
                                <p className="text-muted italic font-semibold leading-relaxed text-[11px]">{clause.suggestionNative}</p>
                              </div>
                            </div>

                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analysisResult.clauseByClause.map((clause: any, i: number) => {
                      let badgeColor = "bg-slate-500/10 text-slate-400 border-slate-500/20";
                      let borderStyle = "border-slate-500/30";
                      let statusText = "NEUTRAL";
                      
                      const verdictUpper = (clause.verdict || "NEUTRAL").toUpperCase();
                      if (verdictUpper === "SAFE" || verdictUpper === "FAIR") {
                        badgeColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                        borderStyle = "border-emerald-500/30";
                        statusText = "🟢 SAFE / सुरक्षित";
                      } else if (verdictUpper === "CONCERN" || verdictUpper === "CAUTION") {
                        badgeColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                        borderStyle = "border-amber-500/30";
                        statusText = "⚠️ CONCERN / चिंता का विषय";
                      } else if (verdictUpper === "DANGEROUS" || verdictUpper === "UNFAIR") {
                        badgeColor = "bg-rose-500/10 text-rose-500 border-rose-500/20";
                        borderStyle = "border-rose-500/30";
                        statusText = "🚨 DANGEROUS / खतरनाक";
                      } else {
                        badgeColor = "bg-blue-500/10 text-blue-500 border-blue-500/20";
                        borderStyle = "border-blue-500/30";
                        statusText = "🔵 NEUTRAL / निष्पक्ष";
                      }

                      // Dynamic fallback checks for older saved analyses that lack explicit fields
                      const rEn = clause.riskEnglish || (verdictUpper === "DANGEROUS" || verdictUpper === "CONCERN" ? clause.plainEnglish : "No significant risk trapped inside this clause.");
                      const rNative = clause.riskNative || (verdictUpper === "DANGEROUS" || verdictUpper === "CONCERN" ? clause.nativeLanguageExplanation : "इस क्लॉज में कोई विशिष्ट खतरा नहीं पाया गया।");
                      
                      // For suggestions fallback, we look at Saved Contract history as well
                      const sEn = clause.suggestionEnglish || "Verify that the terms match the verbally agreed commercial deliverables before signing.";
                      const sNative = clause.suggestionNative || "सुनिश्चित करें कि हस्ताक्षर करने से पहले यह व्यावसायिक शर्तों के पूरी तरह अनुकूल हो।";

                      // Unique identifiers for voice speech playback keys
                      const explanationEnId = `clause-explanation-en-${i}`;
                      const explanationNativeId = `clause-explanation-native-${i}`;
                      const riskEnId = `clause-risk-en-${i}`;
                      const riskNativeId = `clause-risk-native-${i}`;
                      const sugEnId = `clause-sug-en-${i}`;
                      const sugNativeId = `clause-sug-native-${i}`;

                      return (
                        <div key={`clause-${i}`} className={`bg-surface rounded-2xl border-l-[6px] ${borderStyle} border-y border-r border-border/10 shadow-lg p-5 space-y-4`}>
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/5 pb-2.5">
                            <span className="font-serif font-black text-sm text-navy">
                              {clause.clauseTitle || `Clause Section ${i + 1}`}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest border ${badgeColor}`}>
                              {statusText}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">📜 Original Text Excerpt (मूल दस्तावेज़ की पंक्ति)</span>
                            <div className="p-3 bg-surface-2 rounded-xl border border-border/5 font-mono text-[11.5px] text-navy italic leading-normal select-all">
                              "{clause.originalText || "No context text matched"}"
                            </div>
                          </div>

                          {/* Side by side English + Native explanations */}
                          <div className="grid md:grid-cols-2 gap-4 pt-1">
                            <div className="space-y-1 bg-navy/20 p-3.5 rounded-xl border border-border/5 text-left relative">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-navy block text-[10px] uppercase tracking-wide">
                                  🇬🇧 Plain English Translation (Compulsory)
                                </span>
                                <button
                                  onClick={() => handleSpeakText(explanationEnId, clause.plainEnglish, "en")}
                                  className="p-1 rounded bg-navy/10 hover:bg-navy/20 transition-colors cursor-pointer text-navy"
                                  title="Listen to translation"
                                >
                                  {playingVoiceId === explanationEnId ? <VolumeX className="h-3.5 w-3.5 text-rose-600 animate-pulse" /> : <Volume2 className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                              <p className="text-text leading-relaxed font-semibold text-xs mt-1">
                                {clause.plainEnglish || "Under review"}
                              </p>
                            </div>

                            <div className="space-y-1 bg-gold/5 p-3.5 rounded-xl border border-gold/10 text-left relative">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-gold block text-[10px] uppercase tracking-wide">
                                  🌍 Chosen Language ({userProfile?.nativeLanguage || "Hindi"}) Translation
                                </span>
                                <button
                                  onClick={() => handleSpeakText(explanationNativeId, clause.nativeLanguageExplanation, "native")}
                                  className="p-1 rounded bg-gold/10 hover:bg-gold/20 transition-colors cursor-pointer text-gold"
                                  title="Listen to native translation"
                                >
                                  {playingVoiceId === explanationNativeId ? <VolumeX className="h-3.5 w-3.5 text-rose-600 animate-pulse" /> : <Volume2 className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                              <p className="text-navy font-semibold italic leading-relaxed text-xs mt-1">
                                {clause.nativeLanguageExplanation || "समीक्षा के तहत"}
                              </p>
                            </div>
                          </div>

                          {/* Unified Side by side Risks and Suggestion Fixes */}
                          <div className="grid md:grid-cols-2 gap-4 border-t border-border/5 pt-3.5">
                            {/* Risks block */}
                            <div className="space-y-1.5 bg-rose-500/[0.02] border border-rose-500/10 p-3.5 rounded-xl text-left">
                              <div className="flex justify-between items-center border-b border-rose-500/10 pb-1 mb-1">
                                <span className="font-bold text-rose-600 flex items-center gap-1.5 block text-[10px] uppercase tracking-wide">
                                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> 🇬🇧 Highlighted Trap / Risk Flag
                                </span>
                                <button
                                  onClick={() => handleSpeakText(riskEnId, rEn, "en")}
                                  className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer text-rose-600"
                                >
                                  {playingVoiceId === riskEnId ? <VolumeX className="h-3 w-3 text-rose-600 animate-pulse" /> : <Volume2 className="h-3 w-3" />}
                                </button>
                              </div>
                              <p className="text-text font-medium leading-relaxed">{rEn}</p>
                              
                              <div className="border-t border-dashed border-rose-500/5 pt-1.5 mt-1.5 flex justify-between items-start gap-2">
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-900/60 font-mono">Native Translation:</span>
                                <button
                                  onClick={() => handleSpeakText(riskNativeId, rNative, "native")}
                                  className="p-0.5 rounded bg-rose-500/5 hover:bg-rose-500/10 transition-colors cursor-pointer text-rose-700 shrink-0"
                                >
                                  {playingVoiceId === riskNativeId ? <VolumeX className="h-3 w-3 text-rose-600 animate-pulse" /> : <Volume2 className="h-3 w-3" />}
                                </button>
                              </div>
                              <p className="text-muted italic leading-relaxed text-[11px]">{rNative}</p>
                            </div>

                            {/* Suggestions block */}
                            <div className="space-y-1.5 bg-emerald-500/[0.02] border border-emerald-500/10 p-3.5 rounded-xl text-left">
                              <div className="flex justify-between items-center border-b border-emerald-500/10 pb-1 mb-1">
                                <span className="font-bold text-teal flex items-center gap-1.5 block text-[10px] uppercase tracking-wide">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 🇬🇧 Protection suggestions / Fix Offer
                                </span>
                                <button
                                  onClick={() => handleSpeakText(sugEnId, sEn, "en")}
                                  className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors cursor-pointer text-teal"
                                >
                                  {playingVoiceId === sugEnId ? <VolumeX className="h-3 w-3 text-rose-600 animate-pulse" /> : <Volume2 className="h-3 w-3" />}
                                </button>
                              </div>
                              <p className="text-text font-bold leading-relaxed">{sEn}</p>
                              
                              <div className="border-t border-dashed border-emerald-500/5 pt-1.5 mt-1.5 flex justify-between items-start gap-2">
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-teal/60 font-mono">Native Translation:</span>
                                <button
                                  onClick={() => handleSpeakText(sugNativeId, sNative, "native")}
                                  className="p-0.5 rounded bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer text-emerald-700 shrink-0"
                                >
                                  {playingVoiceId === sugNativeId ? <VolumeX className="h-3 w-3 text-rose-600 animate-pulse" /> : <Volume2 className="h-3 w-3" />}
                                </button>
                              </div>
                              <p className="text-muted italic font-bold leading-relaxed text-[11px]">{sNative}</p>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 1. Jargon Translator Tab */}
            {activeTab === "jargon" && (
              <div className="space-y-4 animate-fade-in text-xs">
                <div className="p-4 bg-surface-2 border border-gold/15 rounded-xl leading-relaxed">
                  <h5 className="font-bold text-navy flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wide">
                    ⚖️ Compulsory Jargon Translating Engine (परम आवश्यक शब्दावली अनुवादक)
                  </h5>
                  <p className="text-muted leading-relaxed">
                    This engine isolates complex legal terminology (legalese) from your contract and translates it into standard plain English alongside your selected native language (<span className="font-bold text-gold">{userProfile?.nativeLanguage || "Hindi"}</span>).
                  </p>
                </div>

                {(!analysisResult.riskFlags || analysisResult.riskFlags.length === 0) && (!analysisResult.keyObligations || analysisResult.keyObligations.length === 0) ? (
                  <div className="p-8 text-center text-muted bg-surface rounded-2xl border border-border/10">
                    No complex legalese clauses detected for translation. (अनुवाद के लिए कोई शब्दावली नहीं मिली)
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analysisResult.riskFlags?.map((risk: any, i: number) => (
                      <div key={`jargon-risk-${i}`} className="bg-surface rounded-2xl border border-border/10 shadow-lg p-5 space-y-3.5">
                        <div className="flex items-center justify-between">
                           <span className="px-2.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase tracking-widest bg-gold/10 text-gold border border-gold/20">
                            Clause Excerpt {i + 1}
                          </span>
                        </div>
                        
                        <div className="p-3.5 bg-surface-2 rounded-xl border border-border/5 font-mono text-[11px] text-navy italic leading-normal select-all">
                          "{risk.clauseText || "Problematic contract excerpt"}"
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 border-t border-border/15 pt-3.5">
                          <div className="space-y-1 text-left">
                            <span className="font-bold text-navy block text-[10px] uppercase tracking-wide">🇬🇧 Plain English Translation (Compulsory)</span>
                            <p className="text-text leading-relaxed font-semibold">{risk.riskExplanation?.english}</p>
                          </div>
                          <div className="space-y-1 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-border/15 pt-3 md:pt-0 text-left">
                            <span className="font-bold text-gold block text-[10px] uppercase tracking-wide">🌍 {userProfile?.nativeLanguage || "Hindi"} Translation</span>
                            <p className="text-navy font-semibold italic leading-relaxed">{risk.riskExplanation?.hindi}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {analysisResult.keyObligations?.map((ob: any, i: number) => (
                      <div key={`jargon-ob-${i}`} className="bg-surface rounded-2xl border border-border/10 shadow-lg p-5 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase tracking-widest bg-teal/10 text-teal border border-teal/20">
                            Service Obligation Segment {i + 1}
                          </span>
                        </div>
                        
                        <div className="p-3.5 bg-surface-2 rounded-xl border border-border/5 font-mono text-[11px] text-navy italic leading-normal">
                          "{ob.obligation}"
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 border-t border-border/15 pt-3.5">
                          <div className="space-y-1 text-left">
                            <span className="font-bold text-navy block text-[10px] uppercase tracking-wide">🇬🇧 Plain English Translation (Compulsory)</span>
                            <p className="text-text leading-relaxed font-semibold">{ob.obligation}</p>
                          </div>
                          <div className="space-y-1 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-border/15 pt-3 md:pt-0 text-left">
                            <span className="font-bold text-gold block text-[10px] uppercase tracking-wide">🌍 {userProfile?.nativeLanguage || "Hindi"} Translation</span>
                            <p className="text-navy font-semibold italic leading-relaxed">{ob.obligationHindi}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Obligations Tab */}
            {activeTab === "obligations" && (
              <div className="bg-surface rounded-2xl border border-border/10 overflow-hidden text-xs animate-fade-in">
                {(!analysisResult.keyObligations || analysisResult.keyObligations.length === 0) ? (
                  <div className="p-8 text-center text-muted">No obligations mentioned | कोई विशिष्ट दायित्व नहीं मिला।</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-2 text-gold border-b border-border/10 font-bold">
                          <th className="p-4">What You Agree To / आपको क्या करना है</th>
                          <th className="p-4 w-44">Deadline / समय-सीमा</th>
                          <th className="p-4 text-center w-32">Risk Level / खतरा स्तर</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/5">
                        {analysisResult.keyObligations.map((ob: any, idx: number) => (
                          <tr key={idx} className="hover:bg-surface-2/40 transition-colors">
                            <td className="p-4 space-y-1">
                              <p className="font-semibold text-text">{ob.obligation}</p>
                              <p className="text-muted italic text-[11px] font-normal leading-normal">{ob.obligationHindi}</p>
                            </td>
                            <td className="p-4 text-text font-semibold">
                              {ob.deadline || <span className="text-muted italic">Not specified</span>}
                            </td>
                            <td className="p-4 text-center">
                              {ob.isOnerous ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-rose-600 text-[9px] font-extrabold uppercase tracking-wide">
                                  ⚠️ High Concern
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal/15 border border-teal/30 text-teal text-[9px] font-extrabold uppercase tracking-wide">
                                  ✅ Standard Term
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Bottom Results Action Bar */}
          <div className="bg-surface border border-gold/25 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
            <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
              <button
                onClick={handleDownloadPDFReport}
                className="px-5 py-3 bg-gold hover:bg-gold-light text-navy font-bold rounded-xl shadow-md transition-all text-xs uppercase cursor-pointer"
              >
                📥 Download PDF Report
              </button>
              
              {isSaved ? (
                <button
                  disabled
                  className="px-5 py-3 bg-teal/10 text-teal border border-teal/40 rounded-xl text-xs uppercase font-bold flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4 stroke-[3]" /> Saved to Vault / सहेजा गया
                </button>
              ) : (
                <button
                  onClick={handleSaveToVaultClick}
                  className="px-5 py-3 bg-navy border border-gold/40 hover:border-gold hover:bg-surface text-gold font-bold rounded-xl text-xs uppercase cursor-pointer flex items-center gap-1.5 transition-all"
                  title="Save results securely in your Legal Vault"
                >
                  <Save className="h-4 w-4" /> Save to Vault / सहेजें
                </button>
              )}

              <button
                onClick={handleReset}
                className="px-4 py-3 bg-surface-2 text-text border border-border/15 hover:border-gold rounded-xl text-xs uppercase cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Analyze Another
              </button>
            </div>

            <button
              onClick={handleNavigateToGeneratorWithPreselectOnPage}
              className="w-full md:w-auto px-5 py-3 bg-teal/10 hover:bg-teal/20 text-teal border border-teal/30 hover:border-teal rounded-xl text-xs uppercase font-bold cursor-pointer transition-all text-center"
            >
              📝 Draft Better Agreement / बेहतर अनुबंध बनाएं
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
