---
title: Heartbeat Credit System
slug: heartbeat-credit-system
createdAt: 2025-11-21T18:31:43.880Z
updatedAt: 2025-11-28T18:21:34.168Z
---

# **Overview**

pNodes are the core of Xandeum's network: they provide storage, handle data redundancy, and earn income proportional to contributions. Early adopters (e.g., Deep South era), NFT holders and devenet contributors will receive boosts. Rewards evolve from foundation-funded incentives to DAO-governed models, with storage income ("STOINC") as the long-term value driver once mainnet launches (targeted before end-2025).

Key concepts interlink: **Heartbeats** contribute to performance scores, which factor into **credits**; credits determine shares of **rewards** and STOINC. All metrics aim to ensure network reliability, decentralization, and fair distribution.

## **1. Credits (Storage Credits)**

:::Heading{depth="3" indent="1"}
**Definition and Purpose**

:
:::

- Credits are a scoring metric used to calculate a pNode's share of network rewards and stoinc. They quantify a pNode's contribution based on factors like storage provision, performance, and stake. Credits ensure proportional earnings—higher credits mean a larger slice of total fees/rewards.

:::Heading{depth="3" indent="1"}
**Calculation Formula**
:::

- Base Credits = (Number of pNodes) × (Total Storage Space Provided) × (Performance Score) × (Stake Amount in XAND).
- Boosted Credits = Base Credits × (Geometric Mean of Boost Factors across all your pNodes).
- If any factor is zero (e.g., no stake or zero performance), credits = 0, resulting in no earnings for that epoch (currently an epoch last two days).
- Example: A wallet with 3 pNodes and 100,000 base credits, with boosts of 1.5x, 1x, and 2x, yields \~144,000 boosted credits (geometric mean \~1.44x boost).

:::Heading{depth="3" indent="1"}
**Role in Network**

: 
:::

- Credits promote competition and reliability. They are tallied per epoch, with penalties for failures (e.g., -100 credits for incorrect/missed data requests). In the Ingolstadt release, credits incorporate heartbeat responses. This will be refined and include payload handling.

:::Heading{depth="3" indent="1"}
**Evolution**

:
:::

- Starts simple as part of the DevNet (e.g., heartbeat-based); becomes advanced in later eras. On mainnet, credits drive stoinc distribution from real app fees (e.g., Wikipedia/Uber-style dApps, AI/LLM governance tools).

:::Heading{depth="3" indent="1"}
**Boost Factors**

:
:::

- &#x20;Multipliers to increase credits:
  - Era-Based: Deep South (16x/1,500% boost), South (10x), Mine (7x), Coal (3.5x), Central (2x), North (1.25x).
  - NFT-Based: Titan (11x/1,000% boost), Dragon (4x), Coyote (2.5x), Rabbit (1.5x), Cricket (1.1x). Titans were auctioned and added to a NFT store, allowing retroactive purchase for existing pNodes at \~4,410 USDC + 406,000 XAND (ends Nov 5, 2025, 1600 UTC).
  - Other: Xeno NFT (1.1x/10% boost for early owners).
  - An Alpha NFT will be introduced for early MainNet adopters.
  - Combined: e.g., Deep South (16x) + Titan (11x) = 176x total boost (17,500%).

:::Heading{depth="3" indent="1"}
**Thresholds**

: 
:::

- Need \~80% of the 95th percentile credits (network average) to qualify for full rewards. Below that = zero for the epoch.

## **2. pNode Rewards**

:::Heading{depth="3" indent="1"}
**Types of Rewards**

:
:::

:::Heading{depth="3" indent="2"}
**Fixed/Short-Term Rewards**

: 
:::

:::Paragraph{listStyleType="circle" listStart="2" indent="2"}
Foundation-funded incentives (e.g., 10,000 XAN/month per pNode in DevNet). Covers setup costs such as hosting fees. Paid quarterly (seasons); Season 4 ended \~Oct 2025. New seasons will require min performance (e.g., 80% of 95th percentile credits). These rewards are fied and not boosted by NFTs/eras.  They are to reward DevNet operators and are "tiny" compared to STOINC.
:::

:::Heading{depth="3" indent="2"}
**Storage Income (Stoinc)**

: 
:::

:::Paragraph{listStyleType="circle" listStart="4" indent="2"}
This is not introduced in Ingolstadt, but the advances in this release are building towards STOINC implementation. &#x20;
:::

:::Paragraph{listStyleType="circle" listStart="5" indent="2"}
This is for long-term, revenue-based earnings from MainNet app fees (94% of total fees go to pNodes after 3% Foundation and 3% preferred investors cuts).
:::

:::Paragraph{listStyleType="circle" indent="3"}
Formula: Total Fees × 94% × (Your Boosted Credits / Network Total Boosted Credits).
:::

:::Paragraph{listStyleType="square" indent="3"}
Proportional to credits; boosted heavily for early pNodes.
:::

:::Heading{depth="3" indent="1"}
**Eligibility and Payouts**

:
:::

:::Paragraph{listStyleType="circle" indent="2"}
DevNet: There will be a limited number of pNodes, although not fixed it is estimated that this will be in the range (300-1,000). The initial 3 pNodes per wallet cap has been lifted. DevNet pNodes requires license which cost around 35K XAND as a protective fee and monthly hosting which are low \< $10.
:::

:::Paragraph{listStyleType="circle" listStart="2" indent="2"}
Mainnet: Permissionless, no licenses required with earnings payed in SOL.  DevNet operators will recieve assistance fromthe Foundation in running MainNet pNodes.
:::

:::Paragraph{listStyleType="circle" listStart="3" indent="2"}
Governance Shift: Seasons 1-4 (completed) were managed by the Foundation; Season 5+ via DAO proposals/votes (XAND holders decide). Handover promotes decentralization with rewards now community-driven.
:::

:::Paragraph{listStyleType="circle" listStart="4" indent="2"}
Penalties: Downtime/failures reduce credits/rewards (e.g., missed heartbeats or requests).
:::

:::Heading{depth="3" indent="1"}
**Future Changes**

: 
:::

:::Paragraph{listStyleType="disc" indent="2"}
Post-North era (\~2026+), possible DAO-voted adjustments for decentralization (e.g., cap boosts/stake for large holders to favor smaller ones, like Solana's "super minority").  While early adopters will recieve advantages, the DAO may adjust these later on to assist the growth of the network
:::

## **3. Heartbeat**

- **Definition**: Periodic liveness checks sent by Atlas (temporary centralized orchestrator) every 30 seconds to verify pNode uptime and responsiveness. Part of performance monitoring; will decentralize in later eras (e.g., validators challenge pNodes via Merkle proofs).
- **Mechanics**:
  - Response: +1 credit per successful reply (max \~2880/day if 100% uptime).
  - Failure: No credit; repeated issues lead to eviction/redundancy failover (data replicated to other pNodes).
  - Integration: Factors into performance score begining with the Ingolstat release. This will later combined with payload requests (store/retrieve data: -100 credits for failures).
  - There is a modification to the existing pNode setup in that it requires some PORTS to be open; UDP 9001 open for gossip (pNode discovery); TCP 5000 for Atlas. There is no changes to the  hardware requirements but of course needs stable internet and a static IP.
- **Purpose**: Ensures network reliability; prevents bad actors (e.g., altered data detected via Merkle proofs—cryptographic hashes proving data integrity without revealing content).
- **Evolution**: This started in the Herrenburg release with the introduction of gossip and pRPC for analytics; Ingolstadt advances it with metrics and credits; Stuttgart will add redundancy (e.g., apps choose 3-43x replication for fault tolerance).

