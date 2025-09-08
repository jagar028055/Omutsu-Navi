#!/bin/bash

# GitHub Actionsワークフローファイルを復元してプッシュするスクリプト

echo "🔧 GitHub Actionsワークフローファイルを作成中..."

# .githubディレクトリを作成
mkdir -p .github/workflows

# ワークフローファイルを作成
cat > .github/workflows/deploy.yml << 'EOF'
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
EOF

echo "✅ ワークフローファイルを作成しました"

# gitに追加してコミット
echo "📦 Gitに追加中..."
git add .github/workflows/deploy.yml

echo "💾 コミット中..."
git commit -m "feat: GitHub Actionsワークフロー追加 - 自動デプロイ設定

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "🚀 GitHubにプッシュ中..."
git push origin main

echo "🎉 完了！GitHub Actionsワークフローがプッシュされました"
echo "📍 リポジトリ: https://github.com/jagar028055/Omutsu-Navi"
echo "⚙️  次のステップ: Settings → Pages → Source を 'GitHub Actions' に設定"
EOF

chmod +x auth-workflow.sh