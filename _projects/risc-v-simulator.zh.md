---
date: "2024-12-12T11:50:54.000Z"
title: RISC-V 五階管線模擬器
tagline: >-
  用 Python 寫的五階管線 RISC-V 模擬器。
preview: >-
  以 Python 寫成的 RISC-V 模擬器，同時具備單階與五階管線架構，含危障偵測與效能分析。
image: /images/projects/risc-v-simulator.png
links:
  [
    { name: GitHub, url: https://github.com/iridiumtao/RISC-V-Simulator },
    { name: DeepWiki, url: https://deepwiki.com/iridiumtao/RISC-V-Simulator },
  ]
---

這個專案是我用 Python 從頭寫的模擬器，能把 RISC-V 組合語言程式同時跑在兩種處理器實作上：一顆單純的單階核心，和一顆最佳化過的五階管線核心。它會輸出詳細的效能指標（CPI/IPC）、記憶體傾印與暫存器狀態，用來分析並探索資料前遞、危障停頓、分支解出這些計算機結構的概念。

這是紐約大學電腦工程碩士（MSCE）計算機系統結構（CSA）課程的一部分。

## 概覽

我用 Python 開發這套 RISC-V 處理器模擬器，是為了實作並比較幾種基本的計算機結構設計。模擬器會把同一支 RISC-V 組合語言程式同時跑在非管線的單階處理器和五階管線處理器上，直接做效能分析。五階核心裡有一整套我自己設計的危障處理機制，包含處理資料危障的專用前遞單元、負責 load-use 停頓的危障偵測單元，以及提早解出分支以減輕控制危障的機制。模擬器會讀入二進位的指令與資料檔，跑完後產生暫存器狀態、最終記憶體內容，以及 CPI、IPC 等關鍵效能指標的詳細報告，是一個實際動手理解處理器效率與設計取捨的專案。

## 重點

- **設計**了雙核心的 RISC-V 處理器模擬器，以 Python 同時實作單階與五階管線兩種設計，用來分析並比較架構上的效能取捨。
- **打造**了五階管線的完整危障處理機制，包含專用的資料前遞單元、負責插入停頓的 load-use 危障偵測單元，以及在 ID 階段就提早解出分支結果的分支前遞單元，把控制危障降到最低。
- **開發**了平行模擬流程，讓同一支 RISC-V 程式同時在兩顆核心上執行，確保輸出與效能指標能準確地並排比較。
- **建立**了自動化的效能分析模組，計算並輸出各處理器核心的關鍵指標，包括總週期數、每週期指令數（IPC）與每指令週期數（CPI）。

## 功能

- **雙架構模擬**：同時執行並比較 `SingleStageCore`（非管線）與 `FiveStageCore`（管線）。
- **管線執行**：五階核心實作了經典的 IF、ID、EX、MEM、WB 五個階段，並以管線暫存器管理狀態。
- **危障偵測與前遞**：內含 `ForwardingUnit`、`HazardDetectionUnit`、`BranchForwardingUnit` 等單元，用來化解資料危障與控制危障。
- **記憶體系統**：兩顆核心共用指令記憶體，但各自持有獨立的資料記憶體實例，好分別驗證各自的執行結果。
- **詳細輸出**：產生詳細的輸出檔供驗證與分析，包括管線狀態（`StateResult.txt`）、暫存器檔內容（`RFResult.txt`）、最終資料記憶體（`DMEMResult.txt`）與效能指標（`PerformanceMetrics_Result.txt`）。
- **可設定的 I/O**：從使用者指定目錄下的標準二進位檔（`imem.txt`、`dmem.txt`）讀取指令與資料記憶體。

## 電路圖

### 單階

![Schematic RISCV Project Single Stage.png](https://github.com/iridiumtao/RISC-V-Simulator/blob/master/docs/Schematic%20RISCV%20Project%20Single%20Stage.png?raw=true)
電路圖改自[教科書](##Reference)圖 4.25

**說明：**

模擬器依循《Computer Organization and Design RISC-V Edition》第二版裡的 Simple Implementation Scheme 設計。為了用上管線與 State 類別，我實作了第 4.7 節提到的管線暫存器與 Pipelined Control。
不過 BNE 和 JAL 指令沒辦法用 Simple Implementation Scheme 做出來。所以相較於教科書圖 4.25 的單階資料路徑，我做了以下修改來補齊功能：

- 加了 2 個控制訊號（ALUSrcA、JAL）
- 加了 1 個 MUX（ALU 輸入 A）
- 加了 2 個邏輯閘（XOR、OR）
- 改了一個 MUX（ALU 輸入 B）
- 把 PC 接到 MUX（ALU 輸入 A），並把 instruction[12] 接到 XOR 閘。

### 五階

![Schematic RISCV Project Five Stage.png](https://github.com/iridiumtao/RISC-V-Simulator/blob/master/docs/Schematic%20RISCV%20Project%20Five%20Stage.png?raw=true)
改自[教科書](##Reference)圖 4.62

**說明：**

五階的機器裡，我加上前遞單元與危障控制單元，處理多階管線帶進來的危障。控制單元和 PCSrc（由 3 個邏輯閘的結果決定）的設計我維持原樣，但把分支條件的判斷從 EX 階段搬到 ID 階段，其他部分因此大幅改動。另外我也做了一個專用的前遞單元，處理分支判斷所需的輸入來源選擇。
