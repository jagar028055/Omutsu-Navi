import axios from 'axios'

export interface RakutenProduct {
  itemName: string
  itemPrice: number
  itemUrl: string
  shopName: string
  shopUrl: string
  imageFlag: number
  availability: number
  taxFlag: number
  postageFlag: number
  creditCardFlag: number
  shopOfTheYearFlag: number
  shipOverseasFlag: number
  shipOverseasArea: string
  asurakuFlag: number
  asurakuClosingTime: string
  asurakuArea: string
  affiliateUrl: string
  smallImageUrls: string[]
  mediumImageUrls: string[]
  itemCode: string
  reviewCount: number
  reviewAverage: number
  pointRate: number
  pointRateStartTime: string
  pointRateEndTime: string
  giftFlag: number
  shopAffiliateUrl: string
}

export interface RakutenApiResponse {
  Items: Array<{ Item: RakutenProduct }>
  pageCount: number
  first: number
  last: number
  hits: number
  carrier: number
  page: number
}

// 楽天商品検索API（無料プランでも使用可能）
export class RakutenAPI {
  private baseUrl = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601'
  private applicationId: string

  constructor(applicationId: string) {
    this.applicationId = applicationId
  }

  // おむつ商品を検索
  async searchDiapers(options: {
    keyword?: string
    brand?: string
    size?: string
    type?: string
    minPrice?: number
    maxPrice?: number
    page?: number
    sort?: string
  } = {}): Promise<RakutenApiResponse> {
    const {
      keyword = 'おむつ',
      brand = '',
      size = '',
      type = '',
      minPrice,
      maxPrice,
      page = 1,
      sort = '+itemPrice' // 価格昇順
    } = options

    // 検索キーワード構築（シンプルに）
    let searchKeyword = keyword
    if (brand) searchKeyword += ` ${brand}`
    if (size) searchKeyword += ` ${size}`
    if (type === 'TAPE') searchKeyword += ' テープ'
    if (type === 'PANTS') searchKeyword += ' パンツ'

    const params = {
      applicationId: this.applicationId,
      keyword: searchKeyword.trim(),
      page,
      hits: 30,
      sort,
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      formatVersion: 2
    }

    try {
      console.log('🔍 楽天APIリクエスト URL:', this.baseUrl)
      console.log('🔍 楽天APIリクエスト パラメータ:', params)
      
      const response = await axios.get(this.baseUrl, { params })
      console.log('✅ 楽天APIレスポンス成功:', response.status)
      return response.data
    } catch (error: any) {
      console.error('❌ 楽天API呼び出しエラー:')
      console.error('Status:', error?.response?.status)
      console.error('Data:', error?.response?.data)
      console.error('URL:', error?.config?.url)
      throw error
    }
  }

  // 特定ブランドのおむつ検索
  async searchBrandDiapers(brand: string, size?: string, type?: string): Promise<RakutenApiResponse> {
    return this.searchDiapers({
      brand,
      size,
      type,
      keyword: 'おむつ'
    })
  }
}

// 楽天商品データを標準形式に変換
export function convertRakutenToOffer(rakutenItem: RakutenProduct, brand: string, size: string, type: string) {
  // 商品名から枚数を抽出
  const packSizeMatch = rakutenItem.itemName.match(/(\d+)枚/)
  const packSize = packSizeMatch ? parseInt(packSizeMatch[1]) : 0

  // ポイント率を計算（楽天ポイント）
  const pointsPercent = rakutenItem.pointRate || 1.0

  return {
    title: rakutenItem.itemName,
    price: rakutenItem.itemPrice,
    sourceUrl: rakutenItem.itemUrl,
    affiliateUrl: rakutenItem.affiliateUrl,
    storeName: rakutenItem.shopName,
    storeUrl: rakutenItem.shopUrl,
    packSize,
    pointsPercent,
    reviewCount: rakutenItem.reviewCount,
    reviewAverage: rakutenItem.reviewAverage,
    taxIncluded: rakutenItem.taxFlag === 1,
    postageFlag: rakutenItem.postageFlag, // 0:送料別 1:送料込み 2:送料確認
    brand,
    size,
    type,
    fetchedAt: new Date(),
    images: rakutenItem.mediumImageUrls || []
  }
}

// サンプル使用例（環境変数にAPIキーを設定）
export async function fetchRealDiaperData() {
  const apiKey = process.env.RAKUTEN_APPLICATION_ID
  if (!apiKey) {
    console.warn('楽天APIキーが設定されていません')
    return []
  }

  const rakuten = new RakutenAPI(apiKey)
  const results = []

  const brands = ['パンパース', 'メリーズ', 'ムーニー', 'ゲンキ', 'グーン']
  const sizes = ['S', 'M', 'L', 'XL']
  const types = ['テープ', 'パンツ']

  try {
    // 各ブランドの商品を取得
    for (const brand of brands.slice(0, 2)) { // 最初は2ブランドのみテスト
      for (const size of sizes.slice(0, 2)) { // S、Mサイズのみ
        console.log(`${brand} ${size}サイズを検索中...`)
        const response = await rakuten.searchBrandDiapers(brand, size)
        
        if (response.Items && response.Items.length > 0) {
          const items = response.Items.slice(0, 5) // 上位5商品
          for (const { Item } of items) {
            const offer = convertRakutenToOffer(Item, brand, size, 'TAPE')
            results.push(offer)
          }
        }

        // API制限に配慮して少し待機
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return results
  } catch (error) {
    console.error('実データ取得エラー:', error)
    return []
  }
}