export type PointsBase = 'PRE_COUPON' | 'POST_COUPON';

export type CalcPolicy = {
  includePoints: boolean;
  limitedPointFactor: number;
  includeSubscription: boolean;
};

export type OfferData = {
  id: number;
  price: number;
  coupon: number;
  shipping: number;
  packCount: number;
  pointsPercent?: number | null;
  pointsFixed?: number | null;
  pointsBase: PointsBase;
  isSubscription: boolean;
  taxIncluded: boolean;
};

export type CalculationResult = {
  effectiveTotal: number;
  yenPerSheet: number;
  pointsYen: number;
  baseAmount: number;
};

export type OfferWithCalculation = OfferData & {
  calculation: CalculationResult;
  product: {
    brand: string;
    series: string;
    type: string;
    size: string;
  };
  store: {
    name: string;
    slug: string;
  };
  evidence: {
    sourceUrl: string;
    fetchedAt: string;
    assumptions: string;
  };
  affiliate?: {
    link: string;
  };
};

export type ApiFilters = {
  size?: string;
  type?: string;
  brand?: string;
  includePoints?: boolean;
  limitedPointFactor?: number;
  includeSubscription?: boolean;
  sort?: 'cpp' | 'total' | 'updated';
  page?: number;
  per?: number;
};

export type ApiResponse<T> = {
  meta: {
    page: number;
    per: number;
    total?: number;
    calc_policy: CalcPolicy;
  };
  items: T[];
};