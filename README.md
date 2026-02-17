## How we ran the CTF in production

Our set up is in podman-compose.yml. Some other details about how we did it:

 * Our domain was ctf.minnehack.com and *.ctf.minnehack.com
 * Debian 13 host
 * We used two different IPs. One IP was for regular HTTP/HTTPS. The other IP's ports 80 and 443 were used for SSH and Minecraft respectively to work around fireall problems with the guest wifi.
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
