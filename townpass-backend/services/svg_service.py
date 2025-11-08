"""
SVG 圖形生成服務
"""
import numpy as np
import pandas as pd
from typing import List

def generate_route_svg(route_df: pd.DataFrame, width: int = 400, height: int = 400) -> str:
    """
    根據實際路線生成 SVG
    
    Args:
        route_df: 包含 latitude, longitude 的 DataFrame
        width: SVG 寬度
        height: SVG 高度
    
    Returns:
        SVG 字串
    """
    if route_df is None or len(route_df) == 0:
        return ""
    
    # 取得座標範圍
    lats = route_df['latitude'].values
    lons = route_df['longitude'].values
    
    lat_min, lat_max = lats.min(), lats.max()
    lon_min, lon_max = lons.min(), lons.max()
    
    # 加入邊距
    lat_range = lat_max - lat_min
    lon_range = lon_max - lon_min
    
    if lat_range == 0:
        lat_range = 0.01
    if lon_range == 0:
        lon_range = 0.01
    
    margin = 0.1
    lat_min -= lat_range * margin
    lat_max += lat_range * margin
    lon_min -= lon_range * margin
    lon_max += lon_range * margin
    
    # 轉換為 SVG 座標
    points = []
    for _, row in route_df.iterrows():
        x = ((row['longitude'] - lon_min) / (lon_max - lon_min)) * width
        y = height - ((row['latitude'] - lat_min) / (lat_max - lat_min)) * height
        points.append(f"{x:.2f},{y:.2f}")
    
    # 生成路徑
    path_data = f"M {points[0]}"
    for point in points[1:]:
        path_data += f" L {point}"
    
    # 生成 SVG
    svg_parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        f'  <path d="{path_data}" stroke="#3B82F6" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
    ]
    
    # 添加站點標記
    for i, point_str in enumerate(points):
        x, y = point_str.split(',')
        color = "#10B981" if i == 0 else "#EF4444" if i == len(points) - 1 else "#3B82F6"
        svg_parts.append(f'  <circle cx="{x}" cy="{y}" r="5" fill="{color}"/>')
        svg_parts.append(f'  <text x="{x}" y="{float(y)-10}" text-anchor="middle" font-size="12" fill="{color}">{i+1}</text>')
    
    svg_parts.append('</svg>')
    
    return '\n'.join(svg_parts)
