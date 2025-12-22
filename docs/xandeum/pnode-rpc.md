---
title: pNode RPC
slug: pnode-rpc
createdAt: 2025-10-28T19:43:00.531Z
updatedAt: 2025-11-28T18:10:43.904Z
---

## **Overview**

Herrenberg introduces a **Remote Procedure Call (RPC) interface** for pNodes, enabling external applications and smart contracts to interact directly with the storage layer. Unlike Solana’s standard RPC, this interface is **pNode-specific**, allowing queries for shard status, performance metrics, and designated pRPC functions.

The RPC interface is fully integrated with **Xandeum Web3.js**, an extension of Solana’s Web3.js library. Developers can now invoke storage primitives directly from smart contracts, streamlining workflows for uploading, retrieving, or querying data within decentralized applications (sedApps).

This functionality builds on Munich’s Pod Monitor GUI, which provided only visual analytics, by enabling **programmatic access** and integration with third-party analytics tools. The addition of RPC opens new possibilities for high-performance storage applications, custom monitoring platforms, and dynamic staker analytics.

## **Description**

The pNode RPC provides a standardized, programmatic interface for interacting with pNodes. Core capabilities include:

- Retrieving **pNode status** (uptime, storage usage, shard availability).&#x20;
- Accessing **data shards** for recovery or verification purposes.&#x20;
- Invoking **pRPC-specific functions** for advanced queries.&#x20;

By separating this interface from Solana’s native RPC, Herrenberg ensures queries are **tailored to pNode operations** while maintaining compatibility with Web3 development workflows.

## **Technical Details**

- **Integration with Web3.js:** The RPC interface extends **Xandeum Web3.js**, allowing smart contracts and client applications to directly call storage primitives.&#x20;
- **Request Handling:** RPC supports efficient processing of upload, retrieval, and query requests, minimizing latency and computational overhead.&#x20;
- **Extensibility:** Developers can build custom analytics dashboards, monitoring tools, and high-throughput sedApps that leverage real-time pNode performance metrics.&#x20;
- **Security & Access Control:** RPC endpoints include authentication and rate-limiting mechanisms to ensure safe and reliable operation across decentralized nodes.&#x20;

## **Improvements Over Munich**

- **Programmatic Access:** While Munich provided basic analytics via the Pod Monitor GUI, Herrenberg exposes pNode metrics via RPC, enabling automated queries and third-party integrations.&#x20;
- **Enhanced Developer Workflows:** Integration with Web3.js reduces friction for sedApp development, supporting direct interaction with storage primitives from smart contracts.&#x20;
- **Real-Time Monitoring:** Developers and stakers can now monitor pNode health and storage performance programmatically, supporting optimized XAND staking strategies.&#x20;

## **Impact**

The pNode RPC empowers developers to create **high-performance storage applications**, such as decentralized file-sharing systems, research hubs, and collaborative content platforms.

Stakers gain programmatic access to **pNode metrics** (e.g., uptime, storage efficiency), enabling data-driven decisions for XAND staking rewards.

Community participation is encouraged, with plans for a **collaborative analytics dashboard** on xandeum.network, providing shared visibility into network performance and fostering transparency across the ecosystem.

[**RPC API Reference**](docId:1pIQKxDlIlNF5TIRyzKsD)&#x20;

[**What's new in Herrenberg**](docId\:XxVyhaY2PPaB5DpODSuPL)&#x20;

