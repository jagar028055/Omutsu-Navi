import { prisma } from '@/lib/prisma';
import { normalizeOffer } from './normalizer';
import { processOffers, DEFAULT_CALC_POLICY } from '@/lib/calculate';
import { ETLJobConfig, StoreAdapter, RawOfferData } from './types';

export class ETLJobRunner {
  private adapters: Map<string, StoreAdapter> = new Map();

  constructor() {
    // ここでアダプタを登録
    // this.registerAdapter(new AmazonAdapter());
    // this.registerAdapter(new RakutenAdapter());
  }

  registerAdapter(adapter: StoreAdapter) {
    this.adapters.set(adapter.storeSlug, adapter);
  }

  async runJob(config: ETLJobConfig): Promise<{
    processed: number;
    errors: number;
    newOffers: number;
    updatedOffers: number;
  }> {
    const adapter = this.adapters.get(config.storeSlug);
    if (!adapter) {
      throw new Error(`No adapter found for store: ${config.storeSlug}`);
    }

    console.log(`Starting ETL job for ${config.storeSlug}`);
    
    let processed = 0;
    let errors = 0;
    let newOffers = 0;
    let updatedOffers = 0;
    
    try {
      // ストア情報を取得または作成
      const store = await this.ensureStore(adapter.storeSlug, adapter.storeName);
      
      for (const query of config.searchQueries) {
        try {
          console.log(`Searching for: ${query}`);
          const rawOffers = await adapter.search(query);
          
          for (const rawOffer of rawOffers) {
            try {
              const result = await this.processRawOffer(rawOffer, store.id);
              processed++;
              
              if (result.isNew) {
                newOffers++;
              } else if (result.isUpdated) {
                updatedOffers++;
              }
            } catch (error) {
              console.error(`Error processing offer: ${rawOffer.title}`, error);
              errors++;
            }
          }
        } catch (error) {
          console.error(`Error searching for: ${query}`, error);
          errors++;
        }
      }

      // 計算スナップショットの更新
      await this.updateCalculationSnapshots();
      
      console.log(`ETL job completed: processed=${processed}, errors=${errors}, new=${newOffers}, updated=${updatedOffers}`);
      
    } catch (error) {
      console.error(`ETL job failed for ${config.storeSlug}:`, error);
      throw error;
    }

    return { processed, errors, newOffers, updatedOffers };
  }

  private async processRawOffer(rawOffer: RawOfferData, storeId: number): Promise<{
    isNew: boolean;
    isUpdated: boolean;
  }> {
    // 正規化
    const normalized = normalizeOffer(rawOffer);
    if (!normalized) {
      throw new Error(`Failed to normalize offer: ${rawOffer.title}`);
    }

    if (normalized.confidence < 0.6) {
      console.warn(`Low confidence normalization for: ${rawOffer.title} (${normalized.confidence})`);
    }

    // プロダクト情報を取得または作成
    const product = await this.ensureProduct(normalized);

    // 既存オファーのチェック
    const existingOffer = await prisma.offer.findUnique({
      where: {
        productId_storeId: {
          productId: product.id,
          storeId: storeId,
        }
      }
    });

    const offerData = {
      title: rawOffer.title,
      packCount: normalized.packCount,
      price: rawOffer.price,
      coupon: rawOffer.coupon || 0,
      shipping: rawOffer.shipping || 0,
      pointsPercent: rawOffer.pointsPercent,
      pointsFixed: rawOffer.pointsFixed,
      pointsBase: rawOffer.pointsBase,
      pointsNote: rawOffer.pointsNote,
      isSubscription: rawOffer.isSubscription || false,
      sourceUrl: rawOffer.sourceUrl,
      fetchedAt: rawOffer.fetchedAt,
      isActive: true,
    };

    if (existingOffer) {
      // 価格変更があった場合のみ更新
      const hasChanges = 
        existingOffer.price !== offerData.price ||
        existingOffer.coupon !== offerData.coupon ||
        existingOffer.pointsPercent !== offerData.pointsPercent ||
        existingOffer.pointsFixed !== offerData.pointsFixed;

      if (hasChanges) {
        await prisma.offer.update({
          where: { id: existingOffer.id },
          data: offerData,
        });
        return { isNew: false, isUpdated: true };
      }
      
      return { isNew: false, isUpdated: false };
    } else {
      await prisma.offer.create({
        data: {
          ...offerData,
          productId: product.id,
          storeId: storeId,
        },
      });
      return { isNew: true, isUpdated: false };
    }
  }

  private async ensureStore(slug: string, name: string) {
    return await prisma.store.upsert({
      where: { slug },
      update: { name },
      create: {
        name,
        slug,
        priority: 100,
      },
    });
  }

  private async ensureProduct(normalized: any) {
    return await prisma.product.upsert({
      where: {
        brand_series_type_size: {
          brand: normalized.brand,
          series: normalized.series,
          type: normalized.type,
          size: normalized.size,
        }
      },
      update: {},
      create: {
        brand: normalized.brand,
        series: normalized.series,
        type: normalized.type,
        size: normalized.size,
        packSizeMin: normalized.packCount,
      },
    });
  }

  private async updateCalculationSnapshots() {
    // デフォルト計算ポリシーを取得または作成
    const calcPolicy = await prisma.calcPolicy.upsert({
      where: { name: 'default' },
      update: {},
      create: {
        name: 'default',
        includePoints: true,
        limitedPointFactor: 1.0,
        includeSubscription: false,
        isDefault: true,
      },
    });

    // 全アクティブオファーを取得
    const offers = await prisma.offer.findMany({
      where: { isActive: true },
      include: {
        product: true,
        store: true,
      }
    });

    // 計算実行
    const processedOffers = processOffers(
      offers.map(offer => ({
        id: offer.id,
        price: offer.price,
        coupon: offer.coupon,
        shipping: offer.shipping,
        packCount: offer.packCount,
        pointsPercent: offer.pointsPercent,
        pointsFixed: offer.pointsFixed,
        pointsBase: offer.pointsBase,
        isSubscription: offer.isSubscription,
        taxIncluded: offer.taxIncluded,
      })),
      DEFAULT_CALC_POLICY,
      'cpp'
    );

    // 計算スナップショットを更新
    for (const processed of processedOffers) {
      await prisma.calcSnapshot.upsert({
        where: {
          offerId_calcPolicyId: {
            offerId: processed.id,
            calcPolicyId: calcPolicy.id,
          }
        },
        update: {
          effectiveTotal: processed.calculation.effectiveTotal,
          yenPerSheet: processed.calculation.yenPerSheet,
          pointsYen: processed.calculation.pointsYen,
          rankBucket: 'active',
          calcAt: new Date(),
        },
        create: {
          offerId: processed.id,
          calcPolicyId: calcPolicy.id,
          effectiveTotal: processed.calculation.effectiveTotal,
          yenPerSheet: processed.calculation.yenPerSheet,
          pointsYen: processed.calculation.pointsYen,
          rankBucket: 'active',
          calcAt: new Date(),
        },
      });
    }
  }
}

export const etlJobRunner = new ETLJobRunner();