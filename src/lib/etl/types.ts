import { ProductType, ProductSize, PointsBase } from '@/generated/prisma';

export interface RawOfferData {
  title: string;
  price: number;
  coupon?: number;
  shipping?: number;
  pointsPercent?: number;
  pointsFixed?: number;
  pointsBase: PointsBase;
  pointsNote?: string;
  isSubscription?: boolean;
  sourceUrl: string;
  fetchedAt: Date;
  
  // 正規化で抽出される情報
  brand?: string;
  series?: string;
  type?: ProductType;
  size?: ProductSize;
  packCount?: number;
}

export interface StoreAdapter {
  storeSlug: string;
  storeName: string;
  
  /**
   * 指定された検索クエリで商品を検索
   */
  search(query: string): Promise<RawOfferData[]>;
  
  /**
   * 特定の商品URLから詳細を取得
   */
  fetchOffer(url: string): Promise<RawOfferData>;
  
  /**
   * ストア固有の設定
   */
  config: StoreConfig;
}

export interface StoreConfig {
  // ポイント計算の基準（クーポン前/後）
  defaultPointsBase: PointsBase;
  
  // 送料設定
  freeShippingThreshold?: number;
  defaultShipping: number;
  
  // レート制限設定
  rateLimitMs: number;
  
  // User-Agent等のヘッダー
  headers: Record<string, string>;
  
  // 税込み/税抜きの既定値
  defaultTaxIncluded: boolean;
}

export interface NormalizerResult {
  brand: string;
  series: string;
  type: ProductType;
  size: ProductSize;
  packCount: number;
  confidence: number; // 0-1の信頼度
}

export interface ETLJobConfig {
  storeSlug: string;
  searchQueries: string[];
  maxResults?: number;
  forceRefresh?: boolean;
}