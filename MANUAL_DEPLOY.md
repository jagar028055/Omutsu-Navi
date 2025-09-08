# 手動デプロイ手順

## ⚠️ GitHub Actions ワークフローについて

現在のGitHub CLI認証にworkflowスコープがないため、GitHub Actionsワークフローファイル (`.github/workflows/deploy.yml`) は手動で追加する必要があります。

## 🔧 手動でワークフローを追加する手順

### 1. GitHubリポジトリページに移動
https://github.com/jagar028055/Omutsu-Navi

### 2. ファイルを作成
1. 「Create new file」をクリック
2. ファイル名: `.github/workflows/deploy.yml`
3. 以下の内容をコピー&ペースト:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma client
        run: npm run db:generate

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3. コミット
「Commit new file」をクリック

### 4. GitHub Pages設定
1. Settings → Pages
2. Source: `GitHub Actions` を選択

## 🚀 デプロイ確認

ワークフローが追加されると自動的にビルド・デプロイが開始されます。

完了後、以下のURLでアクセス可能:
https://jagar028055.github.io/Omutsu-Navi/

## 📊 現在の状態

✅ **プッシュ完了:**
- メインアプリケーションコード
- 静的サイトビルド設定
- モックデータ
- UI コンポーネント
- テストファイル
- ドキュメント

⏳ **手動追加が必要:**
- GitHub Actions ワークフローファイル