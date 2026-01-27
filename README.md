# Lucky Spin - Raffle Royale (豪華抽獎系統)

這是一個專為活動、尾牙、派對設計的**高質感即時抽獎系統**。
採用 **WebSocket (Socket.io)** 技術確保零延遲互動，並整合 **LINE Login** 與 **Supabase** 資料庫，提供流暢且穩定的使用者體驗。

---

## ✨ 核心特色 (Features)

*   **🔒 LINE Login 整合**: 參與者無需手動輸入資料，使用 LINE 帳號一鍵登入，自動獲取暱稱與頭像。
*   **📡 即時同步 (Real-time)**: 手機端加入後，大螢幕毫秒級同步顯示。
*   **🎨 奢華視覺設計**: 採用賭場風格 (Casino Style) 的視覺特效，包含動態光影、粒子特效與精緻轉盤。
*   **💾 雲端資料庫 (Supabase)**: 完整記錄參與者名單與歷史中獎紀錄，重整頁面不丟失資料。
*   **🔄 多輪次抽獎 (Multi-Round)**: 支援「開啟新一輪」，保留參加者但重置中獎名單，並自動封存歷史紀錄。
*   **🎯 精準控制**: 後台管理員可隨時重置各項狀態，並精準控制抽獎流程。
*   **🤖 測試支持**: 後台內建機器人測試功能，方便開發與展示。

---

## 🔗 三大核心介面 (Pages)

### 1. 🖥️ 大螢幕顯示 (Big Screen)
*   **連結**: `http://localhost:3000/` (開發環境)
*   **用途**: 現場投影用 (Main Display)。
*   **功能**:
    *   動態展示所有參與者。
    *   精美轉盤抽獎動畫。
    *   中獎者慶祝特效與歷史榜單 (Winner Sidebar)。

### 2. 📱 參與者加入 (Mobile Join)
*   **連結**: `http://localhost:3000/#/join`
*   **用途**: 參與者掃碼進入。
*   **功能**:
    *   支援 LINE 登入 (LINE Login)。
    *   顯示個人抽獎狀態與即時同步。

### 3. ⚙️ 後臺管理 (Admin Panel)
*   **連結**: `http://localhost:3000/#/admin`
*   **用途**: 活動控台 (Control Center)。
*   **功能**:
    *   **Start Draw (開始抽獎)**: 啟動轉盤，自動過濾已中獎者。
    *   **Start New Round (開啟新一輪)**: 封存目前中獎紀錄並開啟新回合，保留參加者。
    *   **Reset Game (重置遊戲)**: 清空所有參加者與歷史紀錄。
    *   **Export (匯出)**: 支援匯出中獎名單為 CSV 檔案。

### 4. 📅 活動管理 (Event Manager)
*   **連結**: `http://localhost:3000/#/admin/events`
*   **用途**: 創建與管理多場獨立活動。

---

## 🏗️ 資料庫設定 (Database Setup)

請在 Supabase 執行 `schema.sql` 檔案內容來初始化資料表，包含 `events` 與 `participants`。

---

## 🚀 快速啟動 (Quick Start)

### 1. 安裝依賴 (Install)
```bash
npm install
```

### 2. 設定環境變數 (.env)
建立 `.env` 檔案並參考以下設定：
```properties
ADMIN_PASSWORD=your_password
PORT=4000
FRONTEND_URL=http://your-local-ip:3000

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# LINE Login
LINE_CHANNEL_ID=your_id
LINE_CHANNEL_SECRET=your_secret
LINE_CALLBACK_URL=http://your-local-ip:4000/api/auth/line/callback
```

### 3. 開發模式 (Dev)
```bash
npm run dev
```

---

## 🛠️ 技術棧 (Tech Stack)

*   **Frontend**: React, Vite, TailwindCSS, Framer Motion, Lucide React
*   **Backend**: Node.js, Express, Socket.io
*   **Database**: Supabase
*   **Auth**: LINE Login API
*   **Language**: TypeScript / JavaScript