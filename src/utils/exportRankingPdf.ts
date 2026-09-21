import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ExportPdfOptions {
  element: HTMLElement;
  fileName?: string;
  onProgress?: (status: string) => void;
}

/**
 * Generates a true 2-page A4 PDF report (Page 1: Team Leaders, Page 2: Team Trainers).
 * Each child element with class '.ranking-pdf-page' will be rendered as a dedicated A4 page.
 */
export async function generateRankingPdf({
  element,
  fileName = `Unity_Earning_Performance_Report_${new Date().toISOString().split('T')[0]}.pdf`,
  onProgress
}: ExportPdfOptions): Promise<Blob> {
  onProgress?.('Initializing document renderer...');

  // Ensure all fonts (including system, Google & Bengali fonts) are fully loaded before rendering
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue if font loading check is not supported
    }
  }

  // Identify all distinct pages
  const pageNodes = element.querySelectorAll<HTMLElement>('.ranking-pdf-page');
  const pagesToRender: HTMLElement[] = pageNodes.length > 0 
    ? Array.from(pageNodes) 
    : [element];

  const totalPages = pagesToRender.length;

  // Create standard A4 PDF: 210mm x 297mm
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  for (let i = 0; i < totalPages; i++) {
    onProgress?.(`Rendering page ${i + 1} of ${totalPages}...`);

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    const pageEl = pagesToRender[i];

    const canvas = await html2canvas(pageEl, {
      scale: 2.5, // 2.5x scale gives ~2000px resolution - razor sharp text & icons
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 20000,
      windowWidth: 1200, // Forces desktop width context so mobile viewports never shrink or clip the 800px A4 page
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        // Strip oklch references from Tailwind that can cause html2canvas crashes
        const styles = clonedDoc.getElementsByTagName('style');
        for (let s = 0; s < styles.length; s++) {
          const style = styles[s];
          if (style.innerHTML && style.innerHTML.includes('oklch')) {
            style.innerHTML = style.innerHTML.replace(/oklch\([^)]+\)/g, 'rgba(0,0,0,0.1)');
          }
        }

        // Inject explicit CSS rules to guarantee names and rows are never clipped or overflow-hidden
        const antiClipStyle = clonedDoc.createElement('style');
        antiClipStyle.innerHTML = `
          .ranking-name-text {
            overflow: visible !important;
            white-space: normal !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            line-height: 1.35 !important;
          }
          .ranking-row {
            overflow: visible !important;
            height: auto !important;
          }
        `;
        clonedDoc.head.appendChild(antiClipStyle);

        // Ensure capture area is visible and properly laid out in the clone
        const captureArea = clonedDoc.querySelector('.ranking-capture-area') as HTMLElement;
        if (captureArea) {
          captureArea.style.left = '0';
          captureArea.style.top = '0';
          captureArea.style.position = 'relative';
          captureArea.style.visibility = 'visible';
          captureArea.style.display = 'block';
        }
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.96);
    // Standard A4 page dimensions in mm
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }

  onProgress?.('Finalizing and saving PDF...');
  pdf.save(fileName);
  return pdf.output('blob');
}

/**
 * Exports a high-resolution PNG image (renders Page 1 / overview page)
 */
export async function generateRankingImage({
  element,
  fileName = `Unity_Earning_Ranking_${new Date().toISOString().split('T')[0]}.png`,
  onProgress
}: ExportPdfOptions): Promise<string> {
  onProgress?.('Rendering high-resolution image...');

  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue
    }
  }

  // Target the first page if multiple pages exist
  const firstPage = element.querySelector<HTMLElement>('.ranking-pdf-page') || element;

  const canvas = await html2canvas(firstPage, {
    scale: 2.5,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 20000,
    windowWidth: 1200,
    scrollX: 0,
    scrollY: 0,
    onclone: (clonedDoc) => {
      const styles = clonedDoc.getElementsByTagName('style');
      for (let s = 0; s < styles.length; s++) {
        const style = styles[s];
        if (style.innerHTML && style.innerHTML.includes('oklch')) {
          style.innerHTML = style.innerHTML.replace(/oklch\([^)]+\)/g, 'rgba(0,0,0,0.1)');
        }
      }

      const antiClipStyle = clonedDoc.createElement('style');
      antiClipStyle.innerHTML = `
        .ranking-name-text {
          overflow: visible !important;
          white-space: normal !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          line-height: 1.35 !important;
        }
        .ranking-row {
          overflow: visible !important;
          height: auto !important;
        }
      `;
      clonedDoc.head.appendChild(antiClipStyle);

      const captureArea = clonedDoc.querySelector('.ranking-capture-area') as HTMLElement;
      if (captureArea) {
        captureArea.style.left = '0';
        captureArea.style.top = '0';
        captureArea.style.position = 'relative';
        captureArea.style.visibility = 'visible';
        captureArea.style.display = 'block';
      }
    }
  });

  const image = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.href = image;
  link.download = fileName;
  link.click();
  return image;
}
