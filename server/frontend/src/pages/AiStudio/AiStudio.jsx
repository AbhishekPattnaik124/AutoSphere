import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Sparkles, Wand2, Download, CheckCircle2 } from 'lucide-react';
import Header from '../../components/Header/Header';
import PageTransition from '../../components/PageTransition';
import './AiStudio.css';

const AiStudio = () => {
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const [locationPrompt, setLocationPrompt] = useState('Cyberpunk Tokyo');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setIsComplete(false);
    }
  };

  const handleGenerate = async () => {
    if (!image || !locationPrompt.trim()) return;
    setIsProcessing(true);
    setIsComplete(false);
    
    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      const promptContext = `You are a professional automotive photographer and AI prompt engineer. 
      The user wants to place a car in this location: "${locationPrompt}". 
      Generate a highly detailed, cinematic, and photorealistic Midjourney-style image prompt for this background. 
      Do not include the car itself in the prompt, just the background environment where a car will be placed. 
      Return ONLY the raw prompt text, no quotes, no markdown, no conversational text.`;

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptContext }] }]
        })
      });

      const geminiData = await geminiRes.json();
      
      let promptText = `A highly detailed cinematic background of ${locationPrompt}, 8k, photorealistic`;
      if (geminiData.candidates && geminiData.candidates[0].content.parts[0].text) {
        promptText = geminiData.candidates[0].content.parts[0].text.trim();
      }
      
      setEnhancedPrompt(promptText);
      setBackgroundUrl(`https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?width=1920&height=1080&nologo=true`);
      
      // Wait for Pollinations image to generate and load
      setTimeout(() => {
        setIsProcessing(false);
        setIsComplete(true);
      }, 5000);

    } catch (e) {
      console.error("Failed to generate prompt via Gemini", e);
      // Fallback
      const fallbackPrompt = `A highly detailed photorealistic cinematic background of ${locationPrompt}, 8k`;
      setEnhancedPrompt(fallbackPrompt);
      setBackgroundUrl(`https://image.pollinations.ai/prompt/${encodeURIComponent(fallbackPrompt)}?width=1920&height=1080&nologo=true`);
      setTimeout(() => {
        setIsProcessing(false);
        setIsComplete(true);
      }, 5000);
    }
  };

  return (
    <PageTransition>
      <div className="ai-studio-page">
        <Header />
        
        <div className="studio-container container">
          <header className="studio-header">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="ai-badge">
                <Sparkles size={16} />
                Generative AI
              </div>
              <h1>Virtual 3D Showroom</h1>
              <p>Upload a standard car photo. Our neural network will remove the background and place it in a hyper-realistic virtual showroom instantly.</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-gold)', marginTop: '10px' }}>
                * Note: This is a frontend simulation. For best results, upload a car with a solid white background.
              </p>
            </motion.div>
          </header>

          <div className="studio-workspace">
            {/* Left Panel: Controls */}
            <div className="studio-controls glass-card">
              <h3>Upload Source Image</h3>
              
              <label className="upload-zone">
                <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                <div className="upload-content">
                  <ImageIcon size={40} color="var(--color-primary)" />
                  <span>Click to browse or drag image here</span>
                </div>
              </label>

              <div className="prompt-input-area">
                <h4>Generate Prompt Space</h4>
                <p className="prompt-help">Where should we transport your car?</p>
                <textarea 
                  className="location-input" 
                  value={locationPrompt}
                  onChange={(e) => setLocationPrompt(e.target.value)}
                  placeholder="e.g. A futuristic neon city, a quiet snowy mountain pass, or a sunny beach..."
                  rows={3}
                />
              </div>

              {enhancedPrompt && (
                <div className="enhanced-prompt-display">
                  <div className="prompt-label"><Sparkles size={14}/> Gemini Enhanced Prompt:</div>
                  <p>{enhancedPrompt}</p>
                </div>
              )}

              <button 
                className="btn-luxury btn-gold lg generate-btn" 
                onClick={handleGenerate}
                disabled={!image || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    Generate Virtual Showroom
                  </>
                )}
              </button>
            </div>

            {/* Right Panel: Canvas */}
            <div className="studio-canvas glass-card">
              {!image ? (
                <div className="empty-canvas">
                  <Wand2 size={48} color="rgba(255,255,255,0.1)" />
                  <p>Awaiting source image...</p>
                </div>
              ) : (
                <div className="canvas-wrapper">
                  <div className={`canvas-image-container ${isProcessing ? 'processing' : ''} ${isComplete ? 'complete' : ''}`}>
                    {/* The Background */}
                    <div className="generated-bg" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
                    
                    {/* The Foreground Car */}
                    <img src={image} alt="Uploaded Car" className="uploaded-car" />
                    
                    {/* Scanning Animation Overlay */}
                    {isProcessing && <div className="scanner-line"></div>}
                  </div>
                  
                  {isComplete && (
                    <motion.div 
                      className="completion-overlay"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <CheckCircle2 size={24} color="#00ff9d" />
                      <span>Generation Successful</span>
                      <button className="btn-luxury-sm"><Download size={14} style={{marginRight:'5px'}}/> Download Asset</button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AiStudio;
