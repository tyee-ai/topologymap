# 4K GPU Fabric Topology Map

Interactive explorer for the NVIDIA NCP RA-11750-001 V4 4,096-GPU InfiniBand fabric: 16 scalable units, 16 switch-leaf groups, and 16 core groups.

Spine-to-core wiring follows Figure 13 (2K Rail SU group): **Core Group N connects to all Spine Ns**, not a full mesh. Choose **8 × 8** (8 groups, 8 switches — one core group per spine plane) or **16 × 4** (16 groups, 4 switches — Core Groups N and N+8 share a plane). Both layouts keep 64 MQM9790 cores. **Core Detail → Switches** draws every MQM9790 inside its group; **Groups** keeps the rolled-up card. Append `?cores=8x8` or `?cores=16x4`, and `coreSwitches=1` to expand switches. The reference figure is at `prototypes/figure-13-2k-rail-su-group.png`.

Pan and zoom the three-tier map, highlight a scalable unit to trace host → leaf → spine → core paths, filter by rail (SP1–SP8), and toggle host-leaf, leaf-spine, or spine-core link layers. Export a Draw.io starter diagram from the toolbar.

The original standalone HTML prototype is versioned at `prototypes/source-topology-map.html`.

## Run locally

Requires Node.js 22+.

```bash
npm install
npm run dev
```

The Vite app listens on [http://127.0.0.1:43147](http://127.0.0.1:43147). Docker/nginx still serves HTTPS (see below).

Production build (same port):

```bash
npm run build
npm run preview
```

## Run with Docker

```bash
docker compose up --build
```

The container serves HTTPS (nginx) on host port **43147** (`0.0.0.0:43147:443`) and redirects HTTP **43146** → HTTPS. Open [https://127.0.0.1:43147](https://127.0.0.1:43147). A self-signed cert is created on first start (SAN includes `192.168.1.247`, `127.0.0.1`, `localhost`). Accept the browser warning, or mount your own `tls.crt` / `tls.key` into `/etc/nginx/certs`.

Equivalent without Compose:

```bash
docker build -t gpu-fabric-topology:local .
docker run --rm -p 43147:443 -p 43146:80 gpu-fabric-topology:local
```

`GET /healthz` returns `ok` (use `curl -k` against HTTPS).

## Run on 192.168.1.247

`.env.remote` publishes HTTPS on **43147** and HTTP **43146** (redirects to HTTPS) at **192.168.1.247**. It does not bind 80 or 443. Docker must be installed on that host.

**On the host itself** (clone or copy this repo there):

```bash
./scripts/deploy-remote.sh --local
```

**From another machine** that can SSH to the host (builds on the remote Docker daemon):

```bash
REMOTE_USER=youruser ./scripts/deploy-remote.sh
```

That creates a Docker context `topology-remote` (`ssh://youruser@192.168.1.247`) and runs `docker compose --env-file .env.remote up -d --build`.

Then open [https://192.168.1.247](https://192.168.1.247). If publish fails because that address is not on the Docker host namespace, set `TOPOLOGY_BIND=0.0.0.0` in `.env.remote` and retry — the app is still reached at the same URL.

Manual equivalent on the host:

```bash
docker compose --env-file .env.remote up -d --build
```

## Explore the map

- Drag the canvas to pan. Scroll to zoom (gentle steps) or use the **Zoom** slider / **Zoom + / Zoom − / Fit View**.
- Click **Legend** or **SU / Rail filters** to expand or collapse those panels.
- **Highlight Scalable Unit** or the SU pills to trace one SU’s downlinks and leaf-spine crossbar.
- **Filter Rail** isolates one of the eight rails across all 16 SUs.
- **View Layer** shows all links or only host↔leaf, leaf↔spine, or spine↔core.
- Hover switches and SU cards for port and fanout details.
- **Copy Draw.io XML** or **Download .drawio** for a diagrams.net starter file.
