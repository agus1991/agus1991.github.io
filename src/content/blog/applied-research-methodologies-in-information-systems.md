---
title: "Applied Research Methodologies in Information Systems: An Empirical Evidence-Based Guide to the DSRM Framework"
description: "A comprehensive treatise on Design Science Research Methodology (DSRM), analyzing desk rejection rates in computing publications, and providing operational guidelines across the six artifact engineering cycles."
pubDate: 2026-11-12
updatedDate: 2026-11-17
category: "Research"
tags:
  - Research
  - Methodology
  - DSRM
  - Information Systems
  - Academic Publishing
  - Evaluation Framework
featured: false
draft: false
cover: "/images/articles/metodologi-riset-dsrm.svg"
coverAlt: "Six-stage iterative cycle diagram of Design Science Research Methodology in information systems engineering"
seoTitle: "Applied Research Methodologies in Information Systems (DSRM) — MAS-AGUS"
seoDescription: "A comprehensive guide to applied information systems research using Design Science Research Methodology (DSRM) and rigorous empirical evaluation frameworks."
focusKeyword: "Information Systems Research Methodology DSRM"
lang: "en"
translationSlug: "metodologi-penelitian-terapan-dalam-bidang-sistem-informasi"
---

> **Academic & Methodological Overview:**  
> **Scope:** Computing Research Methodologies, Information Systems Epistemology, Design Science Research Methodology (DSRM), and Academic Artifact Evaluation Standards.  
> **Methodological Approach:** Epistemological Analysis, Systematic Literature Review, and Empirical Operationalization Guidelines.

---

## Introduction

The discipline of Information Systems (IS) occupies a unique epistemological intersection within computing sciences. It operates at the dynamic boundary between pure **Computer Science**—which investigates abstract algorithms, mathematical proofs, and computational complexity—and **Behavioral Science**, which examines organizational behavior and human-computer interactions [1][2].

While conventional behavioral science seeks to observe, understand, and predict natural or social reality (*to understand and explain reality*), applied research in information systems carries an inherently prescriptive mandate: **to design, engineer, and validate innovative solutions (*to create and change reality*)** that resolve pressing operational challenges across industry, governance, and civic society [3].

The global academic community, led by the Association for Information Systems (AIS), codified this paradigm as **Design Science Research (DSR)**, which achieved widespread operational clarity through the seminal framework established by Peffers et al. (2007): the **Design Science Research Methodology (DSRM)** [4]. Nevertheless, in academic theses and applied research laboratories, this methodology frequently suffers from severe and fatal misinterpretations.

---

## 1. The Publication Paradox: High Output vs. Alarmingly High Desk Rejection Rates

The landscape of applied information systems research in developing regions demonstrates a troubling paradox between the volume of technical manuscripts produced and the rigor of the scientific methodologies applied.

Editorial telemetry from reputable international journals (Scopus Q1/Q2) as well as premier national indexed publications reveals that **desk rejection rates for manuscripts titled around "system design and implementation" exceed 75%** [5][6].

```
                THE INFORMATION SYSTEMS RESEARCH PARADOX:
                
    [High Volume of "System Design & Build" Manuscripts]
                           │
                           ▼
    [Core Mistake: Treated as Routine Commercial Programming]
                           │
                           ▼
    [Absence of Theoretical Foundations & Rigorous Evaluation]
                           │
                           ▼
    [Desk Rejection Rate Exceeds 75% in Reputable Journals]
```

This paradox proves that authoring an applied scientific treatise cannot be equated with writing a commercial software deliverable report. Manuscripts that merely describe application features without formulating theoretical constructs and measuring empirical efficacy are routinely rejected for lacking scientific rigor and novelty [7].

---

## 2. Theoretical Foundations: "Routine Software Engineering" vs. "Design Science Research"

The root cause of academic rejection lies in the researcher's inability to distinguish between routine software engineering (*routine engineering/software development*) and authentic scientific design research (*Design Science Research*) [8][9]:

| Evaluation Parameter | Routine Software Engineering | Design Science Research (DSRM) |
| :--- | :--- | :--- |
| **Primary Focus** | Delivering a functional application for a client | Generating new scientific knowledge (*knowledge contribution*) |
| **Problem Approach** | Applying existing off-the-shelf best practices | Investigating unsolved, complex problem spaces |
| **Artifact Output** | Concrete source code / software executable | Computational Artifacts (Constructs, Models, Methods, Instantiations) |
| **Success Criteria** | Software runs according to functional specifications | Artifact efficacy proven through rigorous empirical evaluation |
| **Scientific Contribution** | Zero (purely commercial/practical) | Novel design theorizing and rigorous methodological adherence |

According to the foundational guidelines established by Hevner et al. (2004), research artifacts in DSR are not restricted to deployed code (*instantiations*), but encompass **Constructs** (taxonomies and vocabulary), **Models** (architectural representations and relational schemas), and **Methods** (algorithms, governance guidelines, or workflow protocols) [3][10].

---

## 3. Empirical Case Study: Three Methodological Traps in Academic Research

Through in-depth observations during thesis supervision of undergraduate and postgraduate researchers, as well as peer review duties for independent academic journals, three recurring methodological traps consistently emerge:

### A. Subjective Problem Formulation Without Empirical Evidence
Researchers frequently articulate problem statements founded entirely upon subjective assertions (e.g., *"Agency X requires a website because it currently lacks one"*), without presenting statistical data on operational latency, regulatory bottlenecks, or literature analyses detailing why predecessor systems failed.

### B. Superficial Testing Without Rigorous User Validation
The artifact evaluation stage frequently halts at internal black-box testing that merely confirms UI buttons trigger actions. Scientific evaluation demands assessing user adoption through psychometrically validated instruments (such as the *Technology Acceptance Model / TAM* or *UTAUT*), or objective performance profiling (*load testing*, *latency profiling*, and *stress testing*).

### C. Complete Absence of Scientific Novelty
Researchers often construct applications that merely duplicate mature commercial software without contributing architectural optimizations, novel resource efficiencies, or socio-technical adaptations tailored to unique institutional constraints.

---

## 4. Operational Solution: Implementing the Six Cycles of DSRM

To ensure applied research fulfills both academic rigor and enterprise relevance, researchers must systematically execute the six iterative cycles of the DSRM framework [4]:

```
SIX-STAGE DSRM ITERATIVE CYCLE (PEFFERS ET AL., 2007):

┌───────────────────────────────────────────────┐
│ 1. Problem Identification and Motivation      │
│    └─ Empirical data & literature citations   │
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐
│ 2. Define Objectives for a Solution           │
│    └─ Quantitative success metrics            │
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐ ◄───┐
│ 3. Design and Development                     │     │
│    └─ Constructs, Models, Methods, Prototypes │     │
└───────────────────────┬───────────────────────┘     │ Iterative
                        │                             │ Refinement
┌───────────────────────▼───────────────────────┐     │ Loop
│ 4. Demonstration                              │     │
│    └─ Pilot case study in real environment    │     │
└───────────────────────┬───────────────────────┘     │
                        │                             │
┌───────────────────────▼───────────────────────┐     │
│ 5. Evaluation                                 │ ────┘
│    └─ SEM-PLS, UAT, Performance Profiling     │
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐
│ 6. Communication                              │
│    └─ Peer-reviewed journal dissemination     │
└───────────────────────────────────────────────┘
```

### Actionable Execution Guidelines:

1. **Stage 1 — Problem Identification & Urgency**: Formulate the problem statement using quantified organizational data and synthesize academic literature to demonstrate the specific research gap.
2. **Stage 2 — Define Measurable Solution Objectives**: Establish specific, verifiable quantitative targets (e.g., reducing cross-agency data entry redundancy by 50%, or cutting Time to First Byte latency below 1 second).
3. **Stage 3 — Design & Artifact Development**: Engineer the computing artifact, justifying architectural choices through valid computer science and distributed systems theory (concrete enterprise patterns can be observed in our [SPBE REST API Architecture Integration Case Study](/en/blog/digital-transformation-in-information-systems-public-service-integration)).
4. **Stage 4 — Demonstration**: Deploy the prototype within a live pilot environment (such as a municipal agency or enterprise branch) to validate operational viability (*proof of concept*).
5. **Stage 5 — Rigorous Empirical Evaluation**: Measure artifact performance against the targets established in Stage 2, combining quantitative user psychometrics (*Structural Equation Modeling / SEM-PLS*) with technical benchmarking audits.
6. **Stage 6 — Academic Communication**: Disseminate the artifact's novelty and design principles within the standard IMRAD structure (*Introduction, Method, Results, and Discussion*) across high-impact academic publications.

---

## 5. Conclusion & Recommendations for Researchers

Disciplined execution of the Design Science Research Methodology (DSRM) represents the gold standard bridging academic inquiry with enterprise reality.

For computing scholars, graduate researchers, and systems architects, research is not merely the act of completing software code; it is the deliberate design of verifiable computational artifacts anchored in sound theory and validated through empirical measurement. Adherence to the DSRM cycle is the essential key to securing publication in prestigious journals, while serving as an indispensable compass for re-orienting academic research in the AI era, as explored in [Challenges for IT Educators in the Age of Artificial Intelligence](/en/blog/challenges-for-it-educators-in-the-age-of-artificial-intelligence).

---

## Academic References

[1] A. S. Lee, "Architecture as a frame for research on information systems," in *Information Systems: The Next Generation*, Berlin: Springer, 2001, pp. 1–15.  
[2] R. Baskerville, M. Kaul, and V. Storey, "Genres of inquiry in design-science research: Justification and evaluation of knowledge production," *MIS Quarterly*, vol. 39, no. 3, pp. 541–564, 2015.  
[3] A. R. Hevner, S. T. March, J. Park, and S. Ram, "Design science in information systems research," *MIS Quarterly*, vol. 28, no. 1, pp. 75–105, 2004.  
[4] K. Peffers, T. Tuunanen, M. A. Rothenberger, and S. Chatterjee, "A design science research methodology for information systems research," *Journal of Management Information Systems*, vol. 24, no. 3, pp. 45–77, 2007.  
[5] J. Webster and R. T. Watson, "Analyzing the past to prepare for the future: Writing a literature review," *MIS Quarterly*, vol. 26, no. 2, pp. xiii–xxiii, 2002.  
[6] Ministry of Education, Culture, Research, and Technology of Indonesia, *National Scientific Journal Accreditation Guidelines (SINTA)*, Jakarta: Ditjen Diktiristek, 2024.  
[7] D. Gregor and A. R. Hevner, "Positioning and presenting design science research for maximum impact," *MIS Quarterly*, vol. 37, no. 2, pp. 337–355, 2013.  
[8] S. T. March and G. F. Smith, "Design and natural science research on technology," *Decision Support Systems*, vol. 15, no. 4, pp. 251–266, 1995.  
[9] J. Iivari, "A paradigmatic analysis of information systems as a design science," *Scandinavian Journal of Information Systems*, vol. 19, no. 2, pp. 39–64, 2007.  
[10] S. Gregor and D. Jones, "The anatomy of a design theory," *Journal of the Association for Information Systems*, vol. 8, no. 5, pp. 312–335, 2007.  
[11] F. D. Davis, "Perceived usefulness, perceived ease of use, and user acceptance of information technology," *MIS Quarterly*, vol. 13, no. 3, pp. 319–340, 1989.  
[12] V. Venkatesh, M. G. Morris, G. B. Davis, and F. D. Davis, "User acceptance of information technology: Toward a unified view," *MIS Quarterly*, vol. 27, no. 3, pp. 425–478, 2003.
