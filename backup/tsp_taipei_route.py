import pandas as pd
import numpy as np
import folium
from ortools.constraint_solver import pywrapcp, routing_enums_pb2
from math import radians, sin, cos, sqrt, atan2


# ======================================================
# 計算兩點距離（公里）
# ======================================================
def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


# ======================================================
# 建立距離矩陣
# ======================================================
def create_distance_matrix(df):
    n = len(df)
    dist_matrix = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            if i != j:
                dist_matrix[i][j] = haversine(
                    df.loc[i, "nlat"], df.loc[i, "elong"],
                    df.loc[j, "nlat"], df.loc[j, "elong"]
                )
    return dist_matrix


# ======================================================
# 使用 OR-Tools 求解 TSP
# ======================================================
def solve_tsp(distance_matrix):
    n = len(distance_matrix)
    manager = pywrapcp.RoutingIndexManager(n, 1, 0)
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return int(distance_matrix[from_node][to_node] * 1000)

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 10

    solution = routing.SolveWithParameters(search_parameters)
    route = []
    if solution:
        index = routing.Start(0)
        while not routing.IsEnd(index):
            route.append(manager.IndexToNode(index))
            index = solution.Value(routing.NextVar(index))
        route.append(manager.IndexToNode(index))
    return route


# ======================================================
# 畫地圖
# ======================================================
def plot_route(df, route, output_html="taipei_route_batch.html"):
    taipei_map = folium.Map(location=[25.033, 121.5654], zoom_start=12)
    coords = [(df.loc[i, "nlat"], df.loc[i, "elong"]) for i in route]

    for i, idx in enumerate(route[:-1]):
        folium.Marker(
            location=coords[i],
            popup=f"{i+1}. {df.loc[idx, 'name']}",
            tooltip=df.loc[idx, "name"]
        ).add_to(taipei_map)

    folium.PolyLine(coords, color="blue", weight=3, opacity=0.7).add_to(taipei_map)
    taipei_map.save(output_html)
    print(f"✅ 已生成地圖: {output_html}")


# ======================================================
# 主程式（分批跑）
# ======================================================
if __name__ == "__main__":
    df = pd.read_csv("taipei_attractions.csv")
    batch_size = 20  # 每批處理筆數

    total = len(df)
    print(f"共 {total} 筆景點，將分批處理（每批 {batch_size} 筆）")

    batch_no = 1
    start = 0

    while start < total:
        subset = df.iloc[start:start+batch_size].reset_index(drop=True)
        print(f"\n🚀 正在處理第 {batch_no} 批，共 {len(subset)} 筆景點...")

        dist_matrix = create_distance_matrix(subset)
        route = solve_tsp(dist_matrix)

        print("路線順序：")
        for i, idx in enumerate(route):
            print(f"{i+1}. {subset.loc[idx, 'name']}")

        plot_route(subset, route, f"taipei_route_batch_{batch_no}.html")

        start += batch_size
        batch_no += 1

    print("✅ 所有批次處理完成！請查看 taipei_route_batch_*.html 檔案。")
