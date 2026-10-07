// Application status -> 4-step driver timeline (応募 → 書類選考 → 面接 → 採用).

export const APPLICATION_STAGES = [
  { key: 'applied', i18nKey: 'stageApplied', fallback: '応募', color: '#0A84FF' },
  { key: 'screening', i18nKey: 'stageScreening', fallback: '書類選考', color: '#FF9F0A' },
  { key: 'interview', i18nKey: 'stageInterview', fallback: '面接', color: '#AF52DE' },
  { key: 'hired', i18nKey: 'stageHired', fallback: '採用', color: '#34C759' },
];

export const REJECTED_STAGE = { key: 'rejected', i18nKey: 'stageRejected', fallback: '不採用', color: '#FF3B30' };

const STATUS_TO_INDEX = {
  submitted: 0,
  reviewing: 1,
  reviewed: 1,
  interview: 2,
  accepted: 3,
};

/**
 * @param {string} status application status
 * @returns {{ currentIndex: number, rejected: boolean, withdrawn: boolean }}
 *   currentIndex: index of the current stage (0..3). For `rejected`, the last
 *   step is replaced by 不採用 and currentIndex is 3.
 */
export function getApplicationStage(status) {
  if (status === 'rejected') return { currentIndex: 3, rejected: true, withdrawn: false };
  if (status === 'withdrawn') return { currentIndex: 0, rejected: false, withdrawn: true };
  const idx = STATUS_TO_INDEX[status];
  return { currentIndex: typeof idx === 'number' ? idx : 0, rejected: false, withdrawn: false };
}

/**
 * Steps to render, each with state 'done' | 'current' | 'todo'.
 */
export function getStageSteps(status) {
  const { currentIndex, rejected } = getApplicationStage(status);
  return APPLICATION_STAGES.map((stage, i) => {
    const s = rejected && i === APPLICATION_STAGES.length - 1 ? REJECTED_STAGE : stage;
    let state = 'todo';
    if (i < currentIndex) state = 'done';
    else if (i === currentIndex) state = 'current';
    return { ...s, state };
  });
}
