import { ProductType, ProductSize } from '@/generated/prisma';
import { RawOfferData, NormalizerResult } from './types';

// ブランド正規化マッピング
const BRAND_MAPPING: Record<string, string> = {
  'パンパース': 'Pampers',
  'pampers': 'Pampers',
  'メリーズ': 'Merries',
  'merries': 'Merries',
  'ムーニー': 'Moony',
  'moony': 'Moony',
  'ユニチャーム': 'Moony',
  'ゲンキ': 'Genki',
  'genki': 'Genki',
  'グーン': 'GooN',
  'goon': 'GooN',
  '大王製紙': 'GooN',
};

// サイズマッピング
const SIZE_MAPPING: Record<string, ProductSize> = {
  '新生児': 'NB',
  'newborn': 'NB',
  'nb': 'NB',
  's': 'S',
  'small': 'S',
  'm': 'M',
  'medium': 'M',
  'l': 'L',
  'large': 'L',
  'xl': 'XL',
  'extra large': 'XL',
  'ビッグ': 'XL',
  'big': 'XL',
};

// タイプマッピング
const TYPE_MAPPING: Record<string, ProductType> = {
  'テープ': 'TAPE',
  'tape': 'TAPE',
  'パンツ': 'PANTS',
  'pants': 'PANTS',
  'パンティ': 'PANTS',
  'panty': 'PANTS',
};

/**
 * 商品タイトルから構造化情報を抽出
 */
export function normalizeOffer(rawOffer: RawOfferData): NormalizerResult | null {
  const title = rawOffer.title.toLowerCase();
  
  // ブランド抽出
  const brand = extractBrand(title);
  if (!brand) {
    console.warn(`Brand not found in title: ${rawOffer.title}`);
    return null;
  }
  
  // サイズ抽出
  const size = extractSize(title);
  if (!size) {
    console.warn(`Size not found in title: ${rawOffer.title}`);
    return null;
  }
  
  // タイプ抽出
  const type = extractType(title);
  if (!type) {
    console.warn(`Type not found in title: ${rawOffer.title}`);
    return null;
  }
  
  // パック枚数抽出
  const packCount = extractPackCount(title);
  if (!packCount) {
    console.warn(`Pack count not found in title: ${rawOffer.title}`);
    return null;
  }
  
  // シリーズ名抽出（簡易実装）
  const series = extractSeries(title, brand);
  
  // 信頼度計算
  const confidence = calculateConfidence(title, brand, series, size, type, packCount);
  
  return {
    brand,
    series,
    type,
    size,
    packCount,
    confidence,
  };
}

function extractBrand(title: string): string | null {
  for (const [pattern, brand] of Object.entries(BRAND_MAPPING)) {
    if (title.includes(pattern.toLowerCase())) {
      return brand;
    }
  }
  return null;
}

function extractSize(title: string): ProductSize | null {
  // サイズパターンを優先順位付きで検索
  const sizePatterns = [
    /(\d+)kg/, // 体重表記から推定
    /newborn|新生児|nb/i,
    /\bs\b|small/i,
    /\bm\b|medium/i,
    /\bl\b|large/i,
    /xl|extra\s*large|ビッグ|big/i,
  ];
  
  for (const [pattern, size] of Object.entries(SIZE_MAPPING)) {
    if (new RegExp(pattern, 'i').test(title)) {
      return size;
    }
  }
  
  // 体重表記からサイズを推定
  const weightMatch = title.match(/(\d+)-(\d+)kg/);
  if (weightMatch) {
    const maxWeight = parseInt(weightMatch[2]);
    if (maxWeight <= 5) return 'NB';
    if (maxWeight <= 8) return 'S';
    if (maxWeight <= 12) return 'M';
    if (maxWeight <= 17) return 'L';
    return 'XL';
  }
  
  return null;
}

function extractType(title: string): ProductType | null {
  for (const [pattern, type] of Object.entries(TYPE_MAPPING)) {
    if (title.includes(pattern.toLowerCase())) {
      return type;
    }
  }
  return null;
}

function extractPackCount(title: string): number | null {
  // パック枚数のパターンマッチング
  const patterns = [
    /(\d+)\s*枚/,
    /(\d+)\s*個/,
    /(\d+)\s*count/i,
    /(\d+)\s*pc/i,
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      const count = parseInt(match[1]);
      // 妥当な枚数範囲内かチェック
      if (count >= 10 && count <= 300) {
        return count;
      }
    }
  }
  
  return null;
}

function extractSeries(title: string, brand: string): string {
  // ブランド別のシリーズ名パターン
  const seriesPatterns: Record<string, RegExp[]> = {
    'Pampers': [
      /肌へのいちばん/,
      /はじめての肌へのいちばん/,
      /さらさらパンツ/,
      /コットンケア/,
    ],
    'Merries': [
      /さらさらエアスルー/,
      /ファーストプレミアム/,
      /やわらかフィット/,
    ],
    'Moony': [
      /エアフィット/,
      /ナチュラルムーニー/,
      /マンシリーズ/,
    ],
    'Genki': [
      /アンパンマン/,
      /プレミアム/,
    ],
    'GooN': [
      /まっさらさら/,
      /プラス/,
    ],
  };
  
  const patterns = seriesPatterns[brand];
  if (patterns) {
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        return match[0];
      }
    }
  }
  
  // デフォルトシリーズ名
  return 'スタンダード';
}

function calculateConfidence(
  title: string,
  brand: string,
  series: string,
  size: ProductSize,
  type: ProductType,
  packCount: number
): number {
  let confidence = 0.5; // ベースライン
  
  // ブランド名が明確に含まれている
  if (title.toLowerCase().includes(brand.toLowerCase())) {
    confidence += 0.2;
  }
  
  // サイズ表記が明確
  if (title.includes(size)) {
    confidence += 0.15;
  }
  
  // タイプ表記が明確
  if (title.includes(type === 'TAPE' ? 'テープ' : 'パンツ')) {
    confidence += 0.1;
  }
  
  // 枚数表記が明確
  if (title.includes(`${packCount}枚`)) {
    confidence += 0.15;
  }
  
  return Math.min(confidence, 1.0);
}

/**
 * 複数の正規化結果から最適なものを選択
 */
export function selectBestNormalization(results: NormalizerResult[]): NormalizerResult | null {
  if (results.length === 0) return null;
  
  // 信頼度が最も高いものを選択
  return results.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );
}