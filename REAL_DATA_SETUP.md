# 🎯 実データ取得の設定方法

おむつナビでは実際の価格データを取得することができます。現在はサンプルデータ（Amazon風ダミーデータ）が表示されていますが、楽天市場APIを設定することで本物のデータを取得できます。

## 📋 現在の状況

✅ **実装済み機能**
- 🏗️ 楽天市場API連携
- 🛒 Amazon商品情報スクレイピング（ダミー）
- 🔄 クライアントサイドデータ収集
- 💾 キャッシュシステム
- 🎨 ママ向けUIデザイン

## 🚀 楽天APIの設定方法

### 1. 楽天ウェブサービスアカウント作成

1. [楽天ウェブサービス](https://webservice.rakuten.co.jp/)にアクセス
2. 「新規アプリケーション登録」をクリック
3. 必要な情報を入力してアプリケーションを作成
4. **アプリケーションID**をコピー

### 2. 環境変数の設定

`.env`ファイルに楽天APIキーを追加：

```bash
# Real data collection (Optional - if not set, uses sample data)
# Get free Rakuten API key from: https://webservice.rakuten.co.jp/
RAKUTEN_APPLICATION_ID="your_rakuten_application_id_here"
```

### 3. 公開用環境変数の設定

クライアントサイドでAPIキーを使用するため、`.env`に以下も追加：

```bash
NEXT_PUBLIC_RAKUTEN_APPLICATION_ID="your_rakuten_application_id_here"
```

## 🔧 データ収集の仕組み

### 現在の実装

```typescript
// 1. クライアントサイドでデータ収集
const result = await collectClientSideData()

// 2. 楽天API呼び出し（APIキーがある場合）
if (rakutenKey) {
  const rakutenData = await fetchRakutenData(rakutenKey)
}

// 3. Amazon風ダミーデータ生成
const amazonData = generateAmazonDummyData()

// 4. データ統合と価格計算
const sortedOffers = processOffers([...rakutenData, ...amazonData])
```

### データ形式

```typescript
interface CollectedOffer {
  title: string
  brand: string
  size: string
  type: 'TAPE' | 'PANTS'
  packSize: number
  price: number
  shipping: number
  pointsPercent?: number
  storeName: string
  storeSlug: string
  sourceUrl: string
  yenPerSheet: number  // 実質単価
  effectivePrice: number  // 実質価格
}
```

## 🛠️ 開発・テスト用コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド（実データが組み込まれる）
npm run build

# 実データ収集テスト
npm run build && cat out/index.html | grep "クライアントサイド収集完了"
```

## 📊 データソースの状況

| ソース | 状況 | 取得可能データ |
|--------|------|---------------|
| 楽天市場 | ✅ 実装済み | 価格、ポイント率、レビュー |
| Amazon | 🔄 ダミーデータ | Prime情報、定期便割引 |
| Yahoo!ショッピング | ⏳ 未実装 | - |
| LOHACO | ⏳ 未実装 | - |

## 🚧 制限事項と今後の計画

### 現在の制限
- 楽天APIには1日1000回のリクエスト制限があります
- Amazon公式APIは承認が必要で制限が厳しいため、現在はダミーデータを使用
- CORSの制約により、一部のAPIは直接呼び出せません

### 将来の改善計画
1. **プロキシサーバー経由でのAPI呼び出し**
2. **Yahoo!ショッピングAPI連携**
3. **価格履歴の記録と分析**
4. **アラート機能（価格変動通知）**
5. **より高精度な商品マッチング**

## 🔒 セキュリティ注意事項

- APIキーは環境変数で管理
- 公開リポジトリにAPIキーをコミットしない
- レート制限を遵守する
- robots.txtとサイトの利用規約を確認する

## 📞 サポート

実データ設定でご不明な点があれば、Issue を作成してください。

---

**🎉 楽天APIキーを設定すれば、すぐに本物の価格データが表示されます！**