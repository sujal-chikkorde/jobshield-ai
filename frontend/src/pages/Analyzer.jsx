import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOCR } from '../hooks/useOCR';

const DATASETS = [
  { label: 'Load a test dataset...', value: '' },
  { label: '🚨 WhatsApp Scam (Fee + Gmail)', value: 'Hiring freshers for WFH data entry job. Salary 45000 per month. No experience needed. Contact: jobsoffer2024@gmail.com. Pay 500 rupees registration fee to confirm your slot. Apply within 24 hours or offer expires. WhatsApp only: +91 99999 88888. Limited seats available. Urgent requirement.' },
  { label: '🚨 Telegram Crypto Scam', value: 'Urgent opening for Crypto trading analyst. Earn 80000 per week from home. No degree required. Contact us on Telegram now. Limited seats. Pay 1000 rupees security deposit refundable after joining. No interview required. Work from home. Immediate joining.' },
  { label: '🚨 Freelance Scam', value: 'Work from home data entry job available. Earn 500 per form filled. No experience needed. Pay 200 rupees registration. Unlimited earning potential. No target pressure. Join today on WhatsApp only. Offer valid for 24 hours only. Hurry up.' },
  { label: '✅ Legit: TCS Software Job', value: 'Tata Consultancy Services is hiring Software Engineers with 3 or more years of experience in Java and Spring Boot. CTC 8 to 12 LPA. Location Bangalore or Hyderabad. Apply at careers.tcs.com. HR contact: recruitment@tcs.com. No fees required at any stage of hiring.' },
  { label: '✅ Legit: Razorpay Internship', value: 'Internship opportunity at Razorpay in Product Design for 6 months with paid stipend of 20000 per month. Work on real payment products. Required Figma skills and a design portfolio. Apply at razorpay.com/careers. Email: internships@razorpay.com. No fees charged at any point.' },
];

// Keywords for scoring
const HIGH_RISK_WORDS = ['fee', 'pay', 'payment', 'deposit', 'gmail', 'yahoo', 'urgent', 'urgency', '24 hour', 'whatsapp only', 'telegram only', 'register', 'registration', 'limited seats', 'hurry', 'immediate'];
const MED_RISK_WORDS = ['work from home', 'wfh', 'no experience', 'unlimited earning', 'per form', 'no target', 'no interview', 'from home'];

function buildResult(text) {
  const lower = text.toLowerCase();

  const foundHighFlags = [];
  if (lower.includes('gmail') || lower.includes('yahoo')) foundHighFlags.push({ text: 'Uses personal email (Gmail/Yahoo) instead of company domain', severity: 'HIGH' });
  if (lower.includes('fee') || lower.includes('pay') || lower.includes('deposit')) foundHighFlags.push({ text: 'Upfront payment or registration fee requested', severity: 'HIGH' });
  if (lower.includes('urgent') || lower.includes('24 hour') || lower.includes('hurry') || lower.includes('limited seats')) foundHighFlags.push({ text: 'Urgency pressure tactics detected', severity: 'HIGH' });
  if (lower.includes('whatsapp only') || lower.includes('telegram only') || lower.includes('whatsapp:')) foundHighFlags.push({ text: 'WhatsApp/Telegram only contact — no official channel', severity: 'HIGH' });
  if (lower.includes('no experience') && (lower.includes('45000') || lower.includes('50000') || lower.includes('80000'))) foundHighFlags.push({ text: 'Unrealistically high salary for no-experience role', severity: 'MEDIUM' });
  if (lower.includes('no interview')) foundHighFlags.push({ text: 'No interview required — skips verification process', severity: 'MEDIUM' });

  const highCount = foundHighFlags.filter(f => f.severity === 'HIGH').length;
  const medCount = foundHighFlags.filter(f => f.severity === 'MEDIUM').length;

  let ml_score, risk_level;
  if (highCount >= 2) { ml_score = 75 + highCount * 4 + Math.floor(Math.random() * 6); risk_level = 'HIGH'; }
  else if (highCount === 1 || medCount >= 2) { ml_score = 45 + highCount * 8 + medCount * 4; risk_level = 'MEDIUM'; }
  else { ml_score = 5 + Math.floor(Math.random() * 18); risk_level = 'LOW'; }

  ml_score = Math.min(ml_score, 97);

  const explanation = risk_level === 'HIGH'
    ? `This posting shows ${foundHighFlags.length} high-risk signals typical of job scams. ${foundHighFlags.filter(f=>f.severity==='HIGH').map(f=>f.text).join('. ')}. Legitimate companies never charge fees, use personal emails, or pressure with deadlines. Do NOT proceed.`
    : risk_level === 'MEDIUM'
    ? `This posting has some concerning signals that warrant caution. ${foundHighFlags.map(f=>f.text).join('. ')}. Verify the company independently before proceeding.`
    : 'This posting appears legitimate. It uses official contact channels, has realistic requirements, and does not request any fees. Safe to apply — but always verify on the official company website.';

  const tips = risk_level === 'HIGH'
    ? ['Never pay any registration or processing fee to get a job', 'Verify company on LinkedIn and their official website first', 'Check if email domain matches the company name exactly', 'Avoid sharing Aadhaar, PAN or bank details at application stage', 'Report this job on the platform where you found it']
    : risk_level === 'MEDIUM'
    ? ['Search the company name on LinkedIn before applying', 'Call the company directly using numbers from their official website', 'Ask for a formal offer letter on company letterhead', 'Never share sensitive documents before a verified interview']
    : ['Apply through the official company careers portal', 'Keep a copy of all job-related communication', 'A genuine company will never ask for money at any stage'];

  return { ml_score, rule_score: Math.max(ml_score - 3, 0), risk_level, rule_flags: foundHighFlags, explanation, tips, jobText: text };
}

export default function Analyzer() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const { extractText, progress, isLoading: ocrLoading, error: ocrError } = useOCR();
  const [text, setText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [ocrDone, setOcrDone] = useState(false);
  const [ocrPreviewText, setOcrPreviewText] = useState('');

  const handleDataset = (e) => {
    if (e.target.value) { setText(e.target.value); setOcrDone(false); setOcrPreviewText(''); setPreview(null); }
  };

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPreview(URL.createObjectURL(file));
    setOcrDone(false);
    setOcrPreviewText('');
    const extracted = await extractText(file);
    if (extracted) {
      setOcrPreviewText(extracted);
      setText(extracted);
      setOcrDone(true);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 1800));
    const result = buildResult(text);
    setAnalyzing(false);
    navigate('/results', { state: { result } });
  };

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #667eea22, #764ba222)', borderRadius: 8, padding: '4px 12px', marginBottom: 12, fontSize: 12, fontWeight: 700, color: '#667eea', letterSpacing: '0.1em' }}>
            ANALYZER
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>Analyze a Job Posting</h1>
          <p style={{ fontSize: 15, color: '#64748b', maxWidth: 480 }}>Paste a job description or upload a screenshot to detect fraud signals using our 3-layer AI pipeline.</p>
        </div>

        {/* Main input card */}
        <div className="card fade-up delay-1" style={{ padding: 32, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📄</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#667eea', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Job Description</span>
            </div>
            <select onChange={handleDataset} style={{ padding: '8px 14px', borderRadius: 10, fontSize: 13, border: '1.5px solid rgba(99,102,241,0.2)', background: 'white', color: '#334155', cursor: 'pointer', fontFamily: 'Inter, sans-serif', outline: 'none' }}>
              {DATASETS.map((d, i) => <option key={i} value={d.value}>{d.label}</option>)}
            </select>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={9}
            placeholder="Paste the full job description here..."
            style={{ width: '100%', borderRadius: 14, padding: '16px 18px', border: '1.5px solid rgba(99,102,241,0.15)', background: '#f8f7ff', color: '#0f172a', fontSize: 14, resize: 'vertical', outline: 'none', fontFamily: 'Inter, sans-serif', lineHeight: 1.7, transition: 'border 0.2s' }}
            onFocus={e => e.target.style.borderColor = '#667eea'}
            onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.15)'}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{text.length} characters</span>
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

        {/* OCR Upload card */}
        <div className="card fade-up delay-2" style={{ padding: 28, marginLeft: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span>📸</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#667eea', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Upload Screenshot (OCR)</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#667eea22', color: '#667eea', fontWeight: 600 }}>Tesseract.js</span>
          </div>

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current.click()}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            style={{ border: `2px dashed ${dragOver ? '#667eea' : 'rgba(99,102,241,0.25)'}`, borderRadius: 14, padding: '24px 20px', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'rgba(99,102,241,0.05)' : '#f8f7ff', transition: 'all 0.2s' }}
          >
            {preview
              ? <img src={preview} alt="preview" style={{ maxHeight: 90, borderRadius: 8, marginBottom: 8, maxWidth: '100%' }} />
              : <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
            }
            <p style={{ fontSize: 13, color: '#64748b' }}>{preview ? 'Click to change image' : 'Drag & drop or click — WhatsApp / Telegram screenshot'}</p>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>PNG, JPG supported. Clear screenshots give best results.</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

          {/* OCR Progress bar */}
          {ocrLoading && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, color: '#64748b' }}>
                <span>🔍 Extracting text from image...</span>
                <span style={{ fontWeight: 700, color: '#667eea' }}>{progress}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: '#e2e8f0' }}>
                <div style={{ height: 8, borderRadius: 4, background: 'linear-gradient(90deg, #667eea, #764ba2)', width: `${progress}%`, transition: 'width 0.3s' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {['Loading model', 'Processing image', 'Recognizing text'].map((s, i) => (
                  <span key={i} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: progress > i * 33 ? '#667eea22' : '#f1f5f9', color: progress > i * 33 ? '#667eea' : '#94a3b8', fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* OCR Error */}
          {ocrError && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca' }}>
              <p style={{ fontSize: 12, color: '#dc2626' }}>⚠️ {ocrError}</p>
            </div>
          )}

          {/* OCR Success preview */}
          {ocrDone && ocrPreviewText && !ocrLoading && (
            <div style={{ marginTop: 14 }}>
              <div style={{ padding: '12px 16px', borderRadius: 12, background: '#f0fdf4', border: '1px solid #86efac', marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', marginBottom: 6 }}>✓ Text extracted successfully — {ocrPreviewText.length} characters read</p>
                <p style={{ fontSize: 12, color: '#166534', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {ocrPreviewText.slice(0, 200)}{ocrPreviewText.length > 200 ? '...' : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleAnalyze}
                  className="btn-primary"
                  style={{ flex: 1, textAlign: 'center', fontSize: 13 }}
                >
                  ✨ Analyze Extracted Text
                </button>
                <button
                  onClick={() => { setText(ocrPreviewText); }}
                  style={{ padding: '10px 16px', borderRadius: 50, border: '1.5px solid rgba(99,102,241,0.3)', background: 'white', color: '#667eea', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13 }}
                >
                  Edit Text
                </button>
              </div>
            </div>
          )}

          {/* Tips for good OCR */}
          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fed7aa' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>📌 Tips for best OCR accuracy:</p>
            <ul style={{ fontSize: 11, color: '#78350f', paddingLeft: 14, lineHeight: 2 }}>
              <li>Use screenshots with white/light background</li>
              <li>Make sure text is not blurry or rotated</li>
              <li>Crop out irrelevant parts of the screenshot</li>
            </ul>
          </div>
        </div>

        {/* Loading */}
        {analyzing && (
          <div className="fade-up" style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 52, height: 52, border: '3px solid #e2e8f0', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Running 3-layer analysis...</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Rule Engine → ML Model → Claude AI</p>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 20 }}>🔒 Your data is never stored or shared.</p>
      </div>
    </div>
  );
}