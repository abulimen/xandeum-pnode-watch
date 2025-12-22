---
title: Troubleshooting
slug: troubleshooting
description: Learn essential troubleshooting steps for validators on the Xandeum network. Ensure your validator keypair has the correct balance, stake tokens to the vote account, and verify successful TCP connections on specific ports by restarting the validator. Boos
createdAt: 2023-09-02T13:43:48.844Z
updatedAt: 2025-11-12T03:36:21.510Z
---

# Some things to try

## Balance

Run the `catchup.sh` script first. If you're caught up but your validator is delinquent, then check your `validator-keypair.json` balance.

- Check the Identity Account balance...you need to pay fees out of this account to vote on transactions.

:::CodeblockTabs
CLI

```linux
solana balance validator-keypair.json
```
:::





## Stake

If you're online but not in the `xandeum validators` list, Check if there is any tokens staked to your vote account. If not, follow up with Labs to get you staked.

:::CodeblockTabs
CLI

```linux
solana stakes ~/vote-keypair.json
```
:::

:::hint{type="info"}
If it shows a stake account, but has the phrase `Stake account is undelegated` then it means you were delinquint at some point and your stake was removed to lower the delinquincy level. See examples below.
:::

![](https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/mfeGXYnLvL1LnzsouZibr_image.png "Normal Output if staked")

![](https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/VtP3pe1a0A7pBl6B4sD6J_image.png "Output if stake has been removed")



## Connections

Restart your validator and watch for the TCP connections to suceed:

:::CodeblockTabs
CLI

```linux
sudo systemctl restart validator.service &&
tail -f ~/validator.log | grep --color=always -B 10 -A 50 "Checking that tcp ports"
```
:::

![](https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/56jMMbbVixqAyEt8RMziI_image.png "Correct ports are reachable")

:::hint{type="info"}
Look for the ports to be "reachable"

- tcp/8899
- tcp/8900
- tcp/8000

This will tell you a lot about your router environment. If it fails the first time, it will try again. UDP is important too, but usually the first indicator of trouble is TCP.
:::

