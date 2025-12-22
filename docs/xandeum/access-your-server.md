---
title: Access your server
slug: access-your-server
description: Learn how to access a server using a terminal application with this step-by-step document. Discover how Mac users can utilize the built-in terminal app, while Windows users must download an application like PuTTY. Gain insight into the necessary 'root' us
createdAt: 2023-10-06T01:20:05.595Z
updatedAt: 2025-11-12T03:36:21.510Z
---

Your server hosting company will provide you with the username, password, and IP address of your server. You will then need to use a terminal application to interact with the server via text based prompts. The default administrator user is usually called `root` and it has unlimited power in the operating system. `root` access is required for admin-level commands. A standard non-privledged user will be used for day to day stuff.

# Apple / Mac

You will need to access your server using a CLI (command line interface). If you use a UNIX based operating system like Mac OS, then you can use the built-in terminal app for this.

See [**What is Terminal on Mac**](https://support.apple.com/guide/terminal/what-is-terminal-trmld4c92d55/2.14/mac/14.0) guide

::Image[]{src="https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/gocexuqY92WPphNQnjm_l_image.png" size="44" width="932" height="594" position="center" caption="Terminal on a Mac" alt}

To access your server in terminal, you will use the command `ssh root@<ipaddress>`





***

# Windows

If you use a Windows PC, then you will need a terminal application such as PuTTY. You can learn about it on their website [**putty.org**](https://putty.org). You need to download the correct version for your machine...most likely this one (64-bit x86:[**putty-64bit-0.79-installer.msi)**](https://the.earth.li/~sgtatham/putty/latest/w64/putty-64bit-0.79-installer.msi)

::Image[]{src="https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/QUkVKNOxk4a1ZI1R7mxLR_image.png" signedSrc size="46" width="618" height="551" position="center" caption}

![](https://api.archbee.com/api/optimize/ePevXmvzgG-7aqJ72Gpg_/9TKZR-wre1iOQFJ2YVQFZ_image.png)

To access your server in PuTTY, you will enter `root@<ipaddress>` into the Host Name field.
