import * as pdfjsLib from "pdfjs-dist";

// Initialize worker from jsDelivr CDN matching the library's exact version to ensure correct MIME type
const pdfjsVersion = pdfjsLib.version || "5.7.284";
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;

/**
 * Extracts all plain text lines from a local user PDF file in-browser.
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
