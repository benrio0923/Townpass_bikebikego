# TownPass Backend - FastAPI 版本

## 簡介
使用 Python FastAPI 重寫的 TownPass 後端服務，提供健康檢查 API。

## 安裝

### 1. 安裝 Python 套件
```bash
pip install -r requirements.txt
```

### 2. 設定環境變數（可選）
```bash
cp .env.example .env
# 編輯 .env 檔案設定 PROD_FRONTEND_URL
```

## 執行

### 開發模式（支援熱重載）
```bash
uvicorn main:app --reload --port 3000
```

### 正式環境
```bash
python main.py
```

或使用 uvicorn：
```bash
uvicorn main:app --host 0.0.0.0 --port 3000
```

## API 端點

### 根路徑
- **GET** `/`
- 回應：`{"message": "Hello world"}`

### 健康檢查
- **GET** `/api/v1/health`
- 回應：`{"message": "Server is running healthy!"}`

## API 文件

FastAPI 自動生成互動式 API 文件：

- Swagger UI: http://localhost:3000/docs
- ReDoc: http://localhost:3000/redoc

## 測試

```bash
# 測試根路徑
curl http://localhost:3000/

# 測試健康檢查
curl http://localhost:3000/api/v1/health
```

## Docker 部署（可選）

### 更新 Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

EXPOSE 3000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]
```

### 建立並執行容器
```bash
docker build -t townpass-backend .
docker run -p 3000:3000 townpass-backend
```

## 與 Node.js 版本的差異

1. **框架**：Express.js → FastAPI
2. **語言**：TypeScript → Python
3. **套件管理**：npm → pip
4. **自動文件**：FastAPI 內建 Swagger UI 和 ReDoc
5. **型別檢查**：TypeScript → Python type hints

## 功能對照表

| Node.js/Express | FastAPI |
|----------------|---------|
| `app.get("/", ...)` | `@app.get("/")` |
| `res.send(...)` | `return {...}` |
| `cors()` middleware | `CORSMiddleware` |
| `express.json()` | 內建支援 |
| `nodemon` | `uvicorn --reload` |
