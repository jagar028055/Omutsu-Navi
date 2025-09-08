import { OfferWithCalculation, ApiResponse } from './types';

// 静的サイト用のモックデータ
export const mockOffers: OfferWithCalculation[] = [
  {
    id: 1,
    price: 1580,
    coupon: 0,
    shipping: 0,
    packCount: 88,
    pointsPercent: 1.0,
    pointsFixed: null,
    pointsBase: 'POST_COUPON',
    isSubscription: false,
    taxIncluded: true,
    calculation: {
      effectiveTotal: 1564,
      yenPerSheet: 17.77,
      pointsYen: 16,
      baseAmount: 1580,
    },
    product: {
      brand: 'Pampers',
      series: '肌へのいちばん',
      type: 'TAPE',
      size: 'NB',
    },
    store: {
      name: 'Amazon',
      slug: 'amazon',
    },
    evidence: {
      sourceUrl: 'https://amazon.co.jp/dp/example1',
      fetchedAt: '2025-09-08T09:00:00Z',
      assumptions: '価格: ¥1,580 - ポイント還元: ¥16 (1%、クーポン適用後¥1,580が対象) = ¥1,564 (¥17.77/枚) ÷ 88枚',
    },
    affiliate: {
      link: '#amazon-affiliate-link',
    },
  },
  {
    id: 2,
    price: 1980,
    coupon: 200,
    shipping: 0,
    packCount: 58,
    pointsPercent: 5.0,
    pointsFixed: null,
    pointsBase: 'POST_COUPON',
    isSubscription: false,
    taxIncluded: true,
    calculation: {
      effectiveTotal: 1691,
      yenPerSheet: 29.16,
      pointsYen: 89,
      baseAmount: 1780,
    },
    product: {
      brand: 'Merries',
      series: 'さらさらエアスルー',
      type: 'PANTS',
      size: 'M',
    },
    store: {
      name: '楽天市場',
      slug: 'rakuten',
    },
    evidence: {
      sourceUrl: 'https://rakuten.co.jp/shop/example2',
      fetchedAt: '2025-09-08T08:45:00Z',
      assumptions: '価格: ¥1,980 - クーポン: ¥200 - ポイント還元: ¥89 (5%、クーポン適用後¥1,780が対象) = ¥1,691 (¥29.16/枚) ÷ 58枚',
    },
    affiliate: {
      link: '#rakuten-affiliate-link',
    },
  },
  {
    id: 3,
    price: 1750,
    coupon: 0,
    shipping: 350,
    packCount: 84,
    pointsPercent: 2.0,
    pointsFixed: null,
    pointsBase: 'PRE_COUPON',
    isSubscription: false,
    taxIncluded: true,
    calculation: {
      effectiveTotal: 2058,
      yenPerSheet: 24.50,
      pointsYen: 42,
      baseAmount: 2100,
    },
    product: {
      brand: 'Moony',
      series: 'エアフィット',
      type: 'TAPE',
      size: 'S',
    },
    store: {
      name: 'Yahoo!ショッピング',
      slug: 'yahoo',
    },
    evidence: {
      sourceUrl: 'https://shopping.yahoo.co.jp/products/example3',
      fetchedAt: '2025-09-08T08:30:00Z',
      assumptions: '価格: ¥1,750 + 送料: ¥350 - ポイント還元: ¥42 (2%、クーポン適用前¥2,100が対象) = ¥2,058 (¥24.50/枚) ÷ 84枚',
    },
    affiliate: {
      link: '#yahoo-affiliate-link',
    },
  },
  {
    id: 4,
    price: 1650,
    coupon: 100,
    shipping: 0,
    packCount: 44,
    pointsPercent: 3.0,
    pointsFixed: null,
    pointsBase: 'POST_COUPON',
    isSubscription: true,
    taxIncluded: true,
    calculation: {
      effectiveTotal: 1504,
      yenPerSheet: 34.18,
      pointsYen: 46,
      baseAmount: 1550,
    },
    product: {
      brand: 'Pampers',
      series: 'さらさらパンツ',
      type: 'PANTS',
      size: 'L',
    },
    store: {
      name: 'Amazon',
      slug: 'amazon',
    },
    evidence: {
      sourceUrl: 'https://amazon.co.jp/dp/example4',
      fetchedAt: '2025-09-08T08:15:00Z',
      assumptions: '価格: ¥1,650 - クーポン: ¥100 - ポイント還元: ¥46 (3%、クーポン適用後¥1,550が対象) = ¥1,504 (¥34.18/枚) ÷ 44枚',
    },
    affiliate: {
      link: '#amazon-subscription-link',
    },
  },
  {
    id: 5,
    price: 1880,
    coupon: 0,
    shipping: 0,
    packCount: 38,
    pointsPercent: null,
    pointsFixed: 150,
    pointsBase: 'POST_COUPON',
    isSubscription: false,
    taxIncluded: true,
    calculation: {
      effectiveTotal: 1730,
      yenPerSheet: 45.53,
      pointsYen: 150,
      baseAmount: 1880,
    },
    product: {
      brand: 'GooN',
      series: 'まっさらさら',
      type: 'PANTS',
      size: 'XL',
    },
    store: {
      name: '楽天市場',
      slug: 'rakuten',
    },
    evidence: {
      sourceUrl: 'https://rakuten.co.jp/shop/example5',
      fetchedAt: '2025-09-08T08:00:00Z',
      assumptions: '価格: ¥1,880 - ポイント還元: ¥150 (固定150円) = ¥1,730 (¥45.53/枚) ÷ 38枚',
    },
    affiliate: {
      link: '#rakuten-goon-link',
    },
  },
];

export function getStaticOffers(filters: any = {}): ApiResponse<OfferWithCalculation> {
  let filteredOffers = mockOffers;

  // フィルタリング
  if (filters.size) {
    filteredOffers = filteredOffers.filter(offer => offer.product.size === filters.size);
  }
  if (filters.type) {
    filteredOffers = filteredOffers.filter(offer => offer.product.type === filters.type);
  }
  if (filters.brand) {
    filteredOffers = filteredOffers.filter(offer => offer.product.brand === filters.brand);
  }
  if (!filters.includeSubscription) {
    filteredOffers = filteredOffers.filter(offer => !offer.isSubscription);
  }

  // ソート
  const sortBy = filters.sort || 'cpp';
  if (sortBy === 'cpp') {
    filteredOffers.sort((a, b) => a.calculation.yenPerSheet - b.calculation.yenPerSheet);
  } else if (sortBy === 'total') {
    filteredOffers.sort((a, b) => a.calculation.effectiveTotal - b.calculation.effectiveTotal);
  }

  // ページネーション
  const page = filters.page || 1;
  const per = filters.per || 20;
  const start = (page - 1) * per;
  const paginatedOffers = filteredOffers.slice(start, start + per);

  return {
    meta: {
      page,
      per,
      total: filteredOffers.length,
      calc_policy: {
        includePoints: filters.includePoints !== false,
        limitedPointFactor: filters.limitedPointFactor || 1.0,
        includeSubscription: filters.includeSubscription || false,
      },
    },
    items: paginatedOffers,
  };
}