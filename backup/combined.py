"""
台北市 YouBike 站點 + 景點整合地圖
---------------------------------
將 YouBike 2.0 站點和台北市景點繪製在同一張地圖上
使用圖層控制器讓使用者可以自由開關不同資料

Author: Combined Map
Date: 2025-11-08
"""

import requests
import pandas as pd
import folium
from folium import plugins
import webbrowser
import os
from time import sleep

def fetch_youbike_data():
    """抓取 YouBike 2.0 即時資料"""
    print("🚲 正在抓取 YouBike 即時資料...")
    url = "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
    data = requests.get(url).json()
    df = pd.DataFrame(data)
    df = df[['sno', 'sna', 'sarea', 'latitude', 'longitude', 'available_rent_bikes', 'available_return_bikes']]
    print(f"✅ 獲取 {len(df)} 個 YouBike 站點")
    return df

def fetch_attractions_from_api():
    """從 API 抓取台北景點資料"""
    print("🏛️ 正在從 API 抓取台北景點資料...")
    all_data = []
    page = 1

    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
    }

    while True:
        url = f"https://www.travel.taipei/open-api/zh-tw/Attractions/All?page={page}"
        print(f"   → 抓取第 {page} 頁...")
        
        try:
            res = requests.get(url, headers=headers)
            
            if res.status_code != 200:
                print(f"   ⚠️ 第 {page} 頁抓取失敗，狀態碼: {res.status_code}")
                break

            data = res.json()
            attractions = data.get("data", [])
            
            if not attractions:
                break

            all_data.extend(attractions)
            page += 1

            # 避免被封鎖
            sleep(0.5)
            
        except Exception as e:
            print(f"   ❌ 第 {page} 頁發生錯誤: {e}")
            break

    if not all_data:
        print("   ⚠️ API 抓取失敗，嘗試讀取本地 CSV 檔案...")
        try:
            df = pd.read_csv("taipei_attractions.csv")
            df = df[pd.notna(df['nlat']) & pd.notna(df['elong'])]
            print(f"✅ 從本地檔案讀取 {len(df)} 個景點")
            return df
        except FileNotFoundError:
            print("❌ 錯誤：找不到 taipei_attractions.csv 檔案")
            print("建議先執行 poi.py 產生景點資料檔案")
            raise

    print(f"✅ 從 API 獲取 {len(all_data)} 筆景點資料")
    
    # 轉換為 DataFrame
    df = pd.json_normalize(all_data)
    
    # 只保留有座標的景點
    if 'nlat' in df.columns and 'elong' in df.columns:
        df = df[pd.notna(df['nlat']) & pd.notna(df['elong'])]
        print(f"✅ 過濾後有效景點 {len(df)} 個")
    else:
        print("⚠️ 資料格式異常，缺少座標欄位")
    
    return df

def create_combined_map(youbike_df, attractions_df, save_path="taipei_combined_map.html"):
    """創建整合地圖，使用圖層控制"""
    
    # 建立地圖中心點（台北市政府）
    m = folium.Map(
        location=[25.0375, 121.5637], 
        zoom_start=13,
        tiles='OpenStreetMap'
    )
    
    # === 圖層 1: YouBike 站點 ===
    youbike_layer = folium.FeatureGroup(name='🚲 YouBike 站點', show=True)
    
    for _, row in youbike_df.iterrows():
        # 根據可借車輛數決定顏色
        if row['available_rent_bikes'] >= 10:
            color = "green"
            status = "充足"
        elif row['available_rent_bikes'] >= 5:
            color = "orange"
            status = "普通"
        else:
            color = "red"
            status = "不足"
        
        popup_html = f"""
        <div style="width: 200px;">
            <h4 style="color: {color};">🚲 {row['sna']}</h4>
            <hr>
            <b>區域：</b>{row['sarea']}<br>
            <b>可借車輛：</b><span style="color: {color}; font-size: 16px; font-weight: bold;">{row['available_rent_bikes']}</span> 輛 ({status})<br>
            <b>可還空位：</b>{row['available_return_bikes']} 位
        </div>
        """
        
        folium.CircleMarker(
            location=[row['latitude'], row['longitude']],
            radius=6,
            popup=folium.Popup(popup_html, max_width=250),
            tooltip=f"{row['sna']} ({row['available_rent_bikes']}輛)",
            color=color,
            fillColor=color,
            fillOpacity=0.7,
            weight=2
        ).add_to(youbike_layer)
    
    youbike_layer.add_to(m)
    
    # === 圖層 2: 台北景點 ===
    attractions_layer = folium.FeatureGroup(name='🏛️ 台北景點', show=True)
    
    for _, row in attractions_df.iterrows():
        # 取得景點資訊
        name = row.get('name', '未知景點')
        address = row.get('address', '無地址資訊')
        introduction = row.get('introduction', '無介紹')
        
        # 截斷過長的介紹文字
        if len(introduction) > 150:
            introduction = introduction[:150] + "..."
        
        popup_html = f"""
        <div style="width: 250px;">
            <h4 style="color: #FF6B6B;">📍 {name}</h4>
            <hr>
            <b>地址：</b>{address}<br>
            <b>簡介：</b><br>
            <p style="font-size: 12px; color: #666;">{introduction}</p>
        </div>
        """
        
        folium.Marker(
            location=[row['nlat'], row['elong']],
            popup=folium.Popup(popup_html, max_width=300),
            tooltip=name,
            icon=folium.Icon(color='red', icon='info-sign', prefix='glyphicon')
        ).add_to(attractions_layer)
    
    attractions_layer.add_to(m)
    
    # 添加圖層控制器（讓使用者可以開關圖層）
    folium.LayerControl(collapsed=False).add_to(m)
    
    # 添加全螢幕按鈕
    plugins.Fullscreen(
        position='topright',
        title='全螢幕',
        title_cancel='退出全螢幕',
        force_separate_button=True
    ).add_to(m)
    
    # 添加定位按鈕
    plugins.LocateControl(auto_start=False).add_to(m)
    
    # 添加地圖圖例
    legend_html = '''
    <div style="position: fixed; 
                bottom: 50px; right: 50px; width: 220px; height: auto; 
                background-color: white; border:2px solid grey; z-index:9999; 
                font-size:14px; padding: 10px; border-radius: 5px;">
        <h4 style="margin-top:0;">圖例說明</h4>
        <p><span style="color: green;">●</span> YouBike 充足 (≥10輛)</p>
        <p><span style="color: orange;">●</span> YouBike 普通 (5-9輛)</p>
        <p><span style="color: red;">●</span> YouBike 不足 (<5輛)</p>
        <p><span style="color: red;">📍</span> 台北景點</p>
        <hr>
        <p style="font-size: 11px; color: #666;">提示：使用左上角的圖層控制器<br>可開關不同資料層</p>
    </div>
    '''
    m.get_root().html.add_child(folium.Element(legend_html))  # type: ignore
    
    # 儲存地圖
    m.save(save_path)
    print(f"\n✅ 整合地圖已生成：{save_path}")
    print(f"📊 共包含 {len(youbike_df)} 個 YouBike 站點 + {len(attractions_df)} 個景點")
    
    # 自動在瀏覽器中開啟
    webbrowser.open('file://' + os.path.realpath(save_path))
    print("🌐 已在瀏覽器中開啟地圖")

def main():
    print("=" * 60)
    print("  台北市 YouBike + 景點整合地圖產生器")
    print("=" * 60)
    print()
    
    try:
        # 抓取資料
        youbike_df = fetch_youbike_data()
        attractions_df = fetch_attractions_from_api()
        
        print()
        # 建立地圖
        create_combined_map(youbike_df, attractions_df)
        
        print()
        print("=" * 60)
        print("🎉 完成！請在瀏覽器中查看地圖")
        print("💡 小技巧：")
        print("   - 點擊左上角圖層控制器可開關 YouBike/景點")
        print("   - 點擊標記可查看詳細資訊")
        print("   - 點擊右上角按鈕可全螢幕顯示")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ 發生錯誤：{e}")

if __name__ == "__main__":
    main()
