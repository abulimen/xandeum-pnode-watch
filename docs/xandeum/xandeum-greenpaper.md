---
title: Xandeum Greenpaper
slug: xandeum-greenpaper
createdAt: 2025-01-01T01:13:08.344Z
updatedAt: 2025-11-12T04:01:10.626Z
---

![](https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/VDQyu5F-6c32A1aVQ67d3_logo.png)

# The Xandeum Transformation

# 1. Introduction and Motivation

Try storing a **few gigabytes** of data directly on any blockchain, and watch the costs soar into the **stratosphere**. Yet, Web2 apps run on **massive datasets every day** without breaking a sweat. Enter Xandeum: a new approach that merges Solana’s lightning-fast consensus with an infinitely **scalable storage layer**—enabling sedApps (storage-enabled dApps) that rival (and even surpass) traditional centralized services.

Building truly decentralized applications requires more than just trustless computation and state (account) management—it demands **scalable, cost-effective, and random-access data storage** that's 100% integrated into the smart contract platform. While protocols like Filecoin and Arweave have made strides in decentralized storage, they prioritize "whole file" (S3-like) and/or archival use cases over fast, granular reads and writes with read/write heads that can be set to any position. Meanwhile, storing significant data on-chain (e.g., within Solana’s account model) is expensive and limited in capacity. This disconnect is at the core of what we call the [**blockchain storage trilemma**](https://www.xandeum.network/blockchain-storage-trilemma): balancing decentralization, cost, and efficient random access has proven notoriously difficult.

Xandeum resolves this challenge by **extending Solana’s native account model** with an integrated storage layer that implements the “file system” model to developers while still maintaining on-chain verifiability. In other words, Solana dApp devs get fine-grained, random-access data operations—backed by a decentralized network—without sacrificing performance or affordability. By allowing data to flow seamlessly between standard Solana accounts and Xandeum’s scalable file system, we remove the friction that limits what decentralized apps (dApps) can achieve.

This unified approach sets the stage for a “**Cambrian explosion**” of innovative projects ported from Web2 and entirely new categories of **sedApps** (storage-enabled decentralized applications). From large-scale social platforms to data-heavy research hubs and open knowledge repositories, Xandeum empowers developers to operate at Web2 efficiency and scale, all under the trust guarantees of a blockchain.

In the following chapters, we will explore the architectural principles behind Xandeum’s storage layer, discuss how developers can build and deploy sedApps, and illustrate real-world use cases that exemplify the transformative potential of this technology.



# 2. Xandeum Fundamentals

Xandeum’s core innovation is its **scalable, file-system-based storage layer** that integrates seamlessly with Solana’s high-throughput blockchain. By treating data as files and folders rather than merely on-chain accounts, developers gain flexible, random-access capabilities—without compromising on decentralization or performance. This file system architecture, with their limited set of primitives but including important possibilities called `read()`, `write()` and `seek()` in Unix, has been proven over decades to facilitate a plethora of classes of apps.

### Core Architecture



1. **Extended Solana Account Model**

   Solana handles the trustless execution of smart contracts, while Xandeum manages large data sets in an off-chain but **cryptographically verifiable, blockchain-grade** environment.

   Developers can use specific Xandeum transactions (Xtransactions), sent to Xandeum-aware RPC nodes, to copy data from Solana accounts to a given position within a (mostly larger) Xandeum file inside a Xandeum file system and vice versa.

   That way, the Solana accounts act as the "RAM" of the world computer (Solana in this case), and the Xandeum scalable storage layer as the (so far missing) "disk".

2. **Distributed Storage Nodes**

   Xandeum relies on a set of storage nodes that collectively maintain and replicate files, ensuring **high availability** and **fault tolerance** while being **tamper-proof**, **censorship-resistant** and **crytographically verifiable**, hence the term blockchain-grade storage.

   Data is split into pages (borrowed from Unix memory management) and encrypted, so no single node holds a complete plaintext copy. This deters censorship and preserves user privacy.

3. **Random-Access Protocol**

   Rather than storing data in “write-once” layers, Xandeum’s architecture allows for **granular reads and writes**, similar to a traditional file system.

   This innovation underpins the blockchain storage trilemma solution, enabling cost-effective, rapid data queries without large overhead or complex retrieval processes.



## Key Protocols & Security

1. **pNode Stake Consensus (BFT-Light)**
   - Xandeum’s storage is maintained by **provider nodes (pNodes)**, each of which stakes tokens or collateral to participate.
   - A lightweight Byzantine Fault Tolerance (BFT) mechanism ensures that honest pNodes can continue serving data—even if a subset becomes malicious or fails.
   - This partial consensus avoids excessive overhead by leveraging **Solana** for primary trust anchoring, focusing pNode consensus on storage correctness and availability.
2. **Paging, Replication & Self-Repair**
   - Files are **paged** and **erasure-coded** across multiple pNodes, so that data can be reconstructed even if some nodes lose or corrupt their pieces. We're borrowing from both Unix memory management for the paging as well as ZFS for the redundancy mechanisms.
   - The pNode network maintains the **configurable redundancy** level as set by the storage-enabled dApp (sedApp).
   - A **self-repair** protocol continuously monitors data distribution. If redundancy drops below a safe threshold, new replicas are automatically generated and reassigned to maintain reliability.
3. **Threshold Signature Schemes (TSS)**
   - Xandeum uses **TSS** for cryptographic operations that require joint authorization (e.g., validating data integrity or performing privileged network tasks).
   - Rather than relying on a single signer, TSS splits signing authority among multiple pNodes, reducing the attack surface and strengthening network security.
4. **Periodic Storage Challenges**
   - Similar to Filecoin’s proof-of-storage and proof of space-time (PoST) concepts, **pNodes** must respond to **periodic challenges** from a set of **validators**—proving they still hold the correct data shards.
   - The difference: Xandeum reduces overhead by **anchoring** these proofs on **Solana** rather than running resource-intensive verifications entirely on the storage layer.
   - Validators verify challenge responses and can penalize pNodes that fail or refuse to produce valid proofs, ensuring persistent data availability.
5. **Anchoring to Solana’s Ledger**
   - Each file operation (create, update, delete) and key network event is still **anchored** to **Solana** for finality and verifiability.
   - This hybrid approach unites **pNode**-level checks (ensuring actual data availability) with **Solana**’s trust guarantees (ensuring tamper-proof records of changes).



By combining these protocols—**pNode stake consensus**, **erasure coding**, **TSS**, **periodic challenges**, and **on-chain anchoring**—Xandeum delivers **blockchain-grade** reliability, availability, and integrity for large-scale file storage. Developers can trust that their data is continuously secured by the network, while enjoying the **random-access** performance and ease of use made possible by Xandeum’s **file-system-based** approach.



### Developer Experience

1. **Familiar File-System Interface**

   Rather than forcing developers to grapple with raw storage opcodes, Xandeum’s APIs abstract data interactions into straightforward file and folder operations.

   This **reduces the cognitive load** for teams transitioning from Web2 infrastructures.

2. **Transparent Integration with Solana**

   Developers can use standard Solana tooling (such as the Solana Program Library, CLI tools, and popular frameworks) to orchestrate on-chain logic.

   Data writes and reads in Xandeum are triggered by simple function calls, creating a **unified** workflow.

3. **Flexibility for sedApps**

   By offering **storage-at-scale** plus **rapid state transitions**, sedApps can adopt new user experiences once reserved for centralized platforms.

   This paves the way for the Cambrian explosion of decentralized services Xandeum seeks to ignite.



With these fundamentals, Xandeum balances security, cost-efficiency, and random-access performance—ultimately enabling a new class of **storage-enabled dApps** (sedApps) to thrive on Solana and beyond. In the next chapter, we’ll explore how developers can harness these capabilities to build, deploy, and manage **sedApps** in practice.



# 3. Building sedApps on Xandeum

Developing **storage-enabled dApps (sedApps)** on Xandeum combines the speed and familiarity of **Solana**’s account-based architecture with a **file-system-based** storage interface that scales to meet real-world data demands. This chapter offers a high-level view of how to build, test, and deploy sedApps—while highlighting best practices for leveraging Xandeum’s integrated storage layer.

***

## Guiding Principles

1. **Embrace Solana’s Core Strengths**
   - Solana handles high throughput, robust consensus, and standard tooling for transaction settlement and on-chain logic.
   - Your dApp logic remains centered around smart contracts (programs) and accounts, just as it would on Solana alone.
2. **Offload Data to Xandeum**
   - Whenever you need to store large or frequently accessed datasets, shift that data to Xandeum’s file system based layer instead of bloating on-chain accounts.
   - This keeps your application fast and economical, while giving you **granular**, **random-access** operations.
3. **Maintain Trust Anchoring**
   - Leverage Solana (and potentially other blockchains) for **data anchoring**.
   - Each critical file operation references a hash or **Merkle root** stored on-chain, ensuring immutability and transparency without storing bulky content directly on the ledger.
4. **Prioritize User Experience**
   - **sedApps** are designed to feel smooth and inviting—similar to Web2 solutions—but underpinned by blockchain-grade trust.
   - Whether you’re building a wiki or an online game, simplify the process of reading and writing data so end users barely notice the decentralized mechanics behind the scenes.

***

## Developer Workflow

1. **Set Up Your Environment**
   - Install [**Solana’s tooling**](https://docs.solana.com/getstarted) for smart contract compilation, deployment, and testing.
   - Configure access to Xandeum’s developer environment (Devnet) and SDK, which expose file storage operations in a structure akin to directories and files.
2. **Design Data Schemas**
   - Map out which elements of your dApp should remain in **Solana accounts** versus which belong in Xandeum’s storage layer.
   - For instance:
     - Small counters or user balances might be on-chain.
     - Large documents or media attachments, databases (see demo applications below), extensive customer data go into Xandeum.
   - Define the app's **redundancy level**, e.g. 7 or 43. That means you'll require to always have 7 pNodes to store pages of your data. This is one of the key factors why Xandeum storage is scalable - we're **not bound&#x20;**&#x74;o Solana account's "Redundancy level is 3,000, period" approach, assuming there are 3,000 validators is the cluster.
3. **Implement Smart Contracts (Solana Programs)**
   - Write or adapt existing programs to reference Xandeum file locations, storing **hashes** or **pointers** in the on-chain state.
   - Ensure that any critical transactions (like file creation or updates) emit **events** and update these pointers for auditability.
4. **Handle File Operations**
   - Use **Xandeum**’s APIs to **create, peek** (read)**, poke** (update), or **delete&#x20;**&#x66;iles just as you would in a **Web2 file system**. We're peeking and poking our way through data, an homage to those glorious, spaghetti-coded days of BASIC.
   - Each operation triggers **cryptographic proof** generation, which can be anchored to **Solana**, preserving trust and audit trails.
5. **Testing and Debugging**
   - Deploy your program to **Solana Devnet** and interact with **Xandeum**’s storage **Devnet**.
   - Confirm that file hashes match the values stored on-chain, ensuring consistent integration between the two layers.
6. **Deployment and Scaling**
   - Once your **sedApp** is tested, deploy it to the **Xandeum-Solana Mainnet** (when available) or continue to refine on **Devnet**.
   - Plan for **horizontal scaling** as your data volume grows.
   - **Xandeum**’s storage layer handles large datasets and surges in traffic without compromising performance.

***

## Working with the Scalable Storage Layer

1. **Granular File-Access**
   - Peek and Poke files in small chunks, rather than dealing with entire blobs or "objects" as in ObjectStore solutions.
   - This flexibility is key for **real-time applications**, **collaborative documents&#x20;**&#x6F;r large **structured, interconnected&#x20;**&#x61;n&#x64;**&#x20;dynamically generated content**.
2. **Optional Versioning**
   - For use cases that require detailed historical tracking (e.g., collaborative docs, governance records), Xandeum can log file updates as **“versions.”**
   - Each version is tied to a verifiable proof, which can be anchored on-chain at intervals or on demand.
   - Developers who don’t need a full edit history can skip version logging to minimize overhead.
3. **Integration Patterns**
   - **Direct Reference**
     - Store file references in **Solana** accounts, updated by your program whenever a user uploads or modifies data.
   - **Off-Chain Index**
     - For large datasets, maintain an index in **Xandeum**’s file tree that links to specific file shards or directories.
     - Anchor periodic **Merkle roots** on-chain for transparent auditing.

***

## Looking Ahead

By combining the **Solana** account model with a decentralized, random-access **file-system-based** approach, **Xandeum** unlocks a wealth of possibilities for **sedApps**. This workflow and architecture will feel familiar to developers who’ve built on Web2 or traditional dApp frameworks—now enhanced by **blockchain-grade** properties and tight integration into **Solana**, supervised, overseen, and challenged by the validators, and massively reducing the cost of storage by minimizing redundancy in a configurable way.

In a broader sense, by **eliminating the storage bottleneck** that has prevented large-scale Web2 apps from becoming trustless and decentralized, **Xandeum** paves the way for a new wave of **sedApps**—ultimately propelling us closer to a **self-determined future** where any application can operate without sacrificing speed, usability, or freedom.

In the next chapter, we’ll spotlight **demo applications** that illustrate these principles. From a fast-paced binary guessing game (**iKnowIt.live**) to an open, community-driven wiki (**info.wiki**), we’ll show how **Xandeum**’s **scalable storage layer** can power **data-intensive dApps** at scale.





# 4. Demo Applications

To demonstrate how Xandeum’s **scalable storage layer** expands the possibilities for decentralized apps, we’re unveiling two early **sedApp** prototypes. **iKnowIt.live** shows off the real-time, interactive potential of offloading data-intensive operations to Xandeum, while **info.wiki** highlights how massive public data sets can be collaboratively managed and governed on-chain. Both demo apps are to be released open source to showcase the ease with which storage-enabled dApps (sedApps) can built on Xandeum.

***

## iKnowIt.live

A **binary guessing game** currently under development, aiming to launch live at **iKnowIt.live** later this year. Inspired by popular “think of a character, the app guesses who it is” games, **iKnowIt.live** takes a collaborative twist: players co-create and refine the knowledge base behind the game, adding or updating the distinguishing questions that help narrow down the correct answer. Over time, the knowledge tree grows deeper and more nuanced, giving the platform a sense of collective “intelligence.”

### Gameplay & Mechanics

- **Yes/No Questions**
  Players think of a person, object, or concept. The game asks a series of binary (yes/no) questions to make its guess.
- **Community-Driven Knowledge**
  If the game fails or struggles, players can help enrich the database by suggesting new questions or revising existing ones. This collaborative model ensures the knowledge grows organically.
- **Transparency & Co-Creation**
  Unlike an opaque AI model, **iKnowIt.live** allows the community to inspect, edit, and expand the underlying knowledge base directly, creating a shared sense of ownership and discovery.

### Why It Matters

- **Solana for Speed**
  The core game logic—like generating questions, accepting answers, and updating immediate state—relies on **Solana**. It’s fast, just like **RAM**, handling near-real-time interactions with minimal latency.
- **Xandeum for Capacity**
  **iKnowIt.live** stores its ever-growing knowledge base in **Xandeum**, analogous to **disk** storage. This approach ensures large data sets remain **affordable** and **scalable**, so the game can keep evolving without skyrocketing costs.
- **Avoiding On-Chain Bloat**
  Left to **Solana** alone, storing every user’s contributions and the full knowledge tree would be **prohibitively expensive**—and potentially **technically impossible** if it grows to terabytes of data. **Xandeum** solves that by offloading the biggest storage burdens.

### Timeline & Growth

- **Development in Progress**
  Work is underway to build out the core mechanics and user interface, with an **alpha version** targeted for release soon.
- **Projected Expansion**
  As the knowledge base matures and user numbers soar, the data volume could become massive—potentially reaching gigabytes (or more). **Xandeum** ensures this growth stays feasible.
- **Proof-of-Concept & Beyond**
  Though it’s “just a game,” **iKnowIt.live** illustrates how any data-rich dApp can exceed the practical limits of on-chain storage alone. With **Xandeum**, developers gain capacity to store significant, ever-expanding data sets while retaining the trust guarantees of **Solana**.

### Key Takeaways

- **Massive, Blockchain-Grade Data, Readily Accessible to Solana Programs**
  Large user bases and deep data sets remain practical through **Xandeum**’s file-system-based storage.
- **Cost-Efficiency**
  High-speed operations still happen on **Solana**, while **Xandeum** handles archival and bulk data needs without incurring exorbitant fees.
- **Endless Scalability**
  The game can add new questions, track detailed stats, and expand to new domains over time without hitting a storage wall—unlocking a truly **limitless** knowledge-driven dApp.

##

***

## info.wiki

A **community-driven knowledge repository**—inspired by Wikipedia—fueling a new wave of **open, fully decentralized collaboration**. By leveraging **Xandeum**’s storage approach, **info.wiki** can handle massive datasets while maintaining on-chain verifiability and governance.

### Concept

- Start with Wikipedia’s openly licensed database of articles (roughly **250GB** without media).
- Store this data on **Xandeum** for random-access reads and writes, while **Solana** anchors updates and community decisions.
- Over time, new articles and edits are published under **info.wiki**’s own license, requiring only that the source Wikipedia content remains properly attributed.

### Key Features

- **Massive Data Capacity**
  - **info.wiki** demonstrates how high-volume storage becomes practical in a decentralized setting.
  - By offloading article text and revision histories onto **Xandeum**, we avoid the high costs typically associated with on-chain data.
- **Version Control & History**
  - Each edit to an article is captured in a **Merkle-based** versioning structure, ensuring a tamper-evident revision history.
  - Periodic anchors on **Solana** guarantee transparency and trust in the editorial process.
- **Community-Driven Curation**
  - Edits, article creations, and reorganizations can be governed by a dedicated  community wiki token.
  - Stake-weighted proposals determine content disputes, editorial guidelines, and other governance matters.

### Governance Model

- **Community Wiki Token**
  - Distributed to early contributors, editors, and those who help maintain the platform’s health.
  - Token-holders can vote on community proposals (e.g., new editorial policies, software improvements, or curation rules).
- **On-Chain Anchoring**
  - All governance proposals and decisions live on **Solana**, ensuring transparent polling and results.
  - Major structural changes (like rewriting a significant chunk of the wiki) anchor new file states to **Solana** for verifiability.

### Roadmap

- **Summer / Late Summer 2025**
  - Initial launch of **info.wiki**, seeded with the Wikipedia dataset.
  - Open invitations for community governance participation, content updates, and feature requests.
- **Scalability & Beyond**
  - Explore multi-chain anchoring as the platform grows, potentially tapping into other networks for added security or specialized user communities.
  - Introduce advanced editorial features and expansions (e.g., media file storage) via **Xandeum**’s evolving capabilities.

***

## Why These Demos Matter

Both **iKnowIt.live** and **info.wiki** bring to life **Xandeum**’s defining advantage: combining **Solana**’s high-speed, low-latency consensus with a **file-system-based** storage solution capable of handling **massive** amounts of data. While **iKnowIt.live** demonstrates how even a knowledge-driven, user-generated gaming experience can grow without hitting on-chain storage limits, **info.wiki** explores the far-reaching potential of large-scale collaborative editing on a decentralized knowledge platform.

These examples underscore a central theme: with **Xandeum**, developers can **offload** big data requirements—everything from user-contributed content to gargantuan public datasets—onto a secure yet cost-efficient layer. That means greater freedom to innovate and **scale**, and less time spent wrestling with the prohibitive economics or technical hurdles of storing everything on-chain. As a result, **sedApps** on **Xandeum** can **rival** (and often surpass) their Web2 counterparts in functionality, all while retaining **trust**, **transparency**, and **decentralization**.

By solving the storage bottleneck, **Xandeum** paves the way for a genuine **Cambrian Explosion** of new and ported applications—ultimately moving us closer to a future where **every** app can be **self-determined** and free from centralized gatekeepers. In the next chapter, we’ll explore **Xandeum**’s **roadmap**, including how developers, token-holders, and ecosystem partners can help shape the platform as it progresses toward **mainnet** and **broad** adoption.



# 5. Conclusion & Outlook

From **iKnowIt.live**’s real-time interactivity to **info.wiki**’s large-scale, community-curated knowledge base, **Xandeum** demonstrates that decentralized applications no longer need to sacrifice performance for trust. By coupling **Solana**’s high-throughput blockchain with a **file-system-based** storage layer, we enable **sedApps** to operate at scales and speeds once considered unthinkable on-chain.

The **blockchain storage trilemma** is tackled through **random-access** data operations, anchored in secure, decentralized proofs. This fundamental shift paves the way for a **Cambrian Explosion** of innovative apps—whether they’re reimagined from Web2 or entirely new concepts that leverage decentralized infrastructures at scale.

We invite you to explore, build, and collaborate within the **Xandeum** ecosystem. Join our community channels, contribute to the codebase, and experiment with **Devnet** today. Together, we can forge a future where **sedApps** harness the full potential of blockchain technology—without compromising on speed, user experience, or the richness developers have come to expect from modern applications.

#

