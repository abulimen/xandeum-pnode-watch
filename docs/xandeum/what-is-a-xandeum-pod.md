---
title: What is a Xandeum Pod?
slug: what-is-a-xandeum-pod
createdAt: 2025-11-18T15:54:59.113Z
updatedAt: 2025-11-28T18:01:50.634Z
---

### Overview

A **Xandeum Pod** (often just called "pod") is the **core software that runs on each pNode (provider Node)** in the Xandeum distributed storage network. Think of it as the storage node daemon/service.

It handles key functions like data sharding via erasure coding, peer-to-peer communication through gossip protocols, and integration with pRPC APIs for programmatic access, enabling efficient, fault-tolerant storage for sedApps.&#x20;

With a CLI (pod) for quick starts, configuration (e.g., custom IPs/ports), and monitoring via a stats dashboard. The software powers features like the XandMiner GUI for pNode management, supporting STOINC rewards and network health tracking.

## 1. Core Purpose

Pod software acts as the runtime for pNodes, coordinating data distribution across pods to ensure tamper-proof, reconstructable storage without centralization. It offloads data from Solana validators, making it ideal for high-throughput Web3 apps like decentralized social platforms or AI tools.

### What Pod Does

The main purpose of the pod is **Storage Management** where it stores and retrieves data in the distributed network.  The pods participate in **Networking&#x20;**&#x62;y enabling communicates with other pNodes.  Providing JSON-RPC **API** they allow monitoring and interaction with other pods.  They synchronise with the central **Atlas** server for network state, and ensure the status of the network through **Performance Tracking** where they monitor CPU, RAM, storage, and network metrics.

## 2. Key Components

- **CLI Interface**: Simple commands for;  version checks, isolated testing, and flags for RPC/Atlas customization.
- **Networking**: Uses gossip for peer discovery and heartbeats (every 30s) to maintain rewards eligibility.
- **Integration**: Powers XandMiner for GUI monitoring, with JSON-RPC endpoints (e.g., /rpc on port 6000) for stats like CPU/RAM/uptime and peer lists.
- **Security**: Emphasizes non-standard ports and firewall configs for resilient operations.

## 3. Installation and Usage

- Install via apt from Xandeum's repo; run with defaults for local DevNet.
- Advanced: Daemonize with systemd for 24/7 uptime, crucial for STOINC (e.g., amplified by NFTs up to 11x).
- Testing: Includes curl examples for RPC health checks and troubleshooting for common errors like port conflicts.

## Conclusion

As a foundational piece of Xandeum's ecosystem, Pod software empowers community operators to build and earn.

