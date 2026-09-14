/**
 * TileScheduleMap: the order in which ClusterPersistentScheduler2D numbers
 * output tiles. Rows are M tiles, columns are N tiles. With l2_group_size=g,
 * the grid is cut into bands of g rows; inside a band, ids run down the g
 * rows of one N column before moving to the next column, so consecutive ids
 * share a B tile and revisit the same g A tiles.
 *
 * Only the numbering is drawn. Which persistent CTA picks up which id, and in
 * what order the hardware actually runs them, is not something the id alone
 * determines.
 */
import { cn } from "@/lib/utils";
import styles from "./pipeline-trace.module.css";

const CELL_W = 34;
const CELL_H = 22;
const GAP = 3;
const LABEL_W = 38;
const HEAD_H = 20;

export default function TileScheduleMap({
  mTiles = 16,
  nTiles = 8,
  groupSize = 8,
  className,
}: {
  mTiles?: number;
  nTiles?: number;
  groupSize?: number;
  /** Replaces the default vertical margin (my-8) when embedded in another widget. */
  className?: string;
}) {
  const groups = Math.ceil(mTiles / groupSize);
  const width = LABEL_W + GAP + nTiles * (CELL_W + GAP);
  const height = HEAD_H + GAP + mTiles * (CELL_H + GAP) + (groups - 1) * GAP;

  const tileId = (m: number, n: number) => {
    const g = Math.floor(m / groupSize);
    const rowsInGroup = Math.min(groupSize, mTiles - g * groupSize);
    return g * groupSize * nTiles + n * rowsInGroup + (m - g * groupSize);
  };

  const rowY = (m: number) =>
    HEAD_H + GAP + m * (CELL_H + GAP) + Math.floor(m / groupSize) * GAP;

  return (
    <figure
      className={cn(
        "not-prose",
        className ?? "my-8",
        styles.tokens,
        styles.schedule,
      )}
    >
      <svg
        className={styles.scheduleSvg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Tile numbering for ${mTiles} by ${nTiles} tiles with l2_group_size=${groupSize}`}
      >
        {Array.from({ length: nTiles }, (_, n) => (
          <text
            key={n}
            className={styles.scheduleHead}
            x={LABEL_W + GAP + n * (CELL_W + GAP) + CELL_W / 2}
            y={13}
          >
            n={n}
          </text>
        ))}
        {Array.from({ length: mTiles }, (_, m) => {
          const y = rowY(m);
          const g = Math.floor(m / groupSize);
          return (
            <g key={m}>
              <text
                className={styles.scheduleHead}
                x={LABEL_W - 4}
                y={y + CELL_H / 2 + 4}
                textAnchor="end"
              >
                m={m}
              </text>
              {Array.from({ length: nTiles }, (_, n) => {
                const x = LABEL_W + GAP + n * (CELL_W + GAP);
                return (
                  <g key={n}>
                    <rect
                      className={styles.scheduleCell}
                      data-group={g % 2}
                      x={x}
                      y={y}
                      width={CELL_W}
                      height={CELL_H}
                      rx={3}
                    />
                    <text
                      className={styles.scheduleId}
                      x={x + CELL_W / 2}
                      y={y + CELL_H / 2 + 3.5}
                    >
                      {tileId(m, n)}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <figcaption className={styles.scheduleCaption}>
        Tile ids for {mTiles} x {nTiles} output tiles with{" "}
        <code>l2_group_size={groupSize}</code>. Each shaded band is one group of{" "}
        {groupSize} M rows; within a band, ids run down one N column before
        advancing to the next, so ids {0} to {groupSize - 1} all use B tile n=0.
      </figcaption>
    </figure>
  );
}
