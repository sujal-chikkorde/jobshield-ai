import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ExplanationCard({ explanation }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(explanation.slice(0, i));
      i++;
      if (i > explanation.length) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, [explanation]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass glow-purple"
      style={{ padding: 24, borderLeft: '3px solid var(--accent3)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 16 }}>🧠</span>
        <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent3)', fontWeight: 700 }}>
          AI Explanation
        </p>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text)', minHeight: 60 }}>
        {displayed}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{ display: 'inline-block', width: 2, height: 14, background: 'var(--accent3)', marginLeft: 2, verticalAlign: 'middle' }}
        />
      </p>
    </motion.div>
  );
}