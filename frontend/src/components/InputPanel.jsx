import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function InputPanel({ onAnalyze, loading }) {
  const [text, setText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* Textarea */}
      <div className="glass" style={{ padding: 20 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted2)', marginBottom: 10 }}>
          Paste Job Description
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={6}
          placeholder="Paste the suspicious job posting here... e.g. 'Work from home, earn ₹50,000/month, pay ₹500 registration fee'"
          style={{
            width: '100%', background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
            padding: '14px 16px', color: 'var(--text)', fontSize: 13,
            resize: 'vertical', outline: 'none', fontFamily: 'inherit',
            lineHeight: 1.7, transition: 'border 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(124,109,250,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{text.length} characters</span>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(255,61,107,0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => text.trim() && onAnalyze(text)}
            disabled={loading || !text.trim()}
            style={{
              background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #ff3d6b, #7c6dfa)',
              color: 'white', border: 'none', borderRadius: 12,
              padding: '11px 28px', fontWeight: 700, fontSize: 13,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
              opacity: !text.trim() ? 0.5 : 1, fontFamily: 'inherit',
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? '⚙️ Analyzing...' : '🔍 Analyze Job'}
          </motion.button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Space Mono, monospace' }}>OR</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Upload */}
      <motion.div
        className="glass"
        onClick={() => fileRef.current.click()}
        onDrop={e => { e.preventDefault(); setDragOver(false); }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        animate={{ borderColor: dragOver ? 'rgba(0,229,176,0.5)' : 'rgba(255,255,255,0.08)' }}
        whileHover={{ background: 'rgba(255,255,255,0.06)' }}
        style={{
          padding: 28, textAlign: 'center', cursor: 'pointer',
          border: `2px dashed ${dragOver ? 'rgba(0,229,176,0.5)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 20, transition: 'all 0.2s'
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
        <p style={{ fontSize: 13, color: 'var(--muted2)' }}>Drop a WhatsApp / Telegram screenshot</p>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>OCR will extract the text automatically</p>
      </motion.div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} />
    </motion.div>
  );
}