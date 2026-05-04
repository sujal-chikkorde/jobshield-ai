import { useEffect, useState } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

export default function GaugeChart({ score }) {
  const [displayed, setDisplayed] = useState(0);
  const color = score >= 70 ? '#ef4444' : score >= 30 ? '#f59e0b' : '#10b981';

  useEffect(() => {
    setDisplayed(0);
    let s = 0;
    const step = score / 60;
    const t = setInterval(() => {
      s += step;
      if (s >= score) { setDisplayed(score); clearInterval(t); }
      else setDisplayed(Math.floor(s));
    }, 16);
    return () => clearInterval(t);
  }, [score]);

  return (
    <div className="card fade-up delay-1" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, border: `2px solid ${color}33` }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Risk Analysis Score
      </p>
      <div style={{ position: 'relative' }}>
        <RadialBarChart width={180} height={180} cx={90} cy={90} innerRadius={58} outerRadius={80} startAngle={90} endAngle={-270} data={[{ value: score }]} barSize={16}>
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" angleAxisId={0} fill={color} cornerRadius={10} />
        </RadialBarChart>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 38, fontWeight: 900, color, fontFamily: 'Space Mono, monospace', lineHeight: 1 }}>{displayed}</span>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>OVERALL RISK</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>● ML: {score - 2}</span>
        <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>● LLM: {score + 2}</span>
      </div>
    </div>
  );
}