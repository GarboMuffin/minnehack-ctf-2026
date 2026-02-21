# MinneHack CTF 2026

This is the code for the CTF event at [MinneHack 2026](https://minnehack.com/) including our custom website, goofy infrastructure, and almost all of the challenges.

Commit history, unfinished challenges, and a couple other things are not included here for various reasons. For exmaple, it turns out we accidentally committed our HTTPS certificates into the repository at one point. Whoops.

## Puzzles and solutions

You can read all the puzzles and solutions in a much easier format at: https://muffin.ink/blog/minnehack-ctf-2026/

## How we ran the CTF in production

This repo and especially podman-compose.yml is basically what we ran in production. Some other details about how we did it:

 * Our domain was ctf.minnehack.com and *.ctf.minnehack.com
 * Server host ran Debian 13
 * We used two different IPs. On one IP we used ports 80/443 for regular HTTP/HTTPS. On the other IP we used ports 80/443 for CTF SSH and Minecraft respectively. This is to work around the guest wifi firewall being very restrictive about internal traffic.
 * We ran two instances of the portal. One "competitive" instance without teams and another "non-competitive" instance that allowed people to make teams.

Here's how we set up our production environment.

Log in as a non-root user with sudo.

Install dependencies and other useful things:

```sh
sudo apt install podman podman-compose git firewalld htop
```

Clone the repo. We cloned from an unlisted sourcehut repository and stored at /ctf/minnehack-ctf.

Allow things through the firewall:

```sh
sudo firewall-cmd --permanent --zone=public --add-service=http
sudo firewall-cmd --permanent --zone=public --add-service=https
sudo firewall-cmd --reload
```

Make rootless podman not die:

```sh
loginctl enable-linger "$USER"
```

Build everything:

```sh
./build-all.sh
```

Make rootless podman be able to listen on low ports:

```sh
sudo sysctl net.ipv4.ip_unprivileged_port_start=0
echo 'net.ipv4.ip_unprivileged_port_start=0' | sudo tee /etc/sysctl.d/99-unprivileged-ports.conf
```

Enable podman user socket:

```sh
rm -rf $XDG_RUNTIME_DIR/podman/podman.sock
systemctl enable --now --user podman.socket
systemctl restart --user podman.socket
```

Set up GitHub repos:

```sh
node github-actions/generate-repo.js # like 20 times

podman exec -it minnehack-ctf_portal-competitive_1 /bin/sh
$ node src/challenges/supply-chain-manage.js # put in PAT, repos

podman exec -it minnehack-ctf_portal-noncompetitive_1 /bin/sh
$ node src/challenges/supply-chain-manage.js # put in PAT, repos
```

Start:

```sh
podman-compose up -d
```
