#!/bin/bash

echo "🔍 GitHub認証状態を確認中..."
gh auth status

echo "🚀 GitHub Actionsワークフローをプッシュ中..."

# 既存のワークフローファイルが存在するか確認
if [ ! -f ".github/workflows/deploy.yml" ]; then
    echo "❌ ワークフローファイルが見つかりません"
    exit 1
fi

# Gitステータス確認
git status

# プッシュ実行
git push origin main

if [ $? -eq 0 ]; then
    echo "🎉 成功！GitHub Actionsワークフローがプッシュされました"
    echo "📍 リポジトリ: https://github.com/jagar028055/Omutsu-Navi"
    echo "⚙️  次のステップ:"
    echo "   1. GitHub リポジトリページに移動"
    echo "   2. Settings → Pages → Source を 'GitHub Actions' に設定"
    echo "   3. 自動デプロイが開始されます"
    echo "📱 完成予定URL: https://jagar028055.github.io/Omutsu-Navi/"
else
    echo "❌ プッシュに失敗しました"
    echo "💡 認証スコープにworkflowが含まれているか確認してください"
fi