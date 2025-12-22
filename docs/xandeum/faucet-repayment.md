---
title: Faucet Repayment
slug: faucet-repayment
description: Learn how to use the DevNet Faucet for development and staking on the DevNet with this comprehensive document. Find instructions on checking your balance, sending tokens to your validator-keypair, and withdrawing tokens securely. Discover a high op-sec op
createdAt: 2023-09-02T20:25:46.256Z
updatedAt: 2025-11-12T03:36:21.510Z
---

:::hint{type="info"}
The Faucet is used to supply tokens for development and staking on our DevNet. They have no value. When you run a DevNet validator, you earn DevNet Tokens into your vote account. We would appreciate you repaying these back into the faucet so we can keep funding future projects on DevNet! We have 2 wallet accounts for the faucet.&#x20;

Use this to send some to your validator-keypair for voting fees too!

Check out the "High Op-Sec option" below to test out having your withdrawal account removed from your machine!
:::

:::hint{type="success"}
- DevNet Faucet Addresses:
  - `BkFN8AC5aak9bXYxLLyXsUm1QJhbZh6aYEVHidJC3rs7`
  - ``
:::



# DevNet Standard

:::hint{type="info"}
Run as `sol` user from the `/user/sol` directory
:::

:::CodeblockTabs
CLI

```linux
su xand
cd ~
```
:::



Check your balance (yea, we wish it were real too!)

:::CodeblockTabs
CLI

```linux
solana balance ~/vote-keypair.json
```
:::



If your withdraw key is stored on the machine (highly undesireable once we get to mainnet!) Send 1000 to your validator-keypair to pay for vote transactions:

:::CodeblockTabs
CLI

```linux
solana withdraw-from-vote-account --authorized-withdrawer ~/withdraw-keypair.json ~/vote-keypair.json ~/validator-keypair.json 50
```
:::

Send the rest of your DevNet earnings back to the faucet (don't worry, you will earn more!)

:::CodeblockTabs
CLI

```linux
solana withdraw-from-vote-account --authorized-withdrawer withdraw-keypair.json vote-keypair.json BkFN8AC5aak9bXYxLLyXsUm1QJhbZh6aYEVHidJC3rs7 ALL
```
:::







# High Op-Sec option

:::hint{type="info"}
It would be worthwhile to figure these options out while on DevNet!
:::



If your withdraw key is NOT stored on the machine, then use this. This will require you to input your 12 words (+bip39 passphrase if used). It may be most desirable to recover all keys needed to a secure local machine.&#x20;

:::CodeblockTabs
CLI

```linux
solana withdraw-from-vote-account --authorized-withdrawer ASK vote-keypair.json BkFN8AC5aak9bXYxLLyXsUm1QJhbZh6aYEVHidJC3rs7 ALL
```
:::

:::hint{type="warning"}
NOTE: If you require more than one transaction with the recovered key, you may wish to temporarily recover the key to a file to process multiple transactions without requiring the 12 words each time.
:::

Recover a keypair from seed phrase to json output file. Bip39 passphrase (if used) will be required after seed phrase is accepted.

:::CodeblockTabs
CLI

```linux
solana-keygen recover -o temporary-key.json
```
:::

Withdraw from vote account using temporary withdraw keyfile and send back to faucet address.

:::CodeblockTabs
CLI

```linux
xandeum withdraw-from-vote-account --authorized-withdrawer temporary-key.json vote-keypair.json BkFN8AC5aak9bXYxLLyXsUm1QJhbZh6aYEVHidJC3rs7 ALL
```
:::

:::hint{type="danger"}
Don't forget to remove the temporary key from the machine so the two keys required to withdraw from your vote-account are not sitting side-by-side!
:::

