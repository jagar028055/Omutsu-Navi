import { Suspense } from 'react';
import OfferRanking from '@/components/OfferRanking';
import FilterPanel from '@/components/FilterPanel';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              おむつナビ
            </h1>
            <p className="mt-2 text-gray-600">
              実質単価で比較する、最安おむつ価格比較サイト
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-1">
            <FilterPanel />
          </div>
          
          <div className="lg:col-span-3 mt-8 lg:mt-0">
            <Suspense fallback={<div className="text-center py-8">読み込み中...</div>}>
              <OfferRanking />
            </Suspense>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2025 おむつナビ. All rights reserved.</p>
            <p className="mt-2">
              価格情報は各ストアで最終確認してください。ポイント還元条件は変動する場合があります。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
