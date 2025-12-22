---
title: Monitoring your validator
slug: monitoring-your-validator
description: Learn how to monitor and troubleshoot log files using various scripts. This document explains how to create a monitor script, a catchup script, and utilize a watchtower system for effective monitoring. The monitor script allows you to execute specific com
createdAt: 2023-08-19T21:28:06.533Z
updatedAt: 2025-11-12T03:36:21.510Z
---

# Tail your log file

Watch the latest entries in your log file for errors. It moves fast...so may need to stop the tail and read before restarting. Here are several ways to run it.&#x20;

:::hint{type="info"}
When the validator is first starting up, it asks the `entrypoint` in the start script "what IP address do you see me at?" Then it proceeds to ask the entrypoint if the required ports are open for it to use. This can be searched for during the startup sequence using the last tail option below that will grep 10 lines before and 50 after the search term to see if you are reachable. There is a ton of good connection debugging info in this search. See screenshot below.
:::

:::hint{type="warning"}
Run as `sol`  user
:::

:::CodeblockTabs
CLI

```linux
su sol
cd ~
```
:::

:::CodeblockTabs
CLI

```linux
tail -f ~/validator.log
```
:::

:::CodeblockTabs
CLI

```linux
tail -f ~/validator.log | grep "search terms"
```
:::

This will restart your validator then grep the log file for initial connection info:

:::CodeblockTabs
CLI

```linux
sudo systemctl restart validator.service &&
tail -f ~/validator.log | grep --color=always -B 10 -A 50 "Checking that tcp ports"
```
:::

![](https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/56jMMbbVixqAyEt8RMziI_image.png "Correct ports are reachable")

#

# mon.sh

Create a `monitor` script to easily run the monitor command

:::hint{type="info"}
Run as `sol` user
:::

Create a blank file named `mon.sh` in your home dir with editor.

:::CodeblockTabs
CLI

```linux
cd ~
```
:::

:::CodeblockTabs
nano

```linux
nano mon.sh
```

vim

```linux
vim mon.sh
```
:::

Copy the code block into the file, correcting your ledger path if needed. Save and exit.

:::CodeblockTabs
CLI

```linux
agave-validator --ledger ~/ledger monitor
```
:::

Make the file executable

:::CodeblockTabs
CLI

```linux
chmod a+x mon.sh
```
:::

Run the monitor from home dir

:::CodeblockTabs
CLI

```linux
cd ~
./mon.sh
```
:::

:::hint{type="info"}
NOTE: Press `enter` to drop a line to compare old values and press `ctrl+c` to exit the monitor command.
:::



# catchup.sh

Create a `catchup` script that compares your machine to the RPC that you are connected to.


Create a blank file named `catchup.sh` in your home dir with editor.

:::CodeblockTabs
CLI

```linux
cd ~
```
:::

:::CodeblockTabs
nano

```linux
nano catchup.sh
```

vim

```linux
vim catchup.sh
```
:::

Copy the code block into the file. Save and exit.

:::hint{type="warning"}
Note: if using the ALT method for catchup because localhost is not working for you...be sure to grab your validator ID pubkey using `solana-keygen pubkey ~/validator-keypair.json`
:::



:::CodeblockTabs
CLI

```linux
solana catchup -k ~/validator-keypair.json --our-localhost --follow --verbose
```

ALT

```linux
solana catchup --url https://api.devnet.xandeum.network:8899 <validator ID pubkey> --follow --verbose
```
:::

Make the file executable

:::CodeblockTabs
CLI

```linux
chmod a+x catchup.sh
```
:::

Run the monitor from home dir

:::CodeblockTabs
CLI

```linux
cd ~
./catchup.sh
```
:::

:::hint{type="info"}
NOTE: Press `enter` to drop a line to compare old values and press `ctrl+c` to exit the catchup command.
:::



Watchtower



:::hint{type="warning"}
NOTE: `agave-watchtower` is an optional monitoring system **running on a separate computer** that will alert you in your own personal discord. Setup is required that is not shown in this guide.&#x20;
:::



:::hint{type="info"}
Run as `sol` user without sudo
:::



Watchtower should be ran from a remote computer that is running 24/7. It works by asking the RPC node if your Validator passes all the sanity checks. It can be added as a service or ran in a tmux window that never closes. You will need the  software compiled to the point that `solana -V` works after a reboot. You will need to create a Discord or Slack channel with a webhook to make this work. Telegram, PagerDudy, and Twilio are also supported.

This example script checks every `<interval>` seconds and alerts to Discord and Slack if `<unhealthy-threshold>` number of failures show in a row\...ie 900 seconds

Multiple scripts can be running with different `--validator-identity` and pumped into the same alert channel and use the `--name-suffix` to uniquely identify which machine is failing.



:::hint{type="warning"}
NOTE: If our RPC node goes down or is unreachable from your location...you will get false positives that your machine is down...this can be added if desired:

`--ignore-http-bad-gateway`   &#x20;

`Ignore HTTP 502 Bad Gateway errors from the JSON RPC URL. This flag can help reduce false positives, at the expense of no alerting should a Bad Gateway error be a side effect of the real problem`
:::



:::CodeblockTabs
nano

```linux
nano watchtower-alerts.sh
```

vim

```linux
vim watchtower-alerts.sh
```
:::

Add text to file and modify for your needs:

:::CodeblockTabs
text

```linux
export DISCORD_WEBHOOK=https://discord.com/api/webhooks/xxxxxxx/yyyyyyyyyy
export SLACK_WEBHOOK=https://hooks.slack.com/services/xxxxxxxxx/yyyyyyyy/zzzzzz
#note for google spaces output, use the same format as slack but add double quotes, see below.
export SLACK_WEBHOOK="https://chat.googleapis.com/v1/spaces/xxxxxxxxx/messages?key=yyyyyyyyyyy-yyyyyyyytoken=zzzzzzzzzzzzzzz"

#! /bin/sh
exec agave-watchtower \
         --url https://api.devnet.xandeum.network:8899/ \
         --validator-identity <Validator ID> \
         --name-suffix ::<Alert>:: \
         --interval 300 \
         --unhealthy-threshold 3 \
         --minimum-validator-identity-balance 3 \

```
:::

:::CodeblockTabs
CLI

```linux
chmod a+x watchtower-alerts.sh
```
:::

Run the script! You may want this running in a tmux session so it stays active when you close your teminal. [**Learn Tmux**](docId:4ivv9szuCMvtZAXZxUxhj)

:::CodeblockTabs
CLI

```linux
./watchtower-alerts.sh
```
:::

![](https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/PqxUCTwyd5VdRxwma1um__image.png)

From the script, we will see that 3 ERRORS in a row checked at 300 second intervals will trigger the alert to be sent to our Discord webhook.



Consider next [**Zabbix Installation**](docId\:MLb0ziv_jx0kZbybDclo2)
