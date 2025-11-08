"""
路線生成服務 - 整合 tsp_taipei_route_new.py 邏輯
"""
import sys
import os

# 添加專案路徑（相對於當前檔案）
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
parent_dir = os.path.dirname(backend_dir)
sys.path.append(parent_dir)

from tsp_taipei_route_new import (
    fetch_youbike_data,
    find_nearest_youbike,
    generate_shape_route,
    find_nearby_attractions,
    RouteConfig
)
import pandas as pd
from typing import Dict, Any, Optional

# CSV 檔案路徑（相對於 townpass-backend 目錄）
ATTRACTIONS_CSV_PATH = os.path.join(parent_dir, 'taipei_attractions.csv')

def fetch_attractions_from_csv():
    """從本地 CSV 讀取景點資料（使用絕對路徑）"""
    print("🏛️ 正在讀取台北景點資料...")
    try:
        df = pd.read_csv(ATTRACTIONS_CSV_PATH)
        df = df[pd.notna(df['nlat']) & pd.notna(df['elong'])]
        print(f"✅ 讀取 {len(df)} 個景點")
        return df
    except FileNotFoundError:
        print(f"❌ 找不到 {ATTRACTIONS_CSV_PATH}")
        return pd.DataFrame()

def generate_route_for_shape(shape: str, lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """
    為指定圖形生成路線
    
    Args:
        shape: 圖形類型 (T, A, I, P, E, S, U, O, L)
        lat: 使用者緯度
        lon: 使用者經度
    
    Returns:
        包含路線資訊的字典，如果失敗則回傳 None
    """
    try:
        print(f"  🎨 生成 {shape} 形路線...")
        
        # 設定配置
        config = RouteConfig()
        config.target_shape = shape
        config.user_location = {'lat': lat, 'lon': lon}
        
        # 抓取資料
        youbike_df = fetch_youbike_data()
        attractions_df = fetch_attractions_from_csv()
        
        # 找最近的 YouBike 站點作為起點
        start_station = find_nearest_youbike(lat, lon, youbike_df, config.min_available_bikes)
        
        # 生成圖形路線
        route_df, similarity = generate_shape_route(youbike_df, start_station, shape, config)
        
        if route_df is None:
            print(f"  ⚠️ {shape} 路線生成失敗")
            return None
        
        # 為每個站點找附近景點
        spots = []
        
        for idx, (_, station) in enumerate(route_df.iterrows(), 1):
            # 找附近景點
            nearby_attractions = find_nearby_attractions(
                station['latitude'],
                station['longitude'],
                attractions_df,
                config.attraction_radius
            )
            
            # YouBike 站點
            spot = {
                'id': f"You-{station['sno']}",
                'name': station['sna'],
                'description': f"可借: {station['available_rent_bikes']}輛 | 可還: {station['available_return_bikes']}位",
                'type': 'youbike',
                'lat': station['latitude'],
                'lon': station['longitude']
            }
            spots.append(spot)
            
            # 附近景點（最多3個）
            for attr in nearby_attractions[:3]:
                attraction_spot = {
                    'id': f"attr-{idx}-{abs(hash(attr['name'])) % 10000}",
                    'name': attr['name'],
                    'description': f"{attr.get('address', '無地址')} (距離 {attr['distance']:.0f}m)",
                    'type': 'attraction',
                    'lat': attr['lat'],
                    'lon': attr['lon']
                }
                spots.append(attraction_spot)
        
        print(f"  ✅ {shape} 路線完成 ({len(spots)} 個景點)")
        
        return {
            'success': True,
            'shape': shape,
            'similarity': similarity,
            'spots': spots,
            'route_df': route_df
        }
        
    except Exception as e:
        print(f"  ❌ 生成 {shape} 路線時發生錯誤: {e}")
        import traceback
        traceback.print_exc()
        return None
