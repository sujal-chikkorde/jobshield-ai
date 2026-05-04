import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

export default function ScoreGauge({ ml_score }) {
  const color = ml_score >= 70 ? '#ff3d6b' : ml_score >= 40 ? '#f59e0b' : '#00e5b0';
  const label = ml_score >= 70 ? 'HIGH RISK' : ml_score >= 40 ? 'MEDIUM RISK' : 'LOW RISK';

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
      <p style={{fontSize:10,letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--muted2)',fontWeight:700}}>Fraud Probability</p>
      <div style={{position:'relative'}}>
        <RadialBarChart width={160} height={160} cx={80} cy={80} innerRadius={52} outerRadius={72} startAngle={90} endAngle={-270} data={[{value:ml_score}]} barSize={14}>
          <PolarAngleAxis type="number" domain={[0,100]} angleAxisId={0} tick={false}/>
          <RadialBar background={{fill:'var(--surface2)'}} dataKey="value" angleAxisId={0} fill={color} cornerRadius={8}/>
        </RadialBarChart>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:32,fontWeight:900,color,fontFamily:'Space Mono,monospace'}}>{ml_score}</span>
          <span style={{fontSize:9,color:'var(--muted)',letterSpacing:'0.1em'}}>/100</span>
        </div>
      </div>
      <span style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',padding:'4px 12px',borderRadius:20,background:`${color}22`,border:`1px solid ${color}66`,color}}>{label}</span>
    </div>
  );
}