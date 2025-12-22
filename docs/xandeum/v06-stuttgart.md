---
title: v0.6 Stuttgart
slug: v06-stuttgart
createdAt: 2025-11-26T16:56:31.242Z
updatedAt: 2025-12-09T00:13:09.229Z
---

# v0.6 Stuttgart

## State of Development Post-Stuttgart

Stuttgart (v0.6) advances Xandeum's South Era by introducing **redundancy** mechanisms to the scalable storage layer for Solana, enhancing fault tolerance and data durability for smart contracts. Building on Ingolstadt's reward tracking and performance incentives, it shifts focus to replicated data distribution across pNodes, ensuring file systems remain accessible even during outages. This release refines the BigBang operation to incorporate user-defined replica counts, optimizes reconstruction processes, and separates environments for testing, positioning Xandeum toward mainnet with improved reliability and efficiency for storage-enabled dApps (sedApps).

## Core Features

- **Redundancy Mechanisms**: User-configurable replication (1+ replicas) for each file system, with data distributed across semi-randomly selected pNodes to prevent single points of failure.
- **BigBang Enhancements**: Now accepts a replica\_count parameter during file system creation, defining the number of pNode copies for every page; fails if requested replicas exceed available pNodes.
- **Reconstruction Improvements**: Atlas reconstruction now requires only one healthy pNode per redundancy set to rebuild file systems, with caching to speed up lookups and reduce I/O.
- **Pod Environment Separation**: Introduces devnet (default) and trynet modes; trynet uses an isolated gossip network and generates a new identity keypair on each start for convenient testing.
- **Performance Optimizations**: Implements multithreading for simultaneous data transmission to multiple pNodes, accelerating replication processes.
- **On-Chain Operations**: Commands like mkdir, copy, rename, and Armageddon are executed as instant on-chain transactions, propagating across the pod network for consistency without third-party dependencies.
- **Integration with FSOnChain**: Supports fully on-chain file system management, where BigBang instantiates independent file systems with automatic data replication across pNodes for censorship-resistant control.

## Redundancy System

### Overview

Redundancy in Stuttgart ensures every piece of data in a file system is replicated across multiple pNodes, configurable by users during BigBang. This provides resilience, allowing full accessibility and recovery as long as at least one replica per set remains online. It builds toward a scalable file system for smart contracts on Solana, with pNodes participating in multiple sets based on assignments.

### Key Concepts

1. **Replica Count**
   - Specified at BigBang (e.g., 1+); determines pNodes per page.
   - Semi-random selection of pNodes for each set.
   - Write operations replicate to all in the set.
   - Rejects if replica\_count > available pNodes.
2. **Redundancy Sets**
   - Groups of pNodes storing replicas for a file system.
   - A pNode can belong to multiple sets.
   - Enhances fault tolerance without central reliance.
3. **Updated Reconstruction (with Caching)**
   - Pre-Stuttgart: Required all pNodes online; risked data loss if any down.
   - Post-Stuttgart: Needs one healthy pNode per set; caches info for faster recovery.
   - Reduces dependency on full cluster scans.
4. **pNode Operations**
   - No hardware changes; stable internet and static IP required.
   - Open ports: UDP 9001 (gossip), TCP 5000 (Atlas), TCP 6000 (pRPC).
   - Multithreading improves data sending efficiency to replicas.

### Evolution

- Starts centralized on Atlas but resilient via pNode data.
- Prepares for decentralization in later eras (e.g., validators using Merkle proofs).
- Ties into STOINC for proportional rewards based on contributions.

## pNode Rewards and Integration

- Builds on Ingolstadt's credits: Redundancy participation factors into performance scores.
- Monthly XAND allocations (10,000) to high-performers via Foundation Program.
- Analytics via Pod Monitor for dashboards and community tools.

## Xandeum Pod Software

This release updates the open-source Pod software, the runtime for pNodes in Xandeum's scalable storage layer for Solana. It coordinates data sharding, P2P communication, and RPC APIs for efficient file system operations in sedApps.

### What is a Xandeum Pod?

A Xandeum Pod (pod) is the core software turning a VPS/server into a pNode. It manages storage, network participation, and monitoring.

Technical Components:

- pRPC API (Port 6000): JSON-RPC for stats and methods.
- Gossip Protocol (Port 9001): P2P discovery and coordination.
- Atlas Client (Port 5000): State sync.
- Storage Engine: Handles file metadata in /xandeum-pages/pod.db.
- Stats Dashboard (Port 80): Local web metrics.

What Pod Does:

1. Storage Management: Stores/retrieves replicated data.
2. Network Participation: Gossip for peers; supports devnet/trynet.
3. API Service: Monitoring/interaction.
4. Atlas Coordination: Syncs state.
5. Performance Tracking: Metrics for credits.

Installation:

```text
# Add repo
deb [trusted=yes] https://xandeum.github.io/pod-apt-package/ stable main
sudo apt-get update
sudo apt-get install pod
```

Running Pod:

- Devnet (default): `pod --rpc-ip 0.0.0.0 --entrypoint <IP>:9001 --atlas-ip <IP>:5000`

Terminology:

- pNode: Hardware/VPS.
- Pod: Software daemon.

As of 2025 updates, Pod supports redundancy for fault-tolerant storage, essential for mainnet by late 2025.

## Stuttgart Summary

Stuttgart marks a key milestone in Xandeum's South Era, adding redundancy to pNode operations for resilient file systems. It enhances BigBang for replica specification, optimizes reconstruction, and introduces trynet for testing. This fosters ecosystem growth with on-chain operations and FSOnChain integration, advancing toward Stuttgart's successors and full mainnet rollout.

