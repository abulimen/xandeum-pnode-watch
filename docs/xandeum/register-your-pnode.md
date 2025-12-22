---
title: Register your pNode
slug: register-your-pnode
createdAt: 2025-03-09T01:22:43.902Z
updatedAt: 2025-11-12T03:22:40.864Z
---

# Setting Up an SSH Tunnel and Accessing the xandminer Web GUI

To manage your pNode remotely and access the xandminer web-based graphical user interface (GUI) securely, you can set up an SSH tunnel using OpenSSH on Windows. This chapter guides you through creating an SSH tunnel to forward traffic from your local machine to the xandminer web GUI running on your pNode, ensuring secure and encrypted access.

### Prerequisites

Before proceeding, ensure the following:

- You have SSH access to your pNode using your SSH key (as configured in the “SSH Key Setup” chapter).
- The xandminer and xandminerd services are installed, enabled, and running (as described in the “Starting and Monitoring xandminer Services” chapter).
- The xandminer web GUI is enabled and configured on your pNode.
- You have `root` privileges on your pNode.
- You have OpenSSH installed on your Windows machine. You can install it via Windows 10/11 Settings under “Optional Features” or through Windows Subsystem for Linux (WSL).

### Enabling the xandminer Web GUI

Open an SSH tunnel that forwards the proper ports through the tunnel, ensure the xandminer service is enabled and running on your pNode:

1. SSH into your pNode using OpenSSH on Windows:
   `ssh -i %userprofile%\.ssh\id_ed25519 root@<my.p.node.ip> -L 4000:localhost:4000 -L 3000:localhost:3000`
   Replace `<my.p.node.ip>` with your pNode’s IP address.
   1. port 3000 is for the GUI connection (http\://localhost:3000)
   2. port 4000 is for the xandminerd connection
2. Check if the xandminer and xandminerd services are installed and enabled:
   `sudo systemctl status xandminer`
   `sudo systemctl status xandminerd`
3. If the service isn’t installed, refer to the xandminer installation instructions.
4. Start and enable the xandminer services:
   `sudo systemctl enable --now xandminer`
   `sudo systemctl enable --now xandminerd`
5. Verify the GUI is accessible locally on the opening a web browser on the remote Windows machine and navigating to `http://localhost:3000`.

A sucessful connection will look like the screenshot below:

![](https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/FTnUwhjUPyAwSSRud1GS8_image.png)

# Connect your wallet

Using Phantom wallet or Solflare wallet, connect your Manager wallet using the "Select Wallet" button, and choose your wallet that has purchased at least one pNode license.

- A manager can have up to 3 pNode licenses
- Each pNode will need its own ip address

After your wallet is connected, generate a keypair on your pNode using the "Generate Identity Key-pair" button.

::Image[]{src="https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/rTywDF8TK8yDvyRFY0fg3_image.png" signedSrc size="24" width="282" height="447" position="center" caption}

- the keypair will be created on the pnode and the pubkey can be viewed in he Xandminer GUI
- Press on the pNode Identity Keypair button again to copy the pubkey to your clipboard

Next, press the "register pNode" button to register your pNode onto the Xandeum Network

::Image[]{src="https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/gfRsKeyJT8srNzOFCImgE_image.png" signedSrc size="24" width="282" height="421" position="center" caption}



