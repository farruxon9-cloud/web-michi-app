import { describe, it, expect } from 'vitest';
import { getPrefectureByPostalPrefix, JAPAN_PREFECTURE_MAP } from './japaneseZipcodeLookup';

describe('Japanese Zipcode Lookup Utility Tests', () => {
  it('correctly maps 47 Japanese prefectures', () => {
    expect(JAPAN_PREFECTURE_MAP['東京都'].key).toBe('Tokyo');
    expect(JAPAN_PREFECTURE_MAP['千葉県'].key).toBe('Chiba');
    expect(JAPAN_PREFECTURE_MAP['大阪府'].key).toBe('Osaka');
  });

  it('correctly resolves region by 3-digit prefix offline fallback', () => {
    expect(getPrefectureByPostalPrefix('2702261').prefKey).toBe('Chiba');
    expect(getPrefectureByPostalPrefix('1000001').prefKey).toBe('Tokyo');
    expect(getPrefectureByPostalPrefix('5300001').prefKey).toBe('Osaka');
  });
});
