"""
MongoDB 資料庫連線設定
"""
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB 連線設定
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "townpass2025")

# 非同步客戶端（用於 FastAPI）
async_client = None
async_database = None

# 同步客戶端（用於初始化）
sync_client = None
sync_database = None

async def connect_to_mongo():
    """連線到 MongoDB（非同步）"""
    global async_client, async_database
    try:
        async_client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
        async_database = async_client[DATABASE_NAME]
        
        # 測試連線
        await async_client.admin.command('ping')
        print(f"✅ 已連線到 MongoDB: {DATABASE_NAME}")
    except Exception as e:
        print(f"⚠️ MongoDB 連線失敗: {e}")
        print(f"⚠️ 將使用記憶體模式運行（無資料庫）")
        # 設為 None，讓應用程式可以繼續運行
        async_database = None

async def close_mongo_connection():
    """關閉 MongoDB 連線"""
    global async_client
    if async_client:
        async_client.close()
        print("❌ 已關閉 MongoDB 連線")

def get_sync_database():
    """取得同步資料庫（用於初始化）"""
    global sync_client, sync_database
    if sync_database is None:
        sync_client = MongoClient(MONGODB_URL)
        sync_database = sync_client[DATABASE_NAME]
    return sync_database

# Collection 名稱
class Collections:
    ROUTES = "routes"
    YOUBIKE_CACHE = "youbike_cache"
    ATTRACTIONS = "attractions"
    SHAPES = "shapes"
    CHECKINS = "checkins"
    USER_PROGRESS = "user_progress"
    ROUTE_SESSIONS = "route_sessions"
