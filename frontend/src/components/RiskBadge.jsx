import { motion } from 'framer-motion';

export default function RiskBadge({ risk_level }) {
  const config = {
    HIGH:   { color: '#ff3d6b', bg: 'rgba(255,61,107,0.1)',   border: 'rgba(255,61,107,0.4)',   icon: '🔴', glow: 'glow-pink' },
    MEDIUM: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.4)',   icon: '🟡', glow: '' },
    LOW:    { color: '#00e5b0', bg: 'rgba(0,229,176,0.1)',    border: 'rgba(0,229,176,0.4)',    icon: '🟢', glow: 'glow-cyan' },
  };
  const c = config[risk_level] || config.LOW;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
      className={`glass ${c.glow}`}
      style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
    >
      <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted2)', fontWeight: 700 }}>
        Risk Level
      </p>

      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          width: 80, height: 80, borderRadius: '50%',
          background: c.bg, border: `2px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36
        }}
      >
        {c.icon}
      </motion.div>

      <span style={{
        fontSize: 20, fontWeight: 900, letterSpacing: '0.1em',
        color: c.color, textTransform: 'uppercase',
        fontFamily: 'Space Mono, monospace'
      }}>
        {risk_level}
      </span>
    </motion.div>
  );
}