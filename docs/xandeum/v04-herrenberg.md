---
title: v0.4 Herrenberg
slug: v04-herrenberg
createdAt: 2025-10-16T16:54:38.488Z
updatedAt: 2025-11-28T18:10:43.904Z
---

![Xandeum Exabytes for Solana Programs](https://app.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/VDQyu5F-6c32A1aVQ67d3_logo.png)

# Overview

This page provides an overview of the Herrenberg release in Xandeum's South Era, including pre and post development states, newly introduced and enhanced feature. Greater detailed is given in dedicated sections.

::::LinkArray
:::LinkArrayItem{headerImage headerColor}
[**What's new in Herrenberg**](docId\:XxVyhaY2PPaB5DpODSuPL)&#x20;

Key advancements introduced in Herrenberg, building on Munich's foundation.
:::

:::LinkArrayItem{headerImage headerColor}
[**Foundation - pre Herrenberg**](docId\:T9UE30yv_ym3fwbnXpeg_)&#x20;

Summary of the project's state leading up to Herrenberg.
:::
::::

## Enhanced functionality

Herrenberg shifted focus to enhanced communication, reliability, and tools for sedApps. The Gossip Protocol uses Erasure coding it to distribute data shards among pods for resilient, global-scale storage.  A core outcome of Erasure Coding is Xandeum's Full Data Reconstructability, enabling 100% data recovery from distributed shards, even in failures.

::::LinkArray
:::LinkArrayItem{headerImage headerColor}
[**Gossip Protocol**](docId\:oH38ZmOQcWGo3lOZN6ABo)&#x20;

Xandeum's Gossip Protocol enables decentralized pNode scalable file systems to dynamically discover peers and share real-time updates on data health, performance, and erasure-coded shards for resilient, tamper-proof storage on Solana.
:::

:::LinkArrayItem{headerImage headerColor}
[**Reconstructability**](docId\:V4wDz4ys17QJgXOxME-46)&#x20;

Full Data Reconstructability uses advanced erasure coding to enable complete recovery of stored data from distributed pod shards, even amid pNode failures, for resilient exabyte-scale storage on Solana.
:::

:::LinkArrayItem{headerImage headerColor}
[**pNode RPC**](docId\:Y33rJCkzM_RkbSw-ueaMn)&#x20;

Xandeum's pRPC is a tailored RPC interface for pNodes, enabling storage layer interactions like status and shard queries, distinct from Solana's RPC, to streamline sedApp building via Xandeum Web3.js.
:::

:::LinkArrayItem{headerImage headerColor}
[**Search Capabilities**](docId\:pbq8dxx9J8EUwPaEW8ISx)&#x20;

Herrenberg adds search capabilities which enable basic, efficient querying of scalable storage units via pRPC, allowing data retrieval without full dataset scans for sedApps on Solana.
:::
::::

***

## Herrenberg Summary

Herrenberg represents a pivotal milestone in Xandeum's South Era, advancing pNode capabilities with enhanced communication, reliability, and developer tools. This release introduces interconnected, analyzable systems to support storage-enabled dApps (sedApps), while the concurrent Dutch Auction of 52 Deep South pNodes and NFT multipliers (up to 11x) for STOINC rewards drive operator incentives and fund progress toward Ingolstadt's reward tracking and Stuttgart's mainnet redundancy.

## Additional Enhancements and Community Focus

Herrenberg also updates the web GUI, improving pNode oversight and providing real-time visibility into pNode performance.  Emphasis is placed on security best practices (non-standard ports, SSH key-only access).

The groundwork is now done to enable data-driven delegation of XAND tokens through the Foundation Delegation Program.

Overall, these features position Xandeum as a robust Minimum Viable Product (MVP) for testing.  This release not only boosts technical capabilities but also fosters ecosystem growth, with potential for future auctions and dApps like LLM integrations.

This release continues addressing the blockchain storage trilemma and positions Xandeum for future milestones like Engold and Stodgard.
