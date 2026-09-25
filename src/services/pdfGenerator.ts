import { jsPDF } from "jspdf";

/**
 * Compiles a professional bilingual risk analysis report into a modern PDF.
 */
export function generateAnalysisPDF(analysisData: any, docTypeLabel: string) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let y = 20;

  // Helper to append text and handle paging
  const addText = (text: string, fontSize: number, style: "normal" | "bold" | "italic" = "normal", color = "#1A202C", lineSpacing = 6) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(fontSize);
    
    // Convert hex color to RGB
    if (color.startsWith("#")) {
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      doc.setTextColor(r, g, b);
    } else {
      doc.setTextColor(26, 32, 44);
    }

    const lines = doc.splitTextToSize(text, contentWidth);
    for (const line of lines) {
      if (y > pageHeight - 30) {
        addFooter(doc, pageWidth, pageHeight);
        doc.addPage();
        y = 25; // Reset y on new page
      }
      doc.text(line, margin, y);
      y += lineSpacing;
    }
  };

  const addLine = (spacingBefore = 4, spacingAfter = 6) => {
    y += spacingBefore;
    doc.setDrawColor(212, 160, 23); // Gold-ish border
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += spacingAfter;
  };

  const addHeader = (title: string, subtitle: string) => {
    // Top banner
    doc.setFillColor(13, 17, 23); // --navy
    doc.rect(0, 0, pageWidth, 40, "F");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(214, 160, 23); // --gold
    doc.text("NyayaAI (न्यायमित्र)", margin, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(139, 148, 158); // --muted
    doc.text("Legal Shield for MSMEs / छोटे व्यवसायों के लिए कानूनी सुरक्षा", margin, 24);

    y = 52;
    addText(title, 16, "bold", "#0D1117");
    addText(subtitle, 11, "italic", "#D4A017", 5);
    addLine(2, 4);
  };

  const addFooter = (d: jsPDF, w: number, h: number) => {
    d.setFont("helvetica", "normal");
    d.setFontSize(8);
    d.setTextColor(139, 148, 158);
    d.line(margin, h - 22, w - margin, h - 22);
    d.text("Disclaimer: NyayaAI provides AI-powered information, not formal legal advice.", margin, h - 17);
    d.text("न्यायमित्र AI-आधारित जानकारी प्रदान करता है, कानूनी सलाह नहीं।", margin, h - 13);
    d.text(`Page ${d.internal.pages.length - 1}`, w - margin - 15, h - 15);
  };

  // --- PAGE 1: TITLE, SUMMARY & RISK GAUGE ---
  addHeader(
    `Contract Review: ${docTypeLabel}`,
    `Generated on: ${new Date().toLocaleDateString("en-IN")}`
  );

  // Parties involved
  const parties = analysisData.partiesInvolved?.join(" VS ") || "Undetected Parties";
  addText(`Parties Involved: ${parties}`, 12, "bold", "#0D1117");
  y += 4;

  // Draw Score Box
  const score = analysisData.overallRiskScore ?? 50;
  let scoreColor = "#2DD4BF"; // Teal
  let scoreText = "LOW RISK / कम जोखिम";
  if (score > 30 && score <= 65) {
    scoreColor = "#E3B341"; // Warning
    scoreText = "MEDIUM RISK / मध्यम जोखिम";
  } else if (score > 65) {
    scoreColor = "#F85149"; // Danger
    scoreText = "HIGH RISK / उच्च जोखिम";
  }

  // Draw a colored rounded card
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(212, 160, 23);
  doc.rect(margin, y, contentWidth, 32);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(26, 32, 44);
  doc.text("OVERALL CONTRACT RISK PROFILE / कुल जोखिम प्रोफाइल", margin + 6, y + 8);
  
  doc.setFontSize(26);
  doc.setTextColor(
    scoreColor === "#F85149" ? 248 : scoreColor === "#E3B341" ? 227 : 45,
    scoreColor === "#F85149" ? 81 : scoreColor === "#E3B341" ? 179 : 212,
    scoreColor === "#F85149" ? 73 : scoreColor === "#E3B341" ? 65 : 191
  );
  doc.text(`${score} / 100`, margin + 6, y + 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text(`Rating: ${scoreText}`, margin + 6, y + 27);

  y += 38;

  // Document Summary
  addText("EXECUTIVE BILINGUAL SUMMARY / कार्यपालक सारांश", 13, "bold", "#D4A017");
  y += 2;
  addText(`English: ${analysisData.documentSummary?.english || "N/A"}`, 10, "normal", "#161B22", 5);
  y += 2;
  addText(`Hindi (हिंदी): ${analysisData.documentSummary?.hindi || "N/A"}`, 10, "normal", "#161B22", 5);
  
  y += 4;
  addText("VERDICT / निर्णय", 13, "bold", "#D4A017");
  y += 2;
  addText(`English: ${analysisData.overallVerdict?.english || "N/A"}`, 10, "normal", "#161B22", 5);
  y += 2;
  addText(`Hindi (हिंदी): ${analysisData.overallVerdict?.hindi || "N/A"}`, 10, "normal", "#4A5568", 5);

  // Ready for Page 2
  addFooter(doc, pageWidth, pageHeight);
  doc.addPage();
  y = 25;

  // --- PAGE 2+: RISK FLAGS ---
  addText("CONTRACT RISK DETAILS & HIGH-ALERT CLAUSES / जोखिम क्लॉज विवरण", 15, "bold", "#D4A017");
  addLine(2, 4);

  const riskFlags = analysisData.riskFlags || [];
  if (riskFlags.length === 0) {
    addText("✅ No critical risk clauses detected. / कोई महत्वपूर्ण जोखिम नहीं मिला।", 12, "bold", "#3FB950");
  } else {
    riskFlags.forEach((flag: any, idx: number) => {
      let riskLvlColor = "#3FB950";
      if (flag.riskLevel === "HIGH") riskLvlColor = "#F85149";
      else if (flag.riskLevel === "MEDIUM") riskLvlColor = "#E3B341";

      addText(`Risk Clause #${idx + 1} [${flag.riskLevel || "LOW"}]`, 11, "bold", riskLvlColor);
      y += 1;
      
      // Clause verbatim excerpt
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      const textBlock = `"${flag.clauseText}"`;
      const textLines = doc.splitTextToSize(textBlock, contentWidth - 10);
      const boxHeight = textLines.length * 5 + 6;
      doc.rect(margin, y, contentWidth, boxHeight, "F");
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(113, 128, 150);
      textLines.forEach((line: string, lineIdx: number) => {
        doc.text(line, margin + 5, y + 5 + lineIdx * 5);
      });
      y += boxHeight + 4;

      addText(`What this means: ${flag.riskExplanation?.english || "N/A"}`, 10, "normal", "#1A202C", 5);
      addText(`इसका मतलब: ${flag.riskExplanation?.hindi || "N/A"}`, 9.5, "italic", "#4A5568", 4.5);
      y += 2;
      addText(`What you should do: ${flag.whatToDo?.english || "N/A"}`, 10, "bold", "#2DD4BF", 5);
      addText(`क्या करें: ${flag.whatToDo?.hindi || "N/A"}`, 9.5, "italic", "#0D9488", 4.5);

      addLine(4, 4);
    });
  }

  // --- PAGE 3: OBLIGATIONS & DEADLINES & TIPS ---
  addFooter(doc, pageWidth, pageHeight);
  doc.addPage();
  y = 25;

  addText("KEY AGREED OBLIGATIONS / मुख्य दायित्व", 15, "bold", "#D4A017");
  addLine(2, 4);

  const obligations = analysisData.keyObligations || [];
  if (obligations.length === 0) {
    addText("No specific obligations listed/कोई विशेष दायित्व नहीं मिले।", 10, "italic", "#718096");
    y += 2;
  } else {
    obligations.forEach((ob: any, idx: number) => {
      const icon = ob.isOnerous ? "⚠️ " : "✅ ";
      addText(`${icon}Obligation #${idx + 1} ${ob.deadline ? `[Deadline: ${ob.deadline}]` : ""}`, 11, "bold", ob.isOnerous ? "#E3B341" : "#1A202C");
      y += 1;
      addText(`English: ${ob.obligation}`, 10, "normal", "#1A202C", 5);
      addText(`Hindi: ${ob.obligationHindi}`, 9.5, "normal", "#4A5568", 4.5);
      y += 2;
    });
  }

  addLine(4, 6);
  addText("CRITICAL DEADLINES / समय-सीमाएं", 13, "bold", "#D4A017");
  y += 2;

  const deadlines = analysisData.importantDeadlines || [];
  if (deadlines.length === 0) {
    addText("No critical deadlines mentioned in text./इस दस्तावेज़ में कोई समय-सीमा नहीं मिली।", 10, "italic", "#718096");
    y += 2;
  } else {
    deadlines.forEach((dl: any, idx: number) => {
      addText(`⏱️ ${dl.dateOrTimeframe ?? "Noted"}:`, 11, "bold", "#F85149");
      y += 0.5;
      addText(`English: ${dl.description}`, 10, "normal", "#1A202C", 5);
      addText(`Hindi: ${dl.descriptionHindi}`, 10, "normal", "#4A5568", 4.5);
      y += 2;
    });
  }

  addLine(4, 6);
  addText("NEGOTIATION RECOMMENDATIONS / बातचीत के सुझाव", 13, "bold", "#D4A017");
  y += 2;

  const tips = analysisData.negotiationTips || [];
  if (tips.length === 0) {
    addText("Draft is basic; inspect standard templates for comparisons.", 10, "italic", "#718096");
  } else {
    tips.forEach((t: any, idx: number) => {
      addText(`💡 Suggestion #${idx + 1}:`, 11, "bold", "#0D9488");
      y += 0.5;
      addText(`English: ${t.tip}`, 10, "normal", "#1A202C", 5);
      addText(`Hindi (हिंदी): ${t.tipHindi}`, 9.5, "normal", "#4A5568", 4.5);
      y += 2.5;
    });
  }

  addFooter(doc, pageWidth, pageHeight);

  // Save analysis file
  doc.save(`NyayaAI-Analysis-${docTypeLabel.replace(/\s+/g, "_")}-${new Date().toLocaleDateString("en-IN")}.pdf`);
}

/**
 * Compiles and exports a fully formatted bilingual, Indian-complaint contract draft into PDF.
 */
export function generateTemplatePDF(draftData: any, typeLabel: string) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let y = 30;

  const addHeader = (title: string) => {
    doc.setFillColor(13, 17, 23); // --navy
    doc.rect(0, 0, pageWidth, 42, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(214, 160, 23); // --gold
    doc.text("NyayaAI (न्यायमित्र)", margin, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(139, 148, 158);
    doc.text("Bilingual Template Generator / Kirana Legal Shield", margin, 24);

    doc.setFillColor(212, 160, 23);
    doc.rect(margin, 30, contentWidth, 0.5, "F");

    y = 52;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(13, 17, 23);
    doc.text((title || "Document").toUpperCase(), margin, y);
    y += 10;
  };

  const addFooter = (d: jsPDF, w: number, h: number) => {
    d.setFont("helvetica", "normal");
    d.setFontSize(7.5);
    d.setTextColor(139, 148, 158);
    d.line(margin, h - 22, w - margin, h - 22);
    d.text("Warning: This template was generated by NyayaAI AI for general business reference. Make sure to authenticate signatures.", margin, h - 17);
    d.text("चेतावनी: यह दस्तावेज़ न्यायमित्र AI द्वारा तैयार किया गया है। लेनदेन से पूर्व गवाहों के हस्ताक्षर अवश्य सुनिश्चित करें।", margin, h - 13);
    d.text(`Page ${d.internal.pages.length - 1}`, w - margin - 15, h - 15);
  };

  const addParaText = (text: string, size = 10, style: "normal" | "bold" | "italic" = "normal", color = "#1A202C") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    
    if (color.startsWith("#")) {
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      doc.setTextColor(r, g, b);
    }

    const lines = doc.splitTextToSize(text, contentWidth);
    for (const line of lines) {
      if (y > pageHeight - 30) {
        addFooter(doc, pageWidth, pageHeight);
        doc.addPage();
        y = 25;
      }
      doc.text(line, margin, y);
      y += 5.5;
    }
  };

  // Compile Header Page
  addHeader(draftData.documentTitle || "LEGAL AGREEMENT");

  // Add summaries & protections first as reference metadata
  addParaText("DRAFT OVERVIEW / अनुबंध की रूपरेखा", 12, "bold", "#D4A017");
  y += 2;
  addParaText(`Plain English: ${draftData.plainEnglishSummary || ""}`, 9.5, "normal", "#4A5568");
  y += 2;
  addParaText(`Hindi / हिंदी विवरण: ${draftData.hindiSummary || ""}`, 9.5, "normal", "#4A5568");
  
  y += 6;
  addParaText("KEY LEGAL PROTECTIONS SECURED / आपकी कानूनी सुरक्षाएं", 11, "bold", "#D4A017");
  y += 2;
  
  const protections = draftData.keyProtections || [];
  protections.forEach((p: string, i: number) => {
    addParaText(`- Protection #${i+1}: ${p}`, 9.5, "normal", "#1A202C");
    y += 1;
  });

  y += 4;
  addParaText("IMPORTANT REMINDER / महत्वपूर्ण चेतावनी", 11, "bold", "#F85149");
  y += 2;
  addParaText(`English: ${draftData.importantReminder || ""}`, 9.5, "normal", "#1A202C");
  y += 1;
  addParaText(`Hindi: ${draftData.importantReminderHindi || ""}`, 9, "italic", "#F85149");

  // Next page for the formal contract body
  addFooter(doc, pageWidth, pageHeight);
  doc.addPage();
  y = 25;

  // Header of main agreement text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(13, 17, 23);
  doc.text(draftData.documentTitle ? draftData.documentTitle.toUpperCase() : "AGREEMENT DEED", margin, y);
  y += 10;

  // Print full formal body clauses
  const bodyTextList = (draftData.documentBody || "").split("\n");
  bodyTextList.forEach((para: string) => {
    const trimmed = para.trim();
    if (trimmed) {
      // Bold section headers
      const isHeader = trimmed.startsWith("CLAUSE") || trimmed.startsWith("SECTION") || trimmed.includes("WITNESSETH") ;
      addParaText(trimmed, isHeader ? 10.5 : 9.5, isHeader ? "bold" : "normal", isHeader ? "#D4A017" : "#2D3748");
      y += 3; // Extra pargaraph separation
    }
  });

  addFooter(doc, pageWidth, pageHeight);

  // Trigger PDF file save
  doc.save(`NyayaAI-${typeLabel.replace(/\s+/g, "_")}-${new Date().toLocaleDateString("en-IN")}.pdf`);
}
