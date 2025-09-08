# GitHub Pages デプロイガイド

## 📋 デプロイの前提

このプロジェクトはGitHub Pages用に最適化された静的サイトです。

## 🚀 自動デプロイ手順

### 1. GitHubリポジトリの準備
```bash
git add .
git commit -m "feat: GitHub Pages対応 - 静的サイトビルド設定完了"
git push origin main
```

### 2. GitHub Pages設定
1. GitHubリポジトリページに移動
2. `Settings` タブをクリック  
3. 左サイドバーから `Pages` を選択
4. Source を `GitHub Actions` に設定
5. ブランチが `main` になっていることを確認

### 3. デプロイの確認
- `Actions` タブでワークフローの実行状況を確認
- デプロイが完了すると以下のURLでアクセス可能:
  `https://[ユーザー名].github.io/Omutsu-Navi/`

## 🔧 手動ビルド（ローカル確認用）

```bash
# 静的サイトビルド
npm run build:static

# outディレクトリに生成されたファイルを確認
ls out/

# ローカルでプレビュー（HTTPサーバー起動）
npx serve out/
```

## 📁 生成ファイル

- `out/index.html` - メインページ  
- `out/_next/` - Next.jsアセット
- `out/404.html` - エラーページ

## 🎯 デプロイ後の確認ポイント

✅ **メイン機能**
- ページの基本表示 
- おむつランキング表示
- フィルターパネル（デモモード）
- レスポンシブデザイン

✅ **スタイリング**
- Tailwind CSSが正常に適用
- カラーテーマが適用
- アイコンとレイアウトが整列

⚠️ **制限事項**
- 動的フィルタリング機能は無効（モックデータ表示）
- データベース連携は無効
- API機能は無効（静的データのみ）

## 🔄 更新手順

```bash
# コード修正後
git add .
git commit -m "更新内容の説明"  
git push origin main

# GitHub Actionsが自動でビルド・デプロイを実行
```

## 🐛 トラブルシューティング

### ビルドエラーの場合
```bash
# ローカルで事前確認
npm run build:static

# エラーがある場合は修正してから push
```

### CSS/JSが読み込まれない場合
- `basePath` 設定が正しいか確認
- `assetPrefix` の設定が正しいか確認

### 404エラーの場合  
- リポジトリ名が `basePath` と一致しているか確認
- GitHub Pages設定が正しく有効化されているか確認

## 📞 サポート

- GitHub Issues: プロジェクトページの Issues タブ
- ドキュメント: README.md 参照