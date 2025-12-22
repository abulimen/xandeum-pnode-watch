---
title: Erasure Coding
slug: erasure-coding
createdAt: 2025-11-08T17:23:15.928Z
updatedAt: 2025-11-28T18:10:43.904Z
---

### Where Erasure Coding Fits in Herrenberg

Erasure coding in Xandeum's Herrenberg release (v0.4.0) enables redundant, fault-tolerant data storage by splitting data into shards with parity info, allowing full reconstruction even if some shards are lost. It integrates with the new gossip protocol to distribute these shards across pNode "pods," ensuring tamper-proof, scalable storage coordination.

Erasure coding is directly involved with the Gossip Protocol, as the protocol uses it to distribute data shards among pods for resilient, global-scale storage.

A core outcome of erasure coding is Full Data Reconstructability, enabling 100% data recovery from distributed shards, even in failures.

### What is Erasure Coding?

Erasure coding is a data protection technique that adds redundancy to original data by splitting it into fragments (shards), encoding them with parity information, and distributing them across multiple locations. This allows reconstruction of the full data even if some shards are lost or corrupted, similar to RAID systems but more efficient for distributed networks like blockchains. It's based on error-correcting codes (e.g., Reed-Solomon) and provides fault tolerance without full duplication, balancing storage costs and reliability.

### Erasure Coding in Xandeum

Xandeum uses erasure coding to enable scalable, redundant storage on Solana, splitting data into pages and distributing encoded shards across pNodes (provider nodes) for exabyte-level capacity with blockchain-grade integrity. Here's a breakdown:

- **Data Splitting and Encoding**: Data is divided into fixed-size pages (e.g., optimized for Solana's transaction limits), then encoded using erasure codes like Reed-Solomon generalizations. This creates data shards plus parity shards, allowing reconstruction from a subset (e.g., tolerate up to a configurable number of failures).
- **Configurable Redundancy**: Users set redundancy levels (e.g., 1.5x to 3x overhead), determining how many extra parity shards are generated. This stores data on a subset of pNodes rather than all validators, optimizing costs while ensuring availability—e.g., recover from 30-50% node failures without data loss.
- **Distribution Across pNodes**: Encoded shards are spread across decentralized pNodes in "pods," using gossip protocols for coordination. This offloads storage from Solana validators (vNodes), which supervise via cryptographic proofs.
- **Security and Integrity**: pNodes generate Merkle proofs for tamper-proofing; vNodes verify using Threshold Signature Schemes (TSS). Combined with Solana's PoH, this ensures data can't be altered undetected.
- **Availability and Reconstruction**: Supports primitives like Poke (store), Peek (retrieve), and Prove (verify). Data is highly available without full replication; e.g., reconstruct from any sufficient shards, even in partial network failures.
- **Integration with Solana**: Erasure coding ties into Solana transactions for on-chain access, with fees in SOL funding the ecosystem. It's designed for sedApps (storage-enabled dApps), enabling low-latency operations at scale.

***





For implementation code or deeper math, refer to Xandeum's GitHub repos or whitepaper for Reed-Solomon specifics.
