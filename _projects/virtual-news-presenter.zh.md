---
date: "2023-07-01T11:50:54.000Z"
title: AI 總編輯與虛擬新聞主播
tagline: >-
  以人工智慧為核心、產出台灣華語新聞的自動化生產 pipeline
preview: >-
  一個想把青少年的注意力拉回重要社會議題的專案，靠的是 AI 驅動的自然語言處理技術。
image: /images/projects/virtual-news-presenter.png
links:
  [
    { name: GitHub, url: https://github.com/iridiumtao/Virtual-to-News-Public },
    { name: YouTube, url: https://www.youtube.com/watch?v=3Q2J9J9Q6Zg },
  ]
---

### 重點

- 運用 Google Trends 與自然語言處理（CKIP Transformers、TextRank、TF-IDF、BERT）找出每週的熱門話題，並研究、設計出彙整新聞稿的方法
- 打造系統基礎設施，以 Docker 和 Flask 設計出一條 pipeline，把五個開源專案整合起來，兼顧專案完整性、資料傳遞效率，以及日後繼續開發的可能

### 貢獻

研究並設計彙整新聞稿的方法，導入 Docker 做到快速部署，把 2 小時的手動部署縮到 20 分鐘自動完成，並設計出一條 pipeline，用管線式架構整合五個開源專案，兼顧專案完整性、資料傳遞與日後開發的可能。

### 獲獎

- 國立臺中科技大學資訊與流通學院專題競賽首獎
- 日本東京第 13 屆 International Conference on Frontier Computing 的 Fi-Award 2023 新興科技應用獎

## 細節

- 「AI 總編輯」會從各個網站蒐集新聞、彙整不同觀點，再重組成新的報導，靠的是網路爬蟲、自然語言處理（CKIP Transformers、TextRank、TF-IDF、BERT）與 Google Trends
- 「虛擬新聞主播」會產出可愛動漫角色播報新聞的影片，讓看新聞這件事變得有趣，用到語音合成、對嘴、臉部特徵點估測，以及搭配 Unity 的 Live2d
- 技能：專案管理 · 自然語言處理（NLP）· Docker 相關產品 · Python（程式語言）

### 架構

![Architecture](https://github.com/iridiumtao/Virtual-to-News-Public/assets/43561001/29602cc3-2313-41e4-848d-9c8707ae700f)
