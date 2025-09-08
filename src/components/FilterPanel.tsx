'use client';

import { useState } from 'react';

const SIZES = [
  { value: 'NB', label: '新生児' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
];

const TYPES = [
  { value: 'TAPE', label: 'テープ' },
  { value: 'PANTS', label: 'パンツ' },
];

const BRANDS = [
  { value: 'Pampers', label: 'パンパース' },
  { value: 'Merries', label: 'メリーズ' },
  { value: 'Moony', label: 'ムーニー' },
  { value: 'Genki', label: 'ゲンキ' },
  { value: 'GooN', label: 'グーン' },
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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">絞り込み検索</h2>
      
      <div className="space-y-4">
        {/* サイズ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            サイズ
          </label>
          <select
            value={filters.size}
            onChange={(e) => setFilters({ ...filters, size: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">すべて</option>
            {SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        {/* タイプ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タイプ
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">すべて</option>
            {TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* ブランド */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ブランド
          </label>
          <select
            value={filters.brand}
            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">すべて</option>
            {BRANDS.map((brand) => (
              <option key={brand.value} value={brand.value}>
                {brand.label}
              </option>
            ))}
          </select>
        </div>

        {/* ソート */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            並び順
          </label>
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* ポイント設定 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ポイント設定
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.includePoints}
                onChange={(e) => setFilters({ ...filters, includePoints: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">ポイント還元を含む</span>
            </label>
            
            {filters.includePoints && (
              <div className="ml-6">
                <label className="block text-sm text-gray-600 mb-1">
                  期間限定ポイント評価
                </label>
                <select
                  value={filters.limitedPointFactor}
                  onChange={(e) => setFilters({ ...filters, limitedPointFactor: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="1.0">100% (楽観的)</option>
                  <option value="0.7">70% (保守的)</option>
                  <option value="0.5">50% (慎重)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 定期便 */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.includeSubscription}
              onChange={(e) => setFilters({ ...filters, includeSubscription: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">定期便を含む</span>
          </label>
        </div>

        {/* ボタン */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={applyFilters}
            className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            検索
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            クリア
          </button>
        </div>
      </div>
    </div>
  );
}