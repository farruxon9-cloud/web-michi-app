import { describe, it, expect } from 'vitest';
import { checkOverpassRestrictions } from './overpassRestrictions';

describe('checkOverpassRestrictions', () => {
  const mockRoute = [
    [35.6895, 139.6917],
    [35.6896, 139.6918],
    [35.6897, 139.6919]
  ];

  it('should pass when there are no restrictions', () => {
    const res = checkOverpassRestrictions(mockRoute, [], 3.8, 2.5, 20.0);
    expect(res.status).toBe('safe');
    expect(res.warnings).toHaveLength(0);
  });

  it('should check height restrictions', () => {
    const restrictions = [
      {
        osmId: 1,
        name: 'Tunnel A',
        wayCoords: [[35.6896, 139.6918], [35.6897, 139.6919]],
        heightLimit: 3.5
      }
    ];
    // Under limit -> safe
    let res = checkOverpassRestrictions(mockRoute, restrictions, 3.2, 2.3, 10.0);
    expect(res.status).toBe('safe');
    
    // Over limit -> warning or blocked
    res = checkOverpassRestrictions(mockRoute, restrictions, 3.8, 2.3, 10.0);
    expect(res.status).toBe('blocked');
    expect(res.warnings[0].message).toContain('高さ制限');
  });

  it('should check length restrictions', () => {
    const restrictions = [
      {
        osmId: 2,
        name: 'Bridge B',
        wayCoords: [[35.6896, 139.6918], [35.6897, 139.6919]],
        lengthLimit: 10.0
      }
    ];
    // Under limit -> safe
    let res = checkOverpassRestrictions(mockRoute, restrictions, 3.0, 2.0, 10.0, 'truck', 8.5, 4.0, 5.0);
    expect(res.status).toBe('safe');
    
    // Over limit -> blocked/warning
    res = checkOverpassRestrictions(mockRoute, restrictions, 3.0, 2.0, 10.0, 'truck', 12.0, 4.0, 5.0);
    expect(res.status).toBe('blocked');
    expect(res.warnings[0].message).toContain('全長制限');
  });

  it('should check axle load restrictions', () => {
    const restrictions = [
      {
        osmId: 3,
        name: 'Bridge C',
        wayCoords: [[35.6896, 139.6918], [35.6897, 139.6919]],
        axleLoadLimit: 5.0
      }
    ];
    // Under limit -> safe
    let res = checkOverpassRestrictions(mockRoute, restrictions, 3.0, 2.0, 10.0, 'truck', 6.0, 4.5, 5.0);
    expect(res.status).toBe('safe');
    
    // Over limit -> blocked/warning
    res = checkOverpassRestrictions(mockRoute, restrictions, 3.0, 2.0, 10.0, 'truck', 6.0, 8.0, 5.0);
    expect(res.status).toBe('blocked');
    expect(res.warnings[0].message).toContain('軸重制限');
  });

  it('should check narrow road turning warnings', () => {
    const restrictions = [
      {
        osmId: 4,
        name: 'Narrow Street D',
        wayCoords: [[35.6896, 139.6918], [35.6897, 139.6919]],
        isNarrow: true
      }
    ];
    // Small turn radius -> safe
    let res = checkOverpassRestrictions(mockRoute, restrictions, 3.0, 2.0, 10.0, 'truck', 6.0, 4.0, 4.5);
    expect(res.status).toBe('safe');
    
    // Large turn radius -> warning
    res = checkOverpassRestrictions(mockRoute, restrictions, 3.0, 2.0, 10.0, 'truck', 6.0, 4.0, 7.5);
    expect(res.status).toBe('warning');
    expect(res.warnings[0].message).toContain('回転半径警告');
  });
});
