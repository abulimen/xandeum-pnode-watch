---
title: v0.8 Reinheim
slug: v08-reinheim
createdAt: 2025-11-13T14:58:01.891Z
updatedAt: 2025-12-15T00:40:55.031Z
---

# State of Development Post-Reinheim

Reinheim (v0.8) is a focused, small release in Xandeum's South Era, delivering directory tree name searching via glob patterns to make large file systems significantly more navigable for sedApps and operators.

## Core Features

- **Directory Tree Name Searching**: Enables efficient, manageable file discovery in large file systems, making storage more practical for sedApps.
  - The new `find` operation searches for files and directories matching a glob pattern within a specified file system or subtree.
  - Supports Unix-like wildcard patterns:
    - `*` for any characters
    - `?` for a single character
    - Escaped literals (e.g., `\.` for a dot)
  - Fully recursive, traversing subdirectories automatically.
  - Ideal for queries like yearly reports (e.g., "financials200?.\*") or config files.

::::CodeDrawer{isResponseExpanded="true" title="Searching for Files with Glob Patterns" codeEditorData="[object Object]" responsesEditorData="[object Object]"}
:::CodeblockTabsExamples
```javascript
// Search the root of file system ID 1234 for all .txt files (recursive)
const results = await xandeum.find("1234", "*.txt");

// Example: Search for config-related files and directories
const configResults = await xandeum.find("1234", "config*");
```
:::

:::CodeblockTabsResponses
```text
// Example results for "*.txt"
[
  "/document.txt",
  "/notes.txt",
  "/readme.txt",
  "/data/file.txt"
]

// Example results for "config*"
[
  "/config.json",
  "/config_prod.yaml",
  "/configuration.txt",
  "/configs/settings.ini"
]
```
:::
::::

## Summary

Reinheim (v0.8) delivers a valuable usability improvement in Xandeum's South Era by adding directory tree name searching with glob pattern support. This small but impactful release makes file discovery efficient in large-scale file systems, building on prior advancements in redundancy (Stuttgart) and analytics (Heidelberg). It enhances practical day-to-day operations for sedApp developers and pNode operators alike, while bringing the prototype storage layer one step closer to full mainnet readiness by late 2025.

