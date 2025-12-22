---
title: Onboarding
slug: onboarding
description: Learn how to onboard a validator seamlessly with this step-by-step guide. Check the validator's status, CPU cores, and current slot. Ensure blockchain synchronization by running scripts and submit essential details like IP address, hostname, Validator ID,
createdAt: 2023-08-31T23:37:22.217Z
updatedAt: 2025-11-12T03:36:21.510Z
---

# Onboarding Process

**Follow All the steps on this page to verify you are ready to onboard your validator!**

:::hint{type="info"}
1. **After you have the validator running for at least 1 hour,** please follow steps 2-6 to ensure you are ready to onboard and start validating transactions!
2. Check `htop` to see if your cpu cores are active (meaning validator is running)
3. Check the current slot `solana slot`
4. Run your `mon.sh` script and verify you are above the slot listed in 2
5. Run `catchup.sh` script to verify you are staying in pace with the blockchain...ie `0 slot(s) behind (us:12345 them:12345)` and watch for 5 minutes
6. Grab the needed info below and submit onboarding form with your IP address, hostname, Validator ID, and Vote ID using the button below.
:::

:::hint{type="warning"}
Use `sol` user
:::



Find your Validator ID Pubkey

:::CodeblockTabs
CLI

```linux
solana-keygen pubkey ~/validator-keypair.json
```
:::

Find your Vote Account Pubkey

:::CodeblockTabs
CLI

```linux
solana-keygen pubkey ~/vote-keypair.json
```
:::

Find your Public IP Address with a suitable method, here are two:

:::CodeblockTabs
dig

```linux
dig +short myip.opendns.com @resolver1.opendns.com
```

curl

```linux
curl https://ipinfo.io/ip/
```
:::



::::hint{type="success"}
:::CtaButton{label="Submit Onboarding Details" docId docAnchorId externalHref="https://xand-devnet-2.paperform.co" openInNewTab="true"}

:::

**Please take a moment to grab your Public IP address, hostname, Validator Pubkey and Vote Pubkey. Submit to Xandeum Foundation using this form!&#x20;**
::::


Check out more [**Validator Commands**](docId\:IZ8K2IUlzWiP78mLxBgE1)
