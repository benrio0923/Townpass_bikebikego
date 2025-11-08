"""
Test Data Seeder
創建測試數據：為 demo-user-123 用戶設定 T 字形路線已完成狀態
完成時間：2025-11-08 14:30
耗時：3 小時
"""
import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "townpass2025")

async def seed_test_data():
    """創建測試數據"""
    print("🌱 開始創建測試數據...")
    
    try:
        # 連接資料庫
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]
        
        # 測試連線
        await client.admin.command('ping')
        print(f"✅ 已連線到 MongoDB: {DATABASE_NAME}")
        
        # 測試用戶和路線資訊
        user_id = "demo-user-123"
        shape = "T"
        
        # 設定完成時間：2025-11-08 14:30
        completed_time = datetime(2025, 11, 8, 14, 30, 0)
        # 設定開始時間：完成時間往前推 3 小時
        start_time = completed_time - timedelta(hours=3)
        duration_hours = 3.0
        
        print(f"\n📝 創建路線會話資料...")
        print(f"   用戶: {user_id}")
        print(f"   路線: {shape}")
        print(f"   開始時間: {start_time}")
        print(f"   完成時間: {completed_time}")
        print(f"   耗時: {duration_hours} 小時")
        
        # 刪除舊的會話記錄（如果存在）
        await db.route_sessions.delete_many({
            "userId": user_id,
            "shape": shape
        })
        
        # 創建完成的路線會話
        session_data = {
            "userId": user_id,
            "shape": shape,
            "status": "completed",
            "start_time": start_time,
            "end_time": completed_time,
            "duration_hours": duration_hours
        }
        
        result = await db.route_sessions.insert_one(session_data)
        print(f"✅ 路線會話已創建 (ID: {result.inserted_id})")
        
        # 創建用戶進度（假設有 10 個景點，全部已完成）
        print(f"\n📝 創建用戶進度資料...")
        
        # 刪除舊的進度記錄
        await db.user_progress.delete_many({
            "userId": user_id,
            "shape": shape
        })
        
        # 模擬 10 個已打卡的景點
        waypoint_ids = [f"You-{i}" for i in range(1, 11)]
        
        progress_data = {
            "userId": user_id,
            "shape": shape,
            "checkins": waypoint_ids,
            "total_waypoints": 10,
            "completed_waypoints": 10,
            "completion_rate": 1.0,
            "last_updated": completed_time
        }
        
        result = await db.user_progress.insert_one(progress_data)
        print(f"✅ 用戶進度已創建 (ID: {result.inserted_id})")
        
        # 創建打卡記錄
        print(f"\n📝 創建打卡記錄...")
        
        # 刪除舊的打卡記錄
        await db.checkins.delete_many({
            "userId": user_id,
            "shape": shape
        })
        
        # 為每個景點創建打卡記錄
        checkin_records = []
        for i, waypoint_id in enumerate(waypoint_ids):
            # 每個景點的打卡時間間隔約 18 分鐘（3小時 / 10個點）
            checkin_time = start_time + timedelta(minutes=18 * i)
            
            checkin_data = {
                "userId": user_id,
                "waypointId": waypoint_id,
                "shape": shape,
                "timestamp": checkin_time,
                "location": {"lat": 25.0 + i * 0.01, "lon": 121.5 + i * 0.01},
                "verified": True,
                "distance": 20.5
            }
            checkin_records.append(checkin_data)
        
        if checkin_records:
            result = await db.checkins.insert_many(checkin_records)
            print(f"✅ 已創建 {len(result.inserted_ids)} 筆打卡記錄")
        
        print(f"\n{'='*70}")
        print(f"🎉 測試數據創建完成！")
        print(f"{'='*70}")
        print(f"\n📋 測試數據摘要：")
        print(f"   - 用戶 ID: {user_id}")
        print(f"   - 路線: {shape} 字形")
        print(f"   - 狀態: 已完成")
        print(f"   - 完成時間: {completed_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"   - 耗時: {duration_hours} 小時")
        print(f"   - 景點數: {len(waypoint_ids)}")
        print(f"   - 已打卡: {len(waypoint_ids)}/{ len(waypoint_ids)}")
        print(f"\n💡 提示：")
        print(f"   - 在前端以用戶 'demo-user-123' 查看 T 字形路線")
        print(f"   - 應該會看到已完成的狀態和下載證書按鈕")
        print(f"   - 所有景點卡片應該呈現灰色樣式")
        print(f"\n")
        
        # 關閉連線
        client.close()
        
    except Exception as e:
        print(f"❌ 錯誤: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(seed_test_data())

