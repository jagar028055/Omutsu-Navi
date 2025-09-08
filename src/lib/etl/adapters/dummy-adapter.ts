import { StoreAdapter, StoreConfig, RawOfferData } from '../types';
import { PointsBase } from '@/generated/prisma';

export class DummyAdapter implements StoreAdapter {
  storeSlug = 'dummy';
  storeName = 'テストストア';

  config: StoreConfig = {
    defaultPointsBase: 'POST_COUPON',
    defaultShipping: 0,
    freeShippingThreshold: 3000,
    rateLimitMs: 1000,
    headers: {
      'User-Agent': 'OmutsuNaviBot/1.0',
    },
    defaultTaxIncluded: true,
  };

  async search(query: string): Promise<RawOfferData[]> {
    // ダミーデータを返す
    const baseOffers: Partial<RawOfferData>[] = [
      {
        title: 'パンパース 肌へのいちばん テープ 新生児 88枚',
        price: 1580,
        coupon: 0,
        shipping: 0,
        pointsPercent: 1.0,
        pointsBase: 'POST_COUPON',
        isSubscription: false,
      },
      {
        title: 'メリーズ さらさらエアスルー パンツ M 58枚',
        price: 1980,
        coupon: 200,
        shipping: 0,
        pointsPercent: 5.0,
        pointsBase: 'POST_COUPON',
        isSubscription: false,
      },
      {
        title: 'ムーニー エアフィット テープ S 84枚',
        price: 1750,
        coupon: 0,
        shipping: 350,
        pointsPercent: 2.0,
        pointsBase: 'PRE_COUPON',
        isSubscription: false,
      },
      {
        title: 'パンパース さらさらパンツ L 44枚 定期便',
        price: 1650,
        coupon: 100,
        shipping: 0,
        pointsPercent: 3.0,
        pointsBase: 'POST_COUPON',
        isSubscription: true,
      },
      {
        title: 'グーン まっさらさら パンツ XL 38枚',
        price: 1880,
        coupon: 0,
        shipping: 0,
        pointsFixed: 150,
        pointsBase: 'POST_COUPON',
        isSubscription: false,
      },
    ];

    const now = new Date();
    
    return baseOffers.map((offer, index): RawOfferData => ({
      title: offer.title!,
      price: offer.price!,
      coupon: offer.coupon,
      shipping: offer.shipping,
      pointsPercent: offer.pointsPercent,
      pointsFixed: offer.pointsFixed,
      pointsBase: offer.pointsBase as PointsBase,
      pointsNote: offer.pointsPercent ? `${offer.pointsPercent}%還元` : undefined,
      isSubscription: offer.isSubscription,
      sourceUrl: `https://example.com/product/${index + 1}`,
      fetchedAt: now,
    }));
  }

  async fetchOffer(url: string): Promise<RawOfferData> {
    const offers = await this.search('');
    return offers[0]; // 最初のオファーを返す
  }
}

export class AmazonDummyAdapter extends DummyAdapter {
  storeSlug = 'amazon';
  storeName = 'Amazon';

  config: StoreConfig = {
    defaultPointsBase: 'PRE_COUPON',
    defaultShipping: 0,
    freeShippingThreshold: 2000,
    rateLimitMs: 1000,
    headers: {
      'User-Agent': 'OmutsuNaviBot/1.0',
    },
    defaultTaxIncluded: true,
  };

  async search(query: string): Promise<RawOfferData[]> {
    const baseOffers = await super.search(query);
    
    // Amazon風にカスタマイズ
    return baseOffers.map(offer => ({
      ...offer,
      title: `[Amazon限定] ${offer.title}`,
      sourceUrl: offer.sourceUrl.replace('example.com', 'amazon.co.jp'),
      pointsNote: 'Amazonポイント還元',
    }));
  }
}

export class RakutenDummyAdapter extends DummyAdapter {
  storeSlug = 'rakuten';
  storeName = '楽天市場';

  config: StoreConfig = {
    defaultPointsBase: 'POST_COUPON',
    defaultShipping: 0,
    freeShippingThreshold: 3980,
    rateLimitMs: 1000,
    headers: {
      'User-Agent': 'OmutsuNaviBot/1.0',
    },
    defaultTaxIncluded: true,
  };

  async search(query: string): Promise<RawOfferData[]> {
    const baseOffers = await super.search(query);
    
    // 楽天風にカスタマイズ（高ポイント還元）
    return baseOffers.map(offer => ({
      ...offer,
      title: `【楽天市場】${offer.title}`,
      pointsPercent: (offer.pointsPercent || 1) * 10, // 楽天は高ポイント還元
      pointsNote: '楽天ポイント還元',
      sourceUrl: offer.sourceUrl.replace('example.com', 'rakuten.co.jp'),
    }));
  }
}