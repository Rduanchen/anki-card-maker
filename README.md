# 🎴 Anki Card Maker (Anki 單字卡製作工具)

[![Electron](https://img.shields.io/badge/Electron-v39.2-3178C6?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Naive UI](https://img.shields.io/badge/Naive_UI-v2.44-18a058?logo=naiveui&logoColor=white)](https://www.naiveui.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

一個極致美觀、高效且現代化的 **Electron** 案頭應用程式，專為英語學習者設計，可自動查詢單字並一鍵匯出至 **Anki** 製作高品質學習卡片。

---

## ✨ 核心特色 (Key Features)

### 1. 🔍 多行單字批次查詢與自動補全 (Batch Query & Auto-complete)
* **批次查詢**：支援在多行輸入框內輸入多個單字（由換行符號分隔），一鍵送出批次查詢。
* **智慧補全**：整合 Auto-complete 自動下拉選單，支援鍵盤方向鍵 (`↑` / `↓`) 與 `Enter` 快速選取單字。
* **錯誤標示**：輸入無效或不存在的單字時，會以**紅色底線**及錯誤訊息即時提示，防止送出無效單字。

### 2. 📖 精準的 Cambridge 字典解析 (Cambridge Dictionary Scraper)
* 內建精準的 Cambridge Dictionary 解析器，能精確擷取多種詞性（如 `noun`、`verb`、`adjective` 等）。
* 自動抓取**英/美式發音音標**、**中文解釋**、以及**實用例句**。

### 3. 🌐 yank-connect 自動同步 (AnkiConnect Integration)
* 深度整合 **AnkiConnect** API（使用 `yanki-connect` 套件）。
* 支援自訂 Anki 牌組 (Deck)、卡片模板 (Model)、欄位對應及自訂標籤 (Tags)。
* 支援單字與解釋的一鍵批次匯出，讓建卡流程在幾秒鐘內搞定！

### 4. 🗂️ 歷史紀錄與管理 (History Tracking)
* 自動儲存查詢歷史，方便隨時複習與重新匯出，避免重複查詢。

### 5. 🎨 頂級視覺設計與使用者體驗 (Premium UI/UX)
* **極致美觀**：採用 Naive UI 元件庫搭配精緻的客製化 CSS，打造流暢且極具現代感的 UI。
* **深/淺色模式**：一鍵無縫切換深色與淺色主題。
* **多國語系 (i18n)**：完整支援**繁體中文 (zh-TW)** 與 **英文 (en-US)** 介面。

---

## 🛠️ 技術棧 (Technology Stack)

* **核心框架**：Electron + Vite + Vue 3 (Composition API, `<script setup>`)
* **程式語言**：TypeScript
* **UI 元件庫**：Naive UI
* **資料擷取**：Axios + Cheerio (後端 HTML 解析)
* **語系管理**：Vue I18n
* **Anki 對接**：yanki-connect (AnkiConnect)

---

## 🚀 專案開發與建置 (Project Setup & Run)

### 📋 事前準備

1. 安裝 [Node.js](https://nodejs.org/) (建議 v18 以上)。
2. 若要使用匯出功能，請確保您的電腦已啟動 **Anki** 並安裝了 **[AnkiConnect](https://ankiweb.net/shared/info/2055492159)** 插件。

### 1. 安裝依賴項目

```bash
npm install
```

### 2. 啟動開發伺服器

執行以下指令啟動 Electron 應用程式的開發環境（支援 HMR 熱重載）：

```bash
npm run dev
```

### 3. 靜態類型檢查 (Type Check)

```bash
npm run typecheck
```

### 4. 打包建置發行版本

```bash
# 針對 Windows 平台打包
npm run build:win

# 針對 macOS 平台打包
npm run build:mac

# 針對 Linux 平台打包
npm run build:linux
```

---

## 📁 專案結構 (Directory Structure)

```text
├── src/
│   ├── main/                 # Electron 主進程 (Main Process)
│   │   ├── dictionary/       # 字典解析邏輯 (如 Cambridge Parser)
│   │   └── index.ts          # 主進程進入點
│   │
│   ├── preload/              # 預載腳本 (Preload Scripts)
│   │
│   └── renderer/             # 渲染進程 (Vue 3 前端)
│       └── src/
│           ├── assets/       # 靜態資源與全域樣式
│           ├── components/   # 可複用元件 (如 DictionaryInput、SettingsModal)
│           ├── composables/  # 封裝的 Composition APIs (語言、狀態、設定等)
│           ├── i18n/         # 國際化多國語系設定 (zh-TW / en-US)
│           ├── views/        # 主要分頁 (Translator、History、AnkiExport)
│           ├── App.vue       # 主應用元件
│           └── main.ts       # 渲染進程進入點
```

---

## 📝 授權條款 (License)

本專案採用 **MIT License** 授權。
