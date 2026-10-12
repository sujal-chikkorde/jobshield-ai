import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOCR } from '../hooks/useOCR';

const API_URL = 'http://127.0.0.1:5000/analyze';

const DATASETS = [
  { label: 'Load a test dataset...', value: '' },
  {
    label: '🚨 WhatsApp Scam (Fee + Gmail)',
    value: 'Hiring freshers for WFH data entry. Salary 45000/month. No experience needed. Contact: jobsoffer2024@gmail.com. Pay ₹500 registration fee to confirm your slot. Apply within 24 hours or offer expires. WhatsApp only: +91 99999 88888',
  },
  {
    label: '🚨 Telegram Crypto Scam',
    value: 'Urgent opening: Crypto trading analyst. Earn ₹80,000/week from home. No degree required. Contact us on Telegram now. Limited seats. Pay ₹1000 security deposit refundable after joining. No interview required.',
  },
  {
    label: '🚨 Freelance Scam',
    value: 'Work from home data entry job. Earn ₹500 per form filled. No experience needed. Pay ₹200 registration. Unlimited earning. No target. Join today. Contact on WhatsApp only. Offer valid 24 hours only.',
  },
  {
    label: '✅ Legit: TCS Software Job',
    value: 'Tata Consultancy Services is hiring Software Engineers with 3+ years of experience in Java and Spring Boot. CTC: 8-12 LPA. Location: Bangalore/Hyderabad. Apply at careers.tcs.com. HR contact: recruitment@tcs.com. No fees required.',
  },
  {
    label: '✅ Legit: Razorpay Internship',
    value: 'Internship opportunity at Razorpay — Product Design (6 months, paid ₹20,000/month stipend). Work on real payment products. Required: Figma skills and portfolio. Apply at razorpay.com/careers. Email: internships@razorpay.com. No fees charged.',
  },
];

function normalizeFlags(flags) {
  if (!Array.isArray(flags)) return [];

  return flags.map((flag) => {
    if (typeof flag === 'string') {
      return { text: flag, severity: 'HIGH' };
    }

    return {
      ...flag,
      text:
        flag.text ||
        flag.message ||
        flag.description ||
        'Potential risk indicator',
      severity: String(flag.severity || 'HIGH').toUpperCase(),
    };
  });
}

function normalizeScore(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const score = Number(value);

  if (!Number.isFinite(score)) return null;

  return Math.max(0, Math.min(100, score));
}

function getRiskLevel(score) {
  if (score <= 30) return 'LOW';
  if (score <= 70) return 'MEDIUM';
  return 'HIGH';
}

export default function Analyzer() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const previewUrlRef = useRef(null);

  const {
    extractText,
    progress,
    isLoading: ocrLoading,
    error,
  } = useOCR();

  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [inputType, setInputType] = useState('Text / Message');
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleDataset = (event) => {
    const selectedText = event.target.value;

    if (selectedText) {
      setText(selectedText);
      setInputType('Text / Message');
      setOcrText('');
      setRequestError('');
    }
  };

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setRequestError('Please upload an image file, such as PNG or JPG.');
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const imageUrl = URL.createObjectURL(file);
    previewUrlRef.current = imageUrl;

    setPreview(imageUrl);
    setOcrText('');
    setRequestError('');
    setInputType('Screenshot OCR');

    try {
      const extracted = await extractText(file);
      const extractedText = String(extracted || '').trim();

      setOcrText(extractedText);
      setText(extractedText);

      if (!extractedText) {
        setRequestError(
          'No readable text was found. Try a clearer screenshot or enter the message manually.'
        );
      }
    } catch (ocrError) {
      console.error('OCR error:', ocrError);
      setRequestError(
        'Could not extract text from this screenshot. Please try another image or paste the message manually.'
      );
    }
  };

  const handleAnalyze = async () => {
    const cleanText = text.trim();
    const cleanUrl = url.trim();

    if (!cleanText && !cleanUrl) {
      setRequestError('Please enter a message, job description, or URL to analyze.');
      return;
    }

    if (analyzing) return;

    setAnalyzing(true);
    setRequestError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          url: cleanUrl,
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error('The backend returned an invalid response.');
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Analysis failed with status ${response.status}.`
        );
      }

      const ruleScore = normalizeScore(data.rule_score);
      const mlScore = normalizeScore(data.ml_score);
      const urlScore = normalizeScore(data.url_score);

      const riskScore =
        normalizeScore(data.risk_score) ??
        normalizeScore(data.score) ??
        Math.max(
          ruleScore ?? 0,
          mlScore ?? 0,
          urlScore ?? 0
        );

      const riskLevel = getRiskLevel(riskScore);

      const safetyTips = Array.isArray(data.safety_tips)
        ? data.safety_tips
        : Array.isArray(data.tips)
          ? data.tips
          : [];

      const detectedInputType = cleanUrl
        ? cleanText
          ? 'URL + Text'
          : 'URL'
        : inputType;

      const result = {
        ...data,

        risk_score: riskScore,
        risk_level: riskLevel,

        rule_score: ruleScore,
        ml_score: mlScore,
        url_score: urlScore,

        rule_flags: normalizeFlags(data.rule_flags),
        url_flags: normalizeFlags(data.url_flags),

        categories: Array.isArray(data.categories)
          ? data.categories
          : [],

        input_type: detectedInputType,

        explanation:
          data.explanation ||
          data.ai_explanation ||
          data.llm_explanation ||
          'Analysis completed. Review the detected indicators and verify the source independently.',

        tips: safetyTips,
        safety_tips: safetyTips,

        jobText: cleanText,
        text: cleanText,
        url: cleanUrl,
      };

      navigate('/results', {
        state: { result },
      });
    } catch (analysisError) {
      console.error('Backend error:', analysisError);

      setRequestError(
        analysisError.message ||
          'Could not connect to the backend. Make sure python app.py is running.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
    setInputType('Text / Message');
    setOcrText('');
    setRequestError('');
  };

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 850, margin: '0 auto' }}>
        <div className="fade-up" style={{ marginBottom: 40 }}>
          <div
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #667eea22, #764ba222)',
              borderRadius: 8,
              padding: '4px 12px',
              marginBottom: 12,
              fontSize: 12,
              fontWeight: 700,
              color: '#667eea',
              letterSpacing: '0.1em',
            }}
          >
            SCAMXRAY ANALYZER
          </div>

          <h1
            style={{
              fontSize: 36,
              fontWeight: 900,
              marginBottom: 8,
              letterSpacing: '-0.02em',
            }}
          >
            Analyze a Suspicious Message
          </h1>

          <p
            style={{
              fontSize: 15,
              color: '#64748b',
              maxWidth: 600,
              lineHeight: 1.8,
            }}
          >
            Check messages, job postings, and suspicious URLs for potential
            scam indicators. You can also upload a screenshot to extract its text.
          </p>
        </div>

        <div
          className="card fade-up delay-1"
          style={{ padding: 32, marginBottom: 22 }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📄</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#667eea',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Text / Message Analysis
              </span>
            </div>

            <select
              defaultValue=""
              onChange={handleDataset}
              style={{
                maxWidth: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                fontSize: 12,
                border: '1.5px solid rgba(99,102,241,0.2)',
                background: '#fff',
                color: '#334155',
                cursor: 'pointer',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            >
              {DATASETS.map((dataset, index) => (
                <option key={index} value={dataset.value}>
                  {dataset.label}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={text}
            onChange={handleTextChange}
            rows={9}
            placeholder="Paste a suspicious SMS, email, job posting, or other message here..."
            style={{
              boxSizing: 'border-box',
              width: '100%',
              borderRadius: 14,
              padding: '16px 18px',
              border: '1.5px solid rgba(99,102,241,0.15)',
              background: '#f8f7ff',
              color: '#0f172a',
              fontSize: 14,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.7,
            }}
            onFocus={(event) => {
              event.target.style.borderColor = '#667eea';
            }}
            onBlur={(event) => {
              event.target.style.borderColor = 'rgba(99,102,241,0.15)';
            }}
          />

          <div style={{ marginTop: 18 }}>
            <label
              htmlFor="suspicious-url"
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 700,
                color: '#667eea',
                letterSpacing: '0.06em',
                marginBottom: 9,
              }}
            >
              🔗 URL ANALYSIS (OPTIONAL)
            </label>

            <input
              id="suspicious-url"
              type="url"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setRequestError('');
              }}
              placeholder="https://example.com"
              style={{
                boxSizing: 'border-box',
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: '1.5px solid rgba(99,102,241,0.2)',
                background: '#fff',
                color: '#0f172a',
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />

            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 7, lineHeight: 1.6 }}>
              Enter a URL to send it to the backend along with your message.
              URL risk scoring requires backend support.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 14,
              marginTop: 20,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: '#d97706',
                fontWeight: 500,
                margin: 0,
              }}
            >
              💡 Tip: Include the complete message for better analysis.
            </p>

            <button
              className="btn-primary"
              onClick={handleAnalyze}
              disabled={analyzing || (!text.trim() && !url.trim()) || ocrLoading}
              style={{
                opacity:
                  analyzing || (!text.trim() && !url.trim()) || ocrLoading
                    ? 0.55
                    : 1,
                cursor:
                  analyzing || (!text.trim() && !url.trim()) || ocrLoading
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              {analyzing ? '⚙️ Analyzing...' : '✨ Analyze Now'}
            </button>
          </div>
        </div>

        <div
          className="card fade-up delay-2"
          style={{ padding: 28, marginBottom: 22 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 18 }}>📸</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#667eea',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Screenshot Analysis (OCR)
            </span>
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              handleFile(event.dataTransfer.files[0]);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                fileRef.current?.click();
              }
            }}
            style={{
              border: `2px dashed ${
                dragOver ? '#667eea' : 'rgba(99,102,241,0.25)'
              }`,
              borderRadius: 14,
              padding: '28px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? 'rgba(99,102,241,0.05)' : '#f8f7ff',
              transition: 'all 0.2s',
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="Screenshot preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: 180,
                  objectFit: 'contain',
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
            ) : (
              <div style={{ fontSize: 34, marginBottom: 8 }}>🖼️</div>
            )}

            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0' }}>
              {preview
                ? 'Click to replace the screenshot'
                : 'Drag and drop or click to upload a screenshot'}
            </p>

            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 5 }}>
              WhatsApp, SMS, email, Telegram, or job-posting screenshots
            </p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: 'none' }}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
              event.target.value = '';
            }}
          />

          {ocrLoading && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  marginBottom: 7,
                  color: '#64748b',
                }}
              >
                <span>Extracting text using OCR...</span>
                <strong style={{ color: '#667eea' }}>{progress}%</strong>
              </div>

              <div
                style={{
                  height: 7,
                  borderRadius: 5,
                  background: '#e2e8f0',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: 5,
                    background: 'linear-gradient(90deg, #667eea, #764ba2)',
                    width: `${progress}%`,
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
          )}

          {ocrText && !ocrLoading && (
            <div
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 10,
                background: '#f0fdf4',
                border: '1px solid #86efac',
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#16a34a',
                  margin: '0 0 7px',
                }}
              >
                ✓ Text extracted successfully
              </p>

              <p
                style={{
                  fontSize: 12,
                  color: '#166534',
                  lineHeight: 1.7,
                  margin: 0,
                  overflowWrap: 'anywhere',
                }}
              >
                {ocrText.length > 240
                  ? `${ocrText.slice(0, 240)}...`
                  : ocrText}
              </p>

              <p style={{ fontSize: 11, color: '#15803d', margin: '10px 0 0' }}>
                The extracted text is placed in the message field. Click Analyze Now to continue.
              </p>
            </div>
          )}

          {error && (
            <div
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 10,
                background: '#fef2f2',
                border: '1px solid #fca5a5',
              }}
            >
              <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>
                ⚠️ {error}
              </p>
            </div>
          )}
        </div>

        {requestError && (
          <div
            role="alert"
            style={{
              marginBottom: 20,
              padding: 15,
              borderRadius: 12,
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#b91c1c',
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            ⚠️ {requestError}
          </div>
        )}

        {analyzing && (
          <div
            className="fade-up"
            style={{ textAlign: 'center', padding: '40px 0' }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                border: '3px solid #e2e8f0',
                borderTopColor: '#667eea',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }}
            />

            <p style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>
              Analyzing your submission...
            </p>

            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
              Rule Engine → ML Model → AI Analysis
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                marginTop: 24,
                opacity: 0.4,
              }}
            >
              {[100, 75, 88].map((width, index) => (
                <div
                  key={index}
                  className="skeleton"
                  style={{
                    height: 12,
                    width: `${width}%`,
                    margin: '0 auto',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <p
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: '#94a3b8',
            marginTop: 24,
            lineHeight: 1.8,
          }}
        >
          🔒 Avoid sharing real passwords, OTPs, or sensitive personal details.
          Verify important messages independently.
        </p>
      </div>
    </div>
  );
}