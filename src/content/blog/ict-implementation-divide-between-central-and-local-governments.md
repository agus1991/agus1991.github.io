---
title: "The ICT Implementation Divide Between Central and Local Governments: Siloed Systems, Credential Fatigue, and SPBE Interoperability"
description: "A critical study on the digital divide between central ministries and regional administrations, analyzing vertical application sprawl in municipal agencies (OPD), and designing distributed network and API architectures for sustainable SPBE."
pubDate: 2026-11-17
updatedDate: 2026-11-17
category: "Information Systems"
tags:
  - SPBE
  - Digital Governance
  - Information Systems
  - Computer Networks
  - REST API
  - Enterprise Architecture
featured: true
draft: false
cover: "/images/articles/kesenjangan-ict-pusat-daerah.svg"
coverAlt: "Infographic comparing SPBE maturity index gap between central and local governments and data interoperability solutions"
seoTitle: "Central-Local Government ICT Divide: Siloed Systems & SPBE — MAS-AGUS"
seoDescription: "An in-depth analysis of ICT disparities between central ministries and regional governments, vertical application sprawl, and distributed integration architectures."
focusKeyword: "ICT Implementation Gap Central Local Government SPBE"
lang: "en"
translationSlug: "kesenjangan-penerapan-ict-di-pemerintah-pusat-dan-daerah"
---

> **Academic & Policy Overview:**  
> **Scope:** Information and Communication Technology (ICT) Governance, Electronic-Based Government System (SPBE), Digital Infrastructure Disparity, and Satu Data Indonesia (One Data) Mandates.  
> **Methodological Approach:** Public Policy Statutory Analysis, Comparative SPBE Maturity Benchmarking, Empirical Fieldwork, and Distributed Network Engineering.

---

## Introduction

The adoption of Information and Communication Technology (ICT) in public governance is universally recognized as a vital catalyst for bureaucratic efficiency, fiscal transparency, and civic service delivery [1][2]. In Indonesia, this transformation is orchestrated through the **Electronic-Based Government System (Sistem Pemerintahan Berbasis Elektronik / SPBE)**, established initially via **Presidential Instruction No. 3/2003** and reinforced by **Presidential Regulation No. 95/2018 on SPBE** alongside **Presidential Regulation No. 39/2019 on Satu Data Indonesia (SDI)** [3][4].

These legal mandates require the creation of an integrated, interoperable, and secure digital architecture designed to dismantle institutional data monopolies. The central government has formulated ambitious roadmaps spanning the National Data Center (Pusat Data Nasional / PDN), intra-governmental networks, and unified citizen digital service portals (GovTech) [4].

However, field empirical observations reveal a profound divide between computing capabilities at central ministries and operational realities across regencies and municipal agencies (Organisasi Perangkat Daerah / OPD). Rather than delivering seamless national interoperability, asymmetrical digitalization has triggered vertical software sprawl, administrative credential fatigue, and compounding budgetary waste at the grassroots level.

---

## 1. The Performance Paradox: Central Benchmarks vs. Regional Realities

Annual SPBE maturity assessments published by the Ministry of Administrative and Bureaucratic Reform (KemenPAN-RB) expose an acute disparity between aggregate scores at central ministries and performance across municipal regencies [5][6].

National composite evaluations reveal that the majority of central ministries and state agencies (K/L) achieve SPBE indices ranging between **3.50 and 4.20** (*"Very Good"* to *"Satisfactory"*). In contrast, more than **65% of regencies and municipalities outside Java's major metropolitan areas languish below 2.60**, receiving ratings of *"Fair"* or *"Deficient"* [5][7].

| Evaluation Dimension | Central Government (Ministries / K/L) | Regional Administrations (Regencies / Cities) |
| :--- | :--- | :--- |
| **SPBE Maturity Index** | Average **> 3.65** *(Rating: Very Good / Good)* | Average **< 2.50** *(Rating: Fair / Deficient)* |
| **Computing Capacity** | Direct National Data Center (PDN) & Cloud | Standalone Local Servers, Frequently Without UPS |
| **System Architecture** | Standardized Microservices & Managed APIs | Disconnected Sectoral Silos Without Data Bridges |
| **Human Resources** | Dedicated Systems Architects & Engineers | Critical Shortage of Certified Network Engineers |
| **Network Backhaul** | Multi-Gigabit Protected Fiber Backbones | Dependent on Unstable Consumer-Grade Broadband |

Data from Statistics Indonesia (BPS) and the Ministry of Communication and Digital Affairs (Komdigi) confirm that this gap is anchored in physical infrastructure and fiscal inequities [7]. While central institutions pilot artificial intelligence architectures and multi-cloud elasticity, remote municipal agencies struggle with primary hurdles: frequent electrical brownouts, zero WAN failover redundancy, and heavily congested sub-district broadband lines [7][8]. This infrastructure fragility significantly magnifies regional cybersecurity vulnerability, as analyzed in [Facing the Cyber Storm: Critical Reflections on Digital Infrastructure](/en/blog/facing-the-cyber-storm-critical-reflections-on-digital-infrastructure).

---

## 2. Theoretical Foundations: The Three Levels of the Digital Divide in Public Governance

In information systems sociology, public sector technology adoption failures cannot be oversimplified merely as "hardware deficiencies." This structural disparity is evaluated through the **Three Levels of the Digital Divide** framework [8][9]:

```
                     THE THREE LEVELS OF THE DIGITAL DIVIDE
                     
    [Level 1: Infrastructure]   Fiber Backbones, Data Centers, Power Redundancy
    [Level 2: Human Capital]    Systems Architects, Network Engineers, Security
    [Level 3: Policy Outcomes]  Data-Driven Decision Making & Analytical Impact
```

1. **First-Level Digital Divide (Physical Access & Infrastructure)**: Extreme disparities in fiber optic availability, carrier-grade routing hardware, certified Tier data centers, and power grid stability between the national capital and peripheral regencies [8].
2. **Second-Level Digital Divide (Human Capital & Technical Skills)**: Discrepancies in technical competencies. While central ministries can engage specialized third-party enterprise consultants, regional agencies routinely assign entire enterprise network infrastructures to a handful of general administrative staff lacking professional engineering certifications [9].
3. **Third-Level Digital Divide (Policy and Governance Outcomes)**: Inability of local governments to transform collected records into tactical, evidence-based policy insights, leaving accumulated databases as digital graveyards offering zero analytical utility [9].

Examining e-government projects across developing nations, Heeks (2003) revealed that **85% of public digitalization initiatives fail to achieve intended objectives**, with 35% resulting in total abandonment and 50% enduring partial failure [10]. The predominant catalyst is the *Design-Actuality Gap*—the yawning divide between idealistic designs drafted by central policy-makers in Jakarta and the unvarnished operational realities of civil servants on the ground [10][11].

---

## 3. Empirical Field Realities: Application Silos and Operator Burden in Regional Agencies

Direct field investigations across municipal departments (OPD)—such as Agriculture, Health, and Civil Registry—uncover three compounding points of operational friction [11]:

### A. Vertical Application Sprawl from Central Ministries
Every central ministry tends to mandate its own vertical software portal and requires regional departments across Indonesia to input data into it continuously:
- The Ministry of Home Affairs mandates SIPD (Regional Development Information System).
- The National Civil Service Agency mandates SIASN (State Civil Apparatus Information System).
- Sectoral ministries enforce reporting through dozens of separate, uncoordinated web portals.

Critically, **these central applications do not expose bidirectional RESTful APIs accessible to municipal database servers** [11]. Regional governments are strictly prohibited from programmatic database access, yet are mandated to manually supply data daily.

### B. Severe Credential Fatigue and Repeated Manual Input
Lacking automated interoperability, regional civil service operators endure exhausting administrative burnout:
- Staff must first log and process community beneficiary records inside the local regency database.
- The same operator must then launch separate browser windows, recall dozens of independent usernames and passwords (*credential fatigue*), and manually type the identical dataset into the regency's *E-Office* and various national ministry portals.

```
MANUAL DUPLICATION WORKFLOW:

[Frontline Public Servant]
   ├── 1. First Manual Input   ──> [Municipal Agency Sektor Portal]
   ├── 2. Second Manual Input  ──> [Regency E-Office Platform]
   └── 3. Third Manual Input   ──> [Central Ministry Vertical Portal]
   
*Impact: Massive administrative waste, data discrepancies, and employee burnout.*
```

### C. The Turnkey Vendor Trap
Constrained budgets and shortages of software engineers lead regional agencies to contract third-party software houses for custom app development. Unfortunately, upon contract completion, complete source code repositories and architectural documentation are seldom handed over. When defects arise or statutory requirements change, these applications are abandoned, resulting in hundreds of orphaned "zombie portals" that drain public funds [11][12].

---

## 4. The Engineering Blueprint: Distributed Interoperability and Resilient Networks

To bridge this structural central-regional divide, public digital transformation must transition away from recurring hardware purchasing sprees toward **building resilient distributed data bridges and robust network engineering** [12][13].

```
UNIFIED DATA INTEROPERABILITY ARCHITECTURE:

┌────────────────────────────────────────────────────────┐
│               CENTRAL MINISTRIES / PDN                 │
│      (SIPD, SIASN, National Satu Data Portals)         │
└───────────────────────────▲────────────────────────────┘
                            │ REST API (Standardized JSON Schemas)
                            │ Token-Based Auth (OAuth2 / JWT)
┌───────────────────────────▼────────────────────────────┐
│      REGIONAL API GATEWAY (REGENCY DISKOMINFO)         │
│  ├─ Asynchronous Sync Middleware (Message Broker)      │
│  ├─ Metadata Validation (Satu Data Indonesia - SDI)    │
│  └─ Centralized Single Sign-On (SSO) for Operators     │
└───────────▲────────────────────────────────▲───────────┘
            │                                │
    ┌───────▼────────┐               ┌───────▼────────┐
    │  Agriculture   │               │ Health Service │
    │ (RouterOS WAN) │               │ (RouterOS WAN) │
    └────────────────┘               └────────────────┘
```

### A. Deploying Regional REST API Gateways and Middleware
Regency Communication and Informatics Agencies (Diskominfo) must establish centralized, hardened API Gateways [12][13]. When field staff commit records locally, the gateway triggers asynchronous RESTful web service calls to sync datasets upstream to regency and national central databases. This mechanism permanently eradicates duplicate manual entry and enforces the *Single Source of Truth* [13], as proven empirically in our municipal data integration deployments in Jombang Regency [15]—a case study detailed further in [Digital Transformation in Information Systems & REST API Integration](/en/blog/digital-transformation-in-information-systems-public-service-integration).

### B. Unified Identity: Single Sign-On (SSO) via OAuth2 and JWT
Unifying all municipal applications under a centralized identity directory allows civil servants to authenticate once via OAuth2/JWT tokens. This immediately resolves credential fatigue and closes major password security loopholes.

### C. Resilient Network Infrastructure via SD-WAN and MikroTik RouterOS
At the physical network layer, public offices must cease relying on unmanaged consumer broadband routers that lack traffic management [14]. Deploying **MikroTik RouterOS** enterprise edge appliances across every agency and sub-district office provides enterprise resilience at an accessible cost [14], reflecting the core architectural principles documented in [The Evolution of MikroTik 1996–2026](/en/blog/evolution-of-mikrotik-1996-2026-routing-and-network-infrastructure):
- **Automated Multi-WAN Failover**: Combining primary fiber broadband with cellular backup (LTE/5G via integrated modems) through route distance and ping checks guarantees uninterrupted citizen service during fiber cuts.
- **Traffic Shaping & Prioritization (QoS & Queue Tree)**: Prioritizing database and transaction traffic over general recreational web browsing.
- **Secure Site-to-Site WireGuard/IPsec Mesh**: Interconnecting all remote district branches to the regency data center through hardware-accelerated encrypted tunnels, eliminating the exorbitant expense of dedicated private leased lines.

---

## 5. Conclusion & Policy Recommendations

The ICT divide between central and local governments is a complex socio-technical challenge that cannot be solved by issuing centralized compliance decrees from Jakarta.

If the state is genuinely committed to achieving national digital sovereignty and bureaucratic efficiency, three policy pivots are imperative:
1. **Mandate Bidirectional REST APIs**: Central ministries must dismantle closed software gardens and publish standardized API endpoints allowing regional servers to exchange data automatically.
2. **Enforce Open Architecture Standards Locally**: Regional governments must mandate that third-party developers deliver complete source repositories, database schemas, and API documentation to prevent vendor lock-in.
3. **Massive Investment in Engineering Human Capital**: Governments must redirect budgets toward technical certifications for civil service computing staff, focusing on network engineering (MikroTik MTCNA/MTCRE) and modern software architecture.

Only through the harmonious alignment of regulatory clarity, open data exchange architectures, and robust network engineering at the grassroots level can SPBE and Satu Data Indonesia evolve from bureaucratic slogans into genuine, high-performing public services for all citizens.

---

## References

[1] R. Heeks, *Implementing and Managing eGovernment: An International Text*. London: SAGE Publications, 2006.  
[2] J. E. Fountain, *Building the Virtual State: Information Technology and Institutional Change*. Washington, D.C.: Brookings Institution Press, 2001.  
[3] Republic of Indonesia, *Presidential Instruction No. 3 of 2003 on National Policy and Strategy for E-Government Development*, Jakarta: State Secretariat, 2003.  
[4] Republic of Indonesia, *Presidential Regulation No. 95 of 2018 on Electronic-Based Government Systems*, Jakarta: State Secretariat, 2018.  
[5] Ministry of Administrative and Bureaucratic Reform (KemenPAN-RB), *National SPBE Evaluation Report*, Jakarta: KemenPAN-RB, 2023.  
[6] I. S. Widiarti and D. Napitupulu, "Evaluation of e-government implementation using SPBE maturity framework," *Journal of Physics: Conference Series*, vol. 1367, p. 012012, 2019.  
[7] Statistics Indonesia (BPS), *Indonesian Telecommunication Statistics: Regional Digital Disparities*, Jakarta: BPS RI, 2024.  
[8] J. van Dijk, *The Deepening Divide: Inequality in the Information Society*. Thousand Oaks: SAGE Publications, 2005.  
[9] E. Ferro, J. R. Gil-Garcia, and N. C. Helbig, "The role of digital divide in e-government: A conceptual and empirical exploration," *Information Polity*, vol. 16, no. 1, pp. 3–17, 2011.  
[10] R. Heeks, "Most eGovernment-for-development projects fail: How can risks be reduced?," *iGovernment Working Paper Series*, no. 14, Institute for Development Policy and Management, University of Manchester, 2003.  
[11] B. Kurniawan, "Tantangan dan hambatan implementasi sistem pemerintahan berbasis elektronik pada pemerintah daerah," *Jurnal Borneo Administrator*, vol. 16, no. 2, pp. 215–234, 2020.  
[12] R. T. Fielding, "Architectural Styles and the Design of Network-based Software Architectures," Ph.D. dissertation, Dept. Inf. Comput. Sci., Univ. California, Irvine, CA, 2000.  
[13] C. Pautasso, O. Zimmermann, and F. Leymann, "RESTful web services vs. big'web services: making the right architectural decision," in *Proc. 17th Int. Conf. World Wide Web (WWW '08)*, Beijing, China, 2008, pp. 805–814.  
[14] MikroTik, "RouterOS v7 General Documentation: Policy Routing, Multi-WAN Failover, and WireGuard Tunneling Architectures," *MikroTik Documentation*, 2026. [Online]. Available: https://help.mikrotik.com/docs/  
[15] A. Sifaunajah, R. D. Amalia, D. A. Lestari, M. Z. Arifin, N. Khafidhoh, and N. Yaqin, "RESTful Web Service Architecture for Secure and Efficient Agricultural Data Integration in Jombang Regency," in *2024 International Conference on Informatics, Multimedia, Cyber and Information System (ICIMCIS)*, IEEE, 2024, pp. 856–863, doi: 10.1109/ICIMCIS63365.2024.10842277.
