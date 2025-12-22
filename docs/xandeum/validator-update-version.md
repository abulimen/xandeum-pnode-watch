---
title: Validator UPDATE version
slug: validator-update-version
description: Set up your Xandeum DevNet validator with ease using this comprehensive document. From user installation to downloading the Xandeum release, this guide covers it all. Discover the steps for creating a user, adding to the sudo group, and switching to the X
createdAt: 2023-08-19T03:02:55.649Z
updatedAt: 2025-11-12T03:36:21.510Z
---

:::hint{type="warning"}
Run as `sol` user
Sudo password may be required
:::



Update your system installation

:::CodeblockTabs
CLI

```linux
sudo apt-get update -y && 
sudo apt-get upgrade -y
```
:::

&#x20;Reboot if you need to load a newer kernel.

## Choose which release you want to install

Go to the Xandeum Binaries repo and download the `tar.bz2` file to your server.
This guide is using version v2.2.0-xandeum\_**ca4fded3**  
You can right-click on the file name to copy the download link and do the upgrade manually if you want.[**&#xA;**](https://github.com/Xandeum/binaries/releases)[**https://github.com/Xandeum/binaries/releases/latest**](https://github.com/Xandeum/binaries/releases/latest)

Otherwise, set some variables and upgrade using our process below.



![](https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/hHxpVz5RtyCKeOHKCbsdq_image.png)




Set the version and filename variables, some versions are listed here:

:::CodeblockTabs
CLI

```none
#latest release 06-18-2025
ver="v2.2.0-xandeum_b5a94688"
file="v2.2.0-xandeum_b5a94688.tar.gz"
echo -e "\n"
echo version=$ver;
echo filename=$file
echo -e "\n"
```
:::



:::CodeblockTabs
CLI

```linux
cd ~
wget https://github.com/Xandeum/binaries/releases/download/$ver/$file
```
:::

Create the needed `bin` folder

:::CodeblockTabs
CLI

```linux
mkdir ~/.local/share/xandeum/install/releases/$ver -p
```
:::

Extract the file into the new `bin` dir

:::CodeblockTabs
CLI

```linux
cd ~
tar -xf $file --directory ~/.local/share/xandeum/install/releases/$ver
```
:::

Add a directory for connection info, and empty it if there is old files.

:::CodeblockTabs
CLI

```linux
sudo mkdir -p /var/run/xandeum && sudo chown sol:sol /var/run/xandeum && sudo chmod 755 /var/run/xandeum
sudo rm /var/run/xandeum/*
```
:::

Test a binary by running it in the local folder

:::CodeblockTabs
CLI

```linux
cd ~/.local/share/xandeum/install/releases/$ver/bin
```
:::

Test a binary by running it in the local folder

:::CodeblockTabs
CLI

```linux
./agave-validator -V
```
:::

Check the version and src match your chosen version from above:

![](https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/QQMnfYQQd99S_REAGlZZG_image.png)

Remove downloaded file if binaries are working

:::CodeblockTabs
CLI

```linux
rm ~/$file
```
:::

### Set our symlink to the new version

Set a symlink from our new release to the active\_release folder we will use in our `$PATH` later. (This command removes an old symlink to `active_release` if it exists)

:::CodeblockTabs
CLI

```linux
rm /home/sol/.local/share/xandeum/install/releases/active_release
ln -sf /home/sol/.local/share/xandeum/install/releases/$ver/bin /home/sol/.local/share/xandeum/install/releases/active_release
```
:::



### Check your Install of the software from the home dirctory to prove the symlink worked:

As `sol` user, time to test if everything worked.

- Check Xandeum Software Version:
- Results should appear simlar to the following (check for correct version and src)

:::CodeblockTabs
CLI

```linux
cd ~
agave-validator -V
```
:::



![](https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/hKtWmAUbX5g9cxBksdN0q_image.png)

### Restart your validator

If everyting looks good, restart your validator while delinquincy is below 10% and monitor until it is caught back up to the chain.

If you have the system service set to `restart=always` , then you can use the validator exit command. The validator will restart as soon as it creates a snapshot and stops.

```bash
agave-validator --ledger ~/ledger exit --max-delinquent-stake 10 --min-idle-time 0 --monitor
```




***

If you have issues, try looking here:

[**Monitoring your validator**](docId\:MYh9NcGnA169K2hipDjBA)&#x20;

[**Validator Commands**](docId\:IZ8K2IUlzWiP78mLxBgE1)&#x20;

[**Troubleshooting**](docId\:x8Yesauj1rjaEmmnrp3tB)&#x20;
