
# 🎰 RaffleRoyale

一個即時互動的幸運抽獎系統，支援多裝置連線、手機加入與大螢幕轉盤動畫。適合尾牙、活動或派對使用。

![Project Preview](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6) 
<!-- 您可以在此處替換為實際的截圖 -->

## ✨ 特色功能

- **📱 手機掃碼加入**：參與者無需下載 App，透過瀏覽器輸入網址即可加入。
- **🎡 即時幸運轉盤**：大螢幕顯示動態生成的轉盤，區塊依人數自動調整。
- **⚡ Real-time WebSocket**：使用 Socket.io 打造，所有動作（加入、開始、重置）皆為毫秒級同步。
- **🎛️ 管理後台**：專屬管理介面，可控制抽獎流程、重置遊戲。
- **🚀 部署就緒**：已配置好 Node.js Server 與靜態檔案服務，可直接部署至 Render / Railway / Vercel。

## 🛠️ 技術棧

- **Frontend**: React 19, Vite, TailwindCSS, Canvas Confetti
- **Backend**: Node.js, Express, Socket.io
- **Language**: TypeScript

## 🚀 快速開始 (Quick Start)

### 1. 安裝依賴
```bash
npm install
```

### 2. 開發模式 (Development)
同時啟動後端 (Port 4000) 與前端 (Port 3000)，支援熱更新。
```bash
npm run dev
```
- **大螢幕**: [http://localhost:3000](http://localhost:3000)
- **加入頁面**: [http://localhost:3000/#/join](http://localhost:3000/#/join)
- **管理後台**: [http://localhost:3000/#/admin](http://localhost:3000/#/admin)

### 3. 生產環境 (Production)
建置並啟動單一服務 (適合部署)。
```bash
npm run build
npm start
```
- 伺服器將運行於 `http://localhost:4000`

## 📦 部署指南

本專案已設定好 `start` 腳本，可直接部署至支援 Node.js 的平台。

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Port**: 程式會自動讀取 `process.env.PORT`。

## 📝 使用說明

1. **準備階段**：
   - 將「大螢幕」投影至現場螢幕。
   - 分享加入連結 (或製作 QR Code) 給參與者。
   - 管理員使用手機或電腦開啟「管理後台」。

2. **抽獎流程**：
   - 等待參與者加入，大螢幕會即時跳出頭像。
   - 管理員點擊 **START DRAW**。
   - 轉盤轉動，產出贏家！
   - 點擊 **RESET GAME** 開始下一輪。
