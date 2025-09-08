'use client';

import { useState, useEffect } from 'react';
import { realDataProvider } from '@/lib/real-data-provider';

export default function DataSourceIndicator() {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkDataStatus();
  }, []);

  const checkDataStatus = async () => {
    try {
      const dataStatus = await realDataProvider.getDataCollectionStatus();
      setStatus(dataStatus);
    } catch (error) {
      console.error('データ状況取得エラー:', error);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const { collectClientSideData } = await import('@/lib/client-data-collector');
      const result = await collectClientSideData();
      if (result.success) {
        await checkDataStatus();
      }
    } catch (error) {
      console.error('データリフレッシュエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!status) {
    return (
      <div className="card-pop rounded-mama p-4 bg-gradient-to-r from-gray-100 to-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-gray-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-gray-600">データ状況を確認中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card-pop rounded-mama p-4 bg-gradient-to-r from-blue-50 to-purple-50 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${status.available ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
          <div>
            <div className="font-bold text-mama-primary text-sm">
              {status.available ? '🌐 実データ使用中' : '📝 サンプルデータ使用中'}
            </div>
            <div className="text-xs text-gray-600">
              {status.available ? (
                <>
                  📊 {status.totalItems}件のデータ • 
                  🏪 楽天: {status.sources?.rakuten || 0}件 • 
                  📦 Amazon: {status.sources?.amazon || 0}件
                  {status.cached && ' • 💾 キャッシュ済み'}
                </>
              ) : (
                '実データ取得に失敗したため、サンプルデータを表示しています'
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="btn-mama rounded-mama px-4 py-2 text-sm font-bold disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>更新中</span>
            </div>
          ) : (
            '🔄 データ更新'
          )}
        </button>
      </div>

      {status.sources?.errors && status.sources.errors.length > 0 && (
        <div className="mt-3 p-3 bg-orange-100 rounded-mama">
          <div className="text-sm font-semibold text-orange-800 mb-1">⚠️ データ取得の警告</div>
          <ul className="text-xs text-orange-700">
            {status.sources.errors.map((error: string, index: number) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}