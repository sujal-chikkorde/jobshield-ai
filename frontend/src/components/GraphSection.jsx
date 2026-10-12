
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function GraphSection({
  risk_score,
  rule_score,
  url_score,
}) {
  const scores = [
    {
      name: 'Overall Risk',
      score: risk_score,
      fill: '#00b894',
    },
    ...(rule_score != null
      ? [{
          name: 'Text Rules',
          score: rule_score,
          fill: '#ff3d6b',
        }]
      : []),
    ...(url_score != null
      ? [{
          name: 'URL Checks',
          score: url_score,
          fill: '#7c6dfa',
        }]
      : []),
  ].filter(item => Number.isFinite(Number(item.score)))
   .map(item => ({
     ...item,
     score: Math.max(0, Math.min(100, Number(item.score))),
   }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass"
      style={{ padding: 24 }}
    >
      <p
        style={{
          fontSize: 11,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--muted2)',
          fontWeight: 700,
          marginBottom: 20,
        }}
      >
        Score Breakdown
      </p>

      {scores.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={scores}
            layout="vertical"
            margin={{ top: 4, right: 12, bottom: 4, left: 12 }}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: '#5a5a78', fontSize: 10 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={95}
              tick={{ fill: '#5a5a78', fontSize: 11 }}
            />
            <Tooltip
              formatter={value => [`${value}/100`, 'Risk score']}
              contentStyle={{
                background: '#0e0e1c',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: '#e8e8f5',
                fontSize: 12,
              }}
            />
            <Bar dataKey="score" barSize={24} radius={[0, 6, 6, 0]}>
              {scores.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p style={{ color: 'var(--muted2)', fontSize: 13 }}>
          No score breakdown is available.
        </p>
      )}

      <p
        style={{
          fontSize: 11,
          color: 'var(--muted2)',
          lineHeight: 1.6,
          marginTop: 12,
        }}
      >
        Scores represent detected risk indicators, not the probability of fraud.
        Text and URL scores use different checks and may not be directly comparable.
      </p>
    </motion.div>
  );
}
