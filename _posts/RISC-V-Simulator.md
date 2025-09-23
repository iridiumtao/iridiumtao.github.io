---
date: '2024-12-12T11:50:54.000Z'
title: RISC-V 5-Stage Pipelined Simulator
tagline: >-
  A 5-stage pipelined RISC-V Simulator written in Python.
preview: >-
  A Python-based RISC-V simulator with single-stage and five-stage pipelined architectures with hazard detection and performance analysis.
image: >-
  https://github.com/iridiumtao/RISC-V-Simulator/blob/master/docs/Schematic%20RISCV%20Project%20Five%20Stage.png?raw=true
links: [
  {name: GitHub, url: https://github.com/iridiumtao/RISC-V-Simulator}, 
]
---

This project is a custom-built simulator in Python that executes RISC-V assembly programs on two parallel processor implementations: a simple single-stage core and an optimized five-stage pipelined core. It provides detailed performance metrics (CPI/IPC), memory dumps, and register state outputs to analyze and explore computer architecture concepts like data forwarding, hazard stalls, and branch resolution.

This project is part of the NYU Master of Science in Computer Engineering (MSCE) course focused on Computing Systems Architecture (CSA).


## Overview

I developed the RISC-V Processor Simulator in Python to implement and compare fundamental computer architecture designs. The simulator simultaneously executes RISC-V assembly programs on both a non-pipelined, single-stage processor and a five-stage pipelined processor, enabling direct performance analysis. The five-stage core features a full hazard management system I engineered, including dedicated forwarding units for data hazards, a hazard detection unit for load-use stalls, and an early branch resolution mechanism to mitigate control hazards. The simulator reads binary instruction and data files, and upon completion, generates detailed reports on register states, final memory contents, and key performance metrics like CPI and IPC, serving as a hands-on project for understanding processor efficiency and design trade-offs.

## Key Points

* **Architected** a dual-core RISC-V processor simulator in Python, implementing both single-stage and five-stage pipelined designs to analyze and compare architectural performance trade-offs.
* **Engineered** a comprehensive hazard management system for the five-stage pipeline, featuring dedicated data forwarding units, a load-use hazard detection unit for stall insertion, and a branch forwarding unit with early resolution in the ID stage to minimize control hazards.
* **Developed** a parallel simulation workflow to execute identical RISC-V programs on both cores simultaneously, ensuring accurate, side-by-side comparison of outputs and performance metrics.
* **Built** an automated performance analysis module that calculates and reports key metrics, including total cycle count, instructions per cycle (IPC), and cycles per instruction (CPI) for each processor core.

***

## Features

* **Dual Architecture Simulation**: Simultaneously runs and compares a `SingleStageCore` (non-pipelined) and a `FiveStageCore` (pipelined).
* **Pipelined Execution**: The five-stage core implements the classic IF, ID, EX, MEM, and WB stages with pipeline registers for state management.
* **Hazard Detection & Forwarding**: Includes sophisticated units for mitigating data and control hazards, such as a `ForwardingUnit`, `HazardDetectionUnit`, and `BranchForwardingUnit`.
* **Memory System**: Utilizes shared instruction memory and separate data memory instances for independent validation of each core's execution results.
* **Comprehensive Output**: Generates detailed output files for validation and analysis, including pipeline states (`StateResult.txt`), register file contents (`RFResult.txt`), final data memory (`DMEMResult.txt`), and performance metrics (`PerformanceMetrics_Result.txt`).
* **Configurable I/O**: Reads instruction and data memory from standard binary files (`imem.txt`, `dmem.txt`) located in a user-specified directory.

## Schematic

### Single Stage

![Schematic RISCV Project Single Stage.png](https://github.com/iridiumtao/RISC-V-Simulator/blob/master/docs/Schematic%20RISCV%20Project%20Single%20Stage.png?raw=true)
Schematic modified from [Textbook](##Reference) Figure 4.25

**Description:**

The simulator was designed to follow the Simple Implementation Scheme from the textbook Computer Organization and Design RISC-V Edition 2nd. To utilize the pipeline and the State class, I implemented the pipeline registers and Pipelined Control mentioned in Chapter 4.7.
However, the BNE and JAL instructions are not achievable with the Simple Implementation Scheme. So, compared to the single stage datapath from the textbook Figure 4.25, I made the following changes to complete the functionality:
- added 2 control signals (ALUSrcA, JAL)
- added 1 MUX (ALU input A)
- added 2 gates (XOR, OR)
- modified a MUX (ALU input B)
- connected PC to a MUX(ALU input A) and instruction[12] to the XOR gate.

### Five Stage

![Schematic RISCV Project Five Stage.png](https://github.com/iridiumtao/RISC-V-Simulator/blob/master/docs/Schematic%20RISCV%20Project%20Five%20Stage.png?raw=true)
Modified from [Textbook](##Reference) Figure 4.62

**Description:**

In the Five-Stage machine, I added the forwarding unit and the hazard control unit to solve hazards introduced in the Mulit-stage pipeline. I kept the design of the control unit and PCSrc (from the result of 3 logic gates) and significantly modified other parts of the branch condition  by moving it from the EX stage to the ID stage. Additionally, I implemented a dedicated forwarding unit to handle branch decision input choices.
