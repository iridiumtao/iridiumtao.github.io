---
date: '2025-7-12T11:50:54.000Z'
title: Oblivilight - OpenHCI'25
tagline: >-
  AI-powered HCI lamp
preview: >-
  An AI-powered smart lamp that transforms nightly voice conversations into tangible memories you can choose to keep or physically discard, ensuring digital privacy.
image: >-
  https://raw.githubusercontent.com/iridiumtao/OpenHCI25-Oblivilight/refs/heads/main/docs/Cover.png?raw=true
links: [
  {name: GitHub, url: https://github.com/iridiumtao/OpenHCI25-Oblivilight}, 
]
---

Oblivilight is a human-computer interaction project designed to address the growing anxiety around AI data permanence. It functions as an intelligent night lamp that provides a safe, ephemeral space for users to voice their thoughts and emotions. By converting conversations into physical paper notes at the end of a session, it gives users tangible control over their personal data, turning the act of "forgetting" into a meaningful, physical ritual.

The project's innovative approach was recognized with the Best Demo Award at OpenHCI'25, where it was also the only project selected for presentation at the TAICHI'25 conference.


## Overview

In an era where personal AI companions collect vast amounts of user data, Oblivilight explores a new paradigm of privacy-centric interaction. This project addresses the user's need for a safe emotional outlet without creating a permanent digital record that could be misinterpreted or misused. Oblivilight is an AI-powered night lamp that engages users in conversation, visualizing the emotional tone of the discussion through ambient colored light. Users can instantly erase parts of a conversation with a simple hand gesture. At the end of the session, the lamp prints a physical summary of the dialogue on a small note, effectively transferring the memory from a vulnerable digital state to a private, tangible artifact. This tangible interaction model empowers users with complete control, transforming data deletion into a deliberate and therapeutic ritual of letting go.

## Key Points


* Led a user-centric design process from research to prototype, identifying a key user need for tangible, privacy-preserving "forgetting mechanisms" in AI companions through 11 user interviews and secondary research.
* Architected a full-stack proof-of-concept integrating an LLM for conversation, emotion analysis, and a multi-modal interface with voice (Whisper/TTS) and gesture controls.
* Designed a novel interaction model that visualizes emotional sentiment as colored light and externalizes digital conversations into physical artifacts via a thermal printer, directly addressing AI data permanence anxiety.


### Features

* **Voice-Activated Dialogue:** Users can initiate conversations naturally to share their thoughts and feelings before sleep. 
* **Real-time Emotion Visualization:** The lamp’s light shifts in color and intensity to reflect the emotional sentiment of the user's voice, providing empathetic, non-verbal feedback. 
* **Gesture-Based Deletion:** A simple wave of the hand over the lamp erases the current part of the conversation, offering immediate, intuitive control over the AI’s memory. 
* **Tangible Memory Creation:** At the end of a session (e.g., saying "Goodnight"), the lamp prints a physical "memory slip" containing a summary of the conversation, the date, and a visual of the emotional lightscape. 
* **Privacy-by-Design:** Once the memory is printed, it is wiped from the system, ensuring the user's thoughts remain private and under their physical control. 
* **Physical Memory Archive:** Users can choose to discard the printed notes or save them in a physical journal, creating a tangible collection of memories they can review offline. 