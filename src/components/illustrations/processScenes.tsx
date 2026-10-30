import { SceneFrame } from './SceneFrame';

export function AuditScene() {
  return (
    <SceneFrame>
      <circle cx="120" cy="84" r="64" className="fill-accent-soft" />
      <g className="illu-float">
        <rect x="70" y="26" width="92" height="116" rx="12" className="fill-white stroke-ink/10" />
        <rect x="98" y="18" width="36" height="16" rx="8" className="fill-navy" />
        {[52, 78, 104].map((y, i) => (
          <g key={y}>
            <rect x="82" y={y} width="16" height="16" rx="5" className={i < 2 ? 'fill-primary' : 'fill-ink/10'} />
            {i < 2 && <path d={`M86 ${y + 8}l3 3 5-6`} stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />}
            <rect x="106" y={y + 3} width={44 - i * 8} height="5" rx="2.5" className="fill-ink/18" />
            <rect x="106" y={y + 11} width={28 - i * 4} height="4" rx="2" className="fill-ink/10" />
          </g>
        ))}
      </g>
      <g className="illu-sweep">
        <circle cx="160" cy="104" r="23" className="fill-white/60 stroke-navy" strokeWidth="5" />
        <path d="M177 122l19 19" className="stroke-navy" strokeWidth="9" strokeLinecap="round" />
        <path d="M148 98q6-9 16-6" className="stroke-primary" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    </SceneFrame>
  );
}

export function BuildScene() {
  return (
    <SceneFrame>
      <circle cx="120" cy="84" r="64" className="fill-accent-soft" />
      <path d="M92 58v22M148 82v22" className="stroke-ink/20" strokeWidth="2.5" strokeDasharray="4 5" />
      <g className="illu-float">
        <rect x="46" y="34" width="104" height="30" rx="12" className="fill-white stroke-ink/10" />
        <rect x="58" y="45" width="52" height="5" rx="2.5" className="fill-ink/20" />
        <circle cx="132" cy="49" r="6" className="fill-primary" />
        <path d="M129 49l2.2 2.2 4-4.4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="illu-float-slow">
        <rect x="92" y="76" width="104" height="30" rx="12" className="fill-primary" />
        <rect x="104" y="87" width="56" height="5" rx="2.5" className="fill-white/80" />
        <circle cx="180" cy="91" r="6" className="fill-white" />
        <path d="M177 91l2.2 2.2 4-4.4" className="stroke-primary" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="illu-float">
        <rect x="52" y="118" width="94" height="28" rx="12" className="fill-white stroke-ink/10" />
        <rect x="64" y="128" width="46" height="5" rx="2.5" className="fill-ink/20" />
        <circle cx="128" cy="132" r="6" className="fill-primary" />
        <path d="M125 132l2.2 2.2 4-4.4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="illu-spin" style={{ transformOrigin: '196px 40px' }}>
        <circle cx="196" cy="40" r="17" className="fill-navy" />
        <circle cx="196" cy="40" r="6" className="fill-accent-soft" />
        <circle cx="196" cy="40" r="17" className="stroke-navy" strokeWidth="6" strokeDasharray="5 6.6" opacity="0.5" />
      </g>
    </SceneFrame>
  );
}

export function FocusScene() {
  return (
    <SceneFrame>
      <circle cx="120" cy="84" r="64" className="fill-accent-soft" />
      <ellipse cx="120" cy="146" rx="62" ry="7" className="fill-navy/10" />
      <g className="illu-float-slow">
        <path d="M54 82l66-48 66 48z" className="fill-navy" />
        <rect x="68" y="80" width="104" height="62" rx="4" className="fill-white stroke-ink/10" />
        <rect x="108" y="104" width="24" height="38" rx="5" className="fill-primary" />
        <circle cx="127" cy="124" r="2" className="fill-white" />
        <rect x="78" y="94" width="22" height="22" rx="4" className="fill-sky/70" />
        <rect x="140" y="94" width="22" height="22" rx="4" className="fill-sky/70" />
      </g>
      <g className="illu-float">
        <circle cx="186" cy="44" r="16" className="fill-primary" />
        <path d="M178 44l6 6 11-12" stroke="white" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </SceneFrame>
  );
}

export function CleanScene() {
  return (
    <SceneFrame>
      <circle cx="120" cy="84" r="64" className="fill-accent-soft" />
      <ellipse cx="116" cy="146" rx="46" ry="6" className="fill-navy/10" />
      <g className="illu-float-slow">
        <rect x="88" y="72" width="56" height="70" rx="14" className="fill-white stroke-ink/10" />
        <rect x="95" y="98" width="42" height="38" rx="9" className="fill-primary/20" />
        <rect x="101" y="106" width="30" height="20" rx="5" className="fill-primary" />
        <rect x="107" y="112" width="18" height="3" rx="1.5" className="fill-white" />
        <rect x="107" y="118" width="12" height="3" rx="1.5" className="fill-white/70" />
        <rect x="106" y="58" width="20" height="16" rx="4" className="fill-navy" />
        <rect x="98" y="40" width="48" height="22" rx="8" className="fill-navy" />
        <rect x="142" y="46" width="14" height="9" rx="3" className="fill-navy" />
        <path d="M136 62q12 2 12 16" className="stroke-navy" strokeWidth="5" strokeLinecap="round" />
      </g>
      <circle cx="170" cy="50" r="3.5" className="fill-sky illu-dot-1" />
      <circle cx="182" cy="42" r="5" className="fill-primary/60 illu-dot-2" />
      <circle cx="180" cy="60" r="2.5" className="fill-sky illu-dot-3" />
      <circle cx="194" cy="52" r="3" className="fill-primary/50 illu-dot-1" />
      <g className="illu-float">
        <circle cx="58" cy="62" r="11" className="fill-white/70 stroke-sky" strokeWidth="2.5" />
        <circle cx="46" cy="94" r="6" className="fill-white/70 stroke-sky" strokeWidth="2.5" />
        <circle cx="66" cy="112" r="4" className="fill-white/70 stroke-sky" strokeWidth="2" />
      </g>
    </SceneFrame>
  );
}

// Light-on-dark: sits on the navy promise card.
export function PromiseScene() {
  return (
    <SceneFrame>
      <circle cx="120" cy="84" r="62" className="fill-white/[0.06]" />
      <g className="illu-float">
        <path d="M120 22l50 18v40c0 30-20 50-50 62-30-12-50-32-50-62V40z" className="fill-white/10 stroke-sky" strokeWidth="3" strokeLinejoin="round" />
        <path d="M96 84l17 17 32-36" className="stroke-primary" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </SceneFrame>
  );
}
