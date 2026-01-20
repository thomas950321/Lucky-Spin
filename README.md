# 🎰 Lucky Spin - Raffle Royale (豪華抽獎系統)

這是一個專為活動、尾牙、派對設計的**高質感即時抽獎系統**。
採用 **WebSocket (Socket.io)** 技術確保零延遲互動，並整合 **LINE Login** 與 **Supabase** 資料庫，提供流暢且穩定的使用者體驗。

---

## ✨ 核心特色 (Features)

*   **🔒 LINE Login 整合**: 參與者無需手動輸入資料，使用 LINE 帳號一鍵登入，自動獲取暱稱與頭像。
*   **📡 即時同步 (Real-time)**: 手機端加入後，大螢幕毫秒級同步顯示。
*   **🎨 奢華視覺設計**: 採用賭場風格 (Casino Style) 的視覺特效，包含動態光影、粒子特效與精緻轉盤。
*   **💾 雲端資料庫 (Supabase)**: 完整記錄參與者名單與歷史中獎紀錄，重整頁面不丟失資料。
*   **🎯 精準控制**: 後台管理員可隨時重置各項狀態，並精準控制抽獎流程。

---

## 🔗 三大核心介面 (Pages)

### 1. 🖥️ 大螢幕顯示 (Big Screen)
*   **連結**: `http://localhost:3000/`
*   **用途**: 現場投影用 (Main Display)。
*   **功能**:
    *   動態展示所有參與者。
    *   3D 視覺轉盤抽獎動畫。
    *   中獎者慶祝特效與歷史榜單 (Winner Sidebar)。

### 2. 📱 參與者加入 (Mobile Join)
*   **連結**: `http://localhost:3000/#/join`
*   **用途**: 參與者掃碼進入。
*   **功能**:
    *   支援 LINE 登入 (LINE Login) 或訪客模式。
    *   登入成功後即時顯示連線狀態。

### 3. ⚙️ 後臺管理 (Admin Panel)
*   **連結**: `http://localhost:3000/#/admin`
*   **用途**: 活動控台 (Control Center)。
*   **功能**:
    *   **Start Draw**: 啟動轉盤。
    *   **Reset Game**: 清空參與者與歷史紀錄 (需雙重確認)。
    *   **Dashboard**: 即時監控上線人數。
    *   **Security**: 密碼保護 (預設 `admin123`)。

---

## 🚀 快速啟動 (Quick Start)

### 1. 安裝依賴 (Install)
```bash
npm install
```

### 2. 設定環境變數 (.env)
請在專案根目錄建立 `.env` 檔案，並填入以下資訊：

```properties
# Server Port
PORT=4000
FRONTEND_URL=http://localhost:3000

# Security
ADMIN_PASSWORD=admin123

# LINE Login (Required for Auth)
LINE_CHANNEL_ID=你的ChannelID
LINE_CHANNEL_SECRET=你的ChannelSecret
LINE_CALLBACK_URL=http://localhost:4000/api/auth/line/callback

# Supabase (Database)
SUPABASE_URL=你的SupabaseURL
SUPABASE_KEY=你的SupabaseAnonKey
```

### 3. 啟動開發伺服器 (Dev)
同時啟動前端 (Vite) 與後端 (Express)：
```bash
npm run dev
```
*   前端: `http://localhost:3000`
*   後端: `http://localhost:4000`

---

## 🛠️ 技術棧 (Tech Stack)

*   **Frontend**: React 18, Vite, TailwindCSS (Styling), Framer Motion (Animations)
*   **Backend**: Node.js, Express
*   **Communication**: Socket.io (WebSocket)
*   **Database**: Supabase (PostgreSQL)
*   **Auth**: LINE Login API (OAuth 2.0)
*   **Language**: TypeScript

## 📝 部署注意事項 (Deployment)
1.  **Callback URL**: 部署到雲端 (如 Render/Vercel) 後，記得去 [LINE Developers Console](https://developers.line.biz/) 更新 Callback URL 為您的正式網域。
    *   範例: `https://your-app.onrender.com/api/auth/line/callback`
2.  **Environment**: 確保雲端平台設定了所有必要的環境變數。