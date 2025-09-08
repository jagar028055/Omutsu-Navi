import { PrismaClient, ProductType, ProductSize, PointsBase } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 データベースシードを開始します...')

  // 計算ポリシーを作成
  const defaultPolicy = await prisma.calcPolicy.upsert({
    where: { name: 'default' },
    update: {},
    create: {
      name: 'default',
      includePoints: true,
      limitedPointFactor: 1.0,
      includeSubscription: false,
      isDefault: true,
    },
  })

  // ストア情報を作成
  const stores = await Promise.all([
    prisma.store.upsert({
      where: { slug: 'amazon' },
      update: {},
      create: {
        name: 'Amazon',
        slug: 'amazon',
        affiliateProgram: 'amazon-associates',
        priority: 1,
      },
    }),
    prisma.store.upsert({
      where: { slug: 'rakuten' },
      update: {},
      create: {
        name: '楽天市場',
        slug: 'rakuten',
        affiliateProgram: 'rakuten-affiliate',
        priority: 2,
      },
    }),
    prisma.store.upsert({
      where: { slug: 'yahoo' },
      update: {},
      create: {
        name: 'Yahoo!ショッピング',
        slug: 'yahoo',
        affiliateProgram: 'value-commerce',
        priority: 3,
      },
    }),
    prisma.store.upsert({
      where: { slug: 'lohaco' },
      update: {},
      create: {
        name: 'LOHACO',
        slug: 'lohaco',
        priority: 4,
      },
    }),
    prisma.store.upsert({
      where: { slug: 'yodobashi' },
      update: {},
      create: {
        name: 'ヨドバシ.com',
        slug: 'yodobashi',
        priority: 5,
      },
    }),
  ])

  console.log('✅ ストア情報を作成しました')

  // 商品データを作成
  const products = [
    // パンパース
    { brand: 'Pampers', series: 'はじめての肌へのいちばん', type: ProductType.TAPE, size: ProductSize.NB, packSizeMin: 84 },
    { brand: 'Pampers', series: 'はじめての肌へのいちばん', type: ProductType.TAPE, size: ProductSize.S, packSizeMin: 76 },
    { brand: 'Pampers', series: 'はじめての肌へのいちばん', type: ProductType.TAPE, size: ProductSize.M, packSizeMin: 64 },
    { brand: 'Pampers', series: 'はじめての肌へのいちばん', type: ProductType.TAPE, size: ProductSize.L, packSizeMin: 54 },
    { brand: 'Pampers', series: 'はじめての肌へのいちばん', type: ProductType.PANTS, size: ProductSize.M, packSizeMin: 58 },
    { brand: 'Pampers', series: 'はじめての肌へのいちばん', type: ProductType.PANTS, size: ProductSize.L, packSizeMin: 44 },
    { brand: 'Pampers', series: 'はじめての肌へのいちばん', type: ProductType.PANTS, size: ProductSize.XL, packSizeMin: 36 },

    // メリーズ
    { brand: 'Merries', series: 'さらさらエアスルー', type: ProductType.TAPE, size: ProductSize.NB, packSizeMin: 90 },
    { brand: 'Merries', series: 'さらさらエアスルー', type: ProductType.TAPE, size: ProductSize.S, packSizeMin: 82 },
    { brand: 'Merries', series: 'さらさらエアスルー', type: ProductType.TAPE, size: ProductSize.M, packSizeMin: 64 },
    { brand: 'Merries', series: 'さらさらエアスルー', type: ProductType.TAPE, size: ProductSize.L, packSizeMin: 54 },
    { brand: 'Merries', series: 'さらさらエアスルー', type: ProductType.PANTS, size: ProductSize.M, packSizeMin: 58 },
    { brand: 'Merries', series: 'さらさらエアスルー', type: ProductType.PANTS, size: ProductSize.L, packSizeMin: 44 },
    { brand: 'Merries', series: 'さらさらエアスルー', type: ProductType.PANTS, size: ProductSize.XL, packSizeMin: 36 },

    // ムーニー
    { brand: 'Moony', series: 'エアフィット', type: ProductType.TAPE, size: ProductSize.NB, packSizeMin: 90 },
    { brand: 'Moony', series: 'エアフィット', type: ProductType.TAPE, size: ProductSize.S, packSizeMin: 84 },
    { brand: 'Moony', series: 'エアフィット', type: ProductType.TAPE, size: ProductSize.M, packSizeMin: 64 },
    { brand: 'Moony', series: 'エアフィット', type: ProductType.TAPE, size: ProductSize.L, packSizeMin: 54 },
    { brand: 'Moony', series: 'エアフィット', type: ProductType.PANTS, size: ProductSize.M, packSizeMin: 58 },
    { brand: 'Moony', series: 'エアフィット', type: ProductType.PANTS, size: ProductSize.L, packSizeMin: 44 },
    { brand: 'Moony', series: 'エアフィット', type: ProductType.PANTS, size: ProductSize.XL, packSizeMin: 36 },

    // ゲンキ
    { brand: 'Genki', series: 'アンパンマン', type: ProductType.TAPE, size: ProductSize.S, packSizeMin: 82 },
    { brand: 'Genki', series: 'アンパンマン', type: ProductType.TAPE, size: ProductSize.M, packSizeMin: 64 },
    { brand: 'Genki', series: 'アンパンマン', type: ProductType.TAPE, size: ProductSize.L, packSizeMin: 54 },
    { brand: 'Genki', series: 'アンパンマン', type: ProductType.PANTS, size: ProductSize.M, packSizeMin: 58 },
    { brand: 'Genki', series: 'アンパンマン', type: ProductType.PANTS, size: ProductSize.L, packSizeMin: 44 },
    { brand: 'Genki', series: 'アンパンマン', type: ProductType.PANTS, size: ProductSize.XL, packSizeMin: 36 },

    // グーン
    { brand: 'GooN', series: 'まっさらさら通気', type: ProductType.TAPE, size: ProductSize.NB, packSizeMin: 90 },
    { brand: 'GooN', series: 'まっさらさら通気', type: ProductType.TAPE, size: ProductSize.S, packSizeMin: 84 },
    { brand: 'GooN', series: 'まっさらさら通気', type: ProductType.TAPE, size: ProductSize.M, packSizeMin: 64 },
    { brand: 'GooN', series: 'まっさらさら通気', type: ProductType.TAPE, size: ProductSize.L, packSizeMin: 54 },
    { brand: 'GooN', series: 'まっさらさら通気', type: ProductType.PANTS, size: ProductSize.M, packSizeMin: 58 },
    { brand: 'GooN', series: 'まっさらさら通気', type: ProductType.PANTS, size: ProductSize.L, packSizeMin: 44 },
    { brand: 'GooN', series: 'まっさらさら通気', type: ProductType.PANTS, size: ProductSize.XL, packSizeMin: 36 },
  ]

  const createdProducts = []
  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: {
        brand_series_type_size: {
          brand: productData.brand,
          series: productData.series,
          type: productData.type,
          size: productData.size,
        }
      },
      update: {},
      create: productData,
    })
    createdProducts.push(product)
  }

  console.log('✅ 商品データを作成しました')

  // オファーデータを作成（サンプル価格）
  const offers = []
  for (const product of createdProducts) {
    for (const store of stores) {
      // 基本価格を設定（ブランドとストアによって変動）
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

      const offer = await prisma.offer.create({
        data: {
          productId: product.id,
          storeId: store.id,
          title: `${product.brand} ${product.series} ${product.type} ${product.size}サイズ`,
          packCount: 1,
          price: finalPrice,
          coupon: Math.random() > 0.7 ? Math.round(finalPrice * 0.05) : 0, // 30%の確率で5%クーポン
          shipping: store.slug === 'amazon' ? 0 : (Math.random() > 0.5 ? 0 : 500),
          pointsPercent: store.slug === 'rakuten' ? 1.0 : (store.slug === 'yahoo' ? 0.5 : null),
          pointsBase: PointsBase.POST_COUPON,
          taxIncluded: true,
          isSubscription: Math.random() > 0.8, // 20%の確率で定期便
          sourceUrl: `https://${store.slug}.example.com/product/${product.id}`,
          fetchedAt: new Date(),
        },
      })

      // 計算スナップショットを作成
      const effectivePrice = offer.price - offer.coupon + offer.shipping
      const pointsYen = offer.pointsPercent ? Math.round(effectivePrice * (offer.pointsPercent / 100)) : 0
      const effectiveTotal = effectivePrice - pointsYen
      const yenPerSheet = effectiveTotal / product.packSizeMin

      await prisma.calcSnapshot.create({
        data: {
          offerId: offer.id,
          effectiveTotal,
          yenPerSheet,
          pointsYen,
          calcPolicyId: defaultPolicy.id,
        },
      })

      offers.push(offer)
    }
  }

  console.log(`✅ ${offers.length}件のオファーデータを作成しました`)
  console.log('🎉 シードデータの作成が完了しました！')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })