---
title: Xandeum's scalable storage solution
slug: xandeums-scalable-storage-solution
createdAt: 2025-10-27T16:38:31.084Z
updatedAt: 2025-11-13T13:15:39.268Z
---

Xandeum's scalable storage solution is a scaling innovation designed specifically for the Solana blockchain, enabling exabyte-scale data storage that supports high-performance, data-intensive decentralized applications (dApps) without compromising on decentralization or efficiency.&#x20;

It addresses the limitations of traditional blockchain storage, where data is often expensive, slow, or reliant on centralized providers, by creating a global network of community-operated nodes that integrate seamlessly with Solana's smart contracts.&#x20;

This allows developers to build "storage-enabled dApps" (sedApps) for use cases like decentralized social platforms, AI governance tools, research hubs, or file-sharing systems, all while maintaining low-latency access and security.

## Core Architecture and How It Works

At its foundation, Xandeum uses a distributed network of **provider nodes (pNodes)**, which are hardware devices or servers run by community participants to store and serve data. Data uploaded to the network is processed through **erasure coding**, a technique that splits files into multiple shards (fragments) with built-in redundancy. This ensures that even if some pNodes go offline or fail, the data can be fully reconstructed from the remaining shards, providing tamper-proof reliability and minimizing storage overhead (e.g., achieving high efficiency without needing full duplication).&#x20;

These shards are distributed across **pods&#x20;**(groups of pNodes that communicate via a **gossip protocol**) for dynamic status updates, data availability checks, and efficient distribution. **Validator nodes (vNodes)** monitor the network's integrity using cryptographic proofs, preventing downtime and enabling seamless recovery.

Storage is organized into scalable, file-system-like containers for data. Users and sedApps interact with these through a **pNode-specific RPC interface** (distinct from Solana's standard RPC), allowing programmatic queries for uploads, retrievals, or status checks. This is facilitated by **Xandeum Web3.js**, an extension of Solana's Web3.js library, which lets developers call storage primitives directly from smart contracts.&#x20;

Fees for storage operations are paid in SOL, which feeds into Xandeum's liquid staking mechanism: staked SOL (converted to xandSOL) earns rewards, including Storage Income (STOINC) amplified by NFT multipliers, and XAND governance tokens. This incentivizes pNode operators and stakers, creating a self-sustaining ecosystem.

## Integration with Solana

Xandeum is natively built on Solana, offloading data from validators to pNodes to reduce network congestion while keeping storage operations on-chain. sedApps can efficiently store and access large datasets (e.g., user profiles, media files, or AI models) without external oracles or off-chain hacks. For example, in recent demos, prototype sedApps like scalable file-sharing tools or AI governance apps showcased real-time operations across global pNodes (from the US to Nigeria and Japan). This integration ensures Solana's high throughput (thousands of TPS) extends to storage-heavy applications, making it viable for Web3 equivalents of centralized services like Dropbox or social media platforms.

## Resolution of the Blockchain Storage Trilemma

Xandeum explicitly solves the "storage trilemma" which is the challenge of balancing scalability, smart contract-native integration, and random access:

- **Scalability**: Supports exabytes+ of storage through distributed pNodes and erasure coding, far beyond typical blockchain limits.
- **Smart Contract-Native Integration**: Storage is directly callable from Solana programs, avoiding silos and enabling efficient, on-chain data handling.
- **Random Access**: Unlike file-level systems that require full downloads, Xandeum allows granular, low-latency queries (e.g., via crude search capabilities in buckets), ensuring quick retrieval of specific data segments.

## Development Status and Innovations

As of October 27, 2025, Xandeum is in the South Era of its six-phase innovation roadmap, having completed the Deep South Era (with 300 incentivized devnet pNodes sold out) and advanced through releases like Munich (first operational pNode prototype with basic file hosting and analytics) and Herrenberg (September 2025: added gossip protocol, RPC interface, 100% reconstructability, crude search, and custom analytics). The Herrenberg release, described as a "new POV" for intelligent decentralized storage, coincided with a Dutch Auction raising funds for the Xandeum Foundation and introducing NFT-boosted rewards. Upcoming releases like Engold (reward tracking) and Stodgard (redundancy for mainnet) aim for full mainnet launch by late 2025.

Unique innovations include the **XandMiner tool** for easy pNode management (e.g., key generation, registration, and monitoring via a web GUI with Pod Monitor analytics), security best practices (non-standard ports, SSH key-only access), and community-driven features like real-time heartbeats (every 30 seconds) for STOINC eligibility. Recent community discussions highlight clarifications on RPC types (one for storage primitives to pNodes, another for analytics) and excitement for sedApps that "think" via AI/ML integration.&#x20;

Overall, Xandeum transforms Solana into a complete platform for Web3, combining speed with unlimited, secure storage. For hands-on involvement, operators can set up pNodes via docs.xandeum.network, and stakers can participate through the Foundation Delegation Program.

