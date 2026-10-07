import { describe, it, expect } from 'vitest';
import { getApplicationStage, getStageSteps } from './applicationStage';

const states = (status) => getStageSteps(status).map((s) => `${s.key}:${s.state}`);

describe('applicationStage', () => {
  it('submitted -> first step current', () => {
    expect(states('submitted')).toEqual(['applied:current', 'screening:todo', 'interview:todo', 'hired:todo']);
  });

  it('reviewing and reviewed -> screening current', () => {
    expect(getApplicationStage('reviewing').currentIndex).toBe(1);
    expect(getApplicationStage('reviewed').currentIndex).toBe(1);
  });

  it('interview -> two done, interview current', () => {
    expect(states('interview')).toEqual(['applied:done', 'screening:done', 'interview:current', 'hired:todo']);
  });

  it('accepted -> hired current, all before done', () => {
    expect(states('accepted')).toEqual(['applied:done', 'screening:done', 'interview:done', 'hired:current']);
  });

  it('rejected -> last step is 不採用 (red)', () => {
    const steps = getStageSteps('rejected');
    expect(steps[3]).toMatchObject({ key: 'rejected', state: 'current', color: '#FF3B30', fallback: '不採用' });
    expect(steps.slice(0, 3).every((s) => s.state === 'done')).toBe(true);
  });

  it('unknown / missing status falls back to applied', () => {
    expect(getApplicationStage(undefined).currentIndex).toBe(0);
    expect(getApplicationStage('weird').currentIndex).toBe(0);
  });

  it('withdrawn is flagged', () => {
    expect(getApplicationStage('withdrawn').withdrawn).toBe(true);
  });
});
