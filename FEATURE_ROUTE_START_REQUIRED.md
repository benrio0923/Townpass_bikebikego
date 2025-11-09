# Route Start Required Feature / 路線開始必要功能

## English

### Feature Description
This feature ensures that users must click the "Start Route" button before they can check in at any waypoint. This enforces the proper flow of the application and ensures route timing is accurate.

### Implementation Details

#### Modified Files
1. **next/components/waypoint-card.tsx**
   - Added `isRouteStarted` prop to WaypointCardProps interface
   - Added validation in `handleCheckIn` function to check if route has been started
   - Shows warning message if user attempts to check in before starting route

2. **next/components/route-detail.tsx**
   - Passed `isStarted` state as `isRouteStarted` prop to each WaypointCard component

### User Flow
1. User selects a route (T, A, I, P, E, or I2)
2. User views route details, map, and waypoint list
3. **User MUST click "開始路線" (Start Route) button**
4. Only after starting, user can begin checking in at waypoints
5. User must check in sequentially (in order)
6. After all waypoints are completed, route is automatically marked as complete

### Validation Rules (in order of checking)
1. ✅ **Route must be started** - User clicked "開始路線" button
2. ✅ **Sequential check-in** - Previous waypoint must be checked in
3. ✅ **Location verification** - User must be near the waypoint

### User Experience
- Before starting route: Check-in buttons are functional but show warning
- Warning message if attempting to check in before starting:
  > ⚠️ 請先點擊「開始路線」按鈕才能開始打卡！
  > (Please click the "Start Route" button first before checking in!)

- After starting route: Check-in proceeds normally with sequential validation

### Benefits
- ✅ Ensures accurate route timing
- ✅ Prevents accidental check-ins
- ✅ Enforces proper application flow
- ✅ Clear user guidance
- ✅ Better data consistency

---

## 繁體中文

### 功能說明
此功能確保使用者必須先點擊「開始路線」按鈕，才能在任何景點打卡。這強制執行應用程式的正確流程，並確保路線計時的準確性。

### 實現細節

#### 修改的檔案
1. **next/components/waypoint-card.tsx**
   - 在 WaypointCardProps 介面中添加了 `isRouteStarted` 屬性
   - 在 `handleCheckIn` 函數中添加驗證邏輯，檢查路線是否已開始
   - 如果使用者在開始路線前嘗試打卡，顯示警告訊息

2. **next/components/route-detail.tsx**
   - 將 `isStarted` 狀態作為 `isRouteStarted` prop 傳遞給每個 WaypointCard 組件

### 使用者流程
1. 使用者選擇一條路線（T、A、I、P、E 或 I2）
2. 使用者查看路線詳情、地圖和景點列表
3. **使用者必須點擊「開始路線」按鈕**
4. 開始後，使用者才能開始在景點打卡
5. 使用者必須按順序打卡
6. 完成所有景點後，路線自動標記為完成

### 驗證規則（按檢查順序）
1. ✅ **路線必須已開始** - 使用者點擊了「開始路線」按鈕
2. ✅ **順序打卡** - 前一個景點必須已打卡
3. ✅ **位置驗證** - 使用者必須在景點附近

### 使用者體驗
- 開始路線前：打卡按鈕可用但會顯示警告
- 在開始路線前嘗試打卡時的警告訊息：
  > ⚠️ 請先點擊「開始路線」按鈕才能開始打卡！

- 開始路線後：打卡正常進行，並進行順序驗證

### 優勢
- ✅ 確保路線計時準確
- ✅ 防止意外打卡
- ✅ 強制執行正確的應用程式流程
- ✅ 清晰的使用者引導
- ✅ 更好的資料一致性

### 完整的打卡驗證流程

```
使用者點擊「打卡」按鈕
        ↓
1. 檢查：路線是否已開始？
   ❌ 否 → 顯示：「⚠️ 請先點擊『開始路線』按鈕才能開始打卡！」
   ✅ 是 → 繼續
        ↓
2. 檢查：前一個景點是否已打卡？（第一個景點除外）
   ❌ 否 → 顯示：「⚠️ 請先完成第 X 個景點的打卡！請依照順序進行打卡。」
   ✅ 是 → 繼續
        ↓
3. 獲取使用者位置
   ❌ 失敗 → 顯示位置錯誤訊息
   ✅ 成功 → 繼續
        ↓
4. 驗證位置（呼叫後端 API）
   ❌ 失敗 → 顯示距離過遠訊息
   ✅ 成功 → 打卡成功！
        ↓
5. 更新打卡狀態
   - 更新 localStorage
   - 更新 UI 顯示
   - 檢查是否完成所有景點
```

### Code Example / 代碼示例

```typescript
// In WaypointCard - Complete validation logic
const handleCheckIn = async () => {
  // 1. Check if route has been started
  if (!isRouteStarted) {
    setCheckInMessage('⚠️ 請先點擊「開始路線」按鈕才能開始打卡！');
    return;
  }
  
  // 2. Check if previous waypoint is checked in
  if (!isPreviousCheckedIn && index > 1) {
    setCheckInMessage(`⚠️ 請先完成第 ${index - 1} 個景點的打卡！請依照順序進行打卡。`);
    return;
  }
  
  // 3. Continue with location verification and check-in...
  setCheckInMessage('正在獲取您的位置...');
  // ... rest of check-in logic
};
```

```typescript
// In RouteDetail - passing isRouteStarted prop
<WaypointCard
  key={waypoint.id}
  waypoint={waypoint}
  index={index + 1}
  shape={shape}
  userId={USER_ID}
  isCheckedIn={checkedInWaypoints.has(waypoint.id)}
  isCompleted={isCompleted}
  isPreviousCheckedIn={isPreviousCheckedIn}
  isRouteStarted={isStarted}  // ← New prop
  onCheckInSuccess={handleCheckInSuccess}
/>
```

### Testing / 測試

#### Test Case 1: Check-in without starting route / 未開始路線就打卡
**Steps:**
1. Open any route detail page
2. Try to check in at any waypoint WITHOUT clicking "開始路線"
3. Verify warning message appears

**Expected:**
- Warning: "⚠️ 請先點擊「開始路線」按鈕才能開始打卡！"
- No location verification starts
- Check-in is blocked

#### Test Case 2: Normal flow / 正常流程
**Steps:**
1. Open any route detail page
2. Click "開始路線" button
3. Check in at waypoints sequentially

**Expected:**
- Timer starts
- All check-ins proceed normally
- Progress updates correctly

#### Test Case 3: Route completion / 路線完成
**Steps:**
1. Start route
2. Complete all waypoints in order
3. Verify route completion

**Expected:**
- Route marked as completed
- Timer stops
- Completion message shows
- Certificate becomes available

### Browser Storage / 瀏覽器儲存

The following data is stored in localStorage:
- `route_{userId}_{shape}_started`: Whether route has been started
- `route_{userId}_{shape}_startTime`: When route was started
- `route_{userId}_{shape}_checkins`: Array of checked-in waypoint IDs
- `route_{userId}_{shape}_completed`: Whether route is completed
- `route_{userId}_{shape}_completedTime`: When route was completed
- `route_{userId}_{shape}_duration`: Total duration in hours

### Future Enhancements / 未來改進

Possible improvements:
- Add visual indicators (lock icons) on waypoints before route starts
- Disable check-in button visually before route starts
- Add progress bar showing overall completion percentage
- Add estimated time remaining based on current progress
- Add achievements/badges for completing routes

