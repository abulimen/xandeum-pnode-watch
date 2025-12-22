---
title: v0.7 Heidelberg
slug: v07-heidelberg
createdAt: 2025-11-13T14:58:01.891Z
updatedAt: 2025-12-15T00:41:13.639Z
---

# State of Development Post-Heidelberg

Heidelberg (v0.7) advances Xandeum's South Era by introducing comprehensive paging statistics, enabling detailed monitoring and optimization of data pages in file systems. Building on Stuttgart's redundancy mechanisms and earlier prototypes, it focuses on analytics for page-level operations. These analytics provide insights into usage, retrieval efficiency, and storage health, helping pNode operators and sedApp developers make informed decisions. This release enhances mainnet readiness by integrating more robust metrics. These improvements support performance tuning and improve ecosystem scalability for smart contract-integrated file systems.

## Core Features

- **Improved gossip timing**: Pods' gossip update frequency improved from 120 seconds to 400 ms, reducing latency in pNode discovery.
  - Also adds multiple open entrypoints, providing an extra layer of redundancy.
  - This improves the **gossip protocol** and prevents pNodes from failing to appear in the gossip list.
- **Bug fixes**: such as correcting excessive outgoing packet size.
- **Enhanced API**: e.g, addition of a detailed API call.

::::CodeDrawer{title="get-pods-with-stats" codeEditorData="[object Object]" responsesEditorData="[object Object]" isResponseExpanded="true"}
:::CodeblockTabsExamples
```curl
curl -X POST http://localhost:6000/rpc   -H "Content-Type: application/json"   -d '{
    "jsonrpc": "2.0",
    "method": "get-pods-with-stats",
    "id": 1
  }' | jq .
```
:::

:::CodeblockTabsResponses
```javascript
{
        "address": "109.199.96.218:9001",
        "is_public": true,
        "last_seen_timestamp": 1765204349,
        "pubkey": "2asTHq4vVGazKrmEa3YTXKuYiNZBdv1cQoLc1Tr2kvaw",
        "rpc_port": 6000,
        "storage_committed": 104857600,
        "storage_usage_percent": 0.02486133575439453,
        "storage_used": 26069,
        "uptime": 3271,
        "version": "0.7.0"
},
```
:::
::::

- **Analytics Enhancements**: Expands Pod Monitor with page-specific visualizations, including real-time stats on data paging, errors, and throughput.
  - Divert to a different port with a change to your **SSH script** e.g.

```bash
ssh -i .ssh\MyKey -L 3000:localhost:3000 -L 4000:localhost:4000 -L 8000:localhost:80  root@<MyIP>
```

![](https://chat.google.com/u/0/api/get_attachment_url?url_type=FIFE_URL\&content_type=image%2Fpng\&attachment_token=AOo0EEWgBTmwSzFepDw2abIS0Sd3a%2Be%2FjwQFVTDfEM2u2S8C7ECv68ZDz0jZJ4Qm68WzrrtGlrZMrmNXyWZQdC510Z%2FwINwz5iYpzToRepUi4JYXs%2FKYMDDI6ovlGwUwiUune7Hxs3ZWFMlAom4Utc1uC0fds8k8kYRbnL1J%2BTR%2FPhuHqvcJ6XpqSBx0YrFcDl8KRkDyj1WgivUqI1CxpRWrgBNTAyfGFpzH%2F7wdJbWnlJZ%2Fds0gS5Bd29QpqfyssRJGLyHwYhgwnWS5mK5ow9WrkTBmAdM2IF7g%2FA8eUoC6uRyUD2geOABIIAcZfRnhmDc9HBn343tJbu4LN%2Fs4A3SbU%2BvL4QBP4NVntMooqt9G4p1u45gL7hDvLnXTpWfPOe3pTuxENRnz3sJJPh1yDZFWnMh3uFVrUoSIZ1ubo4nH9TeADI%2FfpHwYYmIA%2F2haNHRjFVcYoj9G07q%2FlH15g8npd6CNWbuQaNRsBP%2BnlZHe%2F2JbPQDlXdo66tCV2FqWMeohneYYrvXjvNDC8umCpQc9pqneFjeTbAei5dJ7PTH%2FpAIllM5aMo3rqlyDe5%2Bh5DCFVRRtIeM84gIzoyfVpg%3D%3D\&allow_caching=true\&sz=w512)

### What's New in Heidelberg

**Paging stats** in Heidelberg provide granular insights into the handling of data pages within scalable file systems, enabling operators to monitor and optimize storage performance while adding visibility into how pages are accessed and managed across pNodes.&#x20;

The **Paging Statistics System** tracks page access frequency, **hit/miss rates**, replication status, and storage utilization per file system. These metrics are accessible through APIs and dashboards.

**Performance Monitoring** introduces tools for querying paging stats, helping with redundancy set optimization and load balancing.&#x20;

**Optimization Tools** add multithreading for stats aggregation and basic alerting for anomalous paging behavior.&#x20;

**On-chain integration** which anchors key paging metrics for verifiable performance data, and ties them into STOINC calculations.

## pNode Rewards and Integration

- Builds on Ingolstadt's credits: Improved monitoring boosts scores for XAND allocations (10,000 monthly via Foundation Program).
- Analytics via Pod Monitor include paging dashboards and community tools.

## Summary

Heidelberg (v0.7) advances Xandeum's South Era by introducing comprehensive paging statistics. This enables detailed monitoring and optimization of data pages in file systems. This release adds detailed metrics for page access patterns, hit and miss behavior, replication status, and storage utilization. These metrics are available through new and expanded API calls such as get-pods-with-stats, as well as through updated Pod Monitor dashboards. Together, they give operators clearer insight into how pages are being managed across the network.

The release also improves core network behavior with significantly faster gossip propagation, multiple entrypoints for added redundancy, and several stability fixes. Pod environments now support improved monitoring and real-time visualizations. Heidelberg strengthens the operational foundation of the storage layer, supports more accurate performance tuning, and prepares the system for upcoming Main Era capabilities and the planned mainnet launch in late 2025.
