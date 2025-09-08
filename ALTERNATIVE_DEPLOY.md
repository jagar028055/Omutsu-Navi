# 代替デプロイ方法

## 🚀 直接GitHubでワークフローファイルを作成

GitHub CLIの認証問題を回避するため、ブラウザで直接作成します：

### 手順1: GitHubリポジトリページへ
https://github.com/jagar028055/Omutsu-Navi

### 手順2: ワークフローファイルを直接作成
1. 「Add file」→「Create new file」をクリック
2. ファイル名に入力: `.github/workflows/deploy.yml`
3. 以下の内容をコピペ:

### 手順3: ファイル内容
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - run: npm ci
      - run: npm run db:generate
      - run: npm test
      - run: npm run build
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

### 手順4: Settings → Pages設定
1. Settings タブ
2. Pages (左サイドバー)
3. Source: 「GitHub Actions」を選択

## これが最も確実な方法です
- 認証問題を完全回避
- 5分で完了
- 即座にデプロイ開始