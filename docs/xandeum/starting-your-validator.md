---
title: Starting your validator
slug: starting-your-validator
description: Learn two methods to start a validator for optimal performance. Choose between manual activation, keeping your terminal open, or set up a system service for automatic startup after system reboots. Follow the step-by-step guide for enabling and checking th
createdAt: 2023-08-19T21:26:17.108Z
updatedAt: 2025-11-12T03:36:21.510Z
---

# There are two methods to start your validator.&#x20;

:::hint{type="warning"}
**Only run one method or the other. If you have followed the guide, then proceed to option 2 below to start as a background service.**
:::



## 1) Manual&#x20;

:::hint{type="info"}
Manual will require you to keep the terminal window open or use a terminal multiplexor (tmux) as the validatator will die if the window closes.
:::



Run the exec file from the home dir&#x20;

:::CodeblockTabs
CLI

```linux
cd ~
```
:::

:::CodeblockTabs
CLI

```linux
./validator-start.sh
```
:::









## 2) System Service (Auto)

The service will run in the background and will auto start 1 second after the system reboots.&#x20;

:::hint{type="info"}
NOTE: complete the section [**Setup System Service**](docId:_z4VVag78Oly1DTLPVmmb) first.

Run as `sudo` or `root` user
:::

Enable the service to run in auto

:::CodeblockTabs
CLI

```linux
sudo systemctl daemon-reload
sudo systemctl enable --now validator.service
```
:::

Check if the service started and stayed running

:::CodeblockTabs
CLI

```linux
sudo systemctl status validator.service
```
:::

:::hint{type="info"}
Note: You should see the service is `active (running)` and you should see no `exit code` in the log at the bottom of the status window as shown below.&#x20;

Press `q` to quit.
:::



![](https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/os3oF3j94hZi5I0TcFJ8a_screenshot-2023-08-19-201410.png)

Continue to [**Monitoring your validator**](docId\:MYh9NcGnA169K2hipDjBA)
