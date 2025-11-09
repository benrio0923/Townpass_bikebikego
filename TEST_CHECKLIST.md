# Test Checklist / 測試清單

## Feature: Route Start Required + Sequential Check-in / 功能：必須開始路線 + 順序打卡

### Pre-requisites / 前置條件
- [ ] Backend server is running at http://localhost:8000
- [ ] Frontend server is running at http://localhost:3000
- [ ] Browser location permission is enabled
- [ ] 後端伺服器運行於 http://localhost:8000
- [ ] 前端伺服器運行於 http://localhost:3000
- [ ] 瀏覽器位置權限已啟用

---

## Test Scenarios / 測試場景

### 🧪 Scenario 1: Attempt Check-in Before Starting Route
### 場景 1：在開始路線前嘗試打卡

**Steps / 步驟:**
1. Open http://localhost:3000
2. Click on any route (e.g., "第一週 T")
3. Scroll down to first waypoint
4. Click "打卡" button WITHOUT clicking "開始路線"

**Expected Result / 預期結果:**
- [ ] Warning message appears: "⚠️ 請先點擊「開始路線」按鈕才能開始打卡！"
- [ ] Message is styled with red background (bg-red-50 text-red-700)
- [ ] No location permission request
- [ ] No API call to backend
- [ ] 顯示警告訊息：「⚠️ 請先點擊『開始路線』按鈕才能開始打卡！」
- [ ] 訊息使用紅色背景樣式
- [ ] 不會請求位置權限
- [ ] 不會呼叫後端 API

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 🧪 Scenario 2: Start Route and Check-in at First Waypoint
### 場景 2：開始路線並在第一個景點打卡

**Steps / 步驟:**
1. Continue from Scenario 1 OR refresh page
2. Click "開始路線" (Start Route) button
3. Observe timer starts
4. Scroll to first waypoint
5. Click "打卡" button

**Expected Result / 預期結果:**
- [ ] Timer starts counting (00:00, 00:01, 00:02...)
- [ ] Timer display shows in blue card
- [ ] Browser asks for location permission
- [ ] Message shows: "正在獲取您的位置..."
- [ ] Then: "驗證位置中..."
- [ ] Finally: "✓ 打卡成功！距離景點 XX 公尺"
- [ ] Button changes from "打卡" to "已打卡" with checkmark
- [ ] Progress counter updates: (1/20)
- [ ] 計時器開始計數
- [ ] 瀏覽器請求位置權限
- [ ] 打卡流程正常進行
- [ ] 按鈕變更為「已打卡」
- [ ] 進度計數器更新

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 🧪 Scenario 3: Attempt to Skip Waypoint
### 場景 3：嘗試跳過景點

**Steps / 步驟:**
1. Continue from Scenario 2 (first waypoint checked in)
2. Scroll to THIRD waypoint (skip the second one)
3. Click "打卡" button on third waypoint

**Expected Result / 預期結果:**
- [ ] Warning message appears: "⚠️ 請先完成第 2 個景點的打卡！請依照順序進行打卡。"
- [ ] No location verification starts
- [ ] Second waypoint button still shows "打卡" (not checked in)
- [ ] Third waypoint button still shows "打卡" (not checked in)
- [ ] 顯示警告訊息要求先完成第 2 個景點
- [ ] 不會開始位置驗證
- [ ] 第二和第三個景點都未打卡

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 🧪 Scenario 4: Sequential Check-in (Happy Path)
### 場景 4：順序打卡（正常流程）

**Steps / 步驟:**
1. Continue from Scenario 2
2. Check in at waypoint 1 ✓
3. Check in at waypoint 2
4. Check in at waypoint 3
5. Check in at waypoint 4
6. Check in at waypoint 5

**Expected Result / 預期結果:**
- [ ] Each check-in succeeds in order
- [ ] Progress counter updates: (2/20), (3/20), (4/20), (5/20)
- [ ] Each waypoint button changes to "已打卡"
- [ ] Timer keeps running
- [ ] No warning messages
- [ ] 每個打卡都成功
- [ ] 進度正確更新
- [ ] 按鈕狀態正確更新
- [ ] 計時器持續運行

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 🧪 Scenario 5: Route Completion
### 場景 5：路線完成

**Steps / 步驟:**
1. Continue checking in all waypoints sequentially
2. Check in at the LAST waypoint
3. Observe automatic completion

**Expected Result / 預期結果:**
- [ ] After last check-in, route automatically completes
- [ ] Timer stops
- [ ] Completion message appears: "🎉 路線已完成！"
- [ ] Completion card shows:
  - [ ] Total duration in hours
  - [ ] Completion time
  - [ ] Message about certificate
- [ ] All waypoint buttons show "已打卡" with gray styling
- [ ] All waypoints have gray background (completed state)
- [ ] 路線自動標記為完成
- [ ] 計時器停止
- [ ] 顯示完成訊息
- [ ] 所有景點變成已完成樣式

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 🧪 Scenario 6: Persistence After Refresh
### 場景 6：刷新後的持久性

**Steps / 步驟:**
1. During an active route (with some waypoints checked in)
2. Refresh the page (F5 or Cmd+R)
3. Observe state restoration

**Expected Result / 預期結果:**
- [ ] Timer continues from where it left off
- [ ] All checked-in waypoints still show "已打卡"
- [ ] Progress counter shows correct count
- [ ] Route is still in "started" state
- [ ] Next unchecked waypoint is ready for check-in
- [ ] 計時器從之前的時間繼續
- [ ] 已打卡的景點保持已打卡狀態
- [ ] 進度計數器正確
- [ ] 路線保持開始狀態

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 🧪 Scenario 7: Multiple Routes Independence
### 場景 7：多路線獨立性

**Steps / 步驟:**
1. Start and partially complete Route T (第一週)
2. Go back to home page
3. Open Route A (第二週)
4. Observe clean state

**Expected Result / 預期結果:**
- [ ] Route A shows no waypoints checked in
- [ ] Route A timer is at 00:00
- [ ] Route A requires "開始路線" button click
- [ ] Route T progress is preserved (can verify by going back)
- [ ] Each route has independent localStorage keys
- [ ] 路線 A 顯示全新狀態
- [ ] 路線 T 的進度保留
- [ ] 每條路線互相獨立

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 🧪 Scenario 8: Completed Route Behavior
### 場景 8：已完成路線的行為

**Steps / 步驟:**
1. Complete an entire route
2. Try to click on waypoints again
3. Try to click "導航" button

**Expected Result / 預期結果:**
- [ ] All waypoint buttons show "已打卡" (disabled state)
- [ ] Gray styling applied to all waypoints
- [ ] Message shows: "✓ 路線已完成"
- [ ] "導航" button is disabled/grayed out
- [ ] No check-in is possible
- [ ] Cannot restart the route
- [ ] 所有景點顯示已完成
- [ ] 不能再次打卡
- [ ] 導航按鈕被禁用

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## UI/UX Checks / UI/UX 檢查

### Visual Elements / 視覺元素
- [ ] Warning messages are clearly visible
- [ ] Warning messages use appropriate colors (red for warnings)
- [ ] Success messages use green styling
- [ ] Timer is prominent and easy to read
- [ ] Progress counter is visible
- [ ] Button states are clear (打卡 vs 已打卡)
- [ ] 警告訊息清晰可見
- [ ] 顏色使用恰當
- [ ] 計時器顯眼易讀
- [ ] 按鈕狀態清晰

### Responsive Design / 響應式設計
- [ ] Works on mobile view (< 768px)
- [ ] Works on tablet view (768px - 1024px)
- [ ] Works on desktop view (> 1024px)
- [ ] Touch targets are large enough on mobile
- [ ] 手機版正常運作
- [ ] 平板版正常運作
- [ ] 桌面版正常運作

### Performance / 效能
- [ ] Page loads quickly
- [ ] Check-in response is fast
- [ ] No console errors
- [ ] No console warnings
- [ ] Timer updates smoothly (every second)
- [ ] 頁面載入快速
- [ ] 無控制台錯誤

---

## Browser Compatibility / 瀏覽器相容性

Test on the following browsers:

### Desktop Browsers / 桌面瀏覽器
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

### Mobile Browsers / 行動瀏覽器
- [ ] iOS Safari
- [ ] Chrome Mobile (Android)
- [ ] Samsung Internet
- [ ] Firefox Mobile

---

## Bug Reports / 錯誤報告

If any test fails, document here:

### Bug #1
**Scenario:** 
**Expected:** 
**Actual:** 
**Screenshots:** 
**Browser/Device:** 

### Bug #2
**Scenario:** 
**Expected:** 
**Actual:** 
**Screenshots:** 
**Browser/Device:** 

---

## Summary / 總結

**Date Tested:** _____________
**Tested By:** _____________
**Total Scenarios:** 8
**Passed:** ___ / 8
**Failed:** ___ / 8
**Overall Status:** ⬜ Pass | ⬜ Fail | ⬜ Partial Pass

**Notes:**

