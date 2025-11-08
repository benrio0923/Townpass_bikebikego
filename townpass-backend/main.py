"""
TownPass Backend - FastAPI Version with MongoDB
整合 tsp_taipei_route_new.py 路線生成邏輯
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from typing import List
from dotenv import load_dotenv
import sys

# 添加專案路徑（相對於當前檔案）
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from database import connect_to_mongo, close_mongo_connection, async_database, Collections
from models import Route, Spot, RouteDetail, Waypoint, CheckInRequest, CheckIn, UserProgress
from services.route_generator import generate_route_for_shape
from services.svg_service import generate_route_svg
from services.shape_service import SHAPE_TEMPLATES, SHAPE_INFO
from tsp_taipei_route_new import get_osrm_route, haversine_distance

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """應用程式生命週期管理"""
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title="TownPass Backend",
    description="TownPass Backend API with Route Generation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        os.getenv("PROD_FRONTEND_URL", "*")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    """根路徑"""
    return {"message": "TownPass Backend API is running"}

@app.get("/api/v1/health")
def health_check():
    """健康檢查端點"""
    return {"message": "Server is running healthy!"}

@app.get("/api/v1/routeList", response_model=List[Route])
async def route_list(
    lat: float = Query(..., description="使用者緯度", example=25.0330),
    lon: float = Query(..., description="使用者經度", example=121.5654)
):
    """
    取得所有可用的路線類型（整合實際路線生成）
    
    Args:
        lat: 使用者緯度（必填）
        lon: 使用者經度（必填）
    
    Returns:
        Route[]: 路線陣列，每個包含：
            - id: 圖形 ID (T, A, I, P, E, S, U, O, L)
            - name: 圖形名稱
            - description: 描述
            - image: SVG 圖形（實際路線）
            - Spots: 景點陣列（YouBike 站點 + 附近景點）
    """
    try:
        print(f"\n{'='*70}")
        print(f"📍 使用者位置: ({lat}, {lon})")
        print(f"{'='*70}")
        
        routes = []
        
        # 為每個圖形生成路線
        for shape_id in SHAPE_TEMPLATES.keys():
            # 生成路線
            route_result = generate_route_for_shape(shape_id, lat, lon)
            
            if route_result and route_result['success']:
                # 生成 SVG
                svg = generate_route_svg(route_result['route_df'])
                
                # 轉換 Spots
                spots = [
                    Spot(
                        id=spot['id'],
                        name=spot['name'],
                        description=spot['description']
                    )
                    for spot in route_result['spots']
                ]
                
                # 取得圖形資訊
                info = SHAPE_INFO.get(shape_id, {
                    'name': f'{shape_id} 字形',
                    'description': f'{shape_id} 字形路線'
                })
                
                # 建立 Route
                route = Route(
                    id=shape_id,
                    name=info['name'],
                    description=f"{info['description']} (相似度: {route_result['similarity']:.1%})",
                    image=svg,
                    Spots=spots
                )
                
                routes.append(route)
            else:
                print(f"  ⚠️ {shape_id} 路線生成失敗，跳過")
        
        print(f"\n{'='*70}")
        print(f"✅ 共生成 {len(routes)} 條路線")
        print(f"{'='*70}\n")
        
        return routes
        
    except Exception as e:
        print(f"❌ 錯誤: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"生成路線失敗: {str(e)}")

@app.get("/api/v1/route/{shape}", response_model=RouteDetail)
async def get_route_detail(
    shape: str,
    lat: float = Query(25.021777051200228, description="使用者緯度"),
    lon: float = Query(121.5354050968437, description="使用者經度")
):
    """
    取得指定圖形的詳細路線資訊
    
    Args:
        shape: 圖形 ID (T, A, I, P, E, S, U, O, L)
        lat: 使用者緯度
        lon: 使用者經度
    
    Returns:
        RouteDetail: 包含路線幾何、景點、距離等資訊
    """
    try:
        shape = shape.upper()
        
        if shape not in SHAPE_TEMPLATES:
            raise HTTPException(status_code=404, detail=f"不支援的圖形: {shape}")
        
        print(f"\n{'='*70}")
        print(f"📍 生成 {shape} 形路線")
        print(f"   使用者位置: ({lat}, {lon})")
        print(f"{'='*70}")
        
        # 生成路線
        route_result = generate_route_for_shape(shape, lat, lon)
        
        if not route_result or not route_result['success']:
            raise HTTPException(status_code=500, detail=f"{shape} 路線生成失敗")
        
        # 使用 OSRM 計算實際路線
        osrm_result = get_osrm_route(route_result['route_df'])
        
        # 準備路線幾何座標
        route_geometry = []
        distance_km = 0
        duration_min = 0
        
        if osrm_result and osrm_result['success']:
            route_geometry = [[coord[0], coord[1]] for coord in osrm_result['coords']]
            distance_km = osrm_result['distance']
            duration_min = osrm_result['duration']
        else:
            # 如果 OSRM 失敗，使用直線連接
            route_geometry = [
                [row['latitude'], row['longitude']] 
                for _, row in route_result['route_df'].iterrows()
            ]
        
        # 轉換景點資料
        waypoints = []
        for spot in route_result['spots']:
            waypoint = Waypoint(
                id=spot['id'],
                name=spot['name'],
                description=spot['description'],
                type=spot['type'],
                lat=spot['lat'],
                lon=spot['lon'],
                available_bikes=spot.get('available_bikes'),
                nearby_attractions=spot.get('nearby_attractions', [])
            )
            waypoints.append(waypoint)
        
        # 取得圖形資訊
        info = SHAPE_INFO.get(shape, {
            'name': f'{shape} 字形',
            'description': f'{shape} 字形路線'
        })
        
        route_detail = RouteDetail(
            shape=shape,
            name=info['name'],
            description=info['description'],
            similarity=route_result['similarity'],
            route_geometry=route_geometry,
            waypoints=waypoints,
            distance_km=distance_km,
            duration_min=duration_min
        )
        
        print(f"✅ {shape} 路線生成成功")
        print(f"   景點數: {len(waypoints)}")
        print(f"   距離: {distance_km:.2f} km")
        print(f"   時間: {duration_min:.1f} min")
        print(f"{'='*70}\n")
        
        return route_detail
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 錯誤: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"生成路線詳情失敗: {str(e)}")

@app.post("/api/v1/checkin")
async def check_in(request: CheckInRequest):
    """
    打卡 API - 驗證使用者位置並記錄打卡
    
    Args:
        request: 打卡請求資料
    
    Returns:
        打卡結果，包含驗證狀態和距離
    """
    try:
        print(f"\n{'='*70}")
        print(f"📍 打卡請求")
        print(f"   使用者: {request.userId}")
        print(f"   路徑點: {request.waypointId}")
        print(f"   位置: ({request.userLat}, {request.userLon})")
        print(f"{'='*70}")
        
        # TODO: 從資料庫或快取中取得路徑點的實際座標
        # 目前暫時使用簡化邏輯，假設驗證通過
        # 實際應用中需要查詢景點的真實座標來計算距離
        
        # 暫時設定為驗證通過，距離為 0
        distance = 0
        verified = True
        
        # 如果有資料庫連線，保存打卡記錄
        if async_database is not None:
            checkin_data = {
                "userId": request.userId,
                "waypointId": request.waypointId,
                "shape": request.shape,
                "timestamp": datetime.now(),
                "location": {"lat": request.userLat, "lon": request.userLon},
                "verified": verified,
                "distance": distance
            }
            
            await async_database[Collections.CHECKINS].insert_one(checkin_data)
            print(f"✅ 打卡記錄已保存到 MongoDB")
            
            # 更新使用者進度
            progress = await async_database[Collections.USER_PROGRESS].find_one({
                "userId": request.userId,
                "shape": request.shape
            })
            
            if progress:
                # 更新現有進度
                if request.waypointId not in progress['checkins']:
                    await async_database[Collections.USER_PROGRESS].update_one(
                        {"userId": request.userId, "shape": request.shape},
                        {
                            "$push": {"checkins": request.waypointId},
                            "$inc": {"completed_waypoints": 1},
                            "$set": {"last_updated": datetime.now()}
                        }
                    )
                    # 重新計算完成率
                    updated_progress = await async_database[Collections.USER_PROGRESS].find_one({
                        "userId": request.userId,
                        "shape": request.shape
                    })
                    if updated_progress:
                        completion_rate = updated_progress['completed_waypoints'] / updated_progress['total_waypoints']
                        await async_database[Collections.USER_PROGRESS].update_one(
                            {"userId": request.userId, "shape": request.shape},
                            {"$set": {"completion_rate": completion_rate}}
                        )
        else:
            print(f"⚠️ 無 MongoDB 連線，打卡記錄未保存")
        
        print(f"✅ 打卡{'成功' if verified else '失敗'}")
        print(f"   距離: {distance:.1f} 公尺")
        print(f"{'='*70}\n")
        
        return {
            "success": verified,
            "message": "打卡成功" if verified else "距離太遠，打卡失敗",
            "distance": distance,
            "verified": verified,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ 打卡錯誤: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"打卡失敗: {str(e)}")

@app.get("/api/v1/progress/{userId}")
async def get_user_progress(
    userId: str,
    shape: str = Query(None, description="指定圖形 ID（可選）")
):
    """
    取得使用者進度
    
    Args:
        userId: 使用者 ID
        shape: 圖形 ID（可選，不指定則回傳所有圖形的進度）
    
    Returns:
        使用者的打卡記錄和完成進度
    """
    try:
        print(f"\n{'='*70}")
        print(f"📊 查詢進度")
        print(f"   使用者: {userId}")
        if shape:
            print(f"   圖形: {shape}")
        print(f"{'='*70}")
        
        if async_database is None:
            print(f"⚠️ 無 MongoDB 連線")
            return {
                "userId": userId,
                "progress": [],
                "total_checkins": 0
            }
        
        # 查詢進度
        query = {"userId": userId}
        if shape:
            query["shape"] = shape.upper()
        
        progress_list = await async_database[Collections.USER_PROGRESS].find(query).to_list(length=100)
        
        # 查詢打卡記錄
        checkin_query = {"userId": userId}
        if shape:
            checkin_query["shape"] = shape.upper()
        
        checkins = await async_database[Collections.CHECKINS].find(checkin_query).to_list(length=1000)
        
        print(f"✅ 找到 {len(progress_list)} 個進度記錄")
        print(f"✅ 找到 {len(checkins)} 個打卡記錄")
        print(f"{'='*70}\n")
        
        # 轉換 ObjectId 為字串
        for p in progress_list:
            if '_id' in p:
                p['_id'] = str(p['_id'])
            if 'last_updated' in p and isinstance(p['last_updated'], datetime):
                p['last_updated'] = p['last_updated'].isoformat()
        
        for c in checkins:
            if '_id' in c:
                c['_id'] = str(c['_id'])
            if 'timestamp' in c and isinstance(c['timestamp'], datetime):
                c['timestamp'] = c['timestamp'].isoformat()
        
        return {
            "userId": userId,
            "progress": progress_list,
            "checkins": checkins,
            "total_checkins": len(checkins)
        }
        
    except Exception as e:
        print(f"❌ 查詢進度錯誤: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"查詢進度失敗: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
