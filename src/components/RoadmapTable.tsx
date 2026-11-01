import React, { useMemo } from 'react';
import { RoundResult } from '../types/yuki';
import { Grid } from 'lucide-react';
import { Language } from '../utils/translations';

interface RoadmapTableProps {
  history: RoundResult[];
  language?: Language;
}

interface LeftBead {
  id: string;
  number: number;
  size: 'small' | 'big';
  isLatest?: boolean;
}

interface RightBead {
  id: string;
  color: 'red' | 'green' | 'blue';
  parity: 'odd' | 'even';
  label: string; // 'ស' or 'គ'
  isLatest?: boolean;
}

// Initial seed beads on the right side matching image_161c79c7.png exactly
const INITIAL_RIGHT_COLUMNS: RightBead[][] = [
  // Col 0
  [{ id: 'r-seed-0-0', color: 'blue', parity: 'even', label: 'គ' }],
  // Col 1
  [{ id: 'r-seed-1-0', color: 'green', parity: 'even', label: 'គ' }],
  // Col 2
  [{ id: 'r-seed-2-0', color: 'blue', parity: 'even', label: 'គ' }],
  // Col 3
  [{ id: 'r-seed-3-0', color: 'red', parity: 'even', label: 'គ' }],
  // Col 4
  [{ id: 'r-seed-4-0', color: 'blue', parity: 'even', label: 'គ' }],
  // Col 5
  [{ id: 'r-seed-5-0', color: 'red', parity: 'even', label: 'គ' }],
  // Col 6
  [
    { id: 'r-seed-6-0', color: 'green', parity: 'even', label: 'គ' },
    { id: 'r-seed-6-1', color: 'green', parity: 'even', label: 'គ' },
    { id: 'r-seed-6-2', color: 'green', parity: 'odd', label: 'ស' },
  ],
  // Col 7
  [{ id: 'r-seed-7-0', color: 'red', parity: 'odd', label: 'ស' }],
  // Col 8
  [{ id: 'r-seed-8-0', color: 'blue', parity: 'odd', label: 'ស' }],
  // Col 9
  [{ id: 'r-seed-9-0', color: 'green', parity: 'odd', label: 'ស' }],
  // Col 10
  [
    { id: 'r-seed-10-0', color: 'blue', parity: 'odd', label: 'ស' },
    { id: 'r-seed-10-1', color: 'blue', parity: 'even', label: 'គ' },
  ],
  // Col 11
  [
    { id: 'r-seed-11-0', color: 'red', parity: 'even', label: 'គ' },
    { id: 'r-seed-11-1', color: 'red', parity: 'even', label: 'គ' },
  ],
  // Col 12
  [{ id: 'r-seed-12-0', color: 'blue', parity: 'odd', label: 'ស' }],
  // Col 13
  [{ id: 'r-seed-13-0', color: 'green', parity: 'odd', label: 'ស' }],
  // Col 14
  [{ id: 'r-seed-14-0', color: 'red', parity: 'odd', label: 'ស' }],
];

export const RoadmapTable: React.FC<RoadmapTableProps> = ({ history, language = 'kh' }) => {
  const NUM_ROWS = 6;
  const DEFAULT_COLS = 18;

  // Compute Left Roadmap Matrix (លេខ / តូចធំ: Number / Small-Big streak)
  const { leftMatrix, totalLeftCols, latestLeftId } = useMemo(() => {
    // Collect chronological results (oldest -> newest)
    const chronological = [...history].reverse();

    // Group into columns by 'small' vs 'big'
    const columns: LeftBead[][] = [];
    let currentStreak: LeftBead[] = [];
    let currentSize: 'small' | 'big' | null = null;

    chronological.forEach((res, idx) => {
      const isLatest = idx === chronological.length - 1;
      const bead: LeftBead = {
        id: res.id || `res-${res.roundId}`,
        number: res.number,
        size: res.size,
        isLatest,
      };

      if (currentSize === null) {
        currentSize = res.size;
        currentStreak = [bead];
      } else if (res.size === currentSize) {
        currentStreak.push(bead);
      } else {
        columns.push(currentStreak);
        currentStreak = [bead];
        currentSize = res.size;
      }
    });

    if (currentStreak.length > 0) {
      columns.push(currentStreak);
    }

    const totalCols = Math.max(DEFAULT_COLS, columns.length);
    const matrix: (LeftBead | null)[][] = Array(NUM_ROWS)
      .fill(null)
      .map(() => Array(totalCols).fill(null));

    let latestId: string | null = null;

    // Fill matrix using Big Road logic (drop down, dragon tail if reaching row limit)
    columns.forEach((streak, colIdx) => {
      let r = 0;
      let c = colIdx;

      streak.forEach((bead) => {
        if (bead.isLatest) {
          latestId = bead.id;
        }

        if (r < NUM_ROWS && matrix[r][c] === null) {
          matrix[r][c] = bead;
          r += 1;
        } else {
          // Dragon tail turn
          c += 1;
          while (c < totalCols && matrix[NUM_ROWS - 1][c] !== null) {
            c += 1;
          }
          if (c < totalCols) {
            matrix[NUM_ROWS - 1][c] = bead;
          }
        }
      });
    });

    return {
      leftMatrix: matrix,
      totalLeftCols: totalCols,
      latestLeftId: latestId,
    };
  }, [history]);

  // Compute Right Roadmap Matrix (ពណ៌ / សេសគូ: Color streak with Odd/Even label)
  const { rightMatrix, totalRightCols, latestRightId } = useMemo(() => {
    // Separate seed rounds from newly drawn rounds
    // A newly drawn round has an id starting with 'res-' or not in the initial seed
    const newRounds = history.filter((r) => r.id?.startsWith('res-'));
    const chronologicalNew = [...newRounds].reverse();

    // Start with the initial seed columns from image_161c79c7.png
    const columns: RightBead[][] = INITIAL_RIGHT_COLUMNS.map((col) => [...col]);

    let latestId: string | null = null;

    if (chronologicalNew.length > 0) {
      let lastCol = columns[columns.length - 1];
      let lastColor = lastCol && lastCol.length > 0 ? lastCol[lastCol.length - 1].color : null;

      chronologicalNew.forEach((res, idx) => {
        const isLatest = idx === chronologicalNew.length - 1;
        const bead: RightBead = {
          id: res.id || `r-live-${res.roundId}`,
          color: res.color,
          parity: res.parity,
          label: res.parity === 'odd' ? 'ស' : 'គ',
          isLatest,
        };

        if (isLatest) {
          latestId = bead.id;
        }

        if (lastColor === null || res.color === lastColor) {
          if (columns.length === 0) {
            columns.push([bead]);
          } else {
            columns[columns.length - 1].push(bead);
          }
          lastColor = res.color;
        } else {
          columns.push([bead]);
          lastColor = res.color;
        }
      });
    }

    const totalCols = Math.max(DEFAULT_COLS, columns.length);
    const matrix: (RightBead | null)[][] = Array(NUM_ROWS)
      .fill(null)
      .map(() => Array(totalCols).fill(null));

    // Fill matrix
    columns.forEach((streak, colIdx) => {
      let r = 0;
      let c = colIdx;

      streak.forEach((bead) => {
        if (r < NUM_ROWS && matrix[r][c] === null) {
          matrix[r][c] = bead;
          r += 1;
        } else {
          c += 1;
          while (c < totalCols && matrix[NUM_ROWS - 1][c] !== null) {
            c += 1;
          }
          if (c < totalCols) {
            matrix[NUM_ROWS - 1][c] = bead;
          }
        }
      });
    });

    return {
      rightMatrix: matrix,
      totalRightCols: totalCols,
      latestRightId: latestId,
    };
  }, [history]);

  const maxCols = Math.max(DEFAULT_COLS, totalLeftCols, totalRightCols);

  return (
    <div className="w-full bg-white border-t border-[#cbd5e1] flex flex-col text-slate-800 select-none shadow-xs">
      {/* Roadmap Mode Switcher / Real-time Status Bar */}
      <div
        className="bg-[#eef2f7] border-b border-[#cbd5e1] px-3 py-1.5 flex items-center justify-between text-xs"
        style={{
          paddingBottom: '7px',
          paddingTop: '6px',
          marginLeft: '320px',
          marginRight: '0px',
          marginTop: '0px',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-bold text-slate-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>ប្រព័ន្ធលទ្ធផលបន្តផ្ទាល់ (Real-Time History System)</span>
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            • ធ្វើបច្ចុប្បន្នភាពស្វ័យប្រវត្តិតាមជុំថ្មី (Auto-updates every round)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 bg-[#2b5ba8] text-white shadow-xs">
            <Grid className="w-3 h-3" />
            <span>{language === 'en' ? 'Live' : 'ផ្សាយផ្ទាល់'}</span>
          </span>
        </div>
      </div>

      {/* Live Real-Time Interactive Dual Roadmaps */}
      <div className="w-full overflow-x-auto">
          <div
            className="grid grid-cols-2 min-w-[840px] w-full border-b border-[#cbd5e1]"
            style={{ minHeight: '210px' }}
          >
            {/* Left Roadmap: លេខ / តូចធំ (Number / Big-Small) */}
            <div className="border-r border-[#94a3b8] flex flex-col">
              {/* Header */}
              <div
                className="bg-[#dbe6f5] py-1.5 text-center font-bold text-xs sm:text-sm text-[#334155] border-b border-[#9bb9dc]"
                style={{
                  marginRight: '-150px',
                  marginLeft: '321px',
                }}
              >
                {language === 'en' ? 'Number / Big-Small' : 'លេខ / តូចធំ'}
              </div>

              {/* 6-Row Grid */}
              <div
                className="p-1 overflow-x-auto flex-1 flex items-center justify-center bg-white"
                style={{
                  marginRight: '-150px',
                  marginLeft: '321px',
                }}
              >
                <div
                  className="grid grid-rows-6 gap-[1px] bg-[#9bb9dc] border border-[#9bb9dc] w-full"
                  style={{
                    gridTemplateColumns: `repeat(${maxCols}, minmax(28px, 1fr))`,
                  }}
                >
                  {Array.from({ length: NUM_ROWS }).map((_, rIdx) =>
                    Array.from({ length: maxCols }).map((_, cIdx) => {
                      const item = leftMatrix[rIdx]?.[cIdx];
                      const isLatest = item?.id === latestLeftId;

                      return (
                        <div
                          key={`l-${rIdx}-${cIdx}`}
                          className="h-8 sm:h-9 bg-white flex items-center justify-center p-0.5 relative"
                        >
                          {item && (
                            <div
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-[15px] sm:text-[18px] leading-none tracking-tight text-slate-900 bg-white transition-all font-sans ${
                                item.size === 'small'
                                  ? 'border-[2.5px] sm:border-[3px] border-[#00b4d8]' // Small: Cyan hollow ring
                                  : 'border-[2.5px] sm:border-[3px] border-[#ec4899]' // Big: Magenta/Pink hollow ring
                              } ${
                                isLatest
                                  ? 'ring-2 ring-amber-400 scale-105 shadow-md animate-pulse'
                                  : 'shadow-xs'
                              }`}
                            >
                              <span className="translate-y-[-0.5px]">{item.number}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Roadmap: ពណ៌ / សេសគូ (Color / Odd-Even) */}
            <div className="flex flex-col">
              {/* Header */}
              <div
                className="bg-[#dbe6f5] py-1.5 text-center font-bold text-xs sm:text-sm text-[#334155] border-b border-[#9bb9dc]"
                style={{
                  marginLeft: '150px',
                }}
              >
                {language === 'en' ? 'Color / Odd-Even' : 'ពណ៌ / សេសគូ'}
              </div>

              {/* 6-Row Grid */}
              <div
                className="p-1 overflow-x-auto flex-1 flex items-center justify-center bg-white"
                style={{
                  marginLeft: '150px',
                }}
              >
                <div
                  className="grid grid-rows-6 gap-[1px] bg-[#9bb9dc] border border-[#9bb9dc] w-full"
                  style={{
                    gridTemplateColumns: `repeat(${maxCols}, minmax(28px, 1fr))`,
                  }}
                >
                  {Array.from({ length: NUM_ROWS }).map((_, rIdx) =>
                    Array.from({ length: maxCols }).map((_, cIdx) => {
                      const item = rightMatrix[rIdx]?.[cIdx];
                      const isLatest = item?.id === latestRightId;

                      return (
                        <div
                          key={`r-${rIdx}-${cIdx}`}
                          className="h-8 sm:h-9 bg-white flex items-center justify-center p-0.5 relative"
                        >
                          {item && (
                            <div
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-extrabold text-[14px] sm:text-[16px] leading-none text-white transition-all ${
                                item.color === 'red'
                                  ? 'bg-[#dc2626]'
                                  : item.color === 'green'
                                  ? 'bg-[#16a34a]'
                                  : 'bg-[#2563eb]'
                              } ${
                                isLatest
                                  ? 'ring-2 ring-amber-400 scale-105 shadow-md animate-pulse'
                                  : 'shadow-xs'
                              }`}
                            >
                              <span>{item.label}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};
