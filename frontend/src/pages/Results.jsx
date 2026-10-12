import { useLocation, useNavigate } from 'react-router-dom';

const FONT =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const COLORS = {
  primary: '#5b5ce2',
  primaryDark: '#4338ca',
  text: '#172044',
  muted: '#64748b',
  border: '#e2e8f0',
  background: '#f4f6ff',
  green: '#16a34a',
  amber: '#d97706',
  red: '#ef4444',
};

function normalizeScore(value) {
  if (value === null || value === undefined || value === '') return null;

  const score = Number(value);

  if (!Number.isFinite(score)) return null;

  return Math.max(0, Math.min(100, score));
}

function getRiskLevel(score) {
  if (score <= 30) return 'LOW';
  if (score <= 70) return 'MEDIUM';
  return 'HIGH';
}

function getRiskColor(level) {
  if (level === 'LOW') return COLORS.green;
  if (level === 'MEDIUM') return COLORS.amber;
  return COLORS.red;
}

function formatLabel(value) {
  return String(value || 'Other Suspicious Communication')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getFlagText(flag) {
  if (typeof flag === 'string') return flag;

  return (
    flag?.text ||
    flag?.message ||
    flag?.description ||
    flag?.name ||
    'Potential risk indicator'
  );
}

function getTipText(tip) {
  if (typeof tip === 'string') return tip;

  return tip?.text || tip?.message || tip?.description || '';
}

function Panel({ title, icon, children, style = {} }) {
  return (
    <section
      style={{
        background: '#ffffff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: 22,
        boxShadow: '0 4px 18px rgba(79,70,229,0.045)',
        minWidth: 0,
        ...style,
      }}
    >
      <h2
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          fontSize: 17,
          fontWeight: 750,
          margin: '0 0 20px',
          color: COLORS.text,
        }}
      >
        {icon && (
          <span style={{ color: COLORS.primary, fontSize: 20 }}>
            {icon}
          </span>
        )}
        {title}
      </h2>

      {children}
    </section>
  );
}

function ScoreCard({ title, score }) {
  const safeScore = normalizeScore(score);
  const displayScore = safeScore ?? 0;
  const level = getRiskLevel(displayScore);
  const color = getRiskColor(level);

  return (
    <div
      style={{
        minWidth: 0,
        padding: 16,
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        background: '#ffffff',
      }}
    >
      <p
        style={{
          color: COLORS.muted,
          fontSize: 12,
          fontWeight: 550,
          margin: '0 0 12px',
        }}
      >
        {title}
      </p>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <strong
          style={{
            color: safeScore === null ? '#94a3b8' : color,
            fontSize: 27,
            fontWeight: 800,
          }}
        >
          {safeScore === null ? '—' : safeScore}
        </strong>

        <span style={{ color: '#94a3b8', fontSize: 12 }}>/100</span>
      </div>

      <div
        style={{
          height: 7,
          background: '#edf0f8',
          borderRadius: 20,
          overflow: 'hidden',
          marginTop: 12,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${displayScore}%`,
            background: color,
            borderRadius: 20,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {safeScore === null && (
        <p
          style={{
            color: '#94a3b8',
            fontSize: 10,
            margin: '8px 0 0',
          }}
        >
          Awaiting score
        </p>
      )}
    </div>
  );
}

function RiskRadar({ values }) {
  const labels = [
    'Urgency',
    'Payment',
    'URL Risk',
    'ML Score',
    'Impersonation',
  ];

  const scores = labels.map(
    (_, index) => normalizeScore(values[index]) ?? 0
  );

  const getPoint = (score, index, maxRadius = 66) => {
    const angle = (-90 + index * 72) * (Math.PI / 180);
    const radius = maxRadius * score / 100;

    return {
      x: 100 + Math.cos(angle) * radius,
      y: 100 + Math.sin(angle) * radius,
    };
  };

  const points = scores
    .map((score, index) => {
      const point = getPoint(score, index);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label="Risk radar chart"
        style={{ width: 200, maxWidth: '100%' }}
      >
        {[16.5, 33, 49.5, 66].map((radius) => (
          <polygon
            key={radius}
            points={labels
              .map((_, index) => {
                const angle = (-90 + index * 72) * (Math.PI / 180);

                return `${
                  100 + Math.cos(angle) * radius
                },${
                  100 + Math.sin(angle) * radius
                }`;
              })
              .join(' ')}
            fill="none"
            stroke="#dce3f2"
            strokeWidth="1"
          />
        ))}

        {labels.map((label, index) => {
          const angle = (-90 + index * 72) * (Math.PI / 180);

          return (
            <line
              key={label}
              x1="100"
              y1="100"
              x2={100 + Math.cos(angle) * 66}
              y2={100 + Math.sin(angle) * 66}
              stroke="#dce3f2"
            />
          );
        })}

        <polygon
          points={points}
          fill="rgba(99,102,241,0.18)"
          stroke="#7067ff"
          strokeWidth="2"
        />

        {scores.map((score, index) => {
          const point = getPoint(score, index);

          return (
            <circle
              key={labels[index]}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#625cf0"
            />
          );
        })}
      </svg>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          minWidth: 100,
        }}
      >
        {labels.map((label, index) => (
          <div
            key={label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              fontSize: 11,
            }}
          >
            <span style={{ color: COLORS.muted }}>{label}</span>
            <strong style={{ color: COLORS.primaryDark }}>
              {scores[index]}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function HighlightedText({ text }) {
  const suspiciousPattern =
    /(within 24 hours|urgent|limited seats|limited slots|registration fee|security deposit|refundable server activation deposit|pay ₹?\s?\d+|₹\s?[\d,]+(?:\.\d+)?(?:\s?to\s?₹?\s?[\d,]+)?|whatsapp only|telegram only|no experience needed|no prior experience|guaranteed|password|otp|click here|verify your account|telegram|gmail\.com|earn ₹?\s?[\d,]+(?:\s?to\s?₹?\s?[\d,]+)?(?:\/month)?|2 hours daily|contact hr manager|activate your id|registration closes)/gi;

  const parts = String(text ?? '').split(suspiciousPattern);

  function isSuspicious(part) {
    return new RegExp(suspiciousPattern.source, 'i').test(part);
  }

  function isHighRisk(part) {
    return /urgent|security deposit|refundable|registration fee|pay ₹|otp|password|verify your account|telegram|gmail\.com|activate your id/i.test(
      part
    );
  }

  return (
    <div
      style={{
        padding: 18,
        background: '#f8faff',
        border: '1px solid #dfe6ff',
        borderRadius: 12,
        color: '#334155',
        fontSize: 14,
        lineHeight: 1.95,
        overflowWrap: 'anywhere',
        whiteSpace: 'pre-wrap',
      }}
    >
      {parts.map((part, index) => {
        if (!isSuspicious(part)) {
          return <span key={index}>{part}</span>;
        }

        const highRisk = isHighRisk(part);

        return (
          <mark
            key={index}
            style={{
              background: highRisk ? '#fee2e2' : '#ffedd5',
              color: highRisk ? '#dc2626' : '#c2410c',
              borderRadius: 5,
              padding: '2px 4px',
              fontWeight: 750,
            }}
          >
            {part}
          </mark>
        );
      })}
    </div>
  );
}

function RiskBadge({ level }) {
  const color = getRiskColor(level);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 10px',
        borderRadius: 30,
        background: color,
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.04em',
      }}
    >
      {level}
    </span>
  );
}

function getCategoryLabel(category) {
  if (typeof category === 'string') {
    return formatLabel(category);
  }

  if (category && typeof category === 'object') {
    return formatLabel(
      category.name || category.category || category.label || category.type
    );
  }

  return 'Other Suspicious Communication';
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: COLORS.background,
          fontFamily: FONT,
          padding: 24,
          display: 'grid',
          placeItems: 'center',
          color: COLORS.text,
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 18,
            padding: 32,
            maxWidth: 480,
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(79,70,229,0.06)',
          }}
        >
          <div style={{ fontSize: 38, marginBottom: 12 }}>🛡️</div>

          <h1 style={{ fontSize: 25, margin: '0 0 10px' }}>
            No analysis results found
          </h1>

          <p
            style={{
              color: COLORS.muted,
              lineHeight: 1.7,
              fontSize: 14,
            }}
          >
            Analyze a message or job posting first to view its report.
          </p>

          <button
            onClick={() => navigate('/analyzer')}
            style={primaryButtonStyle}
          >
            Go to Analyzer
          </button>
        </div>
      </div>
    );
  }

  const riskScore =
    normalizeScore(result.risk_score ?? result.score) ?? 0;

  const riskLevel = getRiskLevel(riskScore);
  const riskColor = getRiskColor(riskLevel);

  const ruleScore = normalizeScore(result.rule_score);
  const mlScore = normalizeScore(result.ml_score);
  const urlScore = normalizeScore(result.url_score);

  const llmScore = normalizeScore(
    result.llm_score ?? result.gemini_score ?? result.ai_score
  );

  const patternScore = normalizeScore(
    result.pattern_similarity ?? result.similarity_score
  );

  const flags = [
    ...(Array.isArray(result.rule_flags) ? result.rule_flags : []),
    ...(Array.isArray(result.url_flags) ? result.url_flags : []),
  ];

  const categories = Array.isArray(result.categories)
    ? result.categories
    : result.categories
      ? [result.categories]
      : [];

  const tips = Array.isArray(result.safety_tips)
    ? result.safety_tips
    : Array.isArray(result.tips)
      ? result.tips
      : [];

  const jobText = String(
    result.jobText ?? result.text ?? result.original_text ?? ''
  );

  const inputType =
    result.input_type || result.inputType || 'Text / Message';

  const classification =
    result.classification ||
    result.category ||
    result.prediction ||
    result.label;

  const explanation =
    result.explanation ||
    result.ai_explanation ||
    result.llm_explanation ||
    'AI explanation is temporarily unavailable. The available risk indicators are shown below.';

  const chartValues = [
    result.urgency_risk ?? ruleScore,
    result.payment_risk ?? result.fee_risk,
    urlScore,
    mlScore,
    result.impersonation_risk,
  ];

  const layerScores = [
    ['Rule Engine', ruleScore],
    ['Machine Learning', mlScore],
    ['URL Analysis', urlScore],
    ['LLM / AI', llmScore],
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '26px 3.5% 34px',
        background: COLORS.background,
        color: COLORS.text,
        fontFamily: FONT,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 1450, margin: '0 auto' }}>
        {/* Page navigation */}

        <button
          onClick={() => navigate('/analyzer')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            border: 0,
            padding: '6px 0',
            marginBottom: 22,
            background: 'transparent',
            color: COLORS.primary,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: FONT,
          }}
        >
          ← Analyze another message
        </button>

        {/* Page heading */}

        <header style={{ marginBottom: 24 }}>
          <p
            style={{
              color: COLORS.primary,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.13em',
              margin: '0 0 8px',
            }}
          >
            ANALYSIS COMPLETE
          </p>

          <h1
            style={{
              fontSize: 'clamp(27px, 3vw, 40px)',
              fontWeight: 850,
              letterSpacing: '-0.035em',
              margin: '0 0 8px',
              lineHeight: 1.2,
            }}
          >
            {riskLevel === 'HIGH'
              ? '🚨 High Risk Detected'
              : riskLevel === 'MEDIUM'
                ? '⚠️ Medium Risk Detected'
                : '🛡️ Lower Risk Detected'}
          </h1>

          <p
            style={{
              fontSize: 15,
              color: COLORS.muted,
              margin: 0,
            }}
          >
            Risk assessment for your {String(inputType).toLowerCase()}.
          </p>
        </header>

        {/* Overall risk assessment */}

        <section
          style={{
            background:
              riskLevel === 'HIGH'
                ? 'linear-gradient(110deg,#fff1f2,#fff7f7)'
                : riskLevel === 'MEDIUM'
                  ? 'linear-gradient(110deg,#fffbeb,#fff7ed)'
                  : 'linear-gradient(110deg,#f0fdf4,#f7fff9)',
            border: `1px solid ${riskColor}70`,
            borderRadius: 17,
            padding: '25px clamp(18px,3vw,32px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 24,
            marginBottom: 18,
          }}
        >
          <div style={{ flex: '1 1 300px' }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.08em',
                margin: '0 0 8px',
              }}
            >
              OVERALL RISK ASSESSMENT
            </p>

            <h2
              style={{
                color: riskColor,
                fontSize: 30,
                fontWeight: 850,
                margin: '0 0 8px',
                letterSpacing: '-0.025em',
              }}
            >
              {riskLevel} RISK
            </h2>

            <p
              style={{
                color: '#475569',
                fontSize: 13,
                lineHeight: 1.7,
                maxWidth: 480,
                margin: 0,
              }}
            >
              {riskLevel === 'HIGH'
                ? 'Strong warning signs were detected. Do not pay or share sensitive information. Verify the source independently.'
                : riskLevel === 'MEDIUM'
                  ? 'Some warning signs may be present. Check the sender, employer, and links carefully.'
                  : 'Fewer warning signs were detected. This result does not guarantee that the message is safe.'}
            </p>

            {classification && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginTop: 14,
                  fontSize: 12,
                }}
              >
                <strong>Classification:</strong>

                <span
                  style={{
                    background: '#e8eaff',
                    color: COLORS.primaryDark,
                    borderRadius: 30,
                    padding: '5px 11px',
                    fontWeight: 700,
                  }}
                >
                  {formatLabel(classification)}
                </span>
              </div>
            )}
          </div>

          <div
            style={{
              width: 132,
              height: 132,
              borderRadius: '50%',
              border: '9px solid #dce8e7',
              borderTopColor: riskColor,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0,
              boxSizing: 'border-box',
              background: '#ffffff80',
            }}
          >
            <strong
              style={{
                color: riskColor,
                fontSize: 36,
                fontWeight: 850,
              }}
            >
              {riskScore}
            </strong>

            <span
              style={{
                color: COLORS.muted,
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              OUT OF 100
            </span>
          </div>
        </section>

        {/* Score breakdown */}

        <Panel title="📊 Score Breakdown" style={{ marginBottom: 18 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
              gap: 12,
            }}
          >
            <ScoreCard title="Overall Risk" score={riskScore} />
            <ScoreCard title="Rule Engine" score={ruleScore} />
            <ScoreCard title="Machine Learning" score={mlScore} />
            <ScoreCard title="URL Analysis" score={urlScore} />
            <ScoreCard title="LLM / AI Analysis" score={llmScore} />
          </div>
        </Panel>

        {/* Flags and risk analysis */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,360px),1fr))',
            gap: 18,
            alignItems: 'stretch',
            marginBottom: 18,
          }}
        >
          <Panel
            title={`🚨 Detected Flags (${flags.length})`}
            style={{ marginBottom: 0 }}
          >
            {flags.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {flags.map((flag, index) => {
                  const rawSeverity =
                    typeof flag === 'object'
                      ? String(flag.severity || 'HIGH').toUpperCase()
                      : 'HIGH';

                  const severity = ['LOW', 'MEDIUM', 'HIGH'].includes(
                    rawSeverity
                  )
                    ? rawSeverity
                    : 'HIGH';

                  const color = getRiskColor(severity);

                  const details =
                    typeof flag === 'object'
                      ? flag.explanation ||
                        flag.details ||
                        flag.reason ||
                        ''
                      : '';

                  return (
                    <details
                      key={index}
                      style={{
                        background: '#fff7f7',
                        border: '1px solid #fecaca',
                        borderRadius: 12,
                        padding: '13px 14px',
                      }}
                    >
                      <summary
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 10,
                          color: '#334155',
                          fontSize: 13,
                          lineHeight: 1.6,
                          listStylePosition: 'inside',
                        }}
                      >
                        <span style={{ flex: '1 1 140px' }}>
                          {getFlagText(flag)}
                        </span>

                        <RiskBadge level={severity} />
                      </summary>

                      {details && (
                        <p
                          style={{
                            color: COLORS.muted,
                            fontSize: 12,
                            lineHeight: 1.7,
                            margin: '12px 0 0',
                          }}
                        >
                          {details}
                        </p>
                      )}
                    </details>
                  );
                })}
              </div>
            ) : (
              <p
                style={{
                  color: COLORS.muted,
                  fontSize: 13,
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                No specific flags were returned. This does not guarantee that
                the message is legitimate.
              </p>
            )}
          </Panel>

          <Panel title="📊 Risk Analysis" style={{ marginBottom: 0 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,190px),1fr))',
                gap: 18,
                alignItems: 'center',
              }}
            >
              <div>
                <p
                  style={{
                    color: '#818cf8',
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    margin: '0 0 20px',
                  }}
                >
                  LAYER SCORES
                </p>

                {layerScores.map(([label, score]) => {
                  const safeScore = normalizeScore(score);
                  const color =
                    safeScore === null
                      ? '#cbd5e1'
                      : getRiskColor(getRiskLevel(safeScore));

                  return (
                    <div key={label} style={{ marginBottom: 17 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 8,
                          fontSize: 11,
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ color: COLORS.muted }}>
                          {label}
                        </span>

                        <strong style={{ color: COLORS.text }}>
                          {safeScore === null ? 'N/A' : safeScore}
                        </strong>
                      </div>

                      <div
                        style={{
                          height: 7,
                          background: '#edf0f8',
                          borderRadius: 20,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${safeScore ?? 0}%`,
                            height: '100%',
                            borderRadius: 20,
                            background: color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  borderLeft: '1px solid #e2e8f0',
                  paddingLeft: 14,
                  minWidth: 0,
                }}
              >
                <p
                  style={{
                    color: '#818cf8',
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    margin: '0 0 12px',
                  }}
                >
                  RISK RADAR
                </p>

                <RiskRadar values={chartValues} />
              </div>
            </div>
          </Panel>
        </div>

        {/* Risk categories: intentionally directly below the grid */}

        <Panel
          title="🏷️ Risk Categories"
          style={{ marginBottom: 18 }}
        >
          {categories.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 9,
              }}
            >
              {categories.map((category, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '7px 12px',
                    borderRadius: 24,
                    background: '#eeefff',
                    color: COLORS.primaryDark,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {getCategoryLabel(category)}
                </span>
              ))}
            </div>
          ) : (
            <p
              style={{
                color: COLORS.muted,
                fontSize: 13,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {classification
                ? `Backend classification: ${formatLabel(classification)}`
                : 'No risk categories were returned for this analysis.'}
            </p>
          )}
        </Panel>

        {/* AI explanation */}

        <Panel title="✨ AI Explanation" style={{ marginBottom: 18 }}>
          <div
            style={{
              padding: 14,
              borderRadius: 10,
              background: '#f3f5ff',
              border: '1px solid #dfe5ff',
              color: '#475569',
              fontSize: 13,
              lineHeight: 1.8,
              overflowWrap: 'anywhere',
            }}
          >
            {explanation}
          </div>

          {patternScore !== null && (
            <p
              style={{
                color: COLORS.muted,
                fontSize: 12,
                margin: '14px 0 0',
              }}
            >
              <strong>Pattern similarity:</strong> {patternScore}%
            </p>
          )}
        </Panel>

        {/* Safety recommendations */}

        <Panel
          title="🛡️ Safety Recommendations"
          style={{ marginBottom: 18 }}
        >
          {tips.length > 0 ? (
            <ul
              style={{
                paddingLeft: 20,
                margin: 0,
                color: '#475569',
              }}
            >
              {tips.map((tip, index) => (
                <li
                  key={index}
                  style={{
                    fontSize: 13,
                    lineHeight: 1.9,
                    marginBottom: 4,
                  }}
                >
                  {getTipText(tip)}
                </li>
              ))}
            </ul>
          ) : (
            <ul
              style={{
                paddingLeft: 20,
                margin: 0,
                color: '#475569',
              }}
            >
              <li style={{ fontSize: 13, lineHeight: 1.9 }}>
                Never pay registration fees or deposits to secure a job.
              </li>
              <li style={{ fontSize: 13, lineHeight: 1.9 }}>
                Verify job openings through the company&apos;s official careers
                website.
              </li>
              <li style={{ fontSize: 13, lineHeight: 1.9 }}>
                Never share passwords, OTPs, PINs, CVV numbers, or banking
                credentials.
              </li>
              <li style={{ fontSize: 13, lineHeight: 1.9 }}>
                Do not trust a link simply because it uses HTTPS.
              </li>
              <li style={{ fontSize: 13, lineHeight: 1.9 }}>
                Verify unexpected requests through official contact channels.
              </li>
            </ul>
          )}
        </Panel>

        {/* Original message with suspicious phrases highlighted */}

        {jobText.trim() && (
          <Panel
            title="🔎 Original Text — Risk Highlights"
            style={{ marginBottom: 18 }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  color: '#dc2626',
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  borderRadius: 20,
                  padding: '5px 10px',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                🔴 Potential risk phrase
              </span>

              <span
                style={{
                  color: '#b45309',
                  background: '#fffbeb',
                  border: '1px solid #fed7aa',
                  borderRadius: 20,
                  padding: '5px 10px',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                🟠 Review carefully
              </span>
            </div>

            <HighlightedText text={jobText} />
          </Panel>
        )}

        {/* Page actions */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            gap: 10,
            margin: '22px 0',
          }}
        >
          <button
            onClick={() => navigate('/analyzer')}
            style={{
              ...secondaryButtonStyle,
            }}
          >
            ← Analyze Another
          </button>

          <button
            onClick={() => navigate('/')}
            style={primaryButtonStyle}
          >
            Back to Home
          </button>
        </div>

        {/* Disclaimer */}

        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fed7aa',
            borderRadius: 11,
            padding: '12px 15px',
            color: '#92400e',
            fontSize: 11,
            lineHeight: 1.8,
          }}
        >
          <strong>⚠️ Disclaimer:</strong> This tool provides an automated risk
          estimate and should not be solely relied upon. Always verify
          messages, URLs, and job postings independently before taking action.
        </div>
      </div>
    </div>
  );
}

const primaryButtonStyle = {
  border: 0,
  borderRadius: 30,
  padding: '12px 21px',
  background: 'linear-gradient(110deg,#5b6df8,#6537ad)',
  color: '#ffffff',
  fontFamily: FONT,
  fontSize: 12,
  fontWeight: 750,
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(91,92,226,0.15)',
};

const secondaryButtonStyle = {
  border: '1px solid #c7d2fe',
  borderRadius: 30,
  padding: '12px 21px',
  background: '#ffffff',
  color: COLORS.primary,
  fontFamily: FONT,
  fontSize: 12,
  fontWeight: 750,
  cursor: 'pointer',
};