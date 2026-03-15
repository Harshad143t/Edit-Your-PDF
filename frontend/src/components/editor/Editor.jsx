import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Type, Image as ImageIcon, PenTool, MousePointer2, 
  Trash2, Download, Save, ZoomIn, ZoomOut, RotateCw, 
  ArrowLeft, Square, Circle, Scissors, FileText, Loader2
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import PdfRenderer from './PdfRenderer';

const Editor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState('select');
  const [zoom, setZoom] = useState(100);
  const [annotations, setAnnotations] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const drawingCanvasRef = useRef(null);

  // We will get the file from location state passed by Home
  const { fileUrl, fileName } = location.state || {};

  useEffect(() => {
    if (!fileUrl) {
      navigate('/');
    }
  }, [fileUrl, navigate]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'text', icon: Type, label: 'Add Text' },
    { id: 'image', icon: ImageIcon, label: 'Add Image' },
    { id: 'draw', icon: PenTool, label: 'Draw' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
  ];

  const actions = [
    { id: 'rotate', icon: RotateCw, label: 'Rotate' },
    { id: 'delete', icon: Trash2, label: 'Delete Page' },
    { id: 'split', icon: Scissors, label: 'Split PDF' },
    { id: 'extract', icon: FileText, label: 'Extract Text' },
  ];

  // Helper for coordinates relative to the interactive layer
  const handleExport = async () => {
    if (!fileUrl) return;
    setIsExporting(true);
    
    try {
      // Fetch the original PDF
      const existingPdfBytes = await fetch(fileUrl).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // Currently only adding to the first page for this prototype
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      
      // Map annotations onto the page
      for (const ann of annotations) {
        if (ann.type === 'text') {
          // Normalize coordinates
          // Page layout in pdf-lib has origin at bottom-left
          // DOM has origin at top-left
          firstPage.drawText(ann.text, {
            x: ann.x,
            y: height - ann.y,
            size: ann.fontSize,
            font: helveticaFont,
            color: rgb(0.8, 0, 0), // red-shish like the input
          });
        }
        
        if (ann.type === 'draw') {
          if (ann.points.length > 1) {
            // Draw lines between points
            for (let i = 0; i < ann.points.length - 1; i++) {
              firstPage.drawLine({
                start: { x: ann.points[i].x, y: height - ann.points[i].y },
                end: { x: ann.points[i+1].x, y: height - ann.points[i+1].y },
                thickness: 3,
                color: rgb(0.9, 0.2, 0.2),
              });
            }
          }
        }
      }

      // Serialize the PDF
      const pdfBytes = await pdfDoc.save();
      
      // Trigger Download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `edited_${fileName || 'document.pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const getCoordinates = (e, currentElement) => {
    const rect = currentElement.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / (zoom / 100),
      y: (e.clientY - rect.top) / (zoom / 100)
    };
  };

  const handlePointerDown = (e) => {
    if (activeTool === 'text') {
      const coords = getCoordinates(e, e.currentTarget);
      const newText = {
        id: Date.now(),
        type: 'text',
        x: coords.x,
        y: coords.y,
        text: 'New Text',
        fontSize: 16
      };
      setAnnotations([...annotations, newText]);
      setActiveTool('select');
    } else if (activeTool === 'draw') {
      setIsDrawing(true);
      const coords = getCoordinates(e, e.currentTarget);
      setCurrentPath({ id: Date.now(), type: 'draw', points: [coords] });
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || activeTool !== 'draw' || !currentPath) return;
    const coords = getCoordinates(e, e.currentTarget);
    setCurrentPath(prev => ({
      ...prev,
      points: [...prev.points, coords]
    }));
  };

  const handlePointerUp = () => {
    if (isDrawing && currentPath) {
      setAnnotations([...annotations, currentPath]);
      setIsDrawing(false);
      setCurrentPath(null);
    }
  };

  const updateTextAnnotation = (id, newText) => {
    setAnnotations(annotations.map(ann => 
      ann.id === id ? { ...ann, text: newText } : ann
    ));
  };

  return (
    <div className="editor-layout">
      {/* Top Navigation Bar */}
      <div className="top-bar glass-panel">
        <button className="btn btn-ghost" onClick={() => navigate('/')} title="Back to Home">
          <ArrowLeft size={18} />
        </button>
        
        <div className="text-sm font-medium text-primary px-4 truncate max-w-[200px]">
          {fileName || 'Untitled.pdf'}
        </div>

        <div className="zoom-controls">
          <button className="btn btn-ghost p-2" onClick={handleZoomOut}><ZoomOut size={18} /></button>
          <span className="text-sm w-12 text-center">{zoom}%</span>
          <button className="btn btn-ghost p-2" onClick={handleZoomIn}><ZoomIn size={18} /></button>
        </div>

        <button className="btn btn-secondary">
          <Save size={18} /> Save
        </button>
        <button className="btn btn-primary" onClick={handleExport} disabled={isExporting}>
          {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
      </div>

      {/* Left Sidebar Tools */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>PDF Editor</h2>
        </div>
        
        <div className="tool-section">
          <h3>Tools</h3>
          <div className="tool-grid">
            {tools.map(tool => (
              <button 
                key={tool.id} 
                className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
                onClick={() => setActiveTool(tool.id)}
              >
                <tool.icon size={20} />
                {tool.label}
              </button>
            ))}
          </div>
        </div>

        <div className="tool-section">
          <h3>Page Actions</h3>
          <div className="tool-grid">
            {actions.map(action => (
              <button key={action.id} className="tool-btn">
                <action.icon size={20} />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Center Canvas */}
      <div className="canvas-container">
        <div className="pdf-page-container transition-transform">
          {fileUrl ? (
            <div className="relative">
              <PdfRenderer fileUrl={fileUrl} zoom={zoom} />
              
              {/* Interactive Layer Overlay */}
              <div 
                className={`pdf-interactive-layer absolute top-0 left-0 w-full h-full ${activeTool !== 'select' ? 'cursor-crosshair' : ''}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                style={{ touchAction: 'none', pointerEvents: 'auto' }}
              >
                {/* SVG for Drawings */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                  {annotations.filter(a => a.type === 'draw').map(drawing => (
                    <polyline
                      key={drawing.id}
                      points={drawing.points.map(p => `${p.x * (zoom / 100)},${p.y * (zoom / 100)}`).join(' ')}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth={3 * (zoom / 100)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                  {currentPath && (
                    <polyline
                      points={currentPath.points.map(p => `${p.x * (zoom / 100)},${p.y * (zoom / 100)}`).join(' ')}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth={3 * (zoom / 100)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>

                {/* Text Annotations */}
                {annotations.filter(a => a.type === 'text').map(ann => (
                  <div
                    key={ann.id}
                    className="absolute"
                    style={{
                      left: ann.x * (zoom / 100),
                      top: ann.y * (zoom / 100),
                      transform: 'translate(-50%, -50%)'
                    }}
                    onPointerDown={(e) => {
                      if (activeTool === 'select') e.stopPropagation();
                    }}
                  >
                    <input
                      type="text"
                      value={ann.text}
                      onChange={(e) => updateTextAnnotation(ann.id, e.target.value)}
                      className="bg-transparent border border-blue-400 border-dashed outline-none px-1 text-red-600 bg-white/50 focus:bg-white"
                      style={{ fontSize: `${ann.fontSize * (zoom / 100)}px`, minWidth: '100px' }}
                      autoFocus
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-secondary">
              <FileText size={48} className="mx-auto mb-4" />
              <p>No PDF loaded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;
