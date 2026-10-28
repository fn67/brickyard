import { ABOUT } from '../content/about';

// An example left half (three columns of five); the right two columns mirror the first two.
const LEFT = ['101', '011', '111', '010', '101'];
const CELL = 12;
const GAP = 2;
const GRID = 5 * CELL + 4 * GAP;
const RIGHT_X = GRID + 40;

function cellClass(x: number, y: number, mirrored: boolean): string {
  if (x < 3) return LEFT[y][x] === '1' ? 'md-on' : 'md-off';
  if (!mirrored) return 'md-empty';
  return LEFT[y][4 - x] === '1' ? 'md-on md-mirror' : 'md-off';
}

function grid(left: number, mirrored: boolean) {
  return LEFT.flatMap((_, y) =>
    [0, 1, 2, 3, 4].map((x) => {
      const cls = cellClass(x, y, mirrored);
      // Dashed outlines are drawn half a pixel in so the stroke stays inside the cell.
      const inset = cls === 'md-empty' ? 0.5 : 0;
      const size = CELL - inset * 2;
      return (
        <rect
          key={`${left}-${x}-${y}`}
          className={cls}
          x={left + x * (CELL + GAP) + inset}
          y={y * (CELL + GAP) + inset}
          width={size}
          height={size}
        />
      );
    }),
  );
}

/** Step 3: the left half of a grid, an arrow, then the full grid with the mirrored half lighter. */
export function MirrorDiagram() {
  return (
    <svg className="about-diagram" width={RIGHT_X + GRID} height={GRID + 20} viewBox={`0 0 ${RIGHT_X + GRID} ${GRID + 20}`} aria-hidden="true" focusable="false">
      {grid(0, false)}
      <path className="md-arrow" d={`M${GRID + 13} ${GRID / 2}h14m-6-6 6 6-6 6`} />
      {grid(RIGHT_X, true)}
      <text className="md-cap" x={GRID / 2} y={GRID + 17} textAnchor="middle">
        {ABOUT.diagram.left}
      </text>
      <text className="md-cap" x={RIGHT_X + GRID / 2} y={GRID + 17} textAnchor="middle">
        {ABOUT.diagram.right}
      </text>
    </svg>
  );
}
