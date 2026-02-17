How to get SSL certificate:

```sh
cd nginx
podman run -it --rm \
    -v "./certbot-secrets/etc/letsencrypt:/etc/letsencrypt" \
    -v "./certbot-secrets/var/lib/letsencrypt:/var/lib/letsencrypt" \
    docker.io/certbot/certbot certonly \
    --manual --preferred-challenges dns \
    --agree-tos --no-eff-email --email a@example.com \
    -d ctf.minnehack.com -d *.ctf.minnehack.com
```
