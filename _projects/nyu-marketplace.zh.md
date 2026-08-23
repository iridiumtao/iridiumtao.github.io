---
date: "2025-09-02T00:00:00.000Z"
title: NYU Marketplace
tagline: >-
  一個校園二手市集，通過驗證的 NYU 學生在這裡買賣教科書、家具與 3C 用品。
preview: >-
  一個只開放給 NYU 學生的校園二手市集，以 Django 和 Channels 打造，並透過 Travis CI 的流程把每一個通過審查的 PR 自動部署到 AWS Elastic Beanstalk。
image: /images/projects/nyu-marketplace.png
links:
  [{ name: GitHub, url: https://github.com/iridiumtao/NYU-Marketplace }]
---

<!-- SCAFFOLD — the owner writes the real copy. Sourced from the résumé entry
     and the product's own landing page; nothing invented, nothing final.
     Replace it, then delete this comment. -->

NYU Marketplace 是一個只給 NYU 學生用的校園買賣平台：教科書、家具、3C，還有每學期末總會換手的那些東西。所有刊登只有通過驗證的校內成員看得到，所以每一筆交易的起點，都是一個和你共享同一座校園的人。

這是為紐約大學實務軟體工程課程做的專案，指導教授為 Gennadiy Civil（兼任教授，同時是 Google 資深工程經理）。

## 概覽

TODO — 團隊當初想解決的問題，以及為什麼「校園限定」是對的形狀。

## 功能

- **瀏覽與搜尋刊登：** 一路篩到真正想要的那一件。
- **刊登與管理：** 貼出物品，在 My Listings 裡追蹤，一路走到 My Orders。
- **即時訊息：** 買賣雙方直接在 WebSocket 通道上談，不必先交換聯絡方式。
- **學生身分驗證：** 只有確認過的 NYU 帳號才能刊登或購買。
- **收藏與通知：** 先盯著一件商品，不必急著決定。

## 重點

- 以 Travis CI 和 AWS Elastic Beanstalk 建立 CI/CD pipeline，設下嚴格的合併門檻（linting、85% 以上測試覆蓋率），每一個通過審查的 PR 都自動部署。
- 用 Django 5 和 Channels 開發能擴展的 RESTful 與即時 WebSocket API，並擔任主要的程式碼審查者，在團隊裡把關系統設計與程式碼品質。
