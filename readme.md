# 台北騎跡 - 技術架構文檔

> **Taipei bikebikego** - 基於 YouBike 和台北景點的智能路線規劃系統


---

## 專案概述

### 項目簡介

台北騎跡是一個創新的城市探索應用，結合 YouBike 2.0 公共自行車系統和台北市景點數據，通過Greedy Algorithm算法和形狀匹配技術，生成具有特定字母形狀的騎行路線。

### 核心特色

- 🚴 **智能路線生成** - Greedy Algorithm 最優路徑規劃
- 🎨 **形狀路線** - 生成特定字母形狀的騎行軌跡
- 📍 **即時定位打卡** - 基於地理位置的景點簽到系統
- ⏱️ **計時挑戰** - 實時追蹤騎行時間和完成進度
- 🏆 **成就系統** - 完成所有路線獲得證書獎勵

### 應用場景

- 本地居民的周末休閒騎行
- 騎行互動挑戰賽
- 城市探索的遊戲化體驗

---

## 技術棧

### 前端技術

| 技術 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 16.0.0 | React 框架、SSR/SSG |
| **React** | 19.x | UI 組件庫 |
| **TypeScript** | 5.x | 類型安全 |
| **Tailwind CSS** | 3.x | 樣式框架 |
| **Leaflet** | 1.9.x | 地圖渲染 |
| **React Leaflet** | 4.x | React 地圖組件 |
| **Lucide React** | - | 圖標庫 |

### 後端技術

| 技術 | 版本 | 用途 |
|------|------|------|
| **FastAPI** | 0.104+ | Python Web 框架 |
| **Python** | 3.10+ | 後端語言 |
| **Motor** | 3.3+ | MongoDB 異步驅動 |
| **MongoDB** | 5.x | NoSQL 數據庫 |
| **Pydantic** | 2.x | 數據驗證 |
| **NumPy** | 1.24+ | 數值計算 |
| **SciPy** | 1.10+ | 科學計算（TSP） |
| **Shapely** | 2.0+ | 幾何計算 |
| **Pillow** | 10.0+ | 圖像處理 |

### 外部服務

| 服務 | 用途 | 連結 |
|------|------|------|
| **台北市政府開放數據** | YouBike 站點即時數據 | https://data.taipei/dataset/detail?id=c6bc8aed-557d-41d5-bfb1-8da24f78f2fb | 
| **台北市政府開放數據** | 旅遊資訊API | https://www.travel.taipei/open-api/swagger/ui/index#/Attractions/Attractions_All |
| **OSRM** | 路線規劃和距離計算 | https://github.com/Project-OSRM/osrm-backend |
| **Geolocation API** | 瀏覽器定位服務 | https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API |

---

## API 設計

### RESTful API 端點

#### 路線相關

| 方法 | 端點 | 描述 |
|------|------|------|
| GET | `/api/v1/route/{shape}` | 獲取特定形狀的路線詳情 |
| POST | `/api/v1/route/start` | 開始路線計時 |
| POST | `/api/v1/route/complete` | 完成路線 |

#### 打卡相關

| 方法 | 端點 | 描述 |
|------|------|------|
| POST | `/api/v1/checkin` | 景點打卡 |
| GET | `/api/v1/progress/{userId}` | 獲取用戶進度 |

#### 證書相關

| 方法 | 端點 | 描述 |
|------|------|------|
| GET | `/api/v1/certificate/{userId}/{shape}` | 下載證書 |



