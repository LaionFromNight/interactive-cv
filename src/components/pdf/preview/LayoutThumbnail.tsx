import type { CvPdfLayoutId } from "../CvPdfOptions";
import type { PdfPalette } from "../theme/palettes";

/*
 * Tiny schematic drawings of each layout, painted with the active palette.
 * They update instantly (no PDF rendering), so users can compare layouts
 * and colors while the real preview is being generated.
 */

const W = 84;
const H = 119;

type Props = { palette: PdfPalette };

function Lines({
  x,
  y,
  width,
  count,
  color,
  gap = 3.2,
  height = 1.3,
}: {
  x: number;
  y: number;
  width: number;
  count: number;
  color: string;
  gap?: number;
  height?: number;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <rect
          key={index}
          x={x}
          y={y + index * gap}
          width={index === count - 1 ? width * 0.62 : width}
          height={height}
          rx={0.6}
          fill={color}
        />
      ))}
    </>
  );
}

function Classic({ palette: p }: Props) {
  return (
    <>
      <circle cx={13} cy={14} r={6} fill={p.border} />
      <rect x={23} y={9} width={32} height={4} rx={1} fill={p.ink} />
      <rect x={23} y={15.5} width={26} height={1.8} rx={0.9} fill={p.accent} />
      <rect x={23} y={19.5} width={40} height={1.2} rx={0.6} fill={p.subtle} />
      <rect x={7} y={25} width={70} height={1} fill={p.accent} />
      {[31, 49, 83, 101].map((y, index) => (
        <g key={y}>
          <rect x={7} y={y} width={18} height={1.8} rx={0.9} fill={p.accent} />
          <rect x={7} y={y + 3} width={70} height={0.5} fill={p.border} />
          <Lines x={7} y={y + 6} width={70} count={index === 1 ? 8 : 3} color={p.border} />
        </g>
      ))}
    </>
  );
}

function Sidebar({ palette: p }: Props) {
  return (
    <>
      <rect x={0} y={0} width={27} height={H} fill={p.dark} />
      <circle cx={13.5} cy={15} r={7.5} fill={p.darkAccent} />
      <circle cx={13.5} cy={15} r={6.3} fill={p.darkMuted} />
      {[28, 50, 78].map((y) => (
        <g key={y}>
          <rect x={5} y={y} width={12} height={1.5} rx={0.75} fill={p.darkAccent} />
          <Lines x={5} y={y + 4} width={17} count={5} color={p.darkBorder} />
        </g>
      ))}
      <rect x={33} y={9} width={34} height={4.5} rx={1} fill={p.ink} />
      <rect x={33} y={16} width={30} height={1.8} rx={0.9} fill={p.accent} />
      {[25, 45].map((y, index) => (
        <g key={y}>
          <rect x={33} y={y} width={4} height={1.5} rx={0.75} fill={p.accent} />
          <rect x={38.5} y={y - 0.3} width={16} height={2} rx={1} fill={p.ink} />
          <Lines x={33} y={y + 5} width={44} count={index === 0 ? 3 : 18} color={p.border} />
        </g>
      ))}
    </>
  );
}

function Modern({ palette: p }: Props) {
  return (
    <>
      <rect x={0} y={0} width={W} height={24} fill={p.dark} />
      <rect x={0} y={24} width={W} height={1.6} fill={p.accent} />
      <circle cx={13} cy={12} r={6.5} fill={p.darkAccent} />
      <circle cx={13} cy={12} r={5.4} fill={p.darkMuted} />
      <rect x={23} y={7.5} width={30} height={4} rx={1} fill={p.darkText} />
      <rect x={23} y={14} width={24} height={1.6} rx={0.8} fill={p.darkAccent} />
      <rect x={23} y={18} width={36} height={1.2} rx={0.6} fill={p.darkMuted} />
      <rect x={7} y={31} width={16} height={1.6} rx={0.8} fill={p.accent} />
      <Lines x={7} y={35} width={43} count={3} color={p.border} />
      <rect x={7} y={48} width={16} height={1.6} rx={0.8} fill={p.accent} />
      <Lines x={7} y={52} width={43} count={19} color={p.border} />
      {[30, 57, 84].map((y, index) => (
        <g key={y}>
          <rect x={55} y={y} width={22} height={index === 1 ? 23 : 22} rx={2} fill={p.surface} />
          <rect x={58} y={y + 3} width={10} height={1.4} rx={0.7} fill={p.accent} />
          {Array.from({ length: 6 }, (_, chip) => (
            <rect
              key={chip}
              x={58 + (chip % 2) * 8.5}
              y={y + 7 + Math.floor(chip / 2) * 4}
              width={7}
              height={2.4}
              rx={1.2}
              fill={p.paper}
              stroke={p.border}
              strokeWidth={0.4}
            />
          ))}
        </g>
      ))}
    </>
  );
}

function Elegant({ palette: p }: Props) {
  return (
    <>
      <circle cx={W / 2} cy={11} r={5} fill={p.border} />
      <rect x={24} y={19} width={36} height={3.5} rx={0.8} fill={p.ink} />
      <rect x={29} y={25} width={26} height={1.4} rx={0.7} fill={p.accent} />
      <rect x={20} y={29} width={44} height={1} rx={0.5} fill={p.subtle} />
      <rect x={8} y={34} width={68} height={0.8} fill={p.ink} />
      <rect x={8} y={35.6} width={68} height={0.4} fill={p.accent} />
      {[41, 56, 94].map((y, index) => (
        <g key={y}>
          <rect x={8} y={y} width={11} height={1.4} rx={0.7} fill={p.accent} />
          <rect x={22} y={y} width={0.4} height={index === 1 ? 35 : 12} fill={p.border} />
          <Lines x={25} y={y} width={51} count={index === 1 ? 11 : 4} color={p.border} />
        </g>
      ))}
    </>
  );
}

function Timeline({ palette: p }: Props) {
  return (
    <>
      <rect x={0} y={0} width={2.4} height={H} fill={p.accent} />
      <rect x={8} y={7} width={13} height={13} rx={2.5} fill={p.border} />
      <rect x={25} y={8} width={32} height={4.5} rx={1} fill={p.ink} />
      <rect x={25} y={15} width={26} height={1.8} rx={0.9} fill={p.accent} />
      <rect x={8} y={25} width={69} height={12} rx={1.8} fill={p.accentSoft} />
      <rect x={8} y={25} width={1} height={12} fill={p.accent} />
      <Lines x={12} y={28} width={60} count={3} color={p.border} />
      <rect x={8} y={42} width={20} height={2} rx={1} fill={p.ink} />
      <rect x={24} y={49} width={0.6} height={62} fill={p.border} />
      {[49, 66, 83, 100].map((y, index) => (
        <g key={y}>
          <rect x={10} y={y + 0.5} width={11} height={1.2} rx={0.6} fill={index % 2 === 0 ? p.accent : p.subtle} />
          <circle
            cx={24.3}
            cy={y + 1.2}
            r={index % 2 === 0 ? 2 : 1.5}
            fill={index % 2 === 0 ? p.accent : p.paper}
            stroke={p.accent}
            strokeWidth={0.6}
          />
          <rect x={29} y={y} width={26} height={1.8} rx={0.9} fill={p.ink} />
          <Lines x={29} y={y + 4} width={48} count={3} color={p.border} />
        </g>
      ))}
    </>
  );
}

const DRAWINGS: Record<CvPdfLayoutId, (props: Props) => React.ReactElement> = {
  classic: Classic,
  sidebar: Sidebar,
  modern: Modern,
  elegant: Elegant,
  timeline: Timeline,
};

export function LayoutThumbnail({
  layoutId,
  palette,
  className,
}: {
  layoutId: CvPdfLayoutId;
  palette: PdfPalette;
  className?: string;
}) {
  const Drawing = DRAWINGS[layoutId];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true">
      <rect x={0} y={0} width={W} height={H} fill={palette.paper} />
      <Drawing palette={palette} />
    </svg>
  );
}
