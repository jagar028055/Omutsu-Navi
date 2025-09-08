// サンプルデータ（データベース接続まで）
export interface SampleOffer {
  id: number
  title: string
  packCount: number
  price: number
  coupon: number
  shipping: number
  pointsPercent: number | null
  pointsFixed: number | null
  pointsNote: string | null
  taxIncluded: boolean
  isSubscription: boolean
  sourceUrl: string
  fetchedAt: Date
  store: {
    id: number
    name: string
    slug: string
  }
  product: {
    id: number
    brand: string
    series: string
    type: string
    size: string
    packSizeMin: number
  }
  calcSnapshots: {
    effectiveTotal: number
    yenPerSheet: number
    pointsYen: number
  }[]
}

const stores = [
  { id: 1, name: 'Amazon', slug: 'amazon' },
  { id: 2, name: '楽天市場', slug: 'rakuten' },
  { id: 3, name: 'Yahoo!ショッピング', slug: 'yahoo' },
  { id: 4, name: 'LOHACO', slug: 'lohaco' },
  { id: 5, name: 'ヨドバシ.com', slug: 'yodobashi' },
]

const products = [
  { id: 1, brand: 'Pampers', series: 'はじめての肌へのいちばん', type: 'TAPE', size: 'NB', packSizeMin: 84 },
  { id: 2, brand: 'Pampers', series: 'はじめての肌へのいちばん', type: 'TAPE', size: 'S', packSizeMin: 76 },
  { id: 3, brand: 'Pampers', series: 'はじめての肌へのいちばん', type: 'TAPE', size: 'M', packSizeMin: 64 },
  { id: 4, brand: 'Merries', series: 'さらさらエアスルー', type: 'TAPE', size: 'S', packSizeMin: 82 },
  { id: 5, brand: 'Merries', series: 'さらさらエアスルー', type: 'TAPE', size: 'M', packSizeMin: 64 },
  { id: 6, brand: 'Moony', series: 'エアフィット', type: 'PANTS', size: 'M', packSizeMin: 58 },
  { id: 7, brand: 'Moony', series: 'エアフィット', type: 'PANTS', size: 'L', packSizeMin: 44 },
  { id: 8, brand: 'Genki', series: 'アンパンマン', type: 'PANTS', size: 'L', packSizeMin: 44 },
  { id: 9, brand: 'GooN', series: 'まっさらさら通気', type: 'TAPE', size: 'S', packSizeMin: 84 },
  { id: 10, brand: 'GooN', series: 'まっさらさら通気', type: 'PANTS', size: 'XL', packSizeMin: 36 },
]

// サンプルデータ生成
const generateSampleOffers = (): SampleOffer[] => {
  const offers: SampleOffer[] = []
  let offerId = 1

  for (const product of products) {
    for (const store of stores) {
      // 基本価格を設定
      let basePrice = 1500
      if (product.brand === 'Pampers') basePrice = 1800
      if (product.brand === 'Merries') basePrice = 1700
      if (product.brand === 'Moony') basePrice = 1650
      if (product.brand === 'Genki') basePrice = 1400
      if (product.brand === 'GooN') basePrice = 1450

      // サイズによる価格調整
      if (product.size === 'NB') basePrice += 200
      if (product.size === 'XL') basePrice += 100

      // ストアによる価格変動
      if (store.slug === 'amazon') basePrice *= 0.95
      if (store.slug === 'rakuten') basePrice *= 0.98
      if (store.slug === 'yahoo') basePrice *= 0.97
      if (store.slug === 'lohaco') basePrice *= 1.02
      if (store.slug === 'yodobashi') basePrice *= 1.05

      // ランダムな価格変動（±10%）
      const variation = 0.9 + Math.random() * 0.2
      const finalPrice = Math.round(basePrice * variation)

      const coupon = Math.random() > 0.7 ? Math.round(finalPrice * 0.05) : 0
      const shipping = store.slug === 'amazon' ? 0 : (Math.random() > 0.5 ? 0 : 500)
      const pointsPercent = store.slug === 'rakuten' ? 1.0 : (store.slug === 'yahoo' ? 0.5 : null)
      const isSubscription = Math.random() > 0.8

      const effectivePrice = finalPrice - coupon + shipping
      const pointsYen = pointsPercent ? Math.round(effectivePrice * (pointsPercent / 100)) : 0
      const effectiveTotal = effectivePrice - pointsYen
      const yenPerSheet = effectiveTotal / product.packSizeMin

      offers.push({
        id: offerId++,
        title: `${product.brand} ${product.series} ${product.type} ${product.size}サイズ`,
        packCount: 1,
        price: finalPrice,
        coupon,
        shipping,
        pointsPercent,
        pointsFixed: null,
        pointsNote: pointsPercent ? `${pointsPercent}%ポイント還元` : null,
        taxIncluded: true,
        isSubscription,
        sourceUrl: `https://${store.slug}.example.com/product/${product.id}`,
        fetchedAt: new Date(),
        store,
        product,
        calcSnapshots: [{
          effectiveTotal,
          yenPerSheet,
          pointsYen,
        }]
      })
    }
  }

  return offers
}

export const sampleOffers = generateSampleOffers()

export interface FilterOptions {
  size?: string
  type?: string
  brand?: string
  includePoints?: boolean
  limitedPointFactor?: number
  includeSubscription?: boolean
  sort?: 'cpp' | 'total' | 'updated'
}

export function getFilteredOffers(filters: FilterOptions = {}): SampleOffer[] {
  const {
    size,
    type,
    brand,
    includeSubscription = false,
    sort = 'cpp'
  } = filters

  let filtered = sampleOffers.filter(offer => {
    if (!includeSubscription && offer.isSubscription) return false
    if (size && offer.product.size !== size) return false
    if (type && offer.product.type !== type) return false
    if (brand && offer.product.brand !== brand) return false
    return true
  })

  // ソート
  switch (sort) {
    case 'cpp':
      filtered.sort((a, b) => a.calcSnapshots[0].yenPerSheet - b.calcSnapshots[0].yenPerSheet)
      break
    case 'total':
      filtered.sort((a, b) => a.calcSnapshots[0].effectiveTotal - b.calcSnapshots[0].effectiveTotal)
      break
    case 'updated':
      filtered.sort((a, b) => b.fetchedAt.getTime() - a.fetchedAt.getTime())
      break
  }

  return filtered
}

export function getProductStats() {
  return {
    productCount: products.length,
    offerCount: sampleOffers.length,
    storeCount: stores.length,
  }
}