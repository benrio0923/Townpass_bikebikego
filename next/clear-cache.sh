#!/bin/bash

echo "🧹 清除 Next.js 緩存..."

# 停止任何正在運行的 Next.js 進程
echo "停止所有 Next.js 進程..."
pkill -f "next dev" || true

# 刪除 .next 目錄
echo "刪除 .next 目錄..."
rm -rf .next

# 刪除 node_modules/.cache
echo "刪除 node_modules 緩存..."
rm -rf node_modules/.cache

# 刪除 Turbopack 緩存
echo "刪除 Turbopack 緩存..."
rm -rf .turbo

echo "✅ 緩存清除完成！"
echo ""
echo "現在請執行："
echo "  npm run dev"

