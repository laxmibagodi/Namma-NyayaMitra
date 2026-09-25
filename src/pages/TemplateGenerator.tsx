import React, { useState, useEffect, useRef } from "react";
import { FileCode, FileText, Check, AlertTriangle, Copy, Download, RefreshCw, FileSearch, HelpCircle, ArrowRight, Save, Lock } from "lucide-react";
import { DOCUMENT_TYPES, FieldDefinition, DocumentTypeInfo } from "../utils/constants";
import { generateTemplatePDF } from "../services/pdfGenerator";
import LoadingOverlay from "../components/LoadingOverlay";
import BilingualLabel from "../components/BilingualLabel";
import { useAuth } from "../context/AuthContext";
import { saveDraftContract, SavedContract } from "../services/firebase";

interface TemplateGeneratorProps {
  viewMode: "both" | "en" | "hi";
  setActivePage: (page: string) => void;
  preSelectedType?: string;
  setPreSelectedType?: (type: string) => void;
  // Shared text passage to send back to Analyzer
  setAnalyzerInitialTextShare?: (text: string) => void;
  loadedContract?: SavedContract | null;
  onClearLoadedContract?: () => void;
}

export default function TemplateGenerator({
  viewMode,
  setActivePage,
  preSelectedType,
  setPreSelectedType,
  setAnalyzerInitialTextShare,
  loadedContract,
  onClearLoadedContract
}: TemplateGeneratorProps) {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<string>("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // API outcomes
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  
  // Clipboard copied notice state
  const [isCopied, setIsCopied] = useState(false);

  // References
  const formRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Load historical typed contract if tapped from legal vault locker
  useEffect(() => {
    if (loadedContract) {
      setSelectedType(loadedContract.formValues?.documentType || "vendor");
      setGeneratedResult({
        documentTitle: loadedContract.documentTitle,
        documentBody: loadedContract.documentBody,
        plainEnglishSummary: loadedContract.plainEnglishSummary,
        hindiSummary: loadedContract.hindiSummary,
        keyProtections: loadedContract.keyProtections,
        importantReminder: loadedContract.importantReminder,
        importantReminderHindi: loadedContract.importantReminderHindi,
      });
      setFormValues(loadedContract.formValues);
      setFormErrors({});
      setIsSaved(true);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }, [loadedContract]);

  // Load preselected types if directed from analyzer linkage
  useEffect(() => {
    if (preSelectedType) {
      setSelectedType(preSelectedType);
      // Initialize empty/default values
      const doc = DOCUMENT_TYPES.find((d) => d.id === preSelectedType);
      if (doc) {
        const init: Record<string, string> = {};
        doc.fields.forEach((f) => {
          init[f.name] = "";
        });
        setFormValues(init);
        setFormErrors({});
      }
    }
  }, [preSelectedType]);

  const handleSelectDocType = (typeId: string) => {
    setSelectedType(typeId);
    setGeneratedResult(null);
    setIsSaved(false);
    if (setPreSelectedType) {
      setPreSelectedType(typeId);
    }

    const doc = DOCUMENT_TYPES.find((d) => d.id === typeId);
    if (doc) {
      const init: Record<string, string> = {};
      doc.fields.forEach((f) => {
        init[f.name] = "";
      });
      setFormValues(init);
      setFormErrors({});
    }

    // Scroll down to fields
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
    if (value.trim()) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldName];
        return copy;
      });
    }
  };

  // Perform basic client field validation before sending over base64 string
  const validateForm = (fields: FieldDefinition[]): boolean => {
    const errors: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && !formValues[f.name]?.trim()) {
        errors[f.name] = `${f.labelEn} is required / यह जानकारी खाली नहीं रह सकती।`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const doc = DOCUMENT_TYPES.find((d) => d.id === selectedType);
    if (!doc) return;

    if (!validateForm(doc.fields)) {
      // Find first error scroll
      const errorField = Object.keys(formErrors)[0];
      if (errorField) {
        document.getElementsByName(errorField)[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsLoading(true);
    setGeneratedResult(null);

    try {
      const payload = {
        documentType: doc.titleEn,
        formValues: formValues,
      };

      const res = await fetch("/api/generate-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Server drafting service failed.");
      }

      const outcome = await res.json();
      setGeneratedResult(outcome);

      // Scroll smoothly list result panel into view
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Could not draft legal document at this time. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentDocType = DOCUMENT_TYPES.find((d) => d.id === selectedType);

  const handleDownloadPDFLocal = () => {
    if (!generatedResult || !currentDocType) return;
    generateTemplatePDF(generatedResult, currentDocType.titleEn);
  };

  const handleCopyToClipboard = () => {
    if (!generatedResult) return;
    const fullText = `${generatedResult.documentTitle}\n\n${generatedResult.documentBody}`;
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSelfAnalysisLink = () => {
    if (!generatedResult || !setAnalyzerInitialTextShare) return;
    setAnalyzerInitialTextShare(`${generatedResult.documentTitle}\n\n${generatedResult.documentBody}`);
    if (setPreSelectedType) {
      setPreSelectedType(selectedType);
    }
    setActivePage("analyzer");
  };

  const handleSaveDraftToVaultClick = async () => {
    if (!user) {
      alert("🔒 Please Sign In (using Google login top right) to save this agreement to your secure Cloud Vault!");
      return;
    }
    if (!generatedResult) return;

    setIsSavingToDb(true);
    try {
      const draftId = "draft_" + Date.now();
      const valuesWithContext = {
        ...formValues,
        documentType: selectedType
      };
      const payload: SavedContract = {
        id: draftId,
        userId: user.uid,
        documentTitle: generatedResult.documentTitle || "Agreement Deed",
        documentBody: generatedResult.documentBody || "",
        plainEnglishSummary: generatedResult.plainEnglishSummary || "",
        hindiSummary: generatedResult.hindiSummary || "",
        keyProtections: generatedResult.keyProtections || [],
        importantReminder: generatedResult.importantReminder || "",
        importantReminderHindi: generatedResult.importantReminderHindi || "",
        formValues: valuesWithContext,
        createdAt: new Date().toISOString()
      };
      await saveDraftContract(payload);
      setIsSaved(true);
    } catch (err) {
      alert("Failed to synchronize draft with your secure profile.");
    } finally {
      setIsSavingToDb(false);
    }
  };

  const handleResetForm = () => {
    setGeneratedResult(null);
    setIsSaved(false);
    setSelectedType("");
    setFormValues({});
    setFormErrors({});
    if (onClearLoadedContract) {
      onClearLoadedContract();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in space-y-8">
      
      {/* Dynamic spinner loader overlay popup */}
      <LoadingOverlay isVisible={isLoading || isSavingToDb} type={isSavingToDb ? "sync" : "generate"} />

      {/* Page Header */}
      <div className="text-center md:text-left border-b border-border/15 pb-6">
        <h2 className="text-3xl font-serif font-bold text-text flex items-center justify-center md:justify-start gap-3">
          <FileCode className="h-8 w-8 text-gold" />
          Template Generator
        </h2>
        <p className="text-sm text-gold mt-1 font-semibold italic">टेम्पलेट जनरेटर</p>
        <p className="text-xs text-muted max-w-xl mt-2">
          Generate professional, legally sound Indian business agreements and contract drafts in minutes using plain parameters.
        </p>
      </div>

      {!generatedResult ? (
        /* --- BLOCK I: TYPES CARDS & DYNAMIC FORMS --- */
        <div className="space-y-8">
          
          {/* Step 1: Select Type Section */}
          <div className="space-y-4">
            <BilingualLabel
              en="Choose document type you wish to draft:"
              hi="दस्तावेज़ प्रकार चुनें जिसे आप ड्राफ्ट करना चाहते हैं:"
              classNameEn="text-lg font-bold text-text"
              classNameHi="text-xs text-muted italic"
            />

            {/* Grid selector cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DOCUMENT_TYPES.map((doc) => {
                const isSelected = selectedType === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDocType(doc.id)}
                    className={`p-5 rounded-2xl border cursor-pointer text-left flex flex-col justify-between transition-all relative overflow-hidden h-40 ${
                      isSelected
                        ? "border-gold bg-gold/5 shadow-[0_0_15px_rgba(212,160,23,0.15)] scale-[1.01]"
                        : "border-border/10 bg-surface hover:border-gold/40 hover:bg-surface-2"
                    }`}
                  >
                    {/* Background glow node */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 p-1.5 bg-gold text-navy rounded-bl-xl">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-bold text-text text-sm mb-1 group-hover:text-gold">
                        {doc.titleEn}
                      </h4>
                      <p className="text-[11px] text-muted italic leading-none mb-3">{doc.titleHi}</p>
                      
                      <p className="text-[11px] text-text/80 leading-relaxed truncate">{doc.descEn}</p>
                      <p className="text-[10px] text-muted leading-relaxed italic truncate">{doc.descHi}</p>
                    </div>

                    <span className="text-[10px] text-gold font-bold uppercase tracking-wider block mt-2">
                      Select Draft →
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Form submission */}
          {selectedType && currentDocType && (
            <div ref={formRef} className="bg-surface border border-border/15 rounded-2xl p-6 shadow-xl scroll-mt-20">
              
              <div className="border-b border-border/10 pb-4 mb-6">
                <h4 className="text-base font-bold text-gold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gold" />
                  Fill in the details for: {currentDocType.titleEn}
                </h4>
                <p className="text-xs text-muted italic mt-1">अनुबंध विवरण भरें (हिंदी अनुवाद नीचे उपलब्ध है)</p>
              </div>

              {/* Grid block forms */}
              <form onSubmit={handleGenerateTemplate} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                  {currentDocType.fields.map((f) => (
                    <div key={f.name} className="space-y-1.5" name={f.name}>
                      <label className="text-xs font-bold text-text flex flex-col gap-0.5">
                        <span>{f.labelEn} {f.required && <strong className="text-danger">*</strong>}</span>
                        <span className="text-[10px] text-muted font-normal italic">{f.labelHi}</span>
                      </label>
                      <input
                        type={f.type}
                        value={formValues[f.name] || ""}
                        placeholder={f.placeholderEn}
                        onChange={(e) => handleInputChange(f.name, e.target.value)}
                        className={`w-full bg-surface-2 border rounded-xl px-4 py-3 text-xs text-text focus:outline-none focus:border-gold transition-colors ${
                          formErrors[f.name] ? "border-danger/60 focus:border-danger" : "border-border/25"
                        }`}
                      />
                      {formErrors[f.name] && (
                        <p className="text-[10px] text-danger italic font-medium">{formErrors[f.name]}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Submit Panel */}
                <div className="border-t border-border/10 pt-6 flex flex-col items-center">
                  <button
                    type="submit"
                    className="w-full max-w-md py-4 bg-gold hover:bg-gold-light text-navy font-bold rounded-xl shadow-lg shadow-gold/25 hover:scale-102 hover:shadow-gold-light/40 transition-all uppercase tracking-wider cursor-pointer text-xs"
                  >
                    ⚡ Generate Document / दस्तावेज़ बनाएं
                  </button>
                  <p className="text-[10px] text-muted tracking-wide mt-2">
                    Takes around 10-15 seconds process via professional Indian Act standards.
                  </p>
                </div>

              </form>

            </div>
          )}

        </div>
      ) : (
        /* --- BLOCK II: GENERATED OUTPUT LIVE PREVIEW --- */
        <div ref={resultRef} className="grid lg:grid-cols-12 gap-8 animate-fade-in scroll-mt-20">
          
          {/* Left panel paper representation (desktop spans 7) */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="flex justify-between items-center bg-surface border border-border/10 p-3 rounded-xl px-4">
              <span className="text-xs text-gold flex items-center gap-1.5 font-bold">
                <Check className="h-4 w-4 stroke-[3]" /> Printer Friendly Draft Preview
              </span>
              <span className="text-[10px] text-muted italic">Draft compiled at: {new Date().toLocaleDateString("en-IN")}</span>
            </div>

            {/* Pure document text visualization card */}
            <div className="bg-white text-navy-800 p-8 sm:p-12 rounded-xl border border-gray-300 shadow-2xl relative overflow-y-auto max-h-[640px] leading-relaxed select-text flex flex-col font-serif gap-4 print-paper">
              
              {/* Background watermark */}
              <div className="absolute inset-0 select-none flex items-center justify-center opacity-[0.03] pointer-events-none transform -rotate-45 font-sans font-black text-4xl text-navy">
                Namma NyayaMitra Draft
              </div>

              <div className="relative z-10 space-y-4 text-xs tracking-normal font-sans">
                {/* Formal Header centered */}
                <h3 className="text-center font-bold text-sm sm:text-base border-b-2 border-navy/30 pb-3 uppercase underline text-navy">
                  {generatedResult.documentTitle || "AGREEMENT DEED"}
                </h3>

                {/* Clauses and paragraph formatting lines rendering */}
                <div className="space-y-4.5 whitespace-pre-wrap text-justify text-slate-800 pr-1">
                  {generatedResult.documentBody}
                </div>

                {/* Signature panels bottom */}
                <div className="pt-12 grid grid-cols-2 gap-6 font-sans">
                  <div className="border-t border-slate-400 pt-3">
                    <p className="font-bold text-[10px]">SIGNATURE OF DISCLOSER / FIRST PARTY</p>
                    <p className="text-muted text-[9px] mt-1">Name: ______________________</p>
                    <p className="text-muted text-[9px]">Date & Seal:</p>
                  </div>
                  <div className="border-t border-slate-400 pt-3">
                    <p className="font-bold text-[10px]">SIGNATURE OF RECEIVER / SECOND PARTY</p>
                    <p className="text-muted text-[9px] mt-1">Name: ______________________</p>
                    <p className="text-muted text-[9px]">Date & Seal:</p>
                  </div>
                </div>

                {/* Witness panel */}
                <div className="pt-8 border-t border-dashed border-slate-300 grid grid-cols-2 gap-6 font-sans">
                  <div>
                    <p className="font-bold text-[10px]">WITNESS 1 SIGNATURE</p>
                    <p className="text-muted text-[9px] mt-1">Name / Address: _________________</p>
                  </div>
                  <div>
                    <p className="font-bold text-[10px]">WITNESS 2 SIGNATURE</p>
                    <p className="text-muted text-[9px] mt-1">Name / Address: _________________</p>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Right panel summary and protectors (desktop spans 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Outline Summaries block */}
            <div className="bg-surface border border-border/10 p-5 rounded-2xl shadow-lg space-y-4">
              <h4 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="h-4.5 w-4.5 text-gold" />
                What This Document Does / यह दस्तावेज़ क्या करता है
              </h4>

              <div className="p-4 bg-navy/60 border-l-2 border-gold rounded-xl space-y-1">
                <span className="text-[10px] text-gold font-bold uppercase block">🇬🇧 Summary</span>
                <p className="text-xs text-text leading-relaxed">{generatedResult.plainEnglishSummary}</p>
              </div>

              <div className="p-4 bg-navy/60 border-l-2 border-teal rounded-xl space-y-1">
                <span className="text-[10px] text-teal font-bold uppercase block">🇮🇳 सारांश</span>
                <p className="text-xs text-muted leading-relaxed italic">{generatedResult.hindiSummary}</p>
              </div>
            </div>

            {/* Protections list */}
            {generatedResult.keyProtections && generatedResult.keyProtections.length > 0 && (
              <div className="bg-surface border border-border/10 p-5 rounded-2xl shadow-lg space-y-3">
                <h4 className="text-xs font-bold text-gold uppercase tracking-wider">
                  Bilingual Protections Standard
                </h4>
                <div className="space-y-3">
                  {generatedResult.keyProtections.map((p: string, i: number) => (
                    <div key={i} className="flex gap-2.5 items-start text-xs text-text/90">
                      <div className="w-5 h-5 rounded bg-teal/15 border border-teal/30 text-teal flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                        {i + 1}
                      </div>
                      <p className="leading-relaxed">{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important reminder popup box */}
            <div className="bg-danger/5 border border-danger/30 p-5 rounded-2xl space-y-2.5 shadow-md">
              <span className="text-xs font-bold text-danger flex items-center gap-1.5 uppercase">
                <AlertTriangle className="h-4.5 w-4.5 text-danger animate-pulse" />
                Important Signing Reminder
              </span>
              <div className="text-xs leading-relaxed space-y-1">
                <p className="text-text font-medium">{generatedResult.importantReminder}</p>
                <p className="text-muted italic text-[11px] pt-1 border-t border-border/5">{generatedResult.importantReminderHindi}</p>
              </div>
            </div>

            {/* Action Bar compilations */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleDownloadPDFLocal}
                className="w-full py-3.5 bg-gold hover:bg-gold-light text-navy font-bold rounded-xl shadow-lg transition-all text-xs uppercase cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" /> Download PDF / ड्राफ्ट डाउनलोड करें
              </button>

              {isSaved ? (
                <div className="w-full py-3 bg-teal/10 text-teal border border-teal/30 rounded-xl text-xs uppercase font-extrabold flex items-center justify-center gap-1.5 shadow-sm">
                  <Check className="h-4 w-4 stroke-[3]" /> Saved to Vault / तिजोरी में सुरक्षित
                </div>
              ) : (
                <button
                  onClick={handleSaveDraftToVaultClick}
                  className="w-full py-3 bg-navy border border-gold/40 hover:border-gold hover:bg-surface text-gold font-bold rounded-xl text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  title="Store this contract draft securely in your profile"
                >
                  <Save className="h-4 w-4" /> Save Draft to Vault / अनुबंध सहेजें
                </button>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyToClipboard}
                  className="py-3 bg-surface border border-border hover:border-gold text-text rounded-xl text-xs uppercase cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Copy className="h-4 w-4" />
                  {isCopied ? "✅ Copied!" : "Copy Clipboard"}
                </button>
                <button
                  onClick={handleSelfAnalysisLink}
                  className="py-3 bg-teal/10 hover:bg-teal/20 text-teal border border-teal/30 hover:border-teal rounded-xl text-xs font-bold uppercase cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <FileSearch className="h-4 w-4" /> Self Analysis
                </button>
              </div>

              <button
                onClick={handleResetForm}
                className="w-full py-3 text-muted hover:text-text text-center text-xs underline cursor-pointer hover:font-bold transition-all flex items-center justify-center gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Draft/Generate Another Agreement
              </button>
            </div>

          </div>

          {/* Legal Warning Disclaimer Bottom Banner */}
          <div className="lg:col-span-12 p-5 bg-warning/10 border-l-4 border-warning rounded-r-2xl text-xs space-y-1 leading-relaxed mt-4 shadow-md">
            <span className="font-bold text-warning uppercase flex items-center gap-1.5 text-[11px] mb-1">
              <AlertTriangle className="h-4.5 w-4.5 text-warning" />
              AI Compliance Disclosure / चेतावनी सूचना
            </span>
            <p className="text-text">
              ⚠️ This document was generated automatically by artificial intelligence. It is intended as a starting reference draft only.
              For any transaction above ₹10,000 or disputable trades, please have this deed certified, stamped, or reviewed by a qualified advocate/lawyer before executing signature binding.
            </p>
            <p className="text-muted italic text-[11px] pt-1 mt-1 border-t border-border/5">
              ⚠️ यह दस्तावेज़ AI द्वारा स्वचालित बनाया गया है और केवल प्राथमिक सहायता-डीड (प्रारंभिक ड्राफ्ट) है।
              ₹10,000 या अधिक के किसी भी वाणिज्यिक लेनदेन के लिए, सुरक्षा हेतु हस्ताक्षर करने से पहले कानूनी रूप से इसे योग्य वकील से प्रमाणित ज़रूर करवाएं।
            </p>
          </div>

        </div>
      )}

      <style>{`
        /* Custom print-preview class to output real document typography styles */
        .print-paper {
          background-color: #FFFFFF !important;
          color: #1A202C !important;
          font-family: 'Georgia', serif !important;
        }
        .print-paper p, .print-paper span, .print-paper h3 {
          color: #1A202C !important;
        }
      `}</style>

    </div>
  );
}
