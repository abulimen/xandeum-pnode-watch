---
title: Install Validator Software
slug: install-validator-software
description: Learn how to set up a Xandeum DevNet Validator and a Solana validator node with this comprehensive guide. It covers everything from installing necessary binaries and updating the installation to configuring system settings and creating validator accounts.
createdAt: 2023-08-19T03:02:55.649Z
updatedAt: 2025-11-12T03:36:21.510Z
---



How To Setup a Xandeum DevNet Validator
(Build from source)
===================

:::hint{type="info"}
**NOTE:** This guide shows commands for text editors `nano` and `vim`. A quick search can find a guide or video to operate these text editors more efficiently and make your life easier.
:::



##

## 1) Installation of the needed binaries.

Start with a fresh instance of Linux as the `root` user.&#x20;

These instructions use [**Ubuntu Server 24.04LTS**](https://ubuntu.com/download/server)

:::hint{type="danger"}
BEFORE YOU CONTINUE!

Make sure you see your entire drive space as available!
Use `df -h` to see your free space. You want to see that you have all your space in a free partition. Ubuntu will want to default to 100g LVM. The preferance is to eliminate LVM and Raid and use all available space for your `/` mount point. If you don't show all your disk space, run the Ubuntu installer again and pay attention to the storage section.
:::



### Get `root` user

:::hint{type="warning"}
Run as `sudo` or `root` user. If you don't have access to the root user, then you will need to prepend all your requests in this section with sudo.&#x20;

Notice in the screenshot below I start as user `sol` change to `root` user then back to `sol`.&#x20;

Root user has ALL the privledges and won't require sudo. But some items NEED to be ran as the `sol` user (ie rust install, validator build, etc)

Use `sudo -i` to change to root user and `exit` to end root user
:::

![](https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/0naV05D9KRSBrRYLcDmc6_image.png)

### Update your installation

:::CodeblockTabs
CLI

```linux
sudo apt-get update -y && 
sudo apt-get upgrade -y
```
:::

### Install prerequestite packages

:::CodeblockTabs
CLI

```linux
sudo apt -y install sudo curl git build-essential pkg-config libssl-dev libudev-dev zlib1g-dev llvm clang cmake make libprotobuf-dev protobuf-compiler tmux vnstat 
```
:::

- Press OK to restart services if prompted

### Enable `vnstat` to monitor your bandwidth usage on your machine

:::CodeblockTabs
CLI

```linux
sudo systemctl enable --now vnstat
```
:::

:::hint{type="info"}
Note: research `vnstat` to find many different ways to view information on your bandwidth usage.
:::



### Create Xandeum Validator Account

:::CodeblockTabs
CLI

```linux
sudo adduser sol
```
:::

:::hint{type="info"}
Enter a password and accept defaults to the following questions:

`New password:`
` Retype new password:`
` passwd: password updated successfully`
` Changing the user information for xand`
` Enter the new value, or press ENTER for the default`
`        Full Name []:`
`        Room Number []:`
`        Work Phone []:`
`        Home Phone []:`
`        Other []:`
`Is the information correct? [Y/n] y`
:::



### Add new user to sudo group

:::CodeblockTabs
CLI

```linux
sudo usermod -aG sudo sol
```
:::

### Change to the sol user account

:::CodeblockTabs
CLI

```linux
su sol
```
:::



Switch the sol home directory

:::CodeblockTabs
CLI

```linux
cd ~
```
:::

###

### Install Rust, Cargo, and restmft

:::hint{type="warning"}
Run as `sol` user without `sudo` privledges.
:::

:::CodeblockTabs
CLI

```linux
curl https://sh.rustup.rs -sSf | sh
```
:::

- Take care to select option #1 when prompted to.

### Dont forget to set the source for .cargo

:::CodeblockTabs
CLI

```linux
source $HOME/.cargo/env
```
:::

### Add rustfm

:::CodeblockTabs
CLI

```linux
rustup component add rustfmt
```
:::

:::CodeblockTabs
CLI

```linux
rustup update
```
:::

### Set to compile using native cpu flags

:::CodeblockTabs
CLI

```linux
export RUSTFLAGS="-O -C target-cpu=native"
```
:::

:::hint{type="warning"}
### Special Note:

If you run into issues w/ Rust compiling, or if you receive `illegal instruction` errors upon starting your validator (usually only if running on a hypervisor), replace the export command with the export below:

- This will generally impact Antsle owners (and some other Virtualization software/hardware) where CPUs will show up as Westmere E56xx/L56xx/X56xx (Nehalem-C)
- Also if your cpu doesn't support AVX2 instruction set you may need this additional RUST Flag. Check if your CPU supports AVX2 using this command:
  `lscpu | grep --color=always -i  avx2` and avx2 should show up in red if its supported.
- May serverly limit efficiency of the binaries.
:::

:::CodeblockTabs
ONLY USE IF ON A SYSTEM WITHOUT AVX2

```linux
export RUST_REED_SOLOMON_ERASURE_ARCH=native
```
:::



### Clone the Xandeum Validator Repo&#x20;

:::CodeblockTabs
CLI

```linux
cd ~
git clone https://github.com/Xandeum/xandeum-agave.git
```
:::

### cd into new repo dir

:::CodeblockTabs
CLI

```linux
cd xandeum-agave
```
:::

### Choose which release you want to compile

:::CodeblockTabs
CLI

```linux
git checkout v2.2.0-munich
```
:::

### Build (compile) the validator software

:::CodeblockTabs
CLI

```linux
./cargo build --release
```
:::

:::hint{type="warning"}
- `error: toolchain` can be ignored, missing toolchains will be installed.
:::

:::hint{type="info"}
- To use less processor, try adding jobs limit with ` -j 2`
:::

:::hint{type="success"}
- This process is going to take some time. Get a beverage, walk the dog,&#x20;
  take the kids to the pool. 10-40 minutes typical depending on cpu.
:::

***

##

## 2) After build completes:

:::hint{type="info"}
Run as `sol` user in home dir (use `cd ~`)
:::

### Create directories and parent folders `-p` for the validator files

:::CodeblockTabs
CLI

```linux
mkdir $HOME/data/compiled/x2.2.0-munich/bin/ -p
```
:::

### Move the newly created binary (application files) to the appropriate release folder

:::CodeblockTabs
CLI

```linux
cd ~/xandeum-agave/target/release
```
:::

:::CodeblockTabs
CLI

```linux
rsync -aHA ./ $HOME/data/compiled/x2.2.0-munich/bin/
```
:::



### Create symlinks (shortcuts) to the directories. This will allow us to change the version that is loaded by creating a symlink to a newer set of binaries

:::CodeblockTabs
CLI

```linux
ln -sf $HOME/data/compiled/x2.2.0-munich/bin $HOME/data/compiled/active_release
```
:::

### Verify the symlonk was created properly

:::CodeblockTabs
CLI

```linux
ls -la $HOME/data/compiled/
```
:::

### Backup the old $PATH for reference.

:::CodeblockTabs
CLI

```linux
echo $PATH >> ~/PATH.bak
```
:::

### Using your favorite editor to open the bashrc config:

:::CodeblockTabs
nano

```linux
nano ~/.bashrc
```

vim

```linux
vim ~/.bashrc
```
:::

### Add the following lines at the very bottom and save your changes and exit.

:::CodeblockTabs
text

```linux
export PATH="$HOME/data/compiled/active_release:$PATH"
alias l="ls -a --color=auto"
alias ll="ls -alh --color=auto"
alias sv="solana validators --sort skip-rate --reverse"
alias sg="solana gossip"
alias se="solana epoch-info"
```
:::

- Fully exit all shells and come back in. (logout / login to server)

### Check your Install of the software

After logging back in as `sol` user, time to test if everything worked.

- Check solana version:

:::CodeblockTabs
CLI

```linux
cd ~
solana -V

more accutatly, check the version of agave-validator client:
agave-validator -V
```
:::

- Results should appear simlar to the following

::Image[]{src="https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/pR92FqNOzhXFEEVVgymQX_screenshot-2023-08-18-230744.png" size="88" width="711" height="75" position="flex-start" caption darkWidth="711" darkHeight="75"}

:::hint{type="success"}
If you are working on a virtual machine, now would be the ideal time to take a snapshot & backup your work just in case you have any issues beyond this point. It is also advisable for bare metal too.
:::



***

##

## 3) Configure your validator instance.

:::hint{type="danger"}
Please observe proper security of your private keys!&#x20;

Record your 12 words (and bip39 passphrase) in a safe spot. For DevNet it's not critical if you lose them...but if on MainNet, losing the keys equals LOST FUNDS. There is no recovering from lost keys.

- For MainNet, your withdraw authority key should never be on your machine!
:::



### Generate your 3 DevNet keys.

:::hint{type="info"}
- You can leave the  bip39 passphrase empty (only applies to DevNet/TesNet since it is not real money).
- Your 12 words and pubkey are shown immediatly after the prompt for bip39 passphrase.
- Take note of the public key it provides you (copy it down). It will help us help you should there be an issue.
:::

:::hint{type="warning"}
Run as `sol` user!
:::



:::CodeblockTabs
CLI

```linux
mkdir ~/keys/
cd ~/keys
```
:::

:::CodeblockTabs
CLI

```linux
solana-keygen new -o ~/keys/validator-keypair.json
solana-keygen new -o ~/keys/vote-keypair.json
solana-keygen new -o ~/keys/withdraw-keypair.json
solana-keygen pubkey ~/keys/validator-keypair.json
```
:::

To view your public key later

:::CodeblockTabs
CLI

```linux
solana-keygen pubkey ~/keys/validator-keypair.json
```
:::

View your current configuration information

:::CodeblockTabs
CLI

```linux
solana config get
```
:::

### Switch to Xandeum cluster

:::CodeblockTabs
CLI

```linux
solana config set --url https://api.devnet.xandeum.network:8899
```
:::

### Set your new keypair to be used by default.

:::CodeblockTabs
CLI

```text
solana config set --keypair ~/validator-keypair.json
```
:::

### Testing our work so far.

- Check your connecrtion to the cluster

```linux
solana gossip
```

- Request an airdrop from the Xand Faucet

:::CodeblockTabs
CLI

```linux
solana airdrop 1 ~/validator-keypair.json
```
:::

Do this again 4 more times. (We are also giving you fake XAND/SOL to get started.)

- There is a daily limit per wallet...These tokens on TestNet/DevNet are not real.

### Check your wallet balance.

:::CodeblockTabs
CLI

```linux
solana balance
```
:::

You should have \~5 tokens present if you do it 5x's.



### Create your vote account.

- Submit a transaction on the blockchain setting up your vote account

:::CodeblockTabs
CLI

```linux
solana create-vote-account ~/vote-keypair.json ~/validator-keypair.json ~/withdraw-keypair.json
```
:::

To find your Vote Account Pubkey later, use:

:::CodeblockTabs
CLI

```linux
solana-keygen pubkey ~/vote-keypair.json
```
:::

***

##

## 4) Configure your Start Script Configuration

### Create your validator configuration file using your editor

:::CodeblockTabs
nano

```linux
nano ~/validator-start.sh
```

vim

```linux
vim ~/validator-start.sh
```
:::

- There will be nothing in here, so copy and paste in the following configurations. Save and Exit.

:::CodeblockTabs
text

```none
#!/bin/bash
exec solana-validator \
        --known-validator HhuygLTeS6grue95pKKzak2UPuQMXepWbvQv2ToQfbZN \
        --known-validator 6vy4sYV6nTLJQ4tBcXUGgPTuGorVh2FJkm6ToVMFSfr2 \
        --known-validator CYQCxRcrSNg2XUiM42tp6bUtbWzZEdmTNawhBg5hSLoo \
        --known-validator 3dZiYo933M7VftTSb7WudJV92cg69QwVYS1s753xRc59 \
        --known-validator 2X8DQyB88vac5yZnkVzz6JxogWzSEhJBfNz7UHbQms1i \
        --known-validator 2Ww2DYCYegUrwxC44funMmdp7Ttyu38jFvUUkrzyyLMw \
        --entrypoint xand-1.devnet.xandeum.network:8000 \
        --entrypoint xand-2.devnet.xandeum.network:8000 \
        --entrypoint xand-3.devnet.xandeum.network:8000 \
        --entrypoint xand-4.devnet.xandeum.network:8000 \
        --expected-shred-version 46090 \
        --expected-genesis-hash 9MJobEeGZJH9KjQNzMcRDuPNFUwJtAnBEEgpWgAgy4VL \
        --snapshot-interval-slots 300 \
        --full-snapshot-interval-slots 3000 \
        --identity ~/validator-keypair.json \
        --vote-account ~/vote-keypair.json \
        --ledger ~/ledger/ \
        --dynamic-port-range 8000-10000 \
        --rpc-port 8899 \
        --log ~/xand-validator.log \
        --limit-ledger-size 50000000 \
#       --expected-bank-hash 3UQBGcNj3s5jfGKVa1jhqyXyPv6anm4PADbZdMCKY3ht \
#       --wait-for-supermajority 610426 \
#       --no-snapshot-fetch \
#       --no-genesis-fetch \
```
:::

:::hint{type="warning"}
**Note**: Every trailing `\` is important!
Any commented lines `#` must be at the bottom of the script. This is to save a command that may be needed later but not used now.
:::

:::hint{type="info"}
**Note**: Change the location of `ledger` in the script to your second drive if you aren't using raid0
:::

:::hint{type="success"}
Here are the known-validators:

Xand1-known-validator HhuygLTeS6grue95pKKzak2UPuQMXepWbvQv2ToQfbZN \\
Xand2-known-validator 6vy4sYV6nTLJQ4tBcXUGgPTuGorVh2FJkm6ToVMFSfr2 \\
Xand3-known-validator CYQCxRcrSNg2XUiM42tp6bUtbWzZEdmTNawhBg5hSLoo \\
Xand4-known-validator 3dZiYo933M7VftTSb7WudJV92cg69QwVYS1s753xRc59 \\
t3chie-known-validator 2X8DQyB88vac5yZnkVzz6JxogWzSEhJBfNz7UHbQms1i \\
bernie-known-validator 2Ww2DYCYegUrwxC44funMmdp7Ttyu38jFvUUkrzyyLMw \\
:::



### Make the script you just made executable.

:::CodeblockTabs
CLI

```linux
chmod +x ~/validator-start.sh
```
:::

***

##

## 5) System Tuning

:::hint{type="warning"}
Run as `root` user, use `sudo -i`
:::



Optimize sysctl knobs (copy block and paste into teminal, press return)

:::CodeblockTabs
CLI

```linux
sudo bash -c "cat >/etc/sysctl.d/21-solana-validator.conf <<EOF
# Increase UDP buffer sizes
net.core.rmem_default = 134217728
net.core.rmem_max = 134217728
net.core.wmem_default = 134217728
net.core.wmem_max = 134217728

# Increase memory mapped files limit
vm.max_map_count = 1000000

# Increase number of allowed open file descriptors
fs.nr_open = 1000000
EOF"
```
:::

:::CodeblockTabs
CLI

```linux
sudo sysctl -p /etc/sysctl.d/21-solana-validator.conf
```
:::

Open the file `/etc/systemd/system.conf` in your editor

:::CodeblockTabs
nano

```linux
sudo nano /etc/systemd/system.conf
```

vim

```linux
sudo vim /etc/systemd/system.conf
```
:::

Add the following to the `[Manager]` section. Save and exit.

:::CodeblockTabs
CLI

```linux
DefaultLimitNOFILE=1000000
```
:::

Reload the daemon

:::CodeblockTabs
CLI

```linux
sudo systemctl daemon-reload
```
:::

Increase process file desriptor count limit. (copy block and paste into teminal, press return)

:::CodeblockTabs
CLI

```linux
sudo bash -c "cat >/etc/security/limits.d/90-solana-nofiles.conf <<EOF
# Increase process file descriptor count limit
* - nofile 1000000
EOF"
```
:::

:::hint{type="success"}
This section is complete. Exit all shells or reboot to activate changes!
:::





Continue on to [**Setup System Service**](docId\:kFV3d5pRtdndrjBOcbBMB)



