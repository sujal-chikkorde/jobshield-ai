import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

export default function GraphSection({ ml_score, rule_score }) {
  const barData = [
    { name: 'Rule Engine', score: rule_score, fill: '#ff3d6b' },
    { name: 'ML Model',    score: ml_score,   fill: '#7c6dfa' },
    { name: 'Combined',    score: Math.round((rule_score + ml_score) / 2), fill: '#00e5b0' },
  ];

  const radarData = [
    { subject: 'Email Risk',   A: rule_score > 50 ? 80 : 20 },
    { subject: 'Fee Risk',     A: rule_score > 60 ? 90 : 15 },
    { subject: 'ML Score',     A: ml_score },
    { subject: 'Urgency',      A: rule_score > 40 ? 70 : 10 },
    { subject: 'Salary Risk',  A: rule_score > 55 ? 75 : 20 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass"
      style={{ padding: 24 }}
    >
      <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted2)', fontWeight: 700, marginBottom: 20 }}>
        📊 Score Breakdown
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Bar Chart */}
        <div>
          <p style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: 12, textAlign: 'center' }}>Layer Scores</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: '#5a5a78', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#5a5a78', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0e0e1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e8e8f5', fontSize: 12 }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div>
          <p style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: 12, textAlign: 'center' }}>Risk Radar</p>
          <ResponsiveContainer width="100%" height={160}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#5a5a78', fontSize: 9 }} />
              <Radar name="Risk" dataKey="A" stroke="#7c6dfa" fill="#7c6dfa" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </motion.div>
  );
}