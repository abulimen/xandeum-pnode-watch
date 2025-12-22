---
title: Setup System Service
slug: setup-system-service
description: Learn how to create a systemctl config file for running the powerful Xandeum Validator program effortlessly. This comprehensive document covers all the necessary specifications for executing the program, restart behavior, user privileges, and file limits.
createdAt: 2023-08-19T21:17:46.187Z
updatedAt: 2025-11-12T03:36:21.510Z
---

:::hint{type="warning"}
Run as `root` user, use `sudo -i`
:::

Create your systemctl config file

:::CodeblockTabs
nano

```linux
sudo nano /etc/systemd/system/validator.service
```

vim

```linux
sudo vim /etc/systemd/system/validator.service
```
:::

Paste into editor, make any changes to ledger dir or $PATH if you have deviated from the guide. Save and exit.



:::CodeblockTabs
CLI

```linux
[Unit]
Description=Agave Validator
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=5
User=sol
LimitNOFILE=2000000
LogRateLimitIntervalSec=0
Environment="PATH=/bin:/usr/bin:/home/sol/.local/share/xandeum/install/releases/active_release"
ExecStart=/home/sol/validator-start.sh

[Install]
WantedBy=multi-user.target
```
:::

:::CodeblockTabs
CLI

```linux
sudo systemctl daemon-reload
```
:::



:::hint{type="warning"}
Note: You will start the validator using Option 2 on the Starting your validator section later on in the guide.
:::



Continue on to [**Setup LogRotate**](docId\:OLsHuypkjco2MYsxJL9P3)
