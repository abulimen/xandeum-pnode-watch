---
title: Ports Setup
slug: ports-setup
description: Learn how to internally forward ports 8000-10000 tcp & udp to your validator using the `~/validator-start.sh` script. Find instructions on setting up port forwarding rules for your router model to ensure seamless operation. Benefit your cluster by obtaini
createdAt: 2023-08-21T18:38:00.532Z
updatedAt: 2025-11-12T03:36:21.510Z
---

The `~/validator-start.sh` script assumes ports 8000-10000 tcp & udp are internally forwarded to the validator via a DST NAT (port forwarding) Rule.

Please run a few searches on port forwarding rules on your router model before asking for help on this. There are so many router models that we can't possibly know them all.

- Search Terms:
  - how to port forward my router
  - setup virtual server on my router
  - how to set destination nat rules on my firewall

The over all idea is that when a request is made to your Public IP Address on a port (ie 8000) Your router has to take that request and forward it through your router (firewall) and submit it to the Internal IP address of your validator.

:::hint{type="danger"}
STATIC PUBLIC IP: It would be benificial to the entire cluster if your public IP address from your internet provider is set as static. This means that you will always have the same IP address even if you reboot your modem/router or if you change your equipment. **They may ask why you need it so make sure you know your terms of service and the description of what you're doing before inquiring. You're running a home server and would prefer a static IP address.**

STATIC PRIVATE IP: It would also be benificial if you are running your validator behined a router (ie running at home or office vs data center) to make sure you set up your validator server to always aquire the same IP address from your router. This can be done during the installation of ubuntu or it can be done in your router by way of a function called a `dhcp reservation`.&#x20;
:::





