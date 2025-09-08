import { Suspense } from 'react';
import OfferCard from './OfferCard';
import { getOffers } from '@/lib/api';
import { getStaticOffers } from '@/lib/static-data';

type OfferRankingProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function OfferRanking() {
  const filters = {
    size: undefined,
    type: undefined,
    brand: undefined,
    includePoints: true,
    limitedPointFactor: 1.0,
    includeSubscription: false,
    sort: 'cpp' as 'cpp' | 'total' | 'updated',
    page: 1,
    per: 20,
  };

  try {
    // 静的サイト用: 直接データを取得
    const offersData = getStaticOffers(filters);
    
    if (!offersData.items || offersData.items.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            該当する商品がありません
          </h3>
          <p className="text-gray-600">
            検索条件を変更してもう一度お試しください。
          </p>
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            価格ランキング
          </h2>
          <div className="text-sm text-gray-600">
            {offersData.meta.total || 0}件の商品が見つかりました
          </div>
        </div>

        <div className="space-y-4">
          {offersData.items.map((offer, index) => (
            <OfferCard 
              key={offer.id}
              offer={offer}
              rank={index + 1 + (offersData.meta.page - 1) * offersData.meta.per}
            />
          ))}
        </div>

        {(offersData.meta.total || 0) > offersData.meta.per && (
          <div className="mt-8 flex justify-center">
            <Pagination 
              currentPage={offersData.meta.page}
              totalItems={offersData.meta.total || 0}
              itemsPerPage={offersData.meta.per}
            />
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error loading offers:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 mb-2">
          エラーが発生しました
        </h3>
        <p className="text-red-600">
          データの読み込みに失敗しました。しばらく後でもう一度お試しください。
        </p>
      </div>
    );
  }
}

function Pagination({ currentPage, totalItems, itemsPerPage }: {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          <span className="font-medium">{startItem}</span>
          {' - '}
          <span className="font-medium">{endItem}</span>
          {' / '}
          <span className="font-medium">{totalItems}</span>件
        </div>
        
        <div className="flex items-center space-x-2">
          {currentPage > 1 && (
            <a
              href={`?page=${currentPage - 1}`}
              className="px-3 py-1 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
            >
              前へ
            </a>
          )}
          
          <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md">
            {currentPage}
          </span>
          
          {currentPage < totalPages && (
            <a
              href={`?page=${currentPage + 1}`}
              className="px-3 py-1 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
            >
              次へ
            </a>
          )}
        </div>
      </div>
    </div>
  );
}