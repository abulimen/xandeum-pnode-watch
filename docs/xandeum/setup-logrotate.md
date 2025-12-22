---
title: Setup LogRotate
slug: setup-logrotate
description: Learn how to use LogRotate, a powerful tool for managing log files. This document explains how to avoid downtime by ensuring the validator start script starts with "exec". Follow the step-by-step guide to run LogRotate as the root user using "sudo -i" and
createdAt: 2023-08-19T21:18:17.523Z
updatedAt: 2025-11-12T03:36:21.510Z
---

# LogRotate

LogRotate will break your log into a new file daily and keep 7 days of logs and discard old logs.

:::hint{type="warning"}
**Important:** Make sure your validator start script starts with `exec` or your validator will go offline for a time each time the logs rotate.
:::

:::hint{type="info"}
Run as `root` user, use `sudo -i`
:::

Copy code block and paste into terminal.

:::CodeblockTabs
CLI

```linux
cat > logrotate.agave <<EOF
/home/sol/validator.log {
  rotate 7
  daily
  missingok
  postrotate
	systemctl kill -s USR1 validator.service
  endscript
}
EOF
sudo cp logrotate.agave /etc/logrotate.d/agave

```
:::

Restart logrotate service

:::CodeblockTabs
CLI

```linux
sudo systemctl restart logrotate.service
```
:::



Continue on to [**Starting your validator**](docId\:QT-gKqLryy-cYMxMcoZYe)
