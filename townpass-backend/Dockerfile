# ----------------------------
# FastAPI Python Backend
# ----------------------------
FROM python:3.11-slim

WORKDIR /app

# 安裝 Python 套件
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製應用程式
COPY main.py .
COPY .env.example .env

# 開放端口
EXPOSE 3000

# 啟動應用程式
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]