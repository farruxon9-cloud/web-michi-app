import { describe, it, expect } from 'vitest';
import {
  getDistanceMeters,
  findClosestSegmentIndex,
  extrapolatePositionAlongRoute,
  isPositionInTunnel
} from './deadReckoning';

describe('Dead Reckoning Navigation Engine Tests', () => {
  describe('getDistanceMeters', () => {
    it('should calculate distance between two coordinates correctly', () => {
      const lat1 = 35.6895; // Tokyo
      const lng1 = 139.6917;
      const lat2 = 35.6900;
      const lng2 = 139.6925;
      
      const distance = getDistanceMeters(lat1, lng1, lat2, lng2);
      expect(distance).toBeGreaterThan(50);
      expect(distance).toBeLessThan(120);
    });
  });

  describe('findClosestSegmentIndex', () => {
    it('should find the index of the closest node segment', () => {
      const route = [
        [35.6895, 139.6917],
        [35.6900, 139.6925],
        [35.6910, 139.6935]
      ];
      
      const targetPoint = [35.6901, 139.6926];
      const index = findClosestSegmentIndex(targetPoint, route);
      expect(index).toBe(1); // Second segment starts near index 1
    });
  });

  describe('extrapolatePositionAlongRoute', () => {
    const route = [
      [35.6895, 139.6917], // Node 0
      [35.6900, 139.6925], // Node 1
      [35.6910, 139.6935]  // Node 2
    ];

    it('should return initial coordinate if distance is 0', () => {
      const startCoord = [35.6895, 139.6917];
      const result = extrapolatePositionAlongRoute(startCoord, route, 0);
      
      expect(result.lat).toBeCloseTo(35.6895, 4);
      expect(result.lng).toBeCloseTo(139.6917, 4);
    });

    it('should extrapolate position along the first segment', () => {
      const startCoord = [35.6895, 139.6917];
      const segmentLen = getDistanceMeters(route[0][0], route[0][1], route[1][0], route[1][1]);
      
      // Move exactly half of segment length
      const result = extrapolatePositionAlongRoute(startCoord, route, segmentLen / 2);
      
      expect(result.lat).toBeCloseTo((route[0][0] + route[1][0]) / 2, 4);
      expect(result.lng).toBeCloseTo((route[0][1] + route[1][1]) / 2, 4);
      expect(result.segmentIndex).toBe(0);
    });

    it('should cross nodes and extrapolate on subsequent segments', () => {
      const startCoord = [35.6895, 139.6917];
      const seg0Len = getDistanceMeters(route[0][0], route[0][1], route[1][0], route[1][1]);
      const seg1Len = getDistanceMeters(route[1][0], route[1][1], route[2][0], route[2][1]);
      
      // Move length of first segment + half of second segment
      const result = extrapolatePositionAlongRoute(startCoord, route, seg0Len + seg1Len / 2);
      
      expect(result.lat).toBeCloseTo((route[1][0] + route[2][0]) / 2, 4);
      expect(result.lng).toBeCloseTo((route[1][1] + route[2][1]) / 2, 4);
      expect(result.segmentIndex).toBe(1);
    });
  });

  describe('isPositionInTunnel', () => {
    it('should identify position in tunnel from Overpass tags metadata', () => {
      const mockOverpassData = [
        {
          id: 12345,
          tags: { tunnel: 'yes', highway: 'primary' },
          geometry: [
            { lat: 35.6895, lon: 139.6917 },
            { lat: 35.6900, lon: 139.6925 }
          ]
        }
      ];

      const positionInTunnel = { lat: 35.6896, lng: 139.6918 };
      expect(isPositionInTunnel(positionInTunnel, mockOverpassData)).toBe(true);

      const positionOutside = { lat: 35.7000, lng: 139.7100 };
      expect(isPositionInTunnel(positionOutside, mockOverpassData)).toBe(false);
    });
  });
});
