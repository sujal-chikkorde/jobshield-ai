
export default function About() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '80px 24px',
      background: '#f8fafc',
      fontFamily: 'Inter, sans-serif',
      color: '#0f172a',
    }}>
      <div style={{
        maxWidth: 850,
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 48,
          marginBottom: 16,
        }}>
          🛡️
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 900,
          marginBottom: 20,
        }}>
          About <span style={{ color: '#667eea' }}>ScamXRay</span>
        </h1>

        <p style={{
          fontSize: 17,
          color: '#64748b',
          lineHeight: 1.8,
          maxWidth: 700,
          margin: '0 auto 48px',
        }}>
          ScamXRay helps job seekers identify potentially fraudulent job
          postings and internship scams. Our goal is to help people make
          more informed decisions before sharing personal information or
          applying for opportunities.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          textAlign: 'left',
        }}>
          {[
            {
              icon: '🔎',
              title: 'Identify Red Flags',
              desc: 'Analyze job descriptions for suspicious patterns and warning signs.',
            },
            {
              icon: '🧠',
              title: 'Understand the Risk',
              desc: 'Get an explanation of potential concerns identified during analysis.',
            },
            {
              icon: '🛡️',
              title: 'Apply More Safely',
              desc: 'Use risk insights and practical safety tips to evaluate opportunities.',
            },
          ].map((item) => (
            <div key={item.title} className="card" style={{
              padding: 24,
              borderRadius: 16,
            }}>
              <div style={{ fontSize: 30, marginBottom: 16 }}>
                {item.icon}
              </div>
              <h2 style={{
                fontSize: 18,
                fontWeight: 800,
                marginBottom: 10,
              }}>
                {item.title}
              </h2>
              <p style={{
                fontSize: 14,
                color: '#64748b',
                lineHeight: 1.8,
              }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <p style={{
          marginTop: 40,
          fontSize: 13,
          color: '#94a3b8',
          lineHeight: 1.7,
        }}>
          ScamXRay provides AI-based risk estimates, not guarantees.
          Always independently verify employers and job offers before
          making decisions.
        </p>
      </div>
    </div>
  );
}
