import { Calendar, CreditCard, Database, Phone, Star, type LucideIcon } from 'lucide-react';
import { SceneFrame } from './SceneFrame';

const CENTER = { x: 120, y: 100 };
const RADIUS = 66;
const ICON_SIZE = 18;
const DEFAULT_ICONS: LucideIcon[] = [Calendar, Phone, CreditCard, Star, Database];

const nodePosition = (index: number, count: number) => {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
  return { x: CENTER.x + RADIUS * Math.cos(angle), y: CENTER.y + RADIUS * Math.sin(angle) };
};

interface ToolsHubSceneProps {
  activeIndex: number;
  // One icon per tool category, drawn around the hub in order.
  icons?: LucideIcon[];
}

export function ToolsHubScene({ activeIndex, icons = DEFAULT_ICONS }: ToolsHubSceneProps) {
  return (
    <SceneFrame height={200}>
      <circle cx={CENTER.x} cy={CENTER.y} r={RADIUS + 18} className="fill-accent-soft" />
      <circle
        cx={CENTER.x}
        cy={CENTER.y}
        r={RADIUS}
        className="stroke-ink/15 illu-spin"
        strokeWidth="1.5"
        strokeDasharray="3 6"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
      {icons.map((Icon, index) => {
        const { x, y } = nodePosition(index, icons.length);
        const isActive = index === activeIndex;
        return (
          <g key={index}>
            <line
              x1={CENTER.x}
              y1={CENTER.y}
              x2={x}
              y2={y}
              className={isActive ? 'stroke-primary illu-flow' : 'stroke-ink/15'}
              strokeWidth={isActive ? 2.5 : 1.5}
              strokeDasharray={isActive ? '5 6' : undefined}
              strokeLinecap="round"
              style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
            />
            {isActive && <circle cx={x} cy={y} r="26" className="fill-primary/20 illu-pulse" />}
            <g
              style={{
                transformOrigin: `${x}px ${y}px`,
                transform: `scale(${isActive ? 1.18 : 1})`,
                transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <circle cx={x} cy={y} r="19" className={isActive ? 'fill-primary' : 'fill-white stroke-ink/10'} style={{ transition: 'fill 0.3s' }} />
              <Icon
                x={x - ICON_SIZE / 2}
                y={y - ICON_SIZE / 2}
                width={ICON_SIZE}
                height={ICON_SIZE}
                strokeWidth={1.75}
                className={isActive ? 'stroke-white' : 'stroke-navy'}
                style={{ transition: 'stroke 0.3s' }}
              />
            </g>
          </g>
        );
      })}
      <g className="illu-float-slow">
        <circle cx={CENTER.x} cy={CENTER.y} r="25" className="fill-navy/25 illu-pulse" />
        <circle cx={CENTER.x} cy={CENTER.y} r="25" className="fill-navy" />
        <text x={CENTER.x} y={CENTER.y + 5} textAnchor="middle" className="fill-white" fontSize="15" fontWeight="800">
          IT
        </text>
      </g>
    </SceneFrame>
  );
}

// Previous version (restore: comment out the component above, uncomment this block, merge the imports)
// import { SceneFrame } from './SceneFrame';
//
// const CENTER = { x: 120, y: 100 };
// const RADIUS = 66;
// const NODE_COUNT = 5;
//
// const nodePosition = (index: number) => {
//   const angle = -Math.PI / 2 + (index * 2 * Math.PI) / NODE_COUNT;
//   return { x: CENTER.x + RADIUS * Math.cos(angle), y: CENTER.y + RADIUS * Math.sin(angle) };
// };
//
// // One simple glyph per tool category, drawn around (0, 0).
// const GLYPHS = [
//   <g key="calendar"><rect x="-7" y="-6" width="14" height="13" rx="3" strokeWidth="2" /><path d="M-7 -1h14M-3 -9v4M3 -9v4" strokeWidth="2" strokeLinecap="round" /></g>,
//   <path key="phone" d="M-6 -7c-2 9 5 16 14 14l1-4-5-3-3 3c-3-2-5-4-6-7l3-3-2-5z" strokeWidth="2" strokeLinejoin="round" />,
//   <g key="card"><rect x="-8" y="-6" width="16" height="12" rx="3" strokeWidth="2" /><path d="M-8 -1h16" strokeWidth="2" /></g>,
//   <path key="star" d="M0 -8l2.4 5 5.4.7-4 3.8 1 5.4L0 4.2l-4.8 2.7 1-5.4-4-3.8 5.4-.7z" strokeWidth="1.8" strokeLinejoin="round" />,
//   <g key="db"><ellipse cx="0" cy="-5" rx="7" ry="3" strokeWidth="2" /><path d="M-7 -5v10c0 1.7 3 3 7 3s7-1.3 7-3V-5M-7 0c0 1.7 3 3 7 3s7-1.3 7-3" strokeWidth="2" /></g>,
// ];
//
// interface ToolsHubSceneProps {
//   activeIndex: number;
// }
//
// export function ToolsHubScene({ activeIndex }: ToolsHubSceneProps) {
//   return (
//     <SceneFrame height={200}>
//       <circle cx={CENTER.x} cy={CENTER.y} r={RADIUS + 18} className="fill-accent-soft" />
//       <circle cx={CENTER.x} cy={CENTER.y} r={RADIUS} className="stroke-ink/15" strokeWidth="1.5" strokeDasharray="3 6" />
//       {Array.from({ length: NODE_COUNT }, (_, index) => {
//         const { x, y } = nodePosition(index);
//         const isActive = index === activeIndex;
//         return (
//           <g key={index}>
//             <line
//               x1={CENTER.x}
//               y1={CENTER.y}
//               x2={x}
//               y2={y}
//               className={isActive ? 'stroke-primary' : 'stroke-ink/15'}
//               strokeWidth={isActive ? 3 : 1.5}
//               style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
//             />
//             {isActive && <circle cx={x} cy={y} r="26" className="fill-primary/20 illu-pulse" />}
//             <g
//               style={{
//                 transformOrigin: `${x}px ${y}px`,
//                 transform: `scale(${isActive ? 1.18 : 1})`,
//                 transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
//               }}
//             >
//               <circle cx={x} cy={y} r="19" className={isActive ? 'fill-primary' : 'fill-white stroke-ink/10'} style={{ transition: 'fill 0.3s' }} />
//               <g transform={`translate(${x} ${y})`} className={isActive ? 'stroke-white' : 'stroke-navy'} style={{ transition: 'stroke 0.3s' }}>
//                 {GLYPHS[index]}
//               </g>
//             </g>
//           </g>
//         );
//       })}
//       <g className="illu-float-slow">
//         <circle cx={CENTER.x} cy={CENTER.y} r="25" className="fill-navy" />
//         <text x={CENTER.x} y={CENTER.y + 5} textAnchor="middle" className="fill-white" fontSize="15" fontWeight="800">
//           IT
//         </text>
//       </g>
//     </SceneFrame>
//   );
// }
