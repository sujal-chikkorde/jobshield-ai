import { useNavigate } from 'react-router-dom';

const STATS = [
  { value: '50K+', label: 'JOBS ANALYZED' },
  { value: '99.2%', label: 'ACCURACY RATE' },
  { value: '10K+', label: 'SCAMS DETECTED' },
  { value: '100%', label: 'FREE TO USE' },
];

const FEATURES = [
  { icon: '⚡', title: 'Real-time Detection', desc: 'Instant fraud analysis as you paste the job description.' },
  { icon: '🧠', title: 'Explainable AI', desc: 'Understand exactly why a posting is flagged as risky.' },
  { icon: '🛡️', title: '3-Layer Pipeline', desc: 'Rules + ML Model + Claude AI working together.' },
  { icon: '🔒', title: 'Free & Secure', desc: 'Your data is never stored, shared, or sold to third parties.' },
];

const HOW = [
  { step: '01', title: 'Paste or Upload', desc: 'Paste the job description text or upload a screenshot.' },
  { step: '02', title: 'AI Analysis', desc: 'Our 3-layer pipeline scans for 20+ scam signals instantly.' },
  { step: '03', title: 'Get Results', desc: 'See fraud score, red flags, AI explanation, and safety tips.' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        padding: '100px 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background circles */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div className="fade-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.2)', borderRadius: 40,
          padding: '6px 18px', marginBottom: 24,
          fontSize: 12, fontWeight: 700, color: 'white',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          🛡️ AI-Powered Protection
        </div>

        <h1 className="fade-up delay-1" style={{
          fontSize: 'clamp(32px, 6vw, 64px)',
          fontWeight: 900, color: 'white',
          lineHeight: 1.1, marginBottom: 20,
          letterSpacing: '-0.02em'
        }}>
          Detect Fake Jobs &<br />
          <span style={{
            background: 'linear-gradient(90deg, #ffd89b, #ff6b9d)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Internship Scams
          </span>
        </h1>

        <p className="fade-up delay-2" style={{
          fontSize: 18, color: 'rgba(255,255,255,0.85)',
          maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7
        }}>
          Powered by Rule Engine + Machine Learning + Claude AI.
          Know if a job is real before you apply.
        </p>

        <div className="fade-up delay-3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/analyzer')}
            style={{ background: 'white', color: '#667eea', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', fontSize: 15 }}>
            Start Analyzing Now →
          </button>
          <button onClick={() => navigate('/analyzer')}
            style={{
              background: 'rgba(255,255,255,0.15)', color: 'white',
              border: '1.5px solid rgba(255,255,255,0.4)',
              borderRadius: 50, padding: '14px 28px',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', backdropFilter: 'blur(10px)',
              transition: 'all 0.3s'
            }}>
            See Demo
          </button>
        </div>
      </div>

      {/* STATS */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        maxWidth: 900, margin: '-40px auto 0',
        padding: '0 24px', gap: 16, position: 'relative', zIndex: 10
      }}>
        {STATS.map((s, i) => (
          <div key={i} className={`card fade-up delay-${i+1}`}
            style={{ padding: '24px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#667eea', marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <div style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <h2 className="fade-up" style={{ fontSize: 36, fontWeight: 900, textAlign: 'center', marginBottom: 8 }}>
          How JobShield Works
        </h2>
        <p className="fade-up delay-1" style={{ textAlign: 'center', color: '#64748b', marginBottom: 48, fontSize: 15 }}>
          Three simple steps to ensure your next career move is safe.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {HOW.map((h, i) => (
            <div key={i} className={`card hover-lift fade-up delay-${i+2}`}
              style={{ padding: 28 }}>
              <div style={{
                fontSize: 13, fontWeight: 800, color: '#667eea',
                fontFamily: 'Space Mono, monospace', marginBottom: 12,
                background: 'linear-gradient(135deg, #667eea22, #764ba222)',
                display: 'inline-block', padding: '4px 12px', borderRadius: 8
              }}>{h.step}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{h.title}</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{h.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ padding: '0 24px 80px', maxWidth: 900, margin: '0 auto' }}>
        <h2 className="fade-up" style={{ fontSize: 36, fontWeight: 900, textAlign: 'center', marginBottom: 8 }}>
          Enterprise-Grade Protection
        </h2>
        <p className="fade-up delay-1" style={{ textAlign: 'center', color: '#64748b', marginBottom: 48, fontSize: 15 }}>
          Built with the latest advancements in ML and AI.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className={`card hover-lift fade-up delay-${i+1}`}
              style={{ padding: 28, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: 'linear-gradient(135deg, #667eea22, #764ba244)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
              }}>{f.icon}</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        padding: '60px 24px', textAlign: 'center'
      }}>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: 'white', marginBottom: 12 }}>
          Ready to Stay Safe?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 28, fontSize: 15 }}>
          Analyze any job posting for free in seconds.
        </p>
        <button className="btn-primary" onClick={() => navigate('/analyzer')}
          style={{ background: 'white', color: '#667eea', fontSize: 16 }}>
          Start Analyzing Now →
        </button>
      </div>

      {/* DISCLAIMER */}
      <div style={{ background: '#f1f5f9', padding: '20px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#94a3b8', maxWidth: 600, margin: '0 auto' }}>
          ⚠️ <strong>Disclaimer:</strong> This tool provides AI-based risk estimation and should not be solely relied upon. Always verify job postings independently before making decisions.
        </p>
      </div>

    </div>
  );
}