import axios from 'axios'
import * as cheerio from 'cheerio'

export interface AmazonProduct {
  title: string
  price: number
  originalPrice?: number
  rating?: number
  reviewCount?: number
  url: string
  imageUrl?: string
  prime?: boolean
  primePrice?: number
  subscription?: boolean
  subscriptionDiscount?: number
}

// Amazon検索（非公式スクレイピング - 使用時は利用規約を確認）
export class AmazonScraper {
  private baseUrl = 'https://www.amazon.co.jp'
  private headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
  }

  // Amazon商品検索（注意: 実際の使用時はrobot.txtとAPI利用規約を確認）
  async searchProducts(keyword: string, page: number = 1): Promise<AmazonProduct[]> {
    try {
      const searchUrl = `${this.baseUrl}/s?k=${encodeURIComponent(keyword)}&page=${page}`
      
      // 実際のスクレイピングは制限があるため、ここではダミーデータを返す
      console.log(`Amazon検索: ${keyword} (ページ${page})`)
      
      // 本来はここでHTTPリクエストとHTMLパース
      // const response = await axios.get(searchUrl, { headers: this.headers })
      // const $ = cheerio.load(response.data)
      
      // ダミーデータを返す（実際の実装時は実際のスクレイピングコードに置き換え）
      return this.generateDummyAmazonData(keyword)
      
    } catch (error) {
      console.error('Amazon検索エラー:', error)
      return []
    }
  }

  // ダミーデータ生成（実際のスクレイピングの代替）
  private generateDummyAmazonData(keyword: string): AmazonProduct[] {
    const basePrice = 1500
    const products: AmazonProduct[] = []

    for (let i = 0; i < 5; i++) {
      const price = Math.round(basePrice + (Math.random() - 0.5) * 600)
      const originalPrice = Math.random() > 0.7 ? Math.round(price * 1.1) : undefined
      
      products.push({
        title: `${keyword} 商品${i + 1} - Amazon限定`,
        price,
        originalPrice,
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 1000) + 50,
        url: `https://www.amazon.co.jp/dp/B${String(Math.random()).substring(2, 12)}`,
        prime: Math.random() > 0.3,
        subscription: Math.random() > 0.7,
        subscriptionDiscount: Math.random() > 0.5 ? 5 + Math.floor(Math.random() * 15) : undefined
      })
    }

    return products
  }

  // おむつ専用検索
  async searchDiapers(brand?: string, size?: string, type?: string): Promise<AmazonProduct[]> {
    let keyword = 'おむつ'
    if (brand) keyword += ` ${brand}`
    if (size) keyword += ` ${size}`
    if (type === 'TAPE') keyword += ' テープ'
    if (type === 'PANTS') keyword += ' パンツ'

    return this.searchProducts(keyword)
  }
}

// Amazon商品データを標準形式に変換
export function convertAmazonToOffer(amazonItem: AmazonProduct, brand: string, size: string, type: string) {
  // 商品名から枚数を抽出
  const packSizeMatch = amazonItem.title.match(/(\d+)枚/)
  const packSize = packSizeMatch ? parseInt(packSizeMatch[1]) : 0

  return {
    title: amazonItem.title,
    price: amazonItem.price,
    originalPrice: amazonItem.originalPrice,
    sourceUrl: amazonItem.url,
    storeName: 'Amazon',
    storeSlug: 'amazon',
    packSize,
    prime: amazonItem.prime,
    subscription: amazonItem.subscription,
    subscriptionDiscount: amazonItem.subscriptionDiscount,
    rating: amazonItem.rating,
    reviewCount: amazonItem.reviewCount,
    brand,
    size,
    type,
    fetchedAt: new Date(),
    shipping: amazonItem.prime ? 0 : 500, // Prime会員は送料無料
    taxIncluded: true
  }
}