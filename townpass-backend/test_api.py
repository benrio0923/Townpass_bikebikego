"""
測試 API 端點
"""
import requests
import json

def test_health():
    """測試健康檢查端點"""
    print("🧪 測試 /api/v1/health")
    response = requests.get("http://localhost:3000/api/v1/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_route_list():
    """測試路線列表端點"""
    print("🧪 測試 /api/v1/routeList")
    
    # 台北 101 附近
    params = {
        "lat": 25.0330,
        "lon": 121.5654
    }
    
    response = requests.get("http://localhost:3000/api/v1/routeList", params=params)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ 成功取得 {len(data)} 條路線")
        print()
        
        # 顯示每條路線的摘要
        for route in data:
            print(f"路線: {route['id']} - {route['name']}")
            print(f"  描述: {route['description']}")
            print(f"  景點數: {len(route['Spots'])}")
            print(f"  SVG 長度: {len(route['image'])} 字元")
            
            # 顯示前 3 個景點
            if route['Spots']:
                print(f"  景點範例:")
                for spot in route['Spots'][:3]:
                    print(f"    - {spot['name']} ({spot['id']})")
            print()
    else:
        print(f"❌ 失敗: {response.text}")

if __name__ == "__main__":
    print("=" * 70)
    print("  TownPass Backend API 測試")
    print("=" * 70)
    print()
    
    test_health()
    test_route_list()
