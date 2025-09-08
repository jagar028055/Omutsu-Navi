import { Suspense } from 'react';
import OfferRanking from '@/components/OfferRanking';
import FilterPanel from '@/components/FilterPanel';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <header className="card-pop shadow-lg border-b-4 border-pink-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 text-center">
            <h1 className="text-5xl font-bold bg-mama-gradient bg-clip-text text-transparent mb-4">
              👶 おむつナビ 👶
            </h1>
            <p className="text-xl text-mama-primary font-semibold">
              💕 ママの味方！実質単価で見つける最安おむつ 💕
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <span className="bg-pink-100 text-mama-primary px-4 py-2 rounded-full text-sm font-semibold">
                🎯 簡単検索
              </span>
              <span className="bg-blue-100 text-mama-secondary px-4 py-2 rounded-full text-sm font-semibold">
                💰 最安値保証
              </span>
              <span className="bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-sm font-semibold">
                ⚡ 瞬速比較
              </span>
            </div>
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
      
      <footer className="card-pop border-t-4 border-pink-200 mt-16 bg-gradient-to-r from-pink-100 to-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-mama-primary font-bold text-lg mb-2">
              💕 © 2025 おむつナビ. All rights reserved. 💕
            </p>
            <p className="text-mama-secondary font-semibold">
              💎 価格情報は各ストアで最終確認してね！ポイント還元条件は変わることがあるよ 💎
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-2xl">
              <span>👶</span>
              <span>💕</span>
              <span>🌈</span>
              <span>⭐</span>
              <span>🎀</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
