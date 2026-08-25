---
date: "2025-7-12T11:50:54.000Z"
title: Oblivilight - OpenHCI'25
tagline: >-
  A privacy-focused AI-powered smart lamp that transforms nightly voice conversations into tangible memories.
preview: >-
  An AI-powered smart lamp that transforms nightly voice conversations into tangible memories you can choose to keep or physically discard.
image: /images/projects/openhci25-oblivilight.png
links:
  [{ name: GitHub, url: https://github.com/iridiumtao/OpenHCI25-Oblivilight }]
---

Oblivilight is a project from the OpenHCI’25 Human-Computer Interaction Workshop. The topic was "exploring forgetting-mechanism interaction design for intelligent systems." We built an AI night lamp that combines speech recognition, emotion analysis, LLM conversation, and gesture control, letting users talk to it before sleep to release their emotions. When a session ends, the lamp prints the conversation onto a memory slip and wipes all data from the system. The slip is the only record. Users can keep it or throw it away.

The project won the Best Demo Award at OpenHCI’25 and was the only one selected for presentation at TAICHI’25.

- User-centered design from research to prototype: secondary research (including an HBR report and Reddit forum analysis) plus 11 in-depth interviews to define a persona, POV, and HMW statements, then develop the product concept.
- Full-stack proof of concept integrating LLM conversation, speech recognition (Whisper) and synthesis (TTS), emotion analysis, gesture detection, and thermal printer output.
- A new interaction model: color-mapped light for emotion states, hand gestures for forgetting, and physical slips to transfer digital memories into the user’s hands.

## Research

Harvard Business Review’s *The 2025 Top 100 GenAI Use Case Report* identified "companionship and therapy" as the top generative AI application. We started there and studied what users need from a "forgetting" mechanism in AI companion scenarios.

Reddit showed widespread privacy concerns about AI journals. Users worried their personal data was being used to train algorithms, and asking ChatGPT to forget rarely produced satisfying results. We also interviewed 11 people who regularly use AI for emotional expression and found three things:

1. Users like recording their day before bed, treating the act of recording as a ritual
2. AI is a low-barrier emotional outlet, and users want to talk without pressure
3. Users want to keep some records to look back on and notice how they’ve changed

Interviews and secondary research pointed to the same pain point: after releasing their emotions, users can’t tell what the AI still remembers. They worry about conversations leaking or being used for marketing, about the AI forming biased impressions from too much data, about being labeled. The existing deletion tools lack both visibility and user agency.

## Design

Based on our research, we designed Oblivilight. The user flow:

1. **First use:** The user records a spoken self-introduction. The lamp stores only this as the basis for future conversations.
2. **Nightly conversation:** The user wakes the lamp and talks about their day. The light changes color in real time based on the emotion in their voice, with ten emotions each mapped to a different color.
3. **Gesture deletion:** If the user doesn’t want the AI to remember something mid-conversation, they wave their hand over the lamp. The color fades and the system progressively deletes that part of the conversation.
4. **End and print:** The user says "Goodnight." The lamp compiles the conversation and prints a memory slip with a conversation summary, the date, the most vivid light pattern from that session, and an encouraging message from the AI. Once printed, the data is cleared from the system.
5. **What happens to the slip:** It can go into the lamp’s memory archive or into the user’s own journal. When the archive fills up, the user sorts through it and tears up what they don’t want. To revisit a memory, they place the slip on the scanner at the top of the lamp to replay that day’s light patterns.

After the session ends, the lamp switches to a warm yellow light that slowly dims as the user falls asleep.

## My Contributions

Responsible for software design and implementation:

- Designed the overall system architecture, splitting the project into three layers (frontend projection, backend core service, and hardware gateway) communicating via WebSocket and HTTP API.
- Built the backend in Python / FastAPI, integrating a LangChain AI agent, real-time emotion analysis (GPT-4.1-nano/mini), speech-to-text (Whisper / Google Cloud STT), text-to-speech (Yating / OpenAI TTS-1-HD), and WebSocket push to the frontend for real-time light control.
- Designed the conversation state flow across five modes (wake, conversation, forget, rewind, sleep), including automatic diary summary generation and printer triggering at session end.
- Built the hardware gateway with a separated architecture to handle bidirectional serial communication between the Arduino and the backend, defining the protocol for translating sensor signals (touch, wave, cover) into API signals.
- Designed the memory management system: gesture-triggered progressive conversation deletion, diary generation with persistent storage, and RAG context injection so the AI can continue conversations based on past diary entries.
