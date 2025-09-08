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

  // 実データ取得（サーバー＆クライアントサイド対応）
  async getRealData(forceRefresh: boolean = false): Promise<CollectedOffer[]> {
    const now = Date.now()
    
    if (!forceRefresh && this.realDataCache.length > 0 && (now - this.lastFetchTime) < this.cacheDuration) {
      console.log('🗃️ キャッシュからデータを返します')
      return this.realDataCache
    }

    try {
      console.log('🌐 実データを取得中... (サーバー&クライアント対応)')
      const result = await collectClientSideData()
      
      if (result.success && result.offers) {
        this.realDataCache = result.offers as CollectedOffer[]
        this.lastFetchTime = now
        console.log(`✅ 実データ取得成功: ${this.realDataCache.length}件`)
        return this.realDataCache
      } else {
        console.error('❌ 実データの取得に失敗:', result)
        return []
      }
    } catch (error) {
      console.error('❌ 実データ取得エラー:', error)
      return []
    }
  }

  // データ提供（実データまたはサンプルデータ）
  async getOffers(options: RealDataOptions = {}): Promise<SampleOffer[]> {
    const { useRealData = true, brands, sizes, types, maxItems = 50 } = options

    console.log(`🔍 getOffers呼び出し: useRealData=${useRealData}`)
    let offers: SampleOffer[] = []

    if (useRealData) {
      try {
        const realOffers = await this.getRealData()
        console.log(`🔍 getRealData結果: ${realOffers.length}件`)
        if (realOffers.length > 0) {
          offers = this.convertToSampleFormat(realOffers)
          console.log(`🎯 実データを使用: ${offers.length}件 (変換後)`)
        } else {
          console.log('🔍 実データが0件のためサンプルデータにフォールバック')
        }
      } catch (error) {
        console.warn('🔍 実データ取得に失敗、サンプルデータにフォールバック:', error)
      }
    } else {
      console.log('🔍 useRealData=falseのためサンプルデータ使用')
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
    console.log(`🔍 フィルタリング前: ${offers.length}件`)
    if (brands?.length) {
      console.log(`🔍 ブランドフィルタ: ${brands}`)
      offers = offers.filter(offer => brands.includes(offer.product.brand))
      console.log(`🔍 ブランドフィルタ後: ${offers.length}件`)
    }
    if (sizes?.length) {
      console.log(`🔍 サイズフィルタ: ${sizes}`)
      offers = offers.filter(offer => sizes.includes(offer.product.size))
      console.log(`🔍 サイズフィルタ後: ${offers.length}件`)
    }
    if (types?.length) {
      console.log(`🔍 タイプフィルタ: ${types}`)
      offers = offers.filter(offer => types.includes(offer.product.type))
      console.log(`🔍 タイプフィルタ後: ${offers.length}件`)
    }

    const finalOffers = offers.slice(0, maxItems)
    console.log(`🔍 最終表示件数: ${finalOffers.length}件 (maxItems: ${maxItems})`)
    return finalOffers
  }

  // 実データをSampleOffer形式に変換（安全な変換）
  private convertToSampleFormat(realOffers: CollectedOffer[]): SampleOffer[] {
    return realOffers
      .filter(offer => offer && typeof offer === 'object') // 有効なオファーのみ
      .map((offer, index) => {
        // 安全にプロパティを取得
        const title = offer.title || 'タイトル不明'
        const price = offer.price || 0
        const brand = offer.brand || '不明ブランド'
        const size = offer.size || 'S'
        const packSize = offer.packSize || 50
        const storeName = offer.storeName || '楽天市場'
        const storeSlug = offer.storeSlug || 'rakuten'
        
        return {
          id: index + 1000, // 実データは1000番台のIDを使用
          title,
          packCount: 1,
          price,
          coupon: offer.coupon || 0,
          shipping: offer.shipping || 0,
          pointsPercent: offer.pointsPercent || null,
          pointsFixed: offer.pointsFixed || null,
          pointsNote: offer.pointsPercent ? `${offer.pointsPercent}%ポイント還元` : null,
          taxIncluded: offer.taxIncluded !== false, // デフォルトtrue
          isSubscription: offer.subscription || false,
          sourceUrl: offer.sourceUrl || `https://${storeSlug}.co.jp/`,
          fetchedAt: offer.fetchedAt || new Date(),
          store: {
            id: this.getStoreId(storeSlug),
            name: storeName,
            slug: storeSlug
          },
          product: {
            id: index + 2000,
            brand,
            series: offer.series || 'スタンダード',
            type: offer.type || 'TAPE',
            size,
            packSizeMin: packSize
          },
          calcSnapshots: [{
            effectiveTotal: offer.effectivePrice || price,
            yenPerSheet: offer.yenPerSheet || (price / packSize),
            pointsYen: offer.pointsYen || 0
          }]
        }
      })
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

  // データ収集状況を取得（クライアントサイド専用）
  async getDataCollectionStatus() {
    try {
      const result = await collectClientSideData()
      
      return {
        available: result.success,
        totalItems: result.totalItems || 0,
        sources: result.sources || {},
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