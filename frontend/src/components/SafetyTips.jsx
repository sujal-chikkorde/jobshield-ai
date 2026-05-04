import { motion } from 'framer-motion';

export default function SafetyTips({ tips }) {
  if (!tips?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="glass glow-cyan"
      style={{ padding: 24, borderLeft: '3px solid var(--accent2)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 16 }}>🛡️</span>
        <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent2)', fontWeight: 700 }}>
          Safety Tips
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tips.map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i + 0.7 }}
            whileHover={{ x: 4 }}
            style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'default' }}
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 * i + 0.8, type: 'spring' }}
              style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(0,229,176,0.15)', border: '1.5px solid var(--accent2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: 'var(--accent2)', fontWeight: 700, marginTop: 1
              }}
            >
              ✓
            </motion.span>
            <span style={{ fontSize: 13, lineHeight: 1.7, color: '#b0f0e0' }}>{tip}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}