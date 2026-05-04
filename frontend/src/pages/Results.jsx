const HIGH_KEYWORDS = [
  'fee', 'fees', 'pay', 'payment', 'deposit', 'registration fee',
  'gmail', 'yahoo', 'urgent', 'urgency', 'hurry', 'limited seats',
  '24 hour', 'whatsapp only', 'telegram only', 'immediate joining',
  'no interview', 'refundable', 'security deposit'
];

const MED_KEYWORDS = [
  'work from home', 'wfh', 'no experience', 'unlimited earning',
  'per form', 'no target', 'from home', 'earn', 'rupees per',
  'weekly salary', 'daily earning'
];

function HighlightedText({ text }) {
  if (!text) return null;

  // Build segments with risk level marked
  let segments = [{ text, risk: null }];

  // Process HIGH keywords first
  [...HIGH_KEYWORDS, ...MED_KEYWORDS].forEach(keyword => {
    const risk = HIGH_KEYWORDS.includes(keyword) ? 'high' : 'medium';
    const newSegments = [];
    segments.forEach(seg => {
      if (seg.risk !== null) { newSegments.push(seg); return; }
      const lower = seg.text.toLowerCase();
      const idx = lower.indexOf(keyword.toLowerCase());
      if (idx === -1) { newSegments.push(seg); return; }
      if (idx > 0) newSegments.push({ text: seg.text.slice(0, idx), risk: null });
      newSegments.push({ text: seg.text.slice(idx, idx + keyword.length), risk });
      if (idx + keyword.length < seg.text.length) newSegments.push({ text: seg.text.slice(idx + keyword.length), risk: null });
    });
    segments = newSegments;
  });

  return (
    <p style={{ fontSize: 13, lineHeight: 2, color: '#334155' }}>
      {segments.map((seg, i) => {
        if (seg.risk === 'high') return (
          <mark key={i} style={{ background: 'rgba(239,68,68,0.18)', color: '#dc2626', borderRadius: 4, padding: '1px 4px', fontWeight: 700, border: '1px solid rgba(239,68,68,0.3)' }}>
            {seg.text}
          </mark>
        );
        if (seg.risk === 'medium') return (
          <mark key={i} style={{ background: 'rgba(245,158,11,0.18)', color: '#d97706', borderRadius: 4, padding: '1px 4px', fontWeight: 600, border: '1px solid rgba(245,158,11,0.3)' }}>
            {seg.text}
          </mark>
        );
        return <span key={i}>{seg.text}</span>;
      })}
    </p>
  );
}