// クライアントサイドでのデータ収集（静的サイト対応）
import { CollectedOffer } from './data-collection/collector'

export interface ClientDataResult {
  success: boolean
  totalItems: number
  offers: any[]
  sources: {
    rakuten: number
    amazon: number
    errors: string[]
  }
  timestamp: string
}

// 楽天API（ビルド時データ取得）- 静的サイト対応
async function fetchRakutenData(applicationId: string): Promise<any[]> {
  if (!applicationId) {
    console.log('📝 楽天APIキーが設定されていません - ダミーデータを使用')
    return generateRakutenDummyData()
  }
  
  // 静的サイトではビルド時に実際のAPIを呼び出し、実行時はダミーデータを使用
  if (typeof window !== 'undefined') {
    // クライアントサイドの場合：ダミーデータを使用
    console.log('🌐 クライアントサイドでダミーデータを使用')
    return generateRakutenDummyData()
  }
  
  // サーバーサイド（ビルド時）の場合：実際のAPIを呼び出し
  try {
    console.log('🏗️ ビルド時に楽天APIから実データを取得中...')
    const { RakutenAPI } = await import('../lib/data-fetchers/rakuten-api')
    const rakuten = new RakutenAPI(applicationId)
    
    // 複数ブランドとキーワードで検索
    const searchKeywords = [
      'メリーズ おむつ',
      'パンパース おむつ', 
      'ムーニー おむつ',
      'ゲンキ おむつ',
      'グーン おむつ',
      'おむつ テープ',
      'おむつ パンツ'
    ]
    
    const allResults: any[] = []
    
    for (const keyword of searchKeywords) {
      try {
        console.log(`🔍 検索キーワード: ${keyword}`)
        const response = await rakuten.searchDiapers({
          keyword,
          page: 1,
          sort: '+itemPrice'
        })
        
        if (response.Items && response.Items.length > 0) {
          console.log(`✅ ${keyword}: ${response.Items.length}件取得`)
          
          const filteredItems = response.Items
            .filter((item: any) => item && item.itemName) // 有効なアイテムのみ
            .filter((item: any) => {
              // おむつ関連商品のみ
              const name = item.itemName.toLowerCase()
              return name.includes('おむつ') || name.includes('オムツ') || 
                     name.includes('メリーズ') || name.includes('パンパース') || 
                     name.includes('ムーニー') || name.includes('ゲンキ') || 
                     name.includes('グーン')
            })
            
          allResults.push(...filteredItems)
        }
        
        // API制限対策：リクエスト間隔を空ける
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error) {
        console.warn(`⚠️ ${keyword}の検索でエラー:`, error)
        continue
      }
    }
    
    if (allResults.length > 0) {
      console.log(`✅ 全キーワード合計: ${allResults.length}件取得`)
      console.log('🔍 楽天APIレスポンス構造:', JSON.stringify(allResults[0], null, 2))
      
      // 重複除去（商品コードで判定）
      const uniqueResults = allResults.reduce((acc: any[], item: any) => {
        const exists = acc.find(existingItem => 
          existingItem.itemCode === item.itemCode
        )
        if (!exists) {
          acc.push(item)
        }
        return acc
      }, [])
      
      console.log(`✅ 重複除去後: ${uniqueResults.length}件`)
      
      return uniqueResults
        .map((item: any) => {
          const rakutenItem = item
          
          // 安全にプロパティを取得
          const itemName = rakutenItem.itemName || '商品名不明'
          const itemPrice = rakutenItem.itemPrice || 0
          const shopName = rakutenItem.shopName || '楽天市場'
          const itemUrl = rakutenItem.itemUrl || 'https://rakuten.co.jp'
          const postageFlag = rakutenItem.postageFlag || 0
          const pointRate = rakutenItem.pointRate || 1.0
          const taxFlag = rakutenItem.taxFlag || 1
          
          // 商品名から枚数を抽出
          const packSizeMatch = itemName.match(/(\d+)枚/)
          const packSize = packSizeMatch ? parseInt(packSizeMatch[1]) : 50
          
          // ブランドを推定
          const brand = itemName.match(/(メリーズ|パンパース|ムーニー|ゲンキ|グーン)/)?.[1] || 'その他'
          
          // サイズを推定
          const sizeMatch = itemName.match(/(新生児|NB|S|M|L|XL|ビッグ|大きめ)/i)
          let size = 'S'
          if (sizeMatch) {
            const s = sizeMatch[1].toLowerCase()
            if (s.includes('新生児') || s === 'nb') size = 'NB'
            else if (s === 's') size = 'S'
            else if (s === 'm') size = 'M'
            else if (s === 'l' || s.includes('ビッグ')) size = 'L'
            else if (s === 'xl' || s.includes('大きめ')) size = 'XL'
          }
          
          const shipping = postageFlag === 1 ? 0 : 300
          const effectivePrice = itemPrice + shipping
          
          return {
            title: itemName,
            brand: brand,
            size: size,
            type: 'TAPE',
            packSize,
            price: itemPrice,
            shipping,
            pointsPercent: pointRate,
            taxIncluded: taxFlag === 1,
            subscription: false,
            storeName: shopName,
            storeSlug: 'rakuten',
            sourceUrl: itemUrl,
            fetchedAt: new Date(),
            effectivePrice,
            pointsYen: Math.round(pointRate / 100 * effectivePrice),
            yenPerSheet: effectivePrice / packSize
          }
        })
        .filter(item => item.price > 0) // 価格が0のアイテムを除外
    }
    
  } catch (error) {
    console.error('❌ ビルド時楽天API呼び出し失敗:', error)
    throw error // エラーを再スローしてフォールバックさせない
  }
  
  // ここに到達した場合はデータが取得できなかった
  throw new Error('楽天APIからデータを取得できませんでした')
}

// ダミーデータ生成（楽天風）
function generateRakutenDummyData(): any[] {
  const products = [
    { brand: 'Pampers', size: 'S', price: 1680, packSize: 76, store: '楽天市場' },
    { brand: 'Pampers', size: 'M', price: 1580, packSize: 64, store: '楽天市場' },
    { brand: 'Merries', size: 'S', price: 1720, packSize: 82, store: '楽天市場' },
    { brand: 'Merries', size: 'M', price: 1620, packSize: 64, store: '楽天市場' },
    { brand: 'Moony', size: 'S', price: 1650, packSize: 84, store: '楽天市場' },
  ]

  return products.map((product, index) => ({
    id: `rakuten_${index}`,
    title: `${product.brand} はじめての肌へのいちばん テープ ${product.size}サイズ ${product.packSize}枚`,
    brand: product.brand,
    size: product.size,
    type: 'TAPE' as const,
    packSize: product.packSize,
    price: product.price,
    shipping: 0,
    pointsPercent: 1.0,
    taxIncluded: true,
    subscription: false,
    storeName: product.store,
    storeSlug: 'rakuten',
    sourceUrl: `https://item.rakuten.co.jp/example/${index}`,
    fetchedAt: new Date(),
    effectivePrice: product.price,
    pointsYen: Math.round(product.price * 0.01),
    yenPerSheet: (product.price - Math.round(product.price * 0.01)) / product.packSize
  }))
}

// Amazon風ダミーデータ
function generateAmazonDummyData(): any[] {
  const products = [
    { brand: 'Pampers', size: 'S', price: 1599, packSize: 76, prime: true },
    { brand: 'Pampers', size: 'M', price: 1499, packSize: 64, prime: true },
    { brand: 'Merries', size: 'S', price: 1699, packSize: 82, prime: false },
    { brand: 'Moony', size: 'M', price: 1599, packSize: 58, prime: true },
    { brand: 'Genki', size: 'L', price: 1399, packSize: 44, prime: false },
  ]

  return products.map((product, index) => ({
    id: `amazon_${index}`,
    title: `${product.brand} おむつ テープ ${product.size}サイズ ${product.packSize}枚`,
    brand: product.brand,
    size: product.size,
    type: 'TAPE' as const,
    packSize: product.packSize,
    price: product.price,
    shipping: product.prime ? 0 : 500,
    taxIncluded: true,
    subscription: Math.random() > 0.7,
    storeName: 'Amazon',
    storeSlug: 'amazon',
    sourceUrl: `https://amazon.co.jp/dp/B${Math.random().toString(36).substring(2, 10)}`,
    fetchedAt: new Date(),
    effectivePrice: product.price + (product.prime ? 0 : 500),
    pointsYen: 0,
    yenPerSheet: (product.price + (product.prime ? 0 : 500)) / product.packSize,
    prime: product.prime
  }))
}

// クライアントサイドデータ収集
export async function collectClientSideData(): Promise<ClientDataResult> {
  console.log('🚀 クライアントサイドでデータ収集を開始')
  
  const result: ClientDataResult = {
    success: false,
    totalItems: 0,
    offers: [],
    sources: {
      rakuten: 0,
      amazon: 0,
      errors: []
    },
    timestamp: new Date().toISOString()
  }

  try {
    // 楽天データ（実際にはAPIキーが必要）
    const rakutenKey = process.env.NEXT_PUBLIC_RAKUTEN_APPLICATION_ID
    const rakutenOffers = await fetchRakutenData(rakutenKey || '')
    result.offers.push(...rakutenOffers)
    result.sources.rakuten = rakutenOffers.length

    // Amazon（将来的にYahoo APIに置き換え予定）
    // const amazonOffers = generateAmazonDummyData()
    // result.offers.push(...amazonOffers)
    // result.sources.amazon = amazonOffers.length

    // ソート（実質単価順）
    result.offers.sort((a, b) => a.yenPerSheet - b.yenPerSheet)
    
    result.totalItems = result.offers.length
    result.success = result.totalItems > 0

    console.log(`✅ クライアントサイド収集完了: ${result.totalItems}件`)
    
    return result

  } catch (error) {
    console.error('❌ クライアントサイド収集エラー:', error)
    result.sources.errors.push(error instanceof Error ? error.message : '不明なエラー')
    return result
  }
}

// リアルタイム価格データ（WebSocket風の更新）
export function subscribeToRealTimeUpdates(callback: (data: ClientDataResult) => void) {
  // 定期的にデータを更新（実際のプロダクションでは適切な間隔で）
  const interval = setInterval(async () => {
    const data = await collectClientSideData()
    callback(data)
  }, 5 * 60 * 1000) // 5分間隔

  return () => clearInterval(interval)
}