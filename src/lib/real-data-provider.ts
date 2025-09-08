import { CollectedOffer } from './data-collection/collector'
import { getFilteredOffers, SampleOffer } from './sample-data'
import { collectClientSideData, ClientDataResult } from './client-data-collector'

export interface RealDataOptions {
  useRealData?: boolean
  brands?: string[]
  sizes?: string[]
  types?: string[]
  maxItems?: number
}

// 実データとサンプルデータを統合して提供
export class RealDataProvider {
  private realDataCache: CollectedOffer[] = []
  private lastFetchTime: number = 0
  private cacheDuration = 5 * 60 * 1000 // 5分キャッシュ

  // 実データ取得（クライアントサイド）
  async getRealData(forceRefresh: boolean = false): Promise<CollectedOffer[]> {
    const now = Date.now()
    
    if (!forceRefresh && this.realDataCache.length > 0 && (now - this.lastFetchTime) < this.cacheDuration) {
      console.log('🗃️ キャッシュからデータを返します')
      return this.realDataCache
    }

    try {
      console.log('🌐 クライアントサイドで実データを取得中...')
      const result = await collectClientSideData()
      
      if (result.success && result.offers) {
        this.realDataCache = result.offers as CollectedOffer[]
        this.lastFetchTime = now
        console.log(`✅ 実データ取得成功: ${this.realDataCache.length}件`)
        return this.realDataCache
      } else {
        throw new Error('実データの取得に失敗しました')
      }
    } catch (error) {
      console.error('❌ 実データ取得エラー:', error)
      return []
    }
  }

  // データ提供（実データまたはサンプルデータ）
  async getOffers(options: RealDataOptions = {}): Promise<SampleOffer[]> {
    const { useRealData = true, brands, sizes, types, maxItems = 50 } = options

    let offers: SampleOffer[] = []

    if (useRealData) {
      try {
        const realOffers = await this.getRealData()
        if (realOffers.length > 0) {
          offers = this.convertToSampleFormat(realOffers)
          console.log(`🎯 実データを使用: ${offers.length}件`)
        }
      } catch (error) {
        console.warn('実データ取得に失敗、サンプルデータにフォールバック:', error)
      }
    }

    // 実データが取得できない場合はサンプルデータを使用
    if (offers.length === 0) {
      offers = getFilteredOffers({
        brand: brands?.[0],
        size: sizes?.[0],
        type: types?.[0]
      })
      console.log(`📝 サンプルデータを使用: ${offers.length}件`)
    }

    // フィルタリング適用
    if (brands?.length) {
      offers = offers.filter(offer => brands.includes(offer.product.brand))
    }
    if (sizes?.length) {
      offers = offers.filter(offer => sizes.includes(offer.product.size))
    }
    if (types?.length) {
      offers = offers.filter(offer => types.includes(offer.product.type))
    }

    return offers.slice(0, maxItems)
  }

  // 実データをSampleOffer形式に変換
  private convertToSampleFormat(realOffers: CollectedOffer[]): SampleOffer[] {
    return realOffers.map((offer, index) => ({
      id: index + 1000, // 実データは1000番台のIDを使用
      title: offer.title,
      packCount: 1,
      price: offer.price,
      coupon: offer.coupon || 0,
      shipping: offer.shipping,
      pointsPercent: offer.pointsPercent || null,
      pointsFixed: offer.pointsFixed || null,
      pointsNote: offer.pointsPercent ? `${offer.pointsPercent}%ポイント還元` : null,
      taxIncluded: offer.taxIncluded,
      isSubscription: offer.subscription,
      sourceUrl: offer.sourceUrl,
      fetchedAt: offer.fetchedAt,
      store: {
        id: this.getStoreId(offer.storeSlug),
        name: offer.storeName,
        slug: offer.storeSlug
      },
      product: {
        id: index + 2000,
        brand: offer.brand,
        series: offer.series || 'スタンダード',
        type: offer.type,
        size: offer.size,
        packSizeMin: offer.packSize
      },
      calcSnapshots: [{
        effectiveTotal: offer.effectivePrice || offer.price,
        yenPerSheet: offer.yenPerSheet || 0,
        pointsYen: offer.pointsYen || 0
      }]
    }))
  }

  private getStoreId(storeSlug: string): number {
    const storeIds: { [key: string]: number } = {
      'amazon': 1,
      'rakuten': 2,
      'yahoo': 3,
      'lohaco': 4,
      'yodobashi': 5
    }
    return storeIds[storeSlug] || 999
  }

  // データ収集状況を取得
  async getDataCollectionStatus() {
    try {
      const response = await fetch('/api/collect-data')
      const result = await response.json()
      
      return {
        available: result.success,
        totalItems: result.data?.totalItems || 0,
        sources: result.data?.sources || {},
        lastUpdate: result.timestamp,
        cached: this.realDataCache.length > 0
      }
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : '不明なエラー'
      }
    }
  }
}

// シングルトンインスタンス
export const realDataProvider = new RealDataProvider()

// 便利な関数
export async function getOffersWithRealData(options: RealDataOptions = {}): Promise<SampleOffer[]> {
  return realDataProvider.getOffers(options)
}

export async function refreshRealData(): Promise<boolean> {
  try {
    const offers = await realDataProvider.getRealData(true)
    return offers.length > 0
  } catch (error) {
    console.error('データリフレッシュエラー:', error)
    return false
  }
}