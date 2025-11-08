"""
圖形模板服務
從 tsp_taipei_route_new.py 匯入
"""
import numpy as np
from typing import Dict, List

# 圖形模板定義
SHAPE_TEMPLATES = {
    'T': np.array([
        [0.10, 0.95], [0.90, 0.95],
        [0.50, 0.95], [0.50, 0.05]
    ]),
    'A': np.array([
        [0.20, 0.05], [0.40, 0.60], [0.50, 0.95],
        [0.60, 0.60], [0.80, 0.05],
        [0.32, 0.52], [0.68, 0.52]
    ]),
    'I': np.array([
        [0.30, 0.95], [0.70, 0.95],
        [0.50, 0.95], [0.50, 0.05],
        [0.30, 0.05], [0.70, 0.05]
    ]),
    'P': np.array([
        [0.05, 0.22], [0.95, 0.22],
        [0.95, 0.55], [0.86, 0.72], [0.72, 0.78],
        [0.61, 0.70], [0.55, 0.54],
        [0.55, 0.22]
    ]),
    'E': np.array([
        [0.85, 0.95], [0.20, 0.95],
        [0.20, 0.65],
        [0.55, 0.65], [0.20, 0.65],
        [0.20, 0.35], [0.20, 0.05],
        [0.85, 0.05]
    ]),
    'S': np.array([[0.8, 0.9], [0.6, 1.0], [0.3, 0.9], [0.2, 0.7],
                   [0.3, 0.5], [0.5, 0.4], [0.7, 0.3], [0.8, 0.1], [0.6, 0.0]]),
    'U': np.array([[0.2, 1.0], [0.2, 0.6], [0.2, 0.2], [0.5, 0.0],
                   [0.8, 0.2], [0.8, 0.6], [0.8, 1.0]]),
    'O': np.array([[0.5, 1.0], [0.8, 0.9], [1.0, 0.5], [0.8, 0.1],
                   [0.5, 0.0], [0.2, 0.1], [0.0, 0.5], [0.2, 0.9], [0.5, 1.0]]),
    'L': np.array([[0.2, 1.0], [0.2, 0.7], [0.2, 0.4], [0.2, 0.1], [0.2, 0.0],
                   [0.4, 0.0], [0.6, 0.0], [0.8, 0.0]]),
}

# 圖形資訊
SHAPE_INFO = {
    'T': {'name': 'T 字形', 'description': 'T 字形路線，適合探索台北市中心區域', 'difficulty': '簡單'},
    'A': {'name': 'A 字形', 'description': 'A 字形路線，挑戰性中等', 'difficulty': '中等'},
    'I': {'name': 'I 字形', 'description': 'I 字形路線，直線探索', 'difficulty': '簡單'},
    'P': {'name': 'P 字形', 'description': 'P 字形路線，環狀探索', 'difficulty': '中等'},
    'E': {'name': 'E 字形', 'description': 'E 字形路線，多點探索', 'difficulty': '困難'},
    'S': {'name': 'S 字形', 'description': 'S 字形路線，蜿蜒探索', 'difficulty': '中等'},
    'U': {'name': 'U 字形', 'description': 'U 字形路線，U 型探索', 'difficulty': '簡單'},
    'O': {'name': 'O 字形', 'description': 'O 字形路線（圓形），環狀探索', 'difficulty': '中等'},
    'L': {'name': 'L 字形', 'description': 'L 字形路線，直角探索', 'difficulty': '簡單'},
}

def get_available_shapes() -> List[str]:
    """取得所有可用的圖形"""
    return list(SHAPE_TEMPLATES.keys())

def get_shape_template(shape_id: str) -> np.ndarray:
    """取得指定圖形的模板"""
    if shape_id not in SHAPE_TEMPLATES:
        raise ValueError(f"不支援的圖形: {shape_id}")
    return SHAPE_TEMPLATES[shape_id]

def get_shape_info(shape_id: str) -> Dict:
    """取得圖形資訊"""
    if shape_id not in SHAPE_INFO:
        raise ValueError(f"不支援的圖形: {shape_id}")
    return SHAPE_INFO[shape_id]
