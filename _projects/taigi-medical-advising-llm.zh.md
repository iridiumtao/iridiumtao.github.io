---
date: "2025-5-12T11:50:54.000Z"
title: 台語醫療 LLM
tagline: >-
  以 LoRA 微調，並透過完全容器化、有人參與其中的 MLOps 架構交付
preview: >-
  以 LoRA 微調，並透過完全容器化、有人參與其中的 MLOps 架構交付
image: /images/projects/taigi-medical-advising-llm.png
links:
  [
    {
      name: GitHub,
      url: https://github.com/iridiumtao/Fine-Tuning-Taiwanese-Hokkien-LLM-for-Medical-Advising,
    },
    {
      name: DeepWiki,
      url: https://deepwiki.com/iridiumtao/Fine-Tuning-Taiwanese-Hokkien-LLM-for-Medical-Advising,
    },
  ]
---

台灣的台語醫療 LLM，以 LoRA 微調，並透過完全容器化、有人參與其中的 MLOps 架構交付。

## 概覽

我們做了一條端到端的 pipeline，把 8B 參數的 Llama-3.1 模型變成一位貼近在地文化的台語醫療顧問。兩階段的微調流程（先醫療領域、再台語）採用參數高效的 LoRA adapter、容器化部署（FastAPI + Gradio + MinIO），以及一層由 Prometheus/Grafana 追蹤的醫師審閱機制。

## 功能

- 以 LoRA 做參數高效微調（8-bit、fp16、梯度累積）
- 多資料集前處理（醫療問答 ➜ 指令對；台語語料 ➜ 對話格式）
- FastAPI REST API，支援 GPU 推論與信心分數
- Gradio 對話介面，內建回饋掛勾與 MinIO 儲存的對話紀錄
- 由 Airflow 自動化的 Label Studio 審閱與回饋回收迴圈
- Prometheus/Grafana 監控，並針對延遲、錯誤與 GPU 使用率設有告警門檻
- 合規護欄：明確標示「本回覆不構成診斷」，並把台灣食藥署的資安指引納入釋出流程

## 說明

這個專案想補上一道關鍵的可及性缺口：台灣約有七成的人講台語，他們需要能在線上取得初步、且用自己語言說明的醫療建議。兩階段的 pipeline 先讓 8B 的 Llama-3.1-TAIDE 模型專精於選擇題式的醫療問答，再用 ICorpus-100 與 TAIDE-14 資料集把它調成貼近台語的對話語感。參數高效的 LoRA（r = 8、α = 16）在 8-bit 量化下只訓練不到 1% 的權重，大幅壓低了運算需求。整套服務以 GPU 加速的 Docker Compose 架構出貨（FastAPI 推論、Gradio 介面、MinIO 儲存），跑在 Chameleon Cloud 上，搭配 Prometheus/Grafana 儀表板，以及由 Airflow 驅動的 Label Studio 審閱迴圈，讓臨床醫師能在答案釋出前逐一把關安全性與台灣食藥署 SaMD 的合規要求。

## 重點

- 以 LoRA adapter（僅 0.1 – 1% 的權重）**把可訓練參數減少約 99%**，讓 8B 模型能在 A100 GPU 上完成微調。
- **兩階段課程**：第一階段醫療問答 ➜ 第二階段台語領域，在保住專業知識的同時補上方言的流暢度。
- **完整 MLOps 架構裝進 Docker Compose**（FastAPI、Gradio、MinIO），一行指令就能部署；GPU 自動探索讓推論能橫向擴展。
- **人工核可流程**以 Airflow pipeline 搭配 Label Studio，確保答案送到使用者面前前先經臨床醫師簽核，符合台灣食藥署對 AI/ML SaMD 的指引。
- **以可觀測性為先**：Prometheus 指標與 Grafana 儀表板追蹤 P50/P95 延遲、吞吐量與錯誤預算，持續盯著可靠度。
