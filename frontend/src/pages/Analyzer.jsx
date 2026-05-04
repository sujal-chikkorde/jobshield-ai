import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOCR } from '../hooks/useOCR';

const DATASETS = [
  { label: 'Load a test dataset...', value: '' },
  { label: '🚨 WhatsApp Scam (Fee + Gmail)', value: 'Hiring freshers for WFH data entry. Salary 45000/month. No experience needed. Contact: jobsoffer2024@gmail.com. Pay ₹500 registration fee to confirm your slot. Apply within 24 hours or offer expires. WhatsApp only: +91 99999 88888' },
  { label: '🚨 Telegram Crypto Scam', value: 'Urgent opening: Crypto trading analyst. Earn ₹80,000/week from home. No degree required. Contact us on Telegram now. Limited seats. Pay ₹1000 security deposit refundable after joining. No interview required.' },
  { label: '🚨 Freelance Scam', value: 'Work from home data entry job. Earn ₹500 per form filled. No experience needed. Pay ₹200 registration. Unlimited earning. No target. Join today. Contact on WhatsApp only. Offer valid 24 hours only.' },
  { label: '✅ Legit: TCS Software Job', value: 'Tata Consultancy Services is hiring Software Engineers with 3+ years of experience in Java and Spring Boot. CTC: 8-12 LPA. Location: Bangalore/Hyderabad. Apply at careers.tcs.com. HR contact: recruitment@tcs.com. No fees required.' },
  { label: '✅ Legit: Razorpay Internship', value: 'Internship opportunity at Razorpay — Product Design (6 months, paid ₹20,000/month stipend). Work on real payment products. Required: Figma skills and portfolio. Apply at razorpay.com/careers. Email: internships@razorpay.com. No fees charged.' },
];

export default function Analyzer() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const { extractText, progress, isLoading: ocrLoading } = useOCR();
  const [text, setText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [ocrText, setOcrText] = useState('');

  const handleDataset = (e) => {
    if (e.target.value) setText(e.target.value);
  };

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPreview(URL.createObjectURL(file));
    const extracted = await extractText(file);
    setOcrText(extracted);
    setText(extracted);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setAnalyzing(true);

    try {
      const response = await fetch('https://jobshield-ai-dxbh.onrender.com/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      const result = {
        ml_score: data.ml_score,
        rule_score: data.ml_score,
        risk_level: data.risk_level.toUpperCase(),
        rule_flags: data.rule_flags.map(f => ({ text: f, severity: 'HIGH' })),
        explanation: data.explanation,
        tips: data.safety_tips,
        jobText: text,
      };

      navigate('/results', { state: { result } });

    } catch (error) {
      console.error('Backend error:', error);
      alert('Could not connect to backend. Make sure python app.py is running.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Header — asymmetric */}
        <div className="fade-up" style={{ marginBottom: 40 }}>
          <div style={{
            display: 'inline-block', background: 'linear-gradient(135deg, #667eea22, #764ba222)',
            borderRadius: 8, padding: '4px 12px', marginBottom: 12,
            fontSize: 12, fontWeight: 700, color: '#667eea', letterSpacing: '0.1em'
          }}>
            ANALYZER
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>
            Analyze a Job Posting
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', maxWidth: 480 }}>
            Paste a job description below to detect potential fraud indicators using our 3-layer AI pipeline.
          </p>
        </div>

        {/* Main card */}
        <div className="card fade-up delay-1" style={{ padding: 32, marginBottom: 20 }}>

          {/* Top row — asymmetric */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>📄</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#667eea', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Job Description
              </span>
            </div>
            {/* Dataset selector */}
            <select
              onChange={handleDataset}
              style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 13,
                border: '1.5px solid rgba(99,102,241,0.2)',
                background: 'white', color: '#334155', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', outline: 'none',
                boxShadow: '0 2px 8px rgba(99,102,241,0.08)'
              }}
            >
              {DATASETS.map((d, i) => <option key={i} value={d.value}>{d.label}</option>)}
            </select>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={9}
            placeholder="Paste the full job description here... The more text, the more accurate the analysis."
            style={{
              width: '100%', borderRadius: 14, padding: '16px 18px',
              border: '1.5px solid rgba(99,102,241,0.15)',
              background: '#f8f7ff', color: '#0f172a', fontSize: 14,
              resize: 'vertical', outline: 'none', fontFamily: 'Inter, sans-serif',
              lineHeight: 1.7, transition: 'border 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#667eea'}
            onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.15)'}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>💡</span>
              <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 500 }}>
                Tip: Copy the full text for best results
              </span>
            </div>
            <button
              className="btn-primary"
              onClick={handleAnalyze}
              disabled={analyzing || !text.trim()}
              style={{ opacity: !text.trim() ? 0.5 : 1, cursor: !text.trim() ? 'not-allowed' : 'pointer' }}
            >
              {analyzing ? '⚙️ Analyzing...' : '✨ Analyze Now'}
            </button>
          </div>
        </div>

        {/* OCR Upload — asymmetric offset */}
        <div className="card fade-up delay-2" style={{ padding: 28, marginLeft: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>📸</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#667eea', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Upload Screenshot (OCR)
            </span>
          </div>

          <div
            onClick={() => fileRef.current.click()}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            style={{
              border: `2px dashed ${dragOver ? '#667eea' : 'rgba(99,102,241,0.25)'}`,
              borderRadius: 14, padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
              background: dragOver ? 'rgba(99,102,241,0.05)' : '#f8f7ff',
              transition: 'all 0.2s'
            }}
          >
            {preview
              ? <img src={preview} alt="preview" style={{ maxHeight: 80, borderRadius: 8, marginBottom: 8 }} />
              : <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
            }
            <p style={{ fontSize: 13, color: '#64748b' }}>
              {preview ? 'Click to change image' : 'Drag & drop or click to upload'}
            </p>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              WhatsApp / Telegram / LinkedIn screenshots — PNG, JPG
            </p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

          {/* OCR Progress */}
          {ocrLoading && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: '#64748b' }}>
                <span>Extracting text via OCR...</span>
                <span style={{ fontWeight: 700, color: '#667eea' }}>{progress}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: '#e2e8f0' }}>
                <div style={{ height: 6, borderRadius: 3, background: 'linear-gradient(90deg, #667eea, #764ba2)', width: `${progress}%`, transition: 'width 0.3s' }} />
              </div>
            </div>
          )}

          {/* OCR Preview */}
          {ocrText && !ocrLoading && (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: '#f0fdf4', border: '1px solid #86efac' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', marginBottom: 6 }}>✓ Text extracted successfully</p>
              <p style={{ fontSize: 12, color: '#166534', lineHeight: 1.6 }}>{ocrText.slice(0, 120)}...</p>
            </div>
          )}
        </div>

        {/* Loading overlay */}
        {analyzing && (
          <div className="fade-up" style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: 52, height: 52, border: '3px solid #e2e8f0',
              borderTopColor: '#667eea', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
            }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Running 3-layer analysis...</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Rule Engine → ML Model → Gemini AI</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24, opacity: 0.4 }}>
              {[100, 75, 88].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: 12, width: `${w}%`, margin: '0 auto' }} />
              ))}
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 20 }}>
          🔒 Your data is never stored or shared.
        </p>
      </div>
    </div>
  );
}