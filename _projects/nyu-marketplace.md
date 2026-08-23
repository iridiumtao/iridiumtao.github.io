---
date: "2025-09-02T00:00:00.000Z"
title: NYU Marketplace
tagline: >-
  A campus marketplace where verified NYU students buy and sell textbooks, furniture, and electronics.
preview: >-
  A student-only marketplace for the NYU campus, built with Django and Channels and shipped through a Travis CI pipeline that deploys every approved PR to AWS Elastic Beanstalk.
image: /images/projects/nyu-marketplace.png
links:
  [{ name: GitHub, url: https://github.com/iridiumtao/NYU-Marketplace }]
---

<!-- SCAFFOLD — the owner writes the real copy. Everything below is drawn from
     the existing résumé entry (data/portfolio.json → resume.projects) and the
     product's own landing page. Nothing here is invented; nothing here is
     final. Replace it, then delete this comment. -->

NYU Marketplace is a campus-only buy-and-sell platform for NYU students: textbooks, furniture, electronics, and everything else that changes hands at the end of a semester. Listings are visible only to verified members of the university, so a transaction starts with someone you already share a campus with.

It was built for Practical Software Engineering at NYU, advised by Professor Gennadiy Civil (Adjunct; Senior Engineering Manager at Google).

## Overview

TODO — the problem the team set out to solve, and why a campus-scoped marketplace was the right shape for it.

## Features

- **Browse and search listings** — filter down to the item you actually want.
- **Create and manage listings** — post an item, track it under My Listings, and follow it through to My Orders.
- **Real-time messaging** — buyers and sellers talk over a WebSocket channel rather than trading contact details.
- **Verified-student access** — only confirmed NYU accounts can list or buy.
- **Saved items and notifications** — keep an eye on a listing without committing to it.

## Key Points

- Architected a CI/CD pipeline on Travis CI and AWS Elastic Beanstalk with strict merge gates (linting, 85%+ test coverage), automating deployment on every approved PR.
- Built scalable RESTful and real-time WebSocket APIs with Django 5 and Channels, serving as lead code reviewer to enforce system design and clean code standards across the team.
