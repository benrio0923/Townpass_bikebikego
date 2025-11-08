"""
資料模型定義
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

# ===== MongoDB ObjectId 處理 =====

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, info):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

# ===== API 回應模型 =====

class Spot(BaseModel):
    """景點資料"""
    id: str = Field(..., description="景點 ID (YouBike='You-xxx', 一般景點='xxx')")
    name: str = Field(..., description="景點名稱")
    description: str = Field(..., description="景點描述")

class Route(BaseModel):
    """路線資料"""
    id: str = Field(..., description="路線 ID")
    name: str = Field(..., description="路線名稱")
    description: str = Field(..., description="路線描述")
    image: str = Field(..., description="SVG 圖形")
    Spots: List[Spot] = Field(default=[], description="景點陣列")

class ApiResponse(BaseModel):
    """標準 API 回應"""
    success: bool = Field(..., description="是否成功")
    data: Optional[Any] = Field(None, description="資料")
    error: Optional[str] = Field(default=None, description="錯誤訊息")
    meta: Optional[Dict] = Field(default=None, description="元資料")

class Waypoint(BaseModel):
    """路徑點資料"""
    id: str = Field(..., description="路徑點 ID")
    name: str = Field(..., description="名稱")
    description: str = Field(..., description="描述")
    type: str = Field(..., description="類型 (youbike/attraction)")
    lat: float = Field(..., description="緯度")
    lon: float = Field(..., description="經度")
    available_bikes: Optional[int] = Field(None, description="可借車輛數")
    nearby_attractions: List[str] = Field(default=[], description="附近景點")

class RouteDetail(BaseModel):
    """路線詳情"""
    shape: str = Field(..., description="圖形 ID")
    name: str = Field(..., description="路線名稱")
    description: str = Field(..., description="路線描述")
    route_geometry: List[List[float]] = Field(..., description="路線幾何座標 [[lat, lon], ...]")
    waypoints: List[Waypoint] = Field(..., description="路徑點陣列")
    distance_km: float = Field(default=0, description="總距離（公里）")
    duration_min: float = Field(default=0, description="預估時間（分鐘）")
    completed_time: Optional[str] = Field(None, description="完成時間 (ISO 格式)")
    duration_hours: Optional[float] = Field(None, description="耗時（小時）")

class CheckInRequest(BaseModel):
    """打卡請求"""
    userId: str = Field(..., description="使用者 ID")
    waypointId: str = Field(..., description="路徑點 ID")
    shape: str = Field(..., description="圖形 ID")
    userLat: float = Field(..., description="使用者緯度")
    userLon: float = Field(..., description="使用者經度")

class CheckIn(BaseModel):
    """打卡記錄"""
    userId: str = Field(..., description="使用者 ID")
    waypointId: str = Field(..., description="路徑點 ID")
    shape: str = Field(..., description="圖形 ID")
    timestamp: datetime = Field(..., description="打卡時間")
    location: Dict[str, float] = Field(..., description="打卡位置 {lat, lon}")
    verified: bool = Field(..., description="是否驗證通過")
    distance: float = Field(..., description="與景點的距離（公尺）")

class UserProgress(BaseModel):
    """使用者進度"""
    userId: str = Field(..., description="使用者 ID")
    shape: str = Field(..., description="圖形 ID")
    checkins: List[str] = Field(default=[], description="已打卡的路徑點 ID 列表")
    total_waypoints: int = Field(..., description="總路徑點數")
    completed_waypoints: int = Field(..., description="已完成路徑點數")
    completion_rate: float = Field(..., description="完成率")
    last_updated: datetime = Field(..., description="最後更新時間")

class RouteSession(BaseModel):
    """路線會話（計時記錄）"""
    userId: str = Field(..., description="使用者 ID")
    shape: str = Field(..., description="圖形 ID")
    status: str = Field(..., description="狀態 (started/completed)")
    start_time: datetime = Field(..., description="開始時間")
    end_time: Optional[datetime] = Field(None, description="結束時間")
    duration_hours: Optional[float] = Field(None, description="耗時（小時）")

class StartRouteRequest(BaseModel):
    """開始路線請求"""
    userId: str = Field(..., description="使用者 ID")
    shape: str = Field(..., description="圖形 ID")

class CompleteRouteRequest(BaseModel):
    """完成路線請求"""
    userId: str = Field(..., description="使用者 ID")
    shape: str = Field(..., description="圖形 ID")

class CertificateRequest(BaseModel):
    """證書生成請求"""
    userId: str = Field(..., description="使用者 ID")
    shape: str = Field(..., description="圖形 ID")
    userName: Optional[str] = Field(None, description="使用者名稱")
