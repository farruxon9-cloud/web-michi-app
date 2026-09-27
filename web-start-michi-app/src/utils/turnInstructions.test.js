import { describe, it, expect } from 'vitest';
import { decodePolyline6, mapValhallaTypeToOSRM, parseValhallaSteps } from './turnInstructions';

describe('Valhalla Routing Utilities Tests', () => {
  describe('decodePolyline6', () => {
    it('should correctly decode precision-6 encoded polyline shapes', () => {
      // Shape snippet from our Tokyo test query
      const shapeStr = 'sciacAc`cmiGsC\\aBe@{Cg';
      const coords = decodePolyline6(shapeStr);
      
      expect(coords.length).toBeGreaterThan(0);
      // Expected first coordinate to be close to Tokyo area (Shinjuku / Shibuya)
      expect(coords[0][0]).toBeCloseTo(35.689546, 4);
      expect(coords[0][1]).toBeCloseTo(139.69205, 4);
    });
  });

  describe('mapValhallaTypeToOSRM', () => {
    it('should map Valhalla type codes to standard OSRM types and modifiers', () => {
      expect(mapValhallaTypeToOSRM(1)).toEqual({ type: 'depart', modifier: 'straight' });
      expect(mapValhallaTypeToOSRM(4)).toEqual({ type: 'arrive', modifier: 'straight' });
      expect(mapValhallaTypeToOSRM(10)).toEqual({ type: 'turn', modifier: 'right' });
      expect(mapValhallaTypeToOSRM(15)).toEqual({ type: 'turn', modifier: 'left' });
      expect(mapValhallaTypeToOSRM(27)).toEqual({ type: 'exit roundabout', modifier: 'straight' });
    });
  });

  describe('parseValhallaSteps', () => {
    it('should parse Valhalla maneuvers into rich navigation steps matching OSRM layout', () => {
      const mockTrip = {
        legs: [
          {
            maneuvers: [
              {
                type: 1,
                instruction: '出発します。',
                bearing_after: 90,
                length: 0.1,
                time: 15,
                begin_shape_index: 0,
                end_shape_index: 1,
                street_names: ['都庁通り']
              },
              {
                type: 10,
                instruction: '右折します。',
                bearing_before: 90,
                bearing_after: 180,
                length: 0.5,
                time: 45,
                begin_shape_index: 1,
                end_shape_index: 2,
                street_names: ['新宿通り']
              }
            ]
          }
        ]
      };

      const decodedCoords = [
        [35.6895, 139.6917],
        [35.6900, 139.6925],
        [35.6885, 139.6925]
      ];

      const steps = parseValhallaSteps(mockTrip, 'elf_3t', decodedCoords, []);

      expect(steps.length).toBe(2);
      
      // Check first step details
      expect(steps[0].lat).toBe(35.6895);
      expect(steps[0].lng).toBe(139.6917);
      expect(steps[0].maneuverType).toBe('depart');
      expect(steps[0].jaText).toBe('出発します。');
      expect(steps[0].distanceToNext).toBe(100); // 0.1 km = 100m
      expect(steps[0].durationToNext).toBe(15);
      
      // Check second step details
      expect(steps[1].lat).toBe(35.6900);
      expect(steps[1].lng).toBe(139.6925);
      expect(steps[1].maneuverType).toBe('turn');
      expect(steps[1].modifier).toBe('right');
      expect(steps[1].jaText).toBe('右折します。');
      expect(steps[1].distanceToNext).toBe(500); // 0.5 km = 500m
      expect(steps[1].durationToNext).toBe(45);
    });
  });
});
