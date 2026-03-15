import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud } from 'lucide-react';

const Home = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFile = (file) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds the 50MB limit.');
      return;
    }

    setIsLoading(true);
    
    // Simulate API upload or directly navigate with local file object (Blob URL)
    // For a fully local zero-server approach, we could just pass the file.
    // For now we will structure it to use a Blob URL that can be read by pdf.js
    
    const fileUrl = URL.createObjectURL(file);
    
    setTimeout(() => {
      navigate('/editor', { state: { fileUrl, fileName: file.name, file } });
    }, 800);
  };

  return (
    <div className="home-container">
      <div className="hero">
        <h1>Edit Your PDF in Seconds</h1>
        <p>Free, fast, and secure online PDF editor. Your files are processed locally when possible and automatically deleted after processing to ensure privacy.</p>
      </div>

      <div className="upload-zone-wrapper">
        <div 
          className={`upload-zone ${isDragging ? 'drag-active' : ''} ${isLoading ? 'loading' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
          
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="spinner"></div>
              <p className="upload-text">Processing your PDF...</p>
            </div>
          ) : (
            <>
              <UploadCloud size={64} className="upload-icon" />
              <p className="upload-text">Drag & drop your PDF here</p>
              <p className="upload-hint mb-4">or click to browse from your device</p>
              <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); onButtonClick(); }}>
                Upload PDF
              </button>
            </>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-sm text-secondary" style={{ marginTop: '2rem', fontSize: '0.85rem' }}>
        Max file size: 50MB. We value your privacy. Your files are automatically deleted after processing.
      </p>
    </div>
  );
};

export default Home;
