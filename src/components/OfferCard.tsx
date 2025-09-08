'use client';

import { useState } from 'react';
import { OfferWithCalculation } from '@/lib/types';

type OfferCardProps = {
  offer: OfferWithCalculation;
  rank: number;
};

export default function OfferCard({ offer, rank }: OfferCardProps) {
  const [showEvidence, setShowEvidence] = useState(false);

  const formatPrice = (price: number) => `¥${price.toLocaleString()}`;
  const formatYenPerSheet = (cpp: number) => `¥${cpp.toFixed(2)}`;

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rank === 2) return 'bg-gray-100 text-gray-700 border-gray-300';
    if (rank === 3) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const getStoreColor = (storeSlug: string) => {
    switch (storeSlug) {
      case 'amazon': return 'text-orange-600';
      case 'rakuten': return 'text-red-600';
      case 'yahoo': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRankBadgeColor(rank)}`}>
              第{rank}位
            </span>
            <span className={`text-sm font-medium ${getStoreColor(offer.store.slug)}`}>
              {offer.store.name}
            </span>
            {offer.isSubscription && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                定期便
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {offer.product.brand} {offer.product.series}
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span>サイズ: {offer.product.size}</span>
            <span>タイプ: {offer.product.type === 'TAPE' ? 'テープ' : 'パンツ'}</span>
            <span>{offer.packCount}枚入り</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wide">実質単価</dt>
              <dd className="text-2xl font-bold text-blue-600">
                {formatYenPerSheet(offer.calculation.yenPerSheet)}
                <span className="text-sm font-normal text-gray-500">/枚</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wide">実質合計</dt>
              <dd className="text-xl font-semibold text-gray-900">
                {formatPrice(offer.calculation.effectiveTotal)}
              </dd>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>価格: {formatPrice(offer.price)}</span>
            {offer.coupon > 0 && (
              <span className="text-red-600">- クーポン{formatPrice(offer.coupon)}</span>
            )}
            {offer.shipping > 0 && (
              <span>+ 送料{formatPrice(offer.shipping)}</span>
            )}
            {offer.calculation.pointsYen > 0 && (
              <span className="text-green-600">- ポイント{formatPrice(offer.calculation.pointsYen)}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {showEvidence ? '根拠を隠す' : '計算根拠を表示'}
            </button>
            
            <div className="text-xs text-gray-500">
              更新: {new Date(offer.evidence.fetchedAt).toLocaleDateString('ja-JP', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        <div className="ml-6 flex-shrink-0">
          <a
            href={offer.affiliate?.link || offer.evidence.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ストアで確認
            <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>

      {showEvidence && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">計算根拠</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p>{offer.evidence.assumptions}</p>
            <div className="mt-2 text-xs text-gray-500">
              <p>取得元: <a href={offer.evidence.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{offer.evidence.sourceUrl}</a></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}