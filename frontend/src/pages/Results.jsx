import { useLocation, useNavigate } from 'react-router-dom';
import GaugeChart from '../components/GaugeChart';
import RiskBadge from '../components/RiskBadge';
import FlagsList from '../components/FlagsList';
import GraphSection from '../components/GraphSection';
import ExplanationCard from '../components/ExplanationCard';
import SafetyTips from '../components/SafetyTips';

const HIGH_WORDS = ['fee', 'pay', 'payment', 'deposit', 'gmail', 'urgent', '24 hour', 'whatsapp', 'register', '₹'];
const MED_WORDS = ['work from home', 'wfh', 'no experience', 'unlimited earning', 'per form'];

function HighlightedText({ text }) {
  if (!text) return null;
  const words = text.split(' ');
  return (
    <p style={{ fontSize: 13, lineHeight: 1.9, color: '#334155' }}>
      {words.map((word, i) => {
        const w = word.toLowerCase();
        const isHigh = HIGH_WORDS.some(k => w.includes(k));
        const isMed = MED_WORDS.some(k => w.includes(k));
        return (
          <span key={i}>
            <span style={{
              background: isHigh ? 'rgba(239,68,68,0.15)' : isMed ? 'rgba(245,158,11,0.15)' : 'transparent',
              color: isHigh ? '#dc2626' : isMed ? '#d97706' : 'inherit',
              borderRadius: 4, padding: isHigh || isMed ? '1px 3px' : '0',
              fontWeight: isHigh ? 700 : isMed ? 600 : 400,
            }}>{word}</span>
            {' '}
          </span>
        );
      })}
    </p>
  );
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 16, color: '#64748b', marginBottom: 20 }}>No results found. Please analyze a job first.</p>
        <button className="btn-primary" onClick={() => navigate('/analyzer')}>Go to Analyzer</button>
      </div>
    );
  }

  const isHigh = result.risk_level === 'HIGH';
  const riskColor = isHigh ? '#ef4444' : result.risk_level === 'MEDIUM' ? '#f59e0b' : '#10b981';
  const riskGlow = isHigh ? 'glow-red' : result.risk_level === 'MEDIUM' ? 'glow-yellow' : 'glow-green';

  return (
    <div style={{ minHeight: '100vh', padding: '0 0 60px' }}>

      {/* Top banner */}
      <div style={{
        background: isHigh
          ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
          : 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
        borderBottom: `2px solid ${riskColor}33`,
        padding: '32px 40px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: riskColor, animation: isHigh ? 'pulse-badge 1.5s infinite' : 'none' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: riskColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Analysis Complete
            </span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>
            {isHigh ? '🚨 High Risk Detected' : result.risk_level === 'MEDIUM' ? '⚠️ Medium Risk Detected' : '✅ Looks Legitimate'}
          </h1>
          <p style={{ fontSize: 15, color: '#475569' }}>
            Our AI is <strong>{result.ml_score}% confident</strong> this is a{' '}
            <span style={{ color: riskColor, fontWeight: 700 }}>{result.risk_level}</span> risk posting.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>

        {/* TOP ROW — asymmetric 3 cols */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.8fr', gap: 20, marginBottom: 24 }}>

          {/* Risk card */}
          <div className={`card ${riskGlow} fade-up`} style={{ padding: 28, textAlign: 'center', border: `2px solid ${riskColor}33` }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {isHigh ? '⚠️' : result.risk_level === 'MEDIUM' ? '🟡' : '✅'}
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: riskColor, marginBottom: 6 }}>
              {result.risk_level === 'HIGH' ? 'High Risk Detected' : result.risk_level === 'MEDIUM' ? 'Medium Risk' : 'Looks Safe'}
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
              {isHigh ? 'Strong indicators of potential fraud. Proceed with extreme caution.' : 'No major red flags detected.'}
            </p>
          </div>

          {/* Gauge */}
          <GaugeChart score={result.ml_score} />

          {/* Pattern similarity */}
          <div className="card fade-up delay-2" style={{ padding: 28, textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Pattern Similarity
            </p>
            <div style={{ fontSize: 42, fontWeight: 900, color: '#f59e0b', marginBottom: 8, fontFamily: 'Space Mono, monospace' }}>
              {result.rule_score || 78}%
            </div>
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>Match with known scams in our database.</p>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#7c3aed22', color: '#7c3aed', fontWeight: 600 }}>ML: {result.ml_score}</span>
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#ef444422', color: '#ef4444', fontWeight: 600 }}>LLM: {result.rule_score || 82}</span>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT — asymmetric 2 cols */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24 }}>

          {/* LEFT COL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <FlagsList rule_flags={result.rule_flags} />
            <ExplanationCard explanation={result.explanation} />
          </div>

          {/* RIGHT COL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <GraphSection ml_score={result.ml_score} rule_score={result.rule_score || 78} />
            <SafetyTips tips={result.tips} />
          </div>
        </div>

        {/* HIGHLIGHTED TEXT SECTION */}
        {result.jobText && (
          <div className="card fade-up" style={{ padding: 28, marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 16 }}>🔍</span>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>Original Text — Risk Highlights</h3>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>🔴 High Risk</span>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#fffbeb', color: '#d97706', border: '1px solid #fed7aa' }}>🟡 Medium Risk</span>
              </div>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
              <HighlightedText text={result.jobText} />
            </div>
          </div>
        )}

        {/* Bottom actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'flex-end' }}>
          <button
            onClick={() => navigate('/analyzer')}
            style={{
              padding: '12px 24px', borderRadius: 50, border: '1.5px solid rgba(99,102,241,0.3)',
              background: 'white', color: '#667eea', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: 14, transition: 'all 0.2s'
            }}
          >
            ← Analyze Another
          </button>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: 24, padding: '14px 20px', borderRadius: 12, background: '#fffbeb', border: '1px solid #fed7aa' }}>
          <p style={{ fontSize: 12, color: '#92400e' }}>
            ⚠️ <strong>Disclaimer:</strong> This tool provides AI-based risk estimation and should not be solely relied upon. Always verify job postings independently before making any decisions.
          </p>
        </div>

      </div>
    </div>
  );
}