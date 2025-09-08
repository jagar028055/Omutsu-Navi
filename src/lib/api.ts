import { ApiFilters, ApiResponse, OfferWithCalculation } from './types';
import { getStaticOffers } from './static-data';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const IS_STATIC_EXPORT = process.env.NODE_ENV === 'production' && process.env.NEXT_EXPORT;

export async function getOffers(filters: ApiFilters): Promise<ApiResponse<OfferWithCalculation>> {
  // 静的エクスポート時はローカルデータを使用
  if (IS_STATIC_EXPORT || typeof window === 'undefined') {
    // サーバーサイドまたは静的エクスポート時
    return Promise.resolve(getStaticOffers(filters));
  }

  const params = new URLSearchParams();
  
  if (filters.size) params.set('size', filters.size);
  if (filters.type) params.set('type', filters.type);
  if (filters.brand) params.set('brand', filters.brand);
  if (filters.includePoints !== undefined) params.set('includePoints', String(filters.includePoints));
  if (filters.limitedPointFactor !== undefined) params.set('limitedPointFactor', String(filters.limitedPointFactor));
  if (filters.includeSubscription) params.set('includeSubscription', 'true');
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.per) params.set('per', String(filters.per));

  try {
    // まずは静的データを返す（APIが使用不可の場合）
    return getStaticOffers(filters);
  } catch (error) {
    console.error('Failed to fetch offers:', error);
    // フォールバックとして静的データを返す
    return getStaticOffers(filters);
  }
}

export async function getOfferById(id: number): Promise<OfferWithCalculation | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/offers/${id}`, {
      next: { revalidate: 1800 }, // 30分キャッシュ
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch offer:', error);
    throw error;
  }
}