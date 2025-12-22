---
title: Validator Commands
slug: validator-commands
description: Learn how to efficiently use the Xandeum validator software with this comprehensive document. Discover a range of useful commands such as checking connected machines, sorting validators by skip-rate, accessing log files, shutting down properly, and obtain
createdAt: 2023-08-21T02:39:22.358Z
updatedAt: 2025-11-12T03:36:21.510Z
---

# Help

Check the help file.&#x20;

Add `--help` behind ANY validator command to get help on that command or subcommand (ie `solana validators --help`)

:::CodeblockTabs
CLI

```linux
solana --help
```
:::

:::CodeblockTabs
CLI

```linux
agave-validator --help
```
:::

#

# Gossip

Check the machines connected to the cluster

:::CodeblockTabs
CLI

```linux
solana gossip
```
:::

#

# Validators

Check the current and delinquent validators, stake and software version.

:::CodeblockTabs
CLI

```linux
solana validators
```
:::

This will sort by highest skip-rate.

:::CodeblockTabs
CLI

```linux
solana validators --sort skip-rate --reverse
```
:::

#

# Delinquent Validators

Show only delinquent validators by grep for the ⚠️ symbol

:::CodeblockTabs
CLI

```linux

solana validators | grep -P '\x{26A0}'
```

CLI

```linux
solana validators | grep ⚠️ 
```
:::

#

# LOGS

Follow the log file (it moves fast, can be combined with options such as pipe to grep)

:::CodeblockTabs
CLI

```linux
tail -f validator.log
```
:::

:::CodeblockTabs
CLI

```linux
tail -f validator.log | grep "search terms"
```
:::

#

# EXIT

To properly shut down a validator

Use exit command to:

- Check for upcoming leader slots
  - Note: with our cluster size, we will almost always be missing leader slots by shutting down so we need to bypass this check with `--min-idle-time`
- Check cluster for delinquent stake
- Take local snapshot
- Stop your validator

:::CodeblockTabs
CLI

```linux
agave-validator --ledger ~/ledger exit --max-delinquent-stake 10 --min-idle-time 0 --monitor
```
:::

![](https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/Yfk--p-f7d2S50x_VMsSA_screenshot-2023-08-20-215530.png "Exit is holding for upcoming leader slot")

![](https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/Y9W6cuiUzqlgbxnKBuEFs_screenshot-2023-08-20-220527.png)

:::hint{type="warning"}
NOTE: If you have a system service set up on the machine, then you also need to `stop` the service or it will auto-restart!
:::

:::CodeblockTabs
CLI

```linux
sudo systemctl stop validator.service
```
:::

:::CodeblockTabs
CLI

```linux
sudo systemctl status validator.service
```
:::

#

# Get Config

:::CodeblockTabs
CLI

```linux
solana config get
```
:::









