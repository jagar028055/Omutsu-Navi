import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 型定義
export interface OfferWithDetails {
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

export interface FilterOptions {
  size?: string
  type?: string
  brand?: string
  includePoints?: boolean
  limitedPointFactor?: number
  includeSubscription?: boolean
  sort?: 'cpp' | 'total' | 'updated'
}

export async function getOffers(filters: FilterOptions = {}): Promise<OfferWithDetails[]> {
  const {
    size,
    type,
    brand,
    includeSubscription = false,
    sort = 'cpp'
  } = filters

  const where: any = {
    isActive: true,
  }

  if (!includeSubscription) {
    where.isSubscription = false
  }

  if (size || type || brand) {
    where.product = {}
    if (size) where.product.size = size
    if (type) where.product.type = type
    if (brand) where.product.brand = brand
  }

  let orderBy: any = {}
  switch (sort) {
    case 'cpp':
      orderBy = { calcSnapshots: { yenPerSheet: 'asc' } }
      break
    case 'total':
      orderBy = { calcSnapshots: { effectiveTotal: 'asc' } }
      break
    case 'updated':
      orderBy = { fetchedAt: 'desc' }
      break
  }

  const offers = await prisma.offer.findMany({
    where,
    include: {
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
        }
      },
      product: {
        select: {
          id: true,
          brand: true,
          series: true,
          type: true,
          size: true,
          packSizeMin: true,
        }
      },
      calcSnapshots: {
        select: {
          effectiveTotal: true,
          yenPerSheet: true,
          pointsYen: true,
        },
        take: 1,
        orderBy: {
          calcAt: 'desc'
        }
      }
    },
    orderBy,
    take: 50, // 最大50件まで
  })

  return offers as OfferWithDetails[]
}

export async function getProductStats() {
  const [productCount, offerCount, storeCount] = await Promise.all([
    prisma.product.count(),
    prisma.offer.count({ where: { isActive: true } }),
    prisma.store.count(),
  ])

  return {
    productCount,
    offerCount,
    storeCount,
  }
}