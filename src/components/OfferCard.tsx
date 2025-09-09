'use client';

import { useState } from 'react';
import { SampleOffer } from '@/lib/sample-data';

type OfferCardProps = {
  offer: SampleOffer;
  rank: number;
};

export default function OfferCard({ offer, rank }: OfferCardProps) {
  const [showEvidence, setShowEvidence] = useState(false);

  const formatPrice = (price: number) => `¥${price.toLocaleString()}`;
  const formatYenPerSheet = (cpp: number) => `¥${cpp.toFixed(2)}`;

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900 border-yellow-300';
    if (rank === 2) return 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-gradient-to-r from-orange-300 to-orange-400 text-orange-900 border-orange-300';
    return 'bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 border-purple-200';
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '💎';
  };

  const getStoreEmoji = (storeSlug: string) => {
    switch (storeSlug) {
      case 'amazon': return '📦';
      case 'rakuten': return '🛒';
      case 'yahoo': return '🛍️';
      case 'lohaco': return '🏪';
      case 'yodobashi': return '💻';
      default: return '🏬';
    }
  };

  const calcSnapshot = offer.calcSnapshots?.[0];
  
  return (
    <div className="card-pop rounded-mama p-6 hover:scale-[1.02] transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-bold border-2 ${getRankBadgeColor(rank)}`}>
              {getRankEmoji(rank)} 第{rank}位
            </span>
            <span className="text-base sm:text-lg font-bold text-mama-primary">
              {getStoreEmoji(offer.store.slug)} {offer.store.name}
            </span>
            {offer.isSubscription && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm font-semibold bg-mama-gradient text-white">
                📦 定期便
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-mama-primary mb-3">
            💕 {offer.product.brand} {offer.product.series} 💕
          </h3>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-mama-secondary mb-4">
            <span>📏 サイズ: {offer.product.size}</span>
            <span>🔗 {offer.product.type === 'TAPE' ? 'テープ' : 'パンツ'}</span>
            <span>📦 {offer.product.packSizeMin}枚入り</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="card-pop rounded-mama p-4 bg-gradient-to-br from-pink-50 to-purple-50">
              <dt className="text-xs font-bold text-mama-primary uppercase tracking-wide mb-2">💰 実質単価</dt>
              <dd className="text-2xl sm:text-3xl font-bold text-mama-primary">
                {calcSnapshot ? formatYenPerSheet(calcSnapshot.yenPerSheet) : '---'}
                <span className="text-xs sm:text-sm font-normal text-gray-500">/枚</span>
              </dd>
            </div>
            <div className="card-pop rounded-mama p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
              <dt className="text-xs font-bold text-mama-secondary uppercase tracking-wide mb-2">💵 実質合計</dt>
              <dd className="text-xl sm:text-2xl font-bold text-mama-secondary">
                {calcSnapshot ? formatPrice(calcSnapshot.effectiveTotal) : '---'}
              </dd>
            </div>
          </div>

          <div className="card-pop rounded-mama p-4 bg-gradient-to-r from-gray-50 to-gray-100 mb-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold flex-wrap">
              <span className="text-mama-primary">💴 {formatPrice(offer.price)}</span>
              {offer.coupon > 0 && (
                <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">🎫 -{formatPrice(offer.coupon)}</span>
              )}
              {offer.shipping > 0 && (
                <span className="text-orange-600 bg-orange-100 px-2 py-1 rounded-full text-xs">🚚 +{formatPrice(offer.shipping)}</span>
              )}
              {calcSnapshot && calcSnapshot.pointsYen > 0 && (
                <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">⭐ -{formatPrice(calcSnapshot.pointsYen)}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="text-xs sm:text-sm font-semibold text-mama-primary hover:text-mama-secondary transition-colors duration-200 text-left"
            >
              {showEvidence ? '🙈 根拠を隠す' : '🔍 計算根拠を表示'}
            </button>
            
            <div className="text-xs text-gray-500 font-semibold">
              🕒 {new Date(offer.fetchedAt).toLocaleDateString('ja-JP', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 w-full lg:w-auto lg:ml-6">
          <a
            href={offer.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full btn-mama rounded-mama px-6 py-4 text-base sm:text-lg font-bold inline-flex items-center justify-center min-h-[50px]"
          >
            🛒 ストアで確認
            <svg className="ml-2 -mr-1 w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>

      {showEvidence && (
        <div className="mt-6 card-pop rounded-mama p-4 bg-gradient-to-br from-purple-50 to-pink-50">
          <h4 className="text-lg font-bold text-mama-primary mb-3">🔍 計算根拠</h4>
          <div className="text-sm text-gray-700 space-y-2 font-semibold">
            <p>📊 基本価格: {formatPrice(offer.price)}</p>
            {offer.coupon > 0 && <p>🎫 クーポン割引: -{formatPrice(offer.coupon)}</p>}
            {offer.shipping > 0 && <p>🚚 送料: +{formatPrice(offer.shipping)}</p>}
            {calcSnapshot && calcSnapshot.pointsYen > 0 && <p>⭐ ポイント還元: -{formatPrice(calcSnapshot.pointsYen)}</p>}
            <p>📦 内容量: {offer.product.packSizeMin}枚入り</p>
            {offer.pointsPercent && <p>💎 ポイント率: {offer.pointsPercent}%</p>}
            <div className="mt-3 pt-3 border-t border-pink-200 text-xs text-gray-500">
              <p>🔗 データ元: <a href={offer.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-mama-primary hover:underline font-bold">{offer.store.name}</a></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}