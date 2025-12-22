---
title: Setup Your Disks
slug: setup-your-disks
description: Learn how to increase your storage space on Ubuntu by using commands like `df -h` and `lsblk`. Follow step-by-step instructions to format a new drive, create a directory for storage, and mount the spare device. Optimize storage on your machine with ease.
createdAt: 2023-09-08T11:54:54.851Z
updatedAt: 2025-11-12T03:36:21.510Z
---

You will want to verify you have at lease 400gb avaiable on your machine using&#x20;
`df -h`. Here you see 940G in my `/` mount point on drive `/dev/sdc/`. The Ubuntu installer will default to 100G and leave much of your space unused unless you tell it what to do.

::Image[]{src="https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/xnDd4IZfl0EaCiC7Oqqm9_image.png" signedSrc size="60" width="715" height="223" position="center" caption}

If your machine has 2 Disks, we want to separate the Ledger to the larger disk.&#x20;


:::hint{type="info"}
NOTE: if you change ledger to a separate drive, you will need to modify your `Ledger Dir` in other commands and locations later in the guide.
:::



### Process to mount a new directory:

Run `lsblk` to see your storage devices on your system

If you have a drive not being used, you can run `sudo mkfs -t ext4 /dev/sdd` but adjusting for your device name.

Then you can make your ledger dir in some folder such as `sudo mkdir -p /mnt/ledger`

And change ownership to your non-privledged user `sudo chown -R sol:sol /mnt/ledger`

And then mount it to your spare device `sudo mount /dev/sdd /mnt/ledger`

Now anything you put in the `/mnt/ledger` directory will be held in the additional drive (possibly a faster nvme drive).
