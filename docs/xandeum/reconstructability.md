---
title: Reconstructability
slug: reconstructability
createdAt: 2025-11-08T16:45:52.629Z
updatedAt: 2025-11-28T18:10:43.904Z
---

## Overview

Herrenberg extends the Xandeum storage protocol with advanced erasure coding and distributed recovery mechanisms designed for reliability at scale. The system guarantees that all stored data can be reconstructed from available pod shards, even when individual pNodes are offline or permanently lost. Data is divided into mathematically reconstructable fragments, and pods coordinate through gossip-based metadata exchange to regenerate missing pieces as needed.

This release builds on the foundation established by **Munich**. While Munich provided tamper-proof guarantees, Herrenberg introduces full reconstructability as a protocol-level feature. It has been validated in devnet environments using community-operated pNodes, confirming that data recovery remains consistent under real-world network conditions.

For developers, Herrenberg defines the basis for exabyte-scale, fault-tolerant storage that integrates directly with Xandeum’s Web3 infrastructure. It improves reliability and reduces downtime across distributed workloads. The reconstructability model also supports **STOINC reward calculations**, ensuring that operator incentives are tied to verifiable data availability and sustained performance, including NFT-based multipliers.

## Description

Herrenberg introduces a robust erasure coding architecture that extends Xandeum’s scalable storage protocol. Each dataset is divided into  verifiable fragments, distributed across multiple pods to ensure that no single point of failure can compromise accessibility. When any pNode becomes unavailable, remaining nodes dynamically collaborate to reconstruct lost shards, guaranteeing seamless continuity of service.

If one or more pNodes fail or go offline, pods automatically collaborate to regenerate missing data through gossip-based recovery coordination. This guarantees uninterrupted access, persistent data integrity, and resilience against network interruptions, all without the need for centralized control or redundant replication.

## Technical Details

**Erasure Coding&#x20;****Model****:**
Data is divided into *k* data shards and *m* parity shards. Any combination of *k* shards is sufficient to reconstruct the original data, ensuring robust redundancy and reliability.

**Distributed Recovery:**
Pod clusters exchange lightweight metadata through a gossip protocol, enabling automatic shard regeneration without centralized coordination or bottlenecks. This distributed recovery process is computationally lightweight and scales linearly with network size, supporting exabyte-scale storage systems while maintaining predictable latency and throughput.

**Scalability:**
The recovery process scales linearly with network growth, supporting exabyte-scale storage while maintaining consistent latency and throughput across the network.

**Protocol Compatibility:**
Herrenberg is fully compatible with existing Xandeum primitives. It seamlessly integrates with STOINC incentive mechanisms and NFT-based performance multipliers to align operator rewards with verifiable uptime and data availability.

## **Improvements Over Munich**

- **From Integrity to Reconstructability**
  While the Munich release introduced tamper-proof guarantees through cryptographic verification, Herrenberg builds upon this foundation by adding **reconstructability as a native protocol feature**.
- **Mathematically Guaranteed Recovery**
  In contrast to Munich’s reliance on redundancy for data persistence, Herrenberg ensures that **data recovery is mathematically guaranteed**, even in cases of multiple node failures, stored data can be regenerated from available shards using deterministic erasure coding.
- **Real-World Validation**
  Preliminary testing in devnet with community‑operated pNodes suggests improved fault tolerance and recovery behaviour under variable network load.

These advancements mark Herrenberg as a significant milestone in the Xandeum storage roadmap, delivering a self-healing, resilient, and production-ready infrastructure layer.

## Impact

Herrenberg provides a foundation for data-intensive decentralized applications that demand continuous availability and integrity.
The protocol reduces downtime, improves confidence in scalable storage reliability, and ensures that developers and users experience seamless data persistence.

For operators, the protocol’s integration with STOINC readies **reward structures based on verifiable data availability** and sustained service performance. NFT-based multipliers further incentivize sustained performance, aligning long-term economic rewards with network stability objectives.

By combining robust engineering with tokenized incentives, Herrenberg establishes a new standard for **fault-tolerant, reconstructable, and economically sustainable scalable storage** for the next generation of Web3 applications.
