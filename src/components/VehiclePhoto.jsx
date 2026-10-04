import React, { useState } from 'react';
import VehicleGradientCard from './VehicleGradientCard';
import { getLocalVehicleImage } from '../services/vehicleImageService';

/**
 * Mashina rasmi — ishonchli zaxira zanjiri bilan:
 *   photoUrl → mos lokal rasm → VehicleGradientCard (tarmoqsiz ham ishlaydi)
 * Avval onError'da Unsplash'dagi tasodifiy sedan qo'yilardi (yuk mashinasiga ham).
 * Parent `key` bilan qayta o'rnatiladi (rasm/model o'zgarganda xato holati tozalanadi).
 */
export default function VehiclePhoto({ vehicle, height = 110, style }) {
  const v = vehicle || {};
  const local = getLocalVehicleImage(v);
  const candidates = [v.photoUrl, local].filter((u, i, arr) => u && arr.indexOf(u) === i);
  const [failed, setFailed] = useState(0);
  const src = candidates[failed];

  if (!src) {
    return (
      <VehicleGradientCard
        make={v.make || ''}
        model={v.model || ''}
        bodyStyle={v.bodyStyle || 'sedan'}
        type={v.type || 'car'}
        height={height}
      />
    );
  }

  return (
    <img
      src={src}
      alt={`${v.make || ''} ${v.model || 'Vehicle'}`.trim()}
      loading="lazy"
      decoding="async"
      onError={() => setFailed((n) => n + 1)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
    />
  );
}
