import { SceneFrame } from './SceneFrame';

export function MissedCallScene() {
  return (
    <SceneFrame>
      <circle cx="120" cy="84" r="64" className="fill-accent-soft" />
      <ellipse cx="120" cy="146" rx="40" ry="6" className="fill-navy/10" />
      <g className="illu-ring">
        <path d="M80 66 Q70 84 80 102" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
        <path d="M68 56 Q52 84 68 112" className="stroke-primary/50" strokeWidth="4" strokeLinecap="round" />
        <path d="M160 66 Q170 84 160 102" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
        <path d="M172 56 Q188 84 172 112" className="stroke-primary/50" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g className="illu-float">
        <rect x="92" y="28" width="56" height="108" rx="13" className="fill-navy" />
        <rect x="97" y="40" width="46" height="84" rx="8" className="fill-white" />
        <rect x="112" y="33" width="16" height="3" rx="1.5" className="fill-white/40" />
        <circle cx="120" cy="76" r="16" className="fill-accent-soft" />
        <path d="M113 70c-1.5 7 5 15 13 14l2-5-6-3-3 3c-3-2-5-5-6-8l3-3-3-6z" className="fill-primary" />
        <circle cx="140" cy="54" r="9" className="fill-primary" />
        <path d="M136.5 50.5l7 7M143.5 50.5l-7 7" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        <rect x="104" y="102" width="32" height="5" rx="2.5" className="fill-ink/15" />
        <rect x="110" y="111" width="20" height="5" rx="2.5" className="fill-ink/10" />
      </g>
    </SceneFrame>
  );
}

export function SlowReplyScene() {
  return (
    <SceneFrame>
      <circle cx="120" cy="84" r="64" className="fill-accent-soft" />
      <g className="illu-float">
        <rect x="44" y="40" width="102" height="38" rx="14" className="fill-white" />
        <rect x="44" y="40" width="102" height="38" rx="14" className="stroke-ink/10" />
        <rect x="58" y="52" width="60" height="5" rx="2.5" className="fill-ink/20" />
        <rect x="58" y="63" width="38" height="5" rx="2.5" className="fill-ink/12" />
      </g>
      <g className="illu-float-slow">
        <rect x="104" y="92" width="94" height="38" rx="14" className="fill-primary" />
        <circle cx="132" cy="111" r="4.5" className="fill-white illu-dot-1" />
        <circle cx="148" cy="111" r="4.5" className="fill-white illu-dot-2" />
        <circle cx="164" cy="111" r="4.5" className="fill-white illu-dot-3" />
      </g>
      <g>
        <circle cx="186" cy="48" r="22" className="fill-navy" />
        <circle cx="186" cy="48" r="17" className="fill-white" />
        <path d="M186 36v13l9 5" className="stroke-navy" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </SceneFrame>
  );
}

export function ForgottenQuoteScene() {
  return (
    <SceneFrame>
      <circle cx="120" cy="84" r="64" className="fill-accent-soft" />
      <ellipse cx="120" cy="146" rx="42" ry="6" className="fill-navy/10" />
      <g className="illu-float">
        <rect x="76" y="24" width="88" height="112" rx="11" className="fill-white" />
        <rect x="76" y="24" width="88" height="112" rx="11" className="stroke-ink/10" />
        <rect x="76" y="24" width="88" height="26" rx="11" className="fill-navy" />
        <rect x="76" y="40" width="88" height="10" className="fill-navy" />
        <rect x="88" y="32" width="34" height="5" rx="2.5" className="fill-white/70" />
        <rect x="88" y="62" width="64" height="5" rx="2.5" className="fill-ink/15" />
        <rect x="88" y="74" width="50" height="5" rx="2.5" className="fill-ink/12" />
        <rect x="88" y="86" width="58" height="5" rx="2.5" className="fill-ink/12" />
        <rect x="88" y="108" width="30" height="14" rx="7" className="fill-primary" />
        <text x="103" y="119" textAnchor="middle" className="fill-white" fontSize="10" fontWeight="800">$$</text>
      </g>
      <g className="illu-ring">
        <circle cx="170" cy="40" r="17" className="fill-white stroke-ink/10" />
        <path d="M170 31a7 7 0 0 0-7 7v5l-3 4h20l-3-4v-5a7 7 0 0 0-7-7zM167 51a3 3 0 0 0 6 0" className="stroke-primary" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="179" cy="28" r="4.5" className="fill-primary" />
      </g>
    </SceneFrame>
  );
}

export function HelpScene() {
  return (
    <SceneFrame>
      <circle cx="120" cy="84" r="64" className="fill-accent-soft" />
      <g className="illu-float">
        <rect x="52" y="34" width="96" height="62" rx="16" className="fill-white stroke-ink/10" />
        <path d="M76 96l-8 20 26-20z" className="fill-white stroke-ink/10" />
        <rect x="76" y="94" width="20" height="4" className="fill-white" />
        <text x="100" y="78" textAnchor="middle" className="fill-navy" fontSize="38" fontWeight="800">?</text>
      </g>
      <g className="illu-float-slow">
        <rect x="116" y="82" width="84" height="46" rx="16" className="fill-primary" />
        <path d="M178 128l8 18-24-18z" className="fill-primary" />
        <rect x="130" y="95" width="46" height="5" rx="2.5" className="fill-white/85" />
        <rect x="130" y="107" width="30" height="5" rx="2.5" className="fill-white/60" />
        <circle cx="186" cy="105" r="8" className="fill-white" />
        <path d="M182 105l3 3 5-6" className="stroke-primary" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </SceneFrame>
  );
}
