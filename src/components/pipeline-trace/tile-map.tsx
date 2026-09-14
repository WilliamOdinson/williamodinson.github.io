/**
 * TileMap: an SVG of the cluster output tile. Row bands are the A slices each
 * CTA loaded (and therefore the D rows it owns), column bands are the stored-B
 * slices. Per-cycle state tints the operand bands while they load or feed the
 * cooperative MMA, tints the D cells while they accumulate, and sweeps a
 * column strip across every row band while the epilogue writes chunk by chunk.
 */
import { cn } from "@/lib/utils";
import styles from "./pipeline-trace.module.css";
import type { TileFrame, TileMapSpec } from "./types";

const LABEL_W = 96;
const HEAD_H = 34;
const CELL_W = 132;
const CELL_H = 40;
const GAP = 4;

export default function TileMap({
  spec,
  frame,
}: {
  spec: TileMapSpec;
  frame: TileFrame;
}) {
  const rows = spec.rows.length;
  const cols = spec.cols.length;
  const width = LABEL_W + GAP + cols * (CELL_W + GAP);
  const height = HEAD_H + GAP + rows * (CELL_H + GAP);
  const gridX = LABEL_W + GAP;
  const gridY = HEAD_H + GAP;
  const gridW = cols * (CELL_W + GAP) - GAP;
  const chunkW = gridW / spec.chunks;

  return (
    <svg
      className={styles.tileSvg}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${spec.title}: A ${frame.a}, B ${frame.b}, output ${frame.d}`}
    >
      {/* B slices across the top */}
      {spec.cols.map((col, j) => (
        <g
          key={col.label}
          transform={`translate(${gridX + j * (CELL_W + GAP)} 0)`}
        >
          <rect
            className={cn(styles.band, styles.bandB)}
            data-state={frame.b}
            width={CELL_W}
            height={HEAD_H}
            rx={5}
          />
          <text className={styles.bandLabel} x={8} y={14}>
            {col.label}
          </text>
          <text className={styles.bandSub} x={8} y={27}>
            {col.sub}
          </text>
        </g>
      ))}

      {/* A slices down the side, and one row of D cells for each */}
      {spec.rows.map((row, i) => {
        const y = gridY + i * (CELL_H + GAP);
        return (
          <g key={row.label} transform={`translate(0 ${y})`}>
            <rect
              className={cn(styles.band, styles.bandA)}
              data-state={frame.a}
              width={LABEL_W}
              height={CELL_H}
              rx={5}
            />
            <text className={styles.bandLabel} x={8} y={17}>
              {row.label}
            </text>
            <text className={styles.bandSub} x={8} y={30}>
              {row.sub}
            </text>
            {spec.cols.map((col, j) => (
              <rect
                key={col.label}
                className={styles.cell}
                data-state={frame.d}
                x={gridX + j * (CELL_W + GAP)}
                width={CELL_W}
                height={CELL_H}
                rx={5}
              />
            ))}
          </g>
        );
      })}

      {/* Column strip the epilogue is writing, across every row band */}
      {frame.d === "writing" && frame.chunk !== undefined && (
        <rect
          className={styles.chunk}
          x={gridX + frame.chunk * chunkW}
          y={gridY}
          width={chunkW}
          height={rows * (CELL_H + GAP) - GAP}
          rx={5}
        />
      )}
    </svg>
  );
}
