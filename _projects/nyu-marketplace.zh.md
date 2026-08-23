---
date: "2025-12-15T11:50:54.000Z"
title: NYU Marketplace
tagline: >-
  以業界標準 CI/CD、85% 以上測試覆蓋率門檻與自動化 AWS 部署打造的全端網頁應用
preview: >-
  以業界標準 CI/CD、85% 以上測試覆蓋率門檻與自動化 AWS 部署打造的全端網頁應用
image: /images/projects/nyu-marketplace.jpg
links: []
---

在 Google 資深工程經理指導下，以業界標準打造的全端 Marketplace 網頁應用程式，強調 CI/CD 嚴謹度、自動化測試與正式環境的穩定性。

## 概覽

NYU Marketplace 是紐約大學實務軟體工程（Practical Software Engineering）課程的專案，由 Gennadiy Civil 教授（兼任教授，同時是 Google 資深工程經理）指導。這門課的評分標準比照真實工程團隊，不是一般課堂作業。整個學期下來，正式環境只出過一次問題，原因是一個上線前沒抓到的 credential 問題。

## 我的角色

我在團隊中同時擔任基礎架構設計者、後端開發者、首席 code reviewer 與 scrum master。這個專案不同於其他專案的地方在於端到端的掌控：Django 後端功能、驗證機制、OTP、即時通訊、REST API、Travis CI pipeline、開發與正式 AWS 環境、secret 管理、以及團隊的 pull request，每一層我都碰過。東西壞了的時候，沒有別的 layer 可以推。

## 重點

- 在 Travis CI 與 AWS Elastic Beanstalk 上**設計了整條 CI/CD pipeline**，設有嚴格的合併門檻（linting 與 85% 以上測試覆蓋率），每一個通過審核的 PR 都自動部署。
- 以 Django 5 和 Channels **建構了可擴展的 RESTful 與即時 WebSocket API**，涵蓋身份驗證、OTP 驗證、路由與即時通訊功能。
- 加入 pytest 與 Vitest 來**落實品質標準**，設定 pipeline 在任何 check 失敗時自動擋下 PR，並維持開發與正式環境的一致性與妥善的 secret 管理。
- **主導 code review**，確保團隊遵循系統設計原則與 clean code 標準。
- **正式環境穩定性：** 整個學期的正式環境只掛過一次——一個上線後才發現的 credential 問題。
