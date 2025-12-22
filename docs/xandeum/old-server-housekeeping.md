---
title: Old Server housekeeping
slug: old-server-housekeeping
createdAt: 2024-12-31T21:21:02.591Z
updatedAt: 2025-11-12T03:36:21.510Z
---

# Update your server

Run as `sudo` / `root` user

:::hint{type="info"}
Reboot if you have a new kernel installed during the update that needs loaded.
:::

```bash
sudo -s &&
```

```bash
apt-get update -y && apt upgrade
```

# Stop old system service

Use  `status` to check if its running, `stop` to stop the service, and `disable` to prevent it from loading next reboot

```bash
systemctl status xand.service
systemctl disable xand.service
systemctl stop xand.service
```

# SSH Keys

If you want to make a new user `sol` to match the new guide, then make sure your ssh keys to login remotly are stored in your home dir for `sol` or `root` users (not only in `xand` home dir. Careful with the ssh keys...if you remove them you could lock yourself out of your server...

Check for keys in root

```bash
sudo cat ~/.ssh/authorized_keys
```

Check for keys in `xand`

```bash
su xand
```

```bash
cd ~
cat ~/.ssh/authorized_keys
```

Copy from xand and append to root keys file

```bash
sudo -i
```

```bash
sudo cat /home/xand/.ssh/authorized_keys >> /root/.ssh/authorized_keys
```

# Validator Keypairs

Make sure you have copied your validator keypairs if they are needed for the new server.

Otherwise they can be created new during install of the validator software.&#x20;

There is no reason to re-use the old one, only personal preferance.

# Remove xand user account

Once you have sucessfully logged into your server using either `root` or `sol` user, and copied/backed up any files you need, you may wish to remove everything from `xand` user and their files.

```bash
sudo -s
```

```bash
userdel -rf xand
```



