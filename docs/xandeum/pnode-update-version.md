---
title: pNode UPDATE version
slug: pnode-update-version
description: Update your elready set up Xandeum pNode using this update guide.
createdAt: 2023-08-19T03:02:55.649Z
updatedAt: 2025-11-13T16:32:46.092Z
---



Connect to your pNode via SSH, forwarding the proper ports into the localhost of the pNode.

If you're using windows, you'll use `cmd.exe` or `power shell` , use this format:
****Be sure to verify the location of your SSH identity file and public IP address.****

:::CodeblockTabs
CLI

```linux
ssh -i "C:\path to ssh key\id_ed25519.pub" root@<my.p.node.ip> -L 4000:localhost:4000 -L 3000:localhost:3000 -L 8000:localhost:8000 
```
:::

If using Mac terminal or Linux, use this format:
****Be sure to verify the location of your SSH identity file and public IP address.****

:::CodeblockTabs
CLI

```linux
ssh -i ~/.ssh/id_ed25519 root@<my.p.node.ip> -L 4000:localhost:4000 -L 3000:localhost:3000 -L 8000:localhost:8000 
```
:::





Run the newest version of the `install.sh` script, and use Option 2 to Upgrade:

:::hint{type="warning"}
Run as `root` user
use `sudo -i` to change to root user
Sudo password may be required
:::

:::CodeblockTabs
CLI

```linux
wget -O install.sh "https://raw.githubusercontent.com/Xandeum/xandminer-installer/refs/heads/master/install.sh" && chmod a+x install.sh && ./install.sh
```
:::

::::hint{type="success"}
:::BlockQuote
After running Option 2, Wait for the completion messages. It may take several minutes and will look like this when done:

Xandminerd Service Running On Port : 4000
To access your Xandminer, use address localhost:3000 in your web browser
Setup completed successfully!
Upgrade completed successfully!
Restarting Xandeum service...
Service restart completed.

:::
::::



Go to your local web browser and check your xandminer status in the web GUI

:::CodeblockTabs
CLI

```linux
http://localhost:3000/
```
:::



A completed upgrade will show the correct versions, see screenshot:


![](https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/1gZJMHyvbN5TB2KUb3zDp_image.png)

Congratulations, you completed the upgrade!




:::hint{type="warning"}
Check your pNode is accessible on the correct ports here:
&#x20;[**https://pnodes.xandeum.network/#nYHpd**](https://pnodes.xandeum.network/#nYHpd)
----------------------------------------------------------------------------------------
:::



***Don't forget to enable storage by using the "Dedicate and Earn" button!***


***

