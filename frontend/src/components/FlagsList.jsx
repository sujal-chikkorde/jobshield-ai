import { useState } from 'react';

export default function FlagsList({ rule_flags }) {
  const [expanded, setExpanded] = useState(null);

  if (!rule_flags?.length) return (
    <div className="card fade-up" style={{ padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>No red flags detected</p>
      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>This posting passed all rule checks</p>
    </div>
  );

  return (
    <div className="card fade-up" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Detected Flags</h3>
        <span style={{
          marginLeft: 'auto', fontSize: 12, fontWeight: 700,
          padding: '3px 10px', borderRadius: 20,
          background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca'
        }}>
          {rule_flags.length} Found
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rule_flags.map((flag, i) => {
          const isHigh = flag.severity === 'HIGH';
          const color = isHigh ? '#ef4444' : '#f59e0b';
          const bg = isHigh ? '#fef2f2' : '#fffbeb';
          const border = isHigh ? '#fecaca' : '#fed7aa';
          const isOpen = expanded === i;

          return (
            <div key={i} className="slide-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                  background: bg, border: `1px solid ${border}`,
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: 16 }}>{isHigh ? '🚨' : '⚠️'}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#334155' }}>
                  {typeof flag === 'string' ? flag : flag.text}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  background: color, color: 'white', letterSpacing: '0.05em'
                }}>
                  {flag.severity || 'HIGH'}
                </span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{isOpen ? '▲' : '▼'}</span>
              </div>
              {isOpen && (
                <div style={{ padding: '10px 16px', background: '#f8fafc', borderRadius: '0 0 12px 12px', borderLeft: `3px solid ${color}` }}>
                  <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>
                    This pattern is commonly associated with fraudulent job postings. Legitimate employers do not exhibit this behavior.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}