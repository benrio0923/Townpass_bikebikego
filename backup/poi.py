import requests
import pandas as pd
from time import sleep

def fetch_all_attractions():
    all_data = []
    page = 1

    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
    }

    while True:
        url = f"https://www.travel.taipei/open-api/zh-tw/Attractions/All?page={page}"
        print(f"Fetching page {page} ...")
        res = requests.get(url, headers=headers)

        if res.status_code != 200:
            print(f"⚠️ Failed to fetch page {page}, status code: {res.status_code}")
            break

        try:
            data = res.json()
        except Exception as e:
            print(f"❌ JSON decode error on page {page}: {e}")
            break

        attractions = data.get("data", [])
        if not attractions:
            print("✅ No more data found.")
            break

        all_data.extend(attractions)
        print(f"✔️ Page {page} done ({len(attractions)} items)")
        page += 1

        # 避免被封鎖
        sleep(0.5)

    print(f"\n共抓取 {len(all_data)} 筆景點資料。")
    return all_data


def save_to_csv(data, filename="taipei_attractions.csv"):
    df = pd.json_normalize(data)
    df.to_csv(filename, index=False, encoding="utf-8-sig")
    print(f"💾 已成功輸出 {filename}")


if __name__ == "__main__":
    data = fetch_all_attractions()
    if data:
        save_to_csv(data)
