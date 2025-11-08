# 1. Build 階段
FROM node:20-alpine AS builder

# 設定工作目錄
WORKDIR /app

# 複製 package.json 與 lock file
COPY package*.json ./

# 安裝依賴
RUN npm install --legacy-peer-dps


# 複製專案
COPY . .

# 編譯 TypeScript 並 build Next.js
RUN npm run build

# 2. Production 階段
FROM node:20-alpine AS runner

WORKDIR /app

# 複製必要檔案
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# 設定環境
ENV NODE_ENV=production
ENV PORT=3000

# 開放端口
EXPOSE 3000

# 啟動 Next.js
CMD ["npx", "next", "start"]
