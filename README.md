# wgdash

[![Lint and build](https://github.com/christoph-heiss/wgdash/actions/workflows/build.yml/badge.svg)](https://github.com/christoph-heiss/wgdash/actions/workflows/build.yml)

is a simple yet effective tool for monitoring your WireGuard connections (on Linux).

## Getting started

To best way to quickly get wgdash up and running is by using `docker compose`.
```bash
mkdir wgdash && cd wgdash
cat <<EOF >docker-compose.yml
version: '3'

services:
  wgdash:
    image: ghcr.io/christoph-heiss/wgdash:latest
    restart: unless-stopped
    cap_add:
      - NET_ADMIN
    network_mode: host
EOF
docker compose up -d
```
This will use the latest CD-built image.

## Development

To run it directly on your machine, without a Docker container:
```bash
npm install
npm run dev
```
To allow wgdash to actually use the Linux' kernel
[netlink](https://man7.org/linux/man-pages/man7/netlink.7.html) interface, it
generally needs the have `CAP_NET_ADMIN` set on the node binary.
This can be done using
```bash
sudo setcap cap_net_admin+eip $(which node)
```

## License

Licensed under MIT license ([LICENSE](LICENSE) or https://opensource.org/licenses/MIT).

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you shall be licensed by MIT license as above, without any
additional terms or conditions.
