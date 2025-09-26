---
date: '2025-5-12T11:50:54.000Z'
title: Taiwanese-Hokkien medical LLM
tagline: >-
  Fine-tuned with LoRA and delivered through a fully containerized, human-in-the-loop MLOps stack
preview: >-
  Fine-tuned with LoRA and delivered through a fully containerized, human-in-the-loop MLOps stack
image: >-
  https://raw.githubusercontent.com/iridiumtao/Fine-Tuning-Taiwanese-Hokkien-LLM-for-Medical-Advising/refs/heads/main/docs/project_diagram.png
links: [
  {name: GitHub, url: https://github.com/iridiumtao/Fine-Tuning-Taiwanese-Hokkien-LLM-for-Medical-Advising},
  {name: DeepWiki, url: https://deepwiki.com/iridiumtao/Fine-Tuning-Taiwanese-Hokkien-LLM-for-Medical-Advising}
]
---
Taiwan’s Taiwanese-Hokkien medical LLM, fine-tuned with LoRA and delivered through a fully containerized, human-in-the-loop MLOps stack.


## Overview

We built an end-to-end pipeline that transforms an 8B-parameter Llama-3.1 model into a culturally aligned medical advisor in Taiwanese Hokkien. The two-stage fine-tuning workflow (medical domain -> Hokkien dialect) uses parameter-efficient LoRA adapters, containerized deployment (FastAPI + Gradio + MinIO), and a doctor-review layer tracked with Prometheus/Grafana. 

## Features

* LoRA-based parameter-efficient fine-tuning (8-bit, fp16, gradient accumulation)
* Multi-dataset preprocessing (medical QA ➜ instruction pairs; Hokkien corpora ➜ chat format)
* FastAPI REST API with GPU inference and confidence scoring
* Gradio chat UI with feedback hooks and MinIO-backed conversation logs
* Airflow-automated Label Studio review and feedback ingestion loop
* Prometheus/Grafana monitoring with alert thresholds on latency, errors, and GPU utilization
* Compliance guardrails: explicit “not a diagnosis” disclaimer and Taiwan FDA cybersecurity guidelines baked into release process

## Description

The project closes a critical accessibility gap for the ~70 % of Taiwanese who speak Hokkien by providing preliminary, dialect-specific medical advice online. A two-stage pipeline first specializes an 8 B Llama-3.1-TAIDE model on multiple-choice medical QA, then adapts it to Hokkien conversational patterns using ICorpus-100 and TAIDE-14 datasets. Parameter-efficient LoRA (r = 8, α = 16) trains < 1 % of weights under 8-bit quantization, dramatically shrinking compute needs. The service ships as a GPU-accelerated Docker compose stack (FastAPI inference, Gradio UI, MinIO storage) running on Chameleon Cloud, with Prometheus/Grafana dashboards and an Airflow-driven Label-Studio review loop that lets clinicians vet every answer for safety and Taiwan FDA SaMD compliance before release.

## Key points

* **Cut trainable parameters by ~99 %** using LoRA adapters (0.1 – 1 % of weights), enabling 8B model fine-tuning on A100 GPUs.
* **Two-stage curriculum**: Stage 1 medical QA ➜ Stage 2 Hokkien domain, preserving domain expertise while adding dialect fluency.
* **Full MLOps stack in Docker Compose** (FastAPI, Gradio, MinIO) deployable with one command; GPU auto-discovery for inference scaling.
* **Human-approval workflow** with Airflow pipelines and Label Studio ensures clinician sign-off before answers reach users, satisfying Taiwan FDA AI/ML SaMD guidance.
* **Observability-first design**: Prometheus metrics and Grafana dashboards track P50/P95 latency, throughput, and error budgets for continuous reliability checks.
