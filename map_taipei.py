import folium
import pandas as pd

# 讀取資料
df = pd.read_csv("taipei_attractions.csv")

# 建立地圖中心點（台北市中心）
taipei_map = folium.Map(location=[25.0330, 121.5654], zoom_start=12)

# 將每個景點標註上去
for _, row in df.iterrows():
    if pd.notna(row.get("nlat")) and pd.notna(row.get("elong")):
        folium.Marker(
            location=[row["nlat"], row["elong"]],
            popup=f"<b>{row['name']}</b><br>{row.get('address', '')}",
            tooltip=row["name"]
        ).add_to(taipei_map)

# 輸出為 HTML
taipei_map.save("taipei_attractions_map.html")
print("✅ 已生成 taipei_attractions_map.html，打開即可互動查看！")
