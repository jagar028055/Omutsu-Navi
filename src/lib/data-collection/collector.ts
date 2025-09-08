import { RakutenAPI, fetchRealDiaperData } from '../data-fetchers/rakuten-api'
import { AmazonScraper, convertAmazonToOffer } from '../data-fetchers/amazon-scraper'
import { SampleOffer } from '../sample-data'

export interface DataCollectionResult {
  success: boolean
  totalItems: number
  sources: {
    rakuten: number
    amazon: number
    yahoo: number
    errors: string[]
  }
  offers: CollectedOffer[]
}

export interface CollectedOffer {
  title: string
  brand: string
  series?: string
  size: string
  type: 'TAPE' | 'PANTS'
  packSize: number
  price: number
  originalPrice?: number
  coupon?: number
  shipping: number
  pointsPercent?: number
  pointsFixed?: number
  taxIncluded: boolean
  subscription: boolean
  subscriptionDiscount?: number
  storeName: string
  storeSlug: string
  sourceUrl: string
  affiliateUrl?: string
  rating?: number
  reviewCount?: number
  fetchedAt: Date
  
  // 計算データ
  effectivePrice?: number
  yenPerSheet?: number
  pointsYen?: number
}

export class DataCollector {
  private rakutenApi?: RakutenAPI
  private amazonScraper: AmazonScraper
  
  constructor() {
    // 楽天APIキーがある場合のみ初期化
    const rakutenKey = process.env.RAKUTEN_APPLICATION_ID
    if (rakutenKey) {
      this.rakutenApi = new RakutenAPI(rakutenKey)
    }
    
    this.amazonScraper = new AmazonScraper()
  }

  // 全データソースから収集
  async collectAllData(options: {
    brands?: string[]
    sizes?: string[]
    types?: string[]
    maxPerSource?: number
  } = {}): Promise<DataCollectionResult> {
    const {
      brands = ['Pampers', 'Merries', 'Moony', 'Genki', 'GooN'],
      sizes = ['S', 'M', 'L', 'XL'],
      types = ['TAPE', 'PANTS'],
      maxPerSource = 10
    } = options

    const result: DataCollectionResult = {
      success: false,
      totalItems: 0,
      sources: {
        rakuten: 0,
        amazon: 0,
        yahoo: 0,
        errors: []
      },
      offers: []
    }

    console.log('🚀 データ収集を開始します...')

    // 楽天データ収集
    if (this.rakutenApi) {
      try {
        console.log('📦 楽天市場からデータを収集中...')
        const rakutenOffers = await this.collectFromRakuten(brands.slice(0, 2), sizes.slice(0, 2))
        result.offers.push(...rakutenOffers)
        result.sources.rakuten = rakutenOffers.length
        console.log(`✅ 楽天: ${rakutenOffers.length}件取得`)
      } catch (error) {
        result.sources.errors.push(`楽天API: ${error}`)
        console.error('❌ 楽天データ収集エラー:', error)
      }
    } else {
      result.sources.errors.push('楽天APIキーが未設定')
      console.log('⚠️ 楽天APIキーが未設定のため、サンプルデータを使用')
    }

    // Amazonデータ収集（ダミー）
    try {
      console.log('🛒 Amazonからデータを収集中...')
      const amazonOffers = await this.collectFromAmazon(brands.slice(0, 2), sizes.slice(0, 2))
      result.offers.push(...amazonOffers)
      result.sources.amazon = amazonOffers.length
      console.log(`✅ Amazon: ${amazonOffers.length}件取得`)
    } catch (error) {
      result.sources.errors.push(`Amazon: ${error}`)
      console.error('❌ Amazonデータ収集エラー:', error)
    }

    // データ後処理
    result.offers = this.processOffers(result.offers)
    result.totalItems = result.offers.length
    result.success = result.totalItems > 0

    console.log(`🎉 データ収集完了: 合計${result.totalItems}件`)
    
    return result
  }

  // 楽天からデータ収集
  private async collectFromRakuten(brands: string[], sizes: string[]): Promise<CollectedOffer[]> {
    if (!this.rakutenApi) return []

    const offers: CollectedOffer[] = []
    
    for (const brand of brands) {
      for (const size of sizes) {
        try {
          const response = await this.rakutenApi.searchBrandDiapers(this.mapBrandToJapanese(brand), size)
          
          if (response.Items && response.Items.length > 0) {
            const items = response.Items.slice(0, 3) // 上位3商品
            
            for (const { Item } of items) {
              const offer = this.convertRakutenItem(Item, brand, size)
              if (offer) offers.push(offer)
            }
          }
          
          // API制限対策
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (error) {
          console.error(`楽天検索エラー (${brand} ${size}):`, error)
        }
      }
    }

    return offers
  }

  // Amazonからデータ収集
  private async collectFromAmazon(brands: string[], sizes: string[]): Promise<CollectedOffer[]> {
    const offers: CollectedOffer[] = []
    
    for (const brand of brands) {
      for (const size of sizes) {
        try {
          const products = await this.amazonScraper.searchDiapers(this.mapBrandToJapanese(brand), size)
          
          for (const product of products.slice(0, 3)) {
            const offer = this.convertAmazonItem(product, brand, size)
            if (offer) offers.push(offer)
          }
          
          // レート制限対策
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          console.error(`Amazon検索エラー (${brand} ${size}):`, error)
        }
      }
    }

    return offers
  }

  // 楽天商品データ変換
  private convertRakutenItem(item: any, brand: string, size: string): CollectedOffer | null {
    try {
      const packSizeMatch = item.itemName.match(/(\d+)枚/)
      const packSize = packSizeMatch ? parseInt(packSizeMatch[1]) : 0
      
      if (packSize === 0) return null // 枚数不明は除外

      return {
        title: item.itemName,
        brand,
        size,
        type: item.itemName.includes('パンツ') ? 'PANTS' : 'TAPE',
        packSize,
        price: item.itemPrice,
        shipping: item.postageFlag === 1 ? 0 : 500,
        pointsPercent: item.pointRate || 1.0,
        taxIncluded: item.taxFlag === 1,
        subscription: false,
        storeName: '楽天市場',
        storeSlug: 'rakuten',
        sourceUrl: item.itemUrl,
        affiliateUrl: item.affiliateUrl,
        rating: item.reviewAverage,
        reviewCount: item.reviewCount,
        fetchedAt: new Date()
      }
    } catch (error) {
      console.error('楽天商品変換エラー:', error)
      return null
    }
  }

  // Amazon商品データ変換
  private convertAmazonItem(item: any, brand: string, size: string): CollectedOffer | null {
    try {
      const packSizeMatch = item.title.match(/(\d+)枚/)
      const packSize = packSizeMatch ? parseInt(packSizeMatch[1]) : 0
      
      if (packSize === 0) return null

      return {
        title: item.title,
        brand,
        size,
        type: item.title.includes('パンツ') ? 'PANTS' : 'TAPE',
        packSize,
        price: item.price,
        originalPrice: item.originalPrice,
        shipping: item.prime ? 0 : 500,
        taxIncluded: true,
        subscription: item.subscription || false,
        subscriptionDiscount: item.subscriptionDiscount,
        storeName: 'Amazon',
        storeSlug: 'amazon',
        sourceUrl: item.url,
        rating: item.rating,
        reviewCount: item.reviewCount,
        fetchedAt: new Date()
      }
    } catch (error) {
      console.error('Amazon商品変換エラー:', error)
      return null
    }
  }

  // ブランド名を日本語にマッピング
  private mapBrandToJapanese(brand: string): string {
    const brandMap: { [key: string]: string } = {
      'Pampers': 'パンパース',
      'Merries': 'メリーズ',
      'Moony': 'ムーニー',
      'Genki': 'ゲンキ',
      'GooN': 'グーン'
    }
    return brandMap[brand] || brand
  }

  // 収集データの後処理
  private processOffers(offers: CollectedOffer[]): CollectedOffer[] {
    return offers.map(offer => {
      // 実質価格計算
      const basePrice = offer.price + offer.shipping
      const couponDiscount = offer.coupon || 0
      const pointsYen = offer.pointsPercent ? Math.round(basePrice * (offer.pointsPercent / 100)) : 0
      
      offer.effectivePrice = basePrice - couponDiscount
      offer.pointsYen = pointsYen
      offer.yenPerSheet = offer.packSize > 0 ? (offer.effectivePrice - pointsYen) / offer.packSize : 0

      return offer
    })
    .filter(offer => (offer.yenPerSheet || 0) > 0) // 有効な価格データのみ
    .sort((a, b) => (a.yenPerSheet || 0) - (b.yenPerSheet || 0)) // 価格昇順
  }
}

// データ収集の実行
export async function collectRealData(): Promise<DataCollectionResult> {
  const collector = new DataCollector()
  return collector.collectAllData({
    brands: ['Pampers', 'Merries'],
    sizes: ['S', 'M'],
    maxPerSource: 5
  })
}