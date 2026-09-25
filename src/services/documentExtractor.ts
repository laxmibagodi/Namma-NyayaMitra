import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Initialize worker from jsDelivr CDN matching the library's exact version to ensure correct MIME type
const pdfjsVersion = pdfjsLib.version || "5.7.284";
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;

/**
 * Extracts text from PDF
 */
export async function extractPDFText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = "";
    // Read up to 10 pages for scanning contract context, safely avoiding token overhead
    const pagesToRead = Math.min(pdf.numPages, 10);
    
    for (let i = 1; i <= pagesToRead; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items.map((item: any) => item.str || "");
      fullText += pageStrings.join(" ") + "\n";
    }
    
    return fullText.trim();
  } catch (error) {
    console.error("PDF text extraction error:", error);
    throw new Error("Could not parse PDF text. Please ensure the file is not copy-protected.");
  }
}

/**
 * Extracts text from DOCX using Mammoth
 */
export async function extractDocxText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  } catch (error) {
    console.error("DOCX text extraction error:", error);
    throw new Error("Could not parse DOCX text. Please ensure the Word file is not corrupted.");
  }
}

/**
 * Extracts text from general TXT/MD/CSV etc.
 */
export async function extractPlainText(file: File): Promise<string> {
  try {
    return await file.text();
  } catch (error) {
    console.error("Plain text extraction error:", error);
    throw new Error("Could not parse plain text document.");
  }
}

/**
 * Main function to extract text from any supported document format
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  
  if (ext === "pdf") {
    return await extractPDFText(file);
  } else if (ext === "docx") {
    return await extractDocxText(file);
  } else if (["txt", "md", "csv", "rtf", "json", "html", "htm", "xml"].includes(ext)) {
    return await extractPlainText(file);
  } else {
    // Attempt plaintext fallback for any other general text files
    try {
      return await extractPlainText(file);
    } catch {
      throw new Error(`Unsupported or unreadable file type: .${ext}`);
    }
  }
}
