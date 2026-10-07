// v1.1 Faza F: haydovchi ariza kartasidagi 4 bosqichli holat chizig'i (応募 → 書類選考 → 面接 → 採用).
// Faqat mavjud palitra: #0A84FF / #FF9F0A / #AF52DE / #34C759 / #FF3B30, kulrang #8E8E93.
import { getStageSteps } from '../../utils/applicationStage';

const GREY = 'rgba(142, 142, 147, 0.35)';

export default function ApplicationStageTimeline({ status, t }) {
  const steps = getStageSteps(status);
  const currentIdx = steps.findIndex((s) => s.state === 'current');
  const accent = steps[currentIdx]?.color || '#0A84FF';
  return (
    <ol
      className="app-stage-timeline"
      aria-label={t('applicationStatus', '選考状況')}
      style={{ listStyle: 'none', margin: '8px 0 2px 0', padding: '0 4px', display: 'grid', gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
    >
      {steps.map((s, i) => {
        const reached = s.state !== 'todo';
        const dotColor = s.state === 'current' ? s.color : (reached ? accent : GREY);
        return (
          <li
            key={s.key}
            aria-current={s.state === 'current' ? 'step' : undefined}
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', minWidth: 0 }}
          >
            {/* connector to the previous step */}
            {i > 0 && (
              <span
                aria-hidden="true"
                style={{ position: 'absolute', top: '4px', right: '50%', width: '100%', height: '2px', borderRadius: '2px', background: reached ? accent : GREY, opacity: reached ? 0.85 : 1 }}
              />
            )}
            <span
              aria-hidden="true"
              style={{
                position: 'relative', zIndex: 1, width: '10px', height: '10px', borderRadius: '50%',
                background: reached ? dotColor : 'var(--card-bg, #fff)',
                border: `2px solid ${dotColor}`,
                boxSizing: 'border-box',
                boxShadow: s.state === 'current' ? `0 0 8px ${s.color}` : 'none',
              }}
            />
            <span
              style={{
                fontSize: '10.5px', lineHeight: 1.2, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
                color: s.state === 'current' ? s.color : (reached ? 'var(--text-main)' : '#8E8E93'),
                fontWeight: s.state === 'current' ? 700 : 500,
              }}
            >
              {t(s.i18nKey, s.fallback)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
