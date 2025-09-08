'use client';

import { useState } from 'react';

const SIZES = [
  { value: 'NB', label: '新生児', emoji: '👶', color: 'from-pink-300 to-pink-400' },
  { value: 'S', label: 'Sサイズ', emoji: '🌸', color: 'from-rose-300 to-rose-400' },
  { value: 'M', label: 'Mサイズ', emoji: '🌺', color: 'from-purple-300 to-purple-400' },
  { value: 'L', label: 'Lサイズ', emoji: '🌻', color: 'from-yellow-300 to-yellow-400' },
  { value: 'XL', label: 'XLサイズ', emoji: '🌈', color: 'from-blue-300 to-blue-400' },
];

const TYPES = [
  { value: 'TAPE', label: 'テープ', emoji: '📎', color: 'from-green-300 to-green-400' },
  { value: 'PANTS', label: 'パンツ', emoji: '👶', color: 'from-cyan-300 to-cyan-400' },
];

const BRANDS = [
  { value: 'Pampers', label: 'パンパース', emoji: '💙' },
  { value: 'Merries', label: 'メリーズ', emoji: '🤍' },
  { value: 'Moony', label: 'ムーニー', emoji: '💛' },
  { value: 'Genki', label: 'ゲンキ', emoji: '❤️' },
  { value: 'GooN', label: 'グーン', emoji: '💚' },
];

const SORT_OPTIONS = [
  { value: 'cpp', label: '実質単価順' },
  { value: 'total', label: '実質合計順' },
  { value: 'updated', label: '更新順' },
];

export default function FilterPanel() {
  const [filters, setFilters] = useState({
    size: '',
    type: '',
    brand: '',
    includePoints: true,
    limitedPointFactor: '1.0',
    includeSubscription: false,
    sort: 'cpp',
  });

  const applyFilters = () => {
    // 静的サイトでは実際のフィルタリングは行わない
    alert('フィルタが適用されました（デモ版）');
  };

  const clearFilters = () => {
    setFilters({
      size: '',
      type: '',
      brand: '',
      includePoints: true,
      limitedPointFactor: '1.0',
      includeSubscription: false,
      sort: 'cpp',
    });
  };

  return (
    <div className="card-pop rounded-mama p-6">
      <h2 className="text-xl font-bold text-mama-primary mb-6 text-center">
        💕 おむつ選び 💕
      </h2>
      
      <div className="space-y-6">
        {/* サイズカード */}
        <div>
          <h3 className="text-lg font-semibold text-mama-primary mb-3 text-center">
            サイズを選んでね！
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => setFilters({ ...filters, size: size.value === filters.size ? '' : size.value })}
                className={`
                  card-pop rounded-mama p-4 text-center transition-all duration-300 font-semibold
                  ${filters.size === size.value ? 'card-active' : 'hover:scale-105'}
                  bg-gradient-to-br ${size.color}
                `}
              >
                <div className="text-2xl mb-1">{size.emoji}</div>
                <div className="text-sm">{size.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* タイプカード */}
        <div>
          <h3 className="text-lg font-semibold text-mama-primary mb-3 text-center">
            タイプを選んでね！
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setFilters({ ...filters, type: type.value === filters.type ? '' : type.value })}
                className={`
                  card-pop rounded-mama p-4 text-center transition-all duration-300 font-semibold
                  ${filters.type === type.value ? 'card-active' : 'hover:scale-105'}
                  bg-gradient-to-br ${type.color}
                `}
              >
                <div className="text-2xl mb-1">{type.emoji}</div>
                <div className="text-sm">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ブランドカード */}
        <div>
          <h3 className="text-lg font-semibold text-mama-primary mb-3 text-center">
            ブランドを選んでね！
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {BRANDS.map((brand) => (
              <button
                key={brand.value}
                onClick={() => setFilters({ ...filters, brand: brand.value === filters.brand ? '' : brand.value })}
                className={`
                  card-pop rounded-mama p-3 text-center transition-all duration-300 font-semibold text-sm
                  ${filters.brand === brand.value ? 'card-active' : 'hover:scale-105'}
                  bg-gradient-to-br from-white to-gray-50
                `}
              >
                <div className="text-xl mb-1">{brand.emoji}</div>
                <div>{brand.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 詳細設定 */}
        <div className="card-pop rounded-mama p-4 bg-gradient-to-br from-purple-50 to-pink-50">
          <h3 className="text-lg font-semibold text-mama-primary mb-4 text-center">
            💎 詳細設定 💎
          </h3>
          
          {/* 並び順 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-mama-primary mb-2 text-center">
              並び順
            </label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="w-full rounded-mama border-2 border-pink-200 px-4 py-3 text-sm font-semibold focus:border-pink-400 focus:ring-2 focus:ring-pink-200 bg-white"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* トグルボタン */}
          <div className="space-y-3">
            <button
              onClick={() => setFilters({ ...filters, includePoints: !filters.includePoints })}
              className={`
                w-full rounded-mama p-3 font-semibold text-sm transition-all duration-300
                ${filters.includePoints 
                  ? 'bg-mama-gradient text-white shadow-lg' 
                  : 'bg-white border-2 border-pink-200 text-mama-primary hover:border-pink-300'
                }
              `}
            >
              💰 ポイント還元を含む {filters.includePoints ? '✓' : ''}
            </button>
            
            <button
              onClick={() => setFilters({ ...filters, includeSubscription: !filters.includeSubscription })}
              className={`
                w-full rounded-mama p-3 font-semibold text-sm transition-all duration-300
                ${filters.includeSubscription 
                  ? 'bg-mama-gradient text-white shadow-lg' 
                  : 'bg-white border-2 border-pink-200 text-mama-primary hover:border-pink-300'
                }
              `}
            >
              📦 定期便を含む {filters.includeSubscription ? '✓' : ''}
            </button>
          </div>

          {filters.includePoints && (
            <div className="mt-4 p-3 bg-white rounded-mama border border-pink-100">
              <label className="block text-sm font-semibold text-mama-primary mb-2 text-center">
                期間限定ポイント評価
              </label>
              <select
                value={filters.limitedPointFactor}
                onChange={(e) => setFilters({ ...filters, limitedPointFactor: e.target.value })}
                className="w-full rounded-mama border border-pink-200 px-3 py-2 text-sm font-semibold focus:border-pink-400 focus:ring-1 focus:ring-pink-200"
              >
                <option value="1.0">100% 🌟 楽観的</option>
                <option value="0.7">70% 😊 保守的</option>
                <option value="0.5">50% 🤔 慎重</option>
              </select>
            </div>
          )}
        </div>

        {/* ボタン */}
        <div className="flex space-x-3 pt-2">
          <button
            onClick={applyFilters}
            className="flex-1 btn-mama rounded-mama py-4 px-6 font-bold text-lg"
          >
            💕 検索する 💕
          </button>
          <button
            onClick={clearFilters}
            className="px-6 py-4 border-2 border-pink-200 text-mama-primary font-semibold rounded-mama hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all duration-300"
          >
            🗑️ クリア
          </button>
        </div>
      </div>
    </div>
  );
}