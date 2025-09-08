import { computeEffective, generateEvidence, processOffers, DEFAULT_CALC_POLICY, CONSERVATIVE_CALC_POLICY } from '../calculate';
import { OfferData, CalcPolicy } from '../types';

describe('計算エンジンテスト', () => {
  const baseOffer: OfferData = {
    id: 1,
    price: 3980,
    coupon: 500,
    shipping: 0,
    packCount: 100,
    pointsPercent: 5.0,
    pointsFixed: null,
    pointsBase: 'POST_COUPON',
    isSubscription: false,
    taxIncluded: true,
  };

  describe('computeEffective基本テスト', () => {
    it('仕様書の例: P=3980, C=500, S=0, N=100, points%=5, base=post_coupon', () => {
      const result = computeEffective(baseOffer, DEFAULT_CALC_POLICY);
      
      expect(result.baseAmount).toBe(3480); // (3980 - 500 + 0)
      expect(result.pointsYen).toBe(174); // Math.floor(3480 * 5 / 100)
      expect(result.effectiveTotal).toBe(3306); // (3980 - 500 + 0) - 174
      expect(result.yenPerSheet).toBeCloseTo(33.06, 2);
    });

    it('ポイント基準がPRE_COUPONの場合', () => {
      const offer = { ...baseOffer, pointsBase: 'PRE_COUPON' as const };
      const result = computeEffective(offer, DEFAULT_CALC_POLICY);
      
      expect(result.baseAmount).toBe(3980); // (3980 + 0) クーポン適用前
      expect(result.pointsYen).toBe(199); // Math.floor(3980 * 5 / 100)
      expect(result.effectiveTotal).toBe(3281); // (3980 - 500 + 0) - 199
      expect(result.yenPerSheet).toBeCloseTo(32.81, 2);
    });

    it('固定ポイント=200の場合', () => {
      const offer = { ...baseOffer, pointsPercent: null, pointsFixed: 200 };
      const result = computeEffective(offer, DEFAULT_CALC_POLICY);
      
      expect(result.pointsYen).toBe(200);
      expect(result.effectiveTotal).toBe(3280); // (3980 - 500 + 0) - 200
      expect(result.yenPerSheet).toBeCloseTo(32.80, 2);
    });

    it('期間限定ポイント係数=0.7適用時', () => {
      const result = computeEffective(baseOffer, CONSERVATIVE_CALC_POLICY);
      
      expect(result.pointsYen).toBe(121); // Math.floor(174 * 0.7)
      expect(result.effectiveTotal).toBe(3359); // (3980 - 500 + 0) - 121
      expect(result.yenPerSheet).toBeCloseTo(33.59, 2);
    });

    it('ポイント除外時', () => {
      const policy: CalcPolicy = { ...DEFAULT_CALC_POLICY, includePoints: false };
      const result = computeEffective(baseOffer, policy);
      
      expect(result.pointsYen).toBe(0);
      expect(result.effectiveTotal).toBe(3480); // (3980 - 500 + 0)
      expect(result.yenPerSheet).toBeCloseTo(34.80, 2);
    });
  });

  describe('バリデーションテスト', () => {
    it('packCountが0の場合エラー', () => {
      const offer = { ...baseOffer, packCount: 0 };
      expect(() => computeEffective(offer, DEFAULT_CALC_POLICY)).toThrow('Invalid packCount');
    });

    it('負の価格の場合エラー', () => {
      const offer = { ...baseOffer, price: -100 };
      expect(() => computeEffective(offer, DEFAULT_CALC_POLICY)).toThrow('Invalid price');
    });

    it('負のクーポンの場合エラー', () => {
      const offer = { ...baseOffer, coupon: -50 };
      expect(() => computeEffective(offer, DEFAULT_CALC_POLICY)).toThrow('Invalid coupon');
    });
  });

  describe('processOffers複数処理テスト', () => {
    const offers: OfferData[] = [
      { ...baseOffer, id: 1, price: 4000 },
      { ...baseOffer, id: 2, price: 3500 },
      { ...baseOffer, id: 3, price: 3800, isSubscription: true },
    ];

    it('円/枚でソート（定期便含む）', () => {
      const policy = { ...DEFAULT_CALC_POLICY, includeSubscription: true };
      const result = processOffers(offers, policy, 'cpp');
      expect(result.length).toBe(3);
      expect(result[0].calculation.yenPerSheet).toBeLessThanOrEqual(result[1].calculation.yenPerSheet);
      expect(result[1].calculation.yenPerSheet).toBeLessThanOrEqual(result[2].calculation.yenPerSheet);
    });

    it('定期便除外フィルタ', () => {
      const policy = { ...DEFAULT_CALC_POLICY, includeSubscription: false };
      const result = processOffers(offers, policy, 'cpp');
      expect(result.length).toBe(2);
      expect(result.every(item => !item.isSubscription)).toBe(true);
    });
  });

  describe('generateEvidence根拠文生成', () => {
    it('基本的な根拠文', () => {
      const calculation = computeEffective(baseOffer, DEFAULT_CALC_POLICY);
      const evidence = generateEvidence(baseOffer, calculation, DEFAULT_CALC_POLICY);
      
      expect(evidence).toContain('価格: ¥3,980');
      expect(evidence).toContain('クーポン: ¥500');
      expect(evidence).toContain('ポイント還元: ¥174');
      expect(evidence).toContain('5%、クーポン適用後¥3,480が対象');
      expect(evidence).toContain('¥3,306');
      expect(evidence).toContain('¥33.06/枚');
      expect(evidence).toContain('100枚');
    });

    it('期間限定ポイント係数付きの根拠文', () => {
      const calculation = computeEffective(baseOffer, CONSERVATIVE_CALC_POLICY);
      const evidence = generateEvidence(baseOffer, calculation, CONSERVATIVE_CALC_POLICY);
      
      expect(evidence).toContain('期間限定ポイント換算係数: 0.7');
    });
  });
});