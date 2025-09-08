# おむつナビ (Omutsu-Navi)

**実質単価で比較する、最安おむつ価格比較サイト**

おむつナビは、価格・クーポン・送料・ポイント還元を全て考慮した「実質円/枚」で最適なおむつを見つけることができる価格比較サイトです。

## 🌟 主な機能

- **正確な実質単価計算**: 価格・クーポン・送料・ポイント還元を厳密に反映
- **透明性の高い根拠表示**: 計算式・対象金額・ソースURLを完全開示
- **柔軟なフィルタリング**: サイズ・タイプ・ブランド・定期便の有無で絞り込み
- **ポイント評価設定**: 期間限定ポイントの換算係数を選択可能
- **アフィリエイト対応**: クリック計測機能付きアフィリエイトリンク

## 🛠 技術スタック

- **フロントエンド**: Next.js 15, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes, Prisma ORM
- **データベース**: PostgreSQL
- **キャッシュ**: Redis (予定)
- **テスト**: Jest
- **CI/CD**: GitHub Actions (予定)

## 📁 プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API エンドポイント
│   │   ├── offers/        # オファー一覧API
│   │   └── redirect/      # アフィリエイトリダイレクト
│   ├── layout.tsx
│   └── page.tsx           # メインページ
├── components/            # UIコンポーネント
│   ├── FilterPanel.tsx    # フィルターパネル
│   ├── OfferCard.tsx      # オファーカード
│   └── OfferRanking.tsx   # ランキング表示
├── lib/                   # ビジネスロジック
│   ├── calculate.ts       # 実質単価計算エンジン
│   ├── types.ts           # 型定義
│   ├── api.ts            # APIクライアント
│   ├── prisma.ts         # Prismaクライアント
│   └── etl/              # ETL (データ収集)
│       ├── types.ts
│       ├── normalizer.ts  # 商品情報正規化
│       ├── job-runner.ts  # ETLジョブランナー
│       └── adapters/      # ストア別アダプタ
└── scripts/
    └── seed-database.ts   # データベース初期化
```

## 🚀 セットアップ

### 前提条件

- Node.js 18.0+
- PostgreSQL (またはPrisma PostgreSQL)

### インストール

1. リポジトリをクローン:
```bash
git clone https://github.com/your-username/omutsu-navi.git
cd omutsu-navi
```

2. 依存関係をインストール:
```bash
npm install
```

3. 環境変数を設定:
```bash
cp .env.example .env
# .envファイルを編集してデータベースURLなどを設定
```

4. データベースを初期化:
```bash
npm run db:generate
npm run db:migrate
```

5. テストデータを投入:
```bash
npm run db:seed
```

### 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

## 🚀 GitHub Pagesデプロイ

このプロジェクトはGitHub Pagesへの自動デプロイに対応しています。

### 自動デプロイ設定

1. GitHubリポジトリにコードをプッシュ
2. リポジトリの Settings → Pages に移動
3. Source を「GitHub Actions」に設定
4. `main` ブランチにプッシュすると自動的にデプロイが実行されます

### 手動ビルド

```bash
# 静的サイトビルド
npm run build:static

# outディレクトリが生成されます
```

### デプロイURL

デプロイ後は以下のURLでアクセス可能です:
`https://[ユーザー名].github.io/Omutsu-Navi/`

### 注意事項

- GitHub Pagesでは静的サイトのみ対応
- データベース機能は無効化され、モックデータを使用
- 実際のECサイト連携は開発環境でのみ動作

## 🧪 テスト

```bash
# 全テスト実行
npm run test

# ウォッチモード
npm run test:watch
```

## 📊 データベース操作

```bash
# Prismaクライアント生成
npm run db:generate

# マイグレーション実行
npm run db:migrate

# データベース管理画面起動
npm run db:studio

# テストデータ投入
npm run db:seed
```

## 🔧 主要コンポーネント

### 計算エンジン (`src/lib/calculate.ts`)

実質単価計算の核となる機能:

```typescript
// 基本的な使用例
const result = computeEffective(offer, {
  includePoints: true,
  limitedPointFactor: 0.7,  // 期間限定ポイント70%評価
  includeSubscription: false
});

console.log(`実質単価: ¥${result.yenPerSheet.toFixed(2)}/枚`);
```

### ETL システム (`src/lib/etl/`)

ストア別のデータ収集・正規化:

```typescript
// ETLジョブ実行例
await etlJobRunner.runJob({
  storeSlug: 'amazon',
  searchQueries: ['パンパース', 'メリーズ'],
  maxResults: 100
});
```

## 🔌 API仕様

### GET /api/offers

オファー一覧を取得

**クエリパラメータ:**
- `size`: サイズ (NB, S, M, L, XL)
- `type`: タイプ (TAPE, PANTS)  
- `brand`: ブランド名
- `includePoints`: ポイント還元を含む (boolean)
- `limitedPointFactor`: 期間限定ポイント係数 (0-1)
- `sort`: ソート順 (cpp, total, updated)

**レスポンス例:**
```json
{
  "meta": {
    "page": 1,
    "per": 20,
    "total": 45,
    "calc_policy": {
      "includePoints": true,
      "limitedPointFactor": 1.0
    }
  },
  "items": [
    {
      "id": 1,
      "product": {
        "brand": "Pampers",
        "series": "肌へのいちばん",
        "type": "TAPE",
        "size": "NB"
      },
      "store": {
        "name": "Amazon",
        "slug": "amazon"
      },
      "pricing": {
        "price": 1580,
        "effectiveTotal": 1406,
        "yenPerSheet": 15.97
      },
      "evidence": {
        "assumptions": "価格: ¥1,580 - ポイント還元: ¥174...",
        "sourceUrl": "https://amazon.co.jp/...",
        "fetchedAt": "2025-09-08T09:00:00Z"
      },
      "affiliate": {
        "link": "https://omutsu-navi.com/api/redirect?..."
      }
    }
  ]
}
```

## 🏗 アーキテクチャ設計

### データフロー

1. **データ収集**: ETLアダプタがストアから価格情報を取得
2. **正規化**: 商品情報を統一フォーマットに変換
3. **計算**: 実質単価を算出してキャッシュ
4. **API**: フィルタリング・ソートされた結果を提供
5. **UI**: ユーザーフレンドリーな形で表示

### セキュリティ対策

- アフィリエイトトークンの環境変数管理
- SQLインジェクション対策 (Prisma ORM)
- レート制限 (ETL)
- CORS設定
- ログ管理・監査証跡

## 🤝 コントリビューション

1. フォークしてください
2. フィーチャーブランチを作成: `git checkout -b feature/amazing-feature`
3. コミット: `git commit -m 'Add amazing feature'`
4. プッシュ: `git push origin feature/amazing-feature`
5. プルリクエストを作成

## 📝 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## 🙏 謝辞

- Next.js チーム
- Prisma チーム
- おむつメーカー各社の価格情報提供

---

**価格情報について**: 
- 価格は変動する可能性があります
- ポイント還元条件は各ストアで確認してください
- 最終的な購入判断は各ストアで行ってください
