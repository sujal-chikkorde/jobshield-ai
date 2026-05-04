import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: 'Home', path: '/' },
    { label: 'Analyzer', path: '/analyzer' },
    { label: 'About', path: '/about' },
  ];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(99,102,241,0.1)',
      padding: '0 32px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', height: 64,
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
      >
        <div className="floating" style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, boxShadow: '0 4px 16px rgba(102,126,234,0.4)'
        }}>🛡️</div>
        <span style={{ fontWeight: 800, fontSize: 18 }}>
          <span style={{ color: '#667eea' }}>JobShield</span>
          <span style={{ color: '#0f172a' }}> AI</span>
        </span>
      </div>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {links.map(link => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 16px', borderRadius: 8, fontFamily: 'Inter, sans-serif',
              fontSize: 14, fontWeight: 500,
              color: location.pathname === link.path ? '#667eea' : '#64748b',
              borderBottom: location.pathname === link.path ? '2px solid #667eea' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {link.label}
          </button>
        ))}

        <button
          className="btn-primary"
          onClick={() => navigate('/analyzer')}
          style={{ marginLeft: 12, padding: '9px 20px', fontSize: 13 }}
        >
          Start Analyzing
        </button>
      </div>
    </nav>
  );
}