import { OfferData, CalcPolicy, CalculationResult } from './types';

/**
 * 実質単価計算エンジン
 * 仕様書に基づき、価格・クーポン・送料・ポイント還元を正確に反映
 */
export function computeEffective(
  offer: OfferData,
  policy: CalcPolicy
): CalculationResult {
  const { price: P, coupon: C, shipping: S, packCount: N, pointsPercent, pointsFixed, pointsBase } = offer;
  
  // バリデーション
  if (!N || N <= 0) {
    throw new Error(`Invalid packCount: ${N}`);
  }
  if (P < 0) {
    throw new Error(`Invalid price: ${P}`);
  }
  if (C < 0) {
    throw new Error(`Invalid coupon: ${C}`);
  }

  // ポイント基準となる金額を算出
  const baseAmount = pointsBase === 'POST_COUPON' ? (P - C + S) : (P + S);
  
  // ポイント換算額を計算
  let pointsYen = 0;
  if (policy.includePoints) {
    if (pointsFixed !== null && pointsFixed !== undefined) {
      // 固定ポイントの場合
      pointsYen = pointsFixed;
    } else if (pointsPercent !== null && pointsPercent !== undefined && pointsPercent > 0) {
      // パーセントポイントの場合（端数切り捨て）
      pointsYen = Math.floor((baseAmount * pointsPercent) / 100);
    }
    
    // 期間限定ポイントの割引評価を適用
    pointsYen = Math.floor(pointsYen * (policy.limitedPointFactor ?? 1));
  }

  // 実質支払金額を計算
  const effectiveTotal = (P - C + S) - pointsYen;
  
  // 1枚あたりの実質単価を計算
  const yenPerSheet = effectiveTotal / N;

  return {
    effectiveTotal,
    yenPerSheet,
    pointsYen,
    baseAmount
  };
}

/**
 * 複数オファーを計算してソート
 */
export function processOffers(
  offers: OfferData[],
  policy: CalcPolicy,
  sortBy: 'cpp' | 'total' | 'updated' = 'cpp'
): Array<OfferData & { calculation: CalculationResult }> {
  const processed = offers
    .filter(offer => {
      // 定期便フィルタ
      if (!policy.includeSubscription && offer.isSubscription) {
        return false;
      }
      return true;
    })
    .map(offer => {
      try {
        const calculation = computeEffective(offer, policy);
        return { ...offer, calculation };
      } catch (error) {
        console.warn(`Calculation failed for offer ${offer.id}:`, error);
        return null;
      }
    })
    .filter((item): item is OfferData & { calculation: CalculationResult } => item !== null);

  // ソート
  switch (sortBy) {
    case 'cpp':
      processed.sort((a, b) => {
        if (a.calculation.yenPerSheet === b.calculation.yenPerSheet) {
          // タイブレーク: effectiveTotal → id (新しい順）
          if (a.calculation.effectiveTotal === b.calculation.effectiveTotal) {
            return b.id - a.id;
          }
          return a.calculation.effectiveTotal - b.calculation.effectiveTotal;
        }
        return a.calculation.yenPerSheet - b.calculation.yenPerSheet;
      });
      break;
    case 'total':
      processed.sort((a, b) => a.calculation.effectiveTotal - b.calculation.effectiveTotal);
      break;
    case 'updated':
      processed.sort((a, b) => b.id - a.id); // 新しいIDが後の更新と仮定
      break;
  }

  return processed;
}

/**
 * 計算根拠の説明文を生成
 */
export function generateEvidence(
  offer: OfferData,
  calculation: CalculationResult,
  policy: CalcPolicy
): string {
  const { price: P, coupon: C, shipping: S, packCount: N, pointsPercent, pointsFixed, pointsBase } = offer;
  const { pointsYen, baseAmount } = calculation;

  let evidence = `価格: ¥${P.toLocaleString()}`;
  if (C > 0) evidence += ` - クーポン: ¥${C.toLocaleString()}`;
  if (S > 0) evidence += ` + 送料: ¥${S.toLocaleString()}`;
  
  if (policy.includePoints && pointsYen > 0) {
    evidence += ` - ポイント還元: ¥${pointsYen.toLocaleString()}`;
    if (pointsFixed) {
      evidence += ` (固定${pointsFixed}円)`;
    } else if (pointsPercent) {
      evidence += ` (${pointsPercent}%、${pointsBase === 'POST_COUPON' ? 'クーポン適用後' : '適用前'}¥${baseAmount.toLocaleString()}が対象)`;
    }
    
    if (policy.limitedPointFactor !== 1) {
      evidence += ` ※期間限定ポイント換算係数: ${policy.limitedPointFactor}`;
    }
  }
  
  evidence += ` = ¥${calculation.effectiveTotal.toLocaleString()} (¥${calculation.yenPerSheet.toFixed(2)}/枚)`;
  evidence += ` ÷ ${N}枚`;
  
  return evidence;
}

/**
 * デフォルトの計算ポリシー
 */
export const DEFAULT_CALC_POLICY: CalcPolicy = {
  includePoints: true,
  limitedPointFactor: 1.0,
  includeSubscription: false
};

export const CONSERVATIVE_CALC_POLICY: CalcPolicy = {
  includePoints: true,
  limitedPointFactor: 0.7, // 期間限定ポイントを70%評価
  includeSubscription: false
};