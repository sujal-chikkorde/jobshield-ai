
import { useEffect, useState } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

export default function GaugeChart({ score = 0 }) {
  const safeScore = Number.isFinite(Number(score))
    ? Math.min(100, Math.max(0, Number(score)))
    : 0;

  const [displayed, setDisplayed] = useState(0);

  const color =
    safeScore > 70
      ? '#ef4444'
      : safeScore > 30
        ? '#f59e0b'
        : '#10b981';

  useEffect(() => {
    setDisplayed(0);

    if (safeScore === 0) return;

    let current = 0;
    const step = Math.max(safeScore / 60, 1);

    const timer = setInterval(() => {
      current = Math.min(current + step, safeScore);
      setDisplayed(Math.floor(current));

      if (current >= safeScore) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [safeScore]);

  return (
    <div
      className="card fade-up delay-1"
      style={{
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        border: `2px solid ${color}33`,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#94a3b8',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        Overall Risk Score
      </p>

      <div style={{ position: 'relative' }}>
        <RadialBarChart
          width={180}
          height={180}
          cx={90}
          cy={90}
          innerRadius={58}
          outerRadius={80}
          startAngle={90}
          endAngle={-270}
          data={[{ value: safeScore }]}
          barSize={16}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: '#f1f5f9' }}
            dataKey="value"
            angleAxisId={0}
            fill={color}
            cornerRadius={10}
          />
        </RadialBarChart>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: 38,
              fontWeight: 900,
              color,
              fontFamily: 'Space Mono, monospace',
              lineHeight: 1,
            }}
          >
            {displayed}
          </span>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>
            OUT OF 100
          </span>
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>
        A heuristic estimate based on detected warning signs, not a
        probability that the content is fraudulent.
      </p>
    </div>
  );
}
