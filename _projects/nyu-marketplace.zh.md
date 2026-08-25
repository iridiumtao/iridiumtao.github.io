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

NYU Marketplace 是紐約大學實務軟體工程（Practical Software Engineering）課程的專案，由 Gennadiy Civil 教授（兼任教授，Google 資深工程經理）指導。這門課的授課模式比照真實工程團隊，實行每日立會和每週 Demo 和 Retro。

## 我的角色

我在團隊中同時負責架構設計、後端開發、code review 與輪替性質的 Scrum Master。我在專案中擁有完整的端到端掌控：Django 後端功能、驗證機制、OTP、即時通訊、REST API、Travis CI pipeline、開發與正式 AWS 環境、secret 管理、以及團隊的 pull request。

## 重點   

- 在 Travis CI 與 AWS Elastic Beanstalk 上**設計了整條 CI/CD pipeline**，設有嚴格的合併門檻（linting 與 85% 以上測試覆蓋率），每一個通過審核的 PR 都自動部署。
- 以 Django 5 和 Channels **建構了可擴展的 RESTful 與即時 WebSocket API**，涵蓋身份驗證、OTP 驗證、路由與即時通訊功能。
- 加入 pytest 與 Vitest 來**落實品質標準**，設定 pipeline 在任何 check 失敗時自動擋下 PR，並維持開發與正式環境的一致性與妥善的 secret 管理。
- **主導 code review**，在每一個 PR 上檢查系統設計與程式碼品質。
