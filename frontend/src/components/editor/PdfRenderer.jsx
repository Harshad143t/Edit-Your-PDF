import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker globally
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const PdfRenderer = ({ fileUrl, zoom, onPdfLoad }) => {
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);

  // Load PDF Document
  useEffect(() => {
    if (!fileUrl) return;

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        if (onPdfLoad) onPdfLoad(pdf.numPages);
      } catch (err) {
        console.error('Error loading PDF:', err);
      }
    };

    loadPdf();
  }, [fileUrl, onPdfLoad]);

  // Render Page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        const scale = zoom / 100;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Error rendering page:', err);
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, zoom]);

  return (
    <div className="pdf-renderer-container flex flex-col items-center">
      <canvas ref={canvasRef} className="pdf-canvas shadow-lg" style={{ display: 'block' }}></canvas>
      
      {/* Simple pagination controls for now */}
      {numPages > 1 && (
        <div className="flex gap-4 mt-4 bg-white p-2 rounded shadow-sm border border-slate-200">
          <button 
            className="btn btn-ghost px-2 py-1 text-sm" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="text-sm py-1">Page {currentPage} of {numPages}</span>
          <button 
            className="btn btn-ghost px-2 py-1 text-sm" 
            onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
            disabled={currentPage === numPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfRenderer;
