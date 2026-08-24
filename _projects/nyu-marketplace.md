---
date: "2025-12-15T11:50:54.000Z"
title: NYU Marketplace
tagline: >-
  Full-stack web app with industry-grade CI/CD, 85%+ test coverage gates, and automated AWS deployment
preview: >-
  Full-stack web app with industry-grade CI/CD, 85%+ test coverage gates, and automated AWS deployment
image: /images/projects/nyu-marketplace.jpg
links: []
---

A full-stack marketplace web application built to industry standards under the guidance of a Senior Engineering Manager at Google, emphasizing CI/CD rigor, automated testing, and production reliability.

## Overview

NYU Marketplace is a course project from Practical Software Engineering at New York University, advised by Professor Gennadiy Civil — an Adjunct Professor and Senior Engineering Manager at Google. The project was graded like a real engineering team, not a class assignment.

## My Role

I served as the infrastructure architect, backend developer, code reviewer, and scrum master for the team. What sets this project apart is end-to-end ownership: I touched every layer — Django backend features, authentication, OTP, real-time messaging, REST APIs, the Travis CI pipeline, the develop and production AWS environments, secret handling, and the team's pull requests. When something broke, there was no other layer to point at.

## Key Points

- **Architected the CI/CD pipeline** on Travis CI and AWS Elastic Beanstalk with strict merge gates (linting and 85%+ test coverage), automating deployment on every approved PR.
- **Built scalable RESTful and real-time WebSocket APIs** with Django 5 and Channels, handling authentication, OTP verification, routing, and real-time messaging.
- **Enforced quality standards** by adding pytest and Vitest, configuring the pipeline to automatically block any PR when a check failed, and maintaining dev/production environment parity with proper secret management.
- **Led code reviews** across the entire codebase, ensuring the team's adherence to system design principles and clean code standards.
- **Production reliability:** across the full semester, the production environment went down only once — a credential issue caught after publishing.
