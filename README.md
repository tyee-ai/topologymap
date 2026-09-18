# 4K GPU Fabric Topology Map

Interactive explorer for the NVIDIA NCP RA-11750-001 V4 4,096-GPU InfiniBand fabric: 16 scalable units, 16 switch-leaf groups, and 16 core groups.

Spine-to-core wiring follows Figure 13 (2K Rail SU group): **Core Group N connects to all Spine Ns**, not a full mesh. Choose **8 × 8** (8 groups, 8 switches — one core group per spine plane) or **16 × 4** (16 groups, 4 switches — Core Groups N and N+8 share a plane). Both layouts keep 64 MQM9790 cores. Append `?cores=8x8` or `?cores=16x4` to the URL. The reference figure is at `prototypes/figure-13-2k-rail-su-group.png`.

Pan and zoom the three-tier map, highlight a scalable unit to trace host → leaf → spine → core paths, filter by rail (SP1–SP8), and toggle host-leaf, leaf-spine, or spine-core link layers. Export a Draw.io starter diagram from the toolbar.

The original standalone HTML prototype is versioned at `prototypes/source-topology-map.html`.

## Run locally

Requires Node.js 22+.

```bash
npm install
npm run dev
```

The Vite app listens on [http://127.0.0.1:43147](http://127.0.0.1:43147).

Production build (same port):

```bash
npm run build
npm run preview
```

## Run with Docker

```bash
docker compose up --build
```

The container serves the production build with nginx on host port **43147** (`43147:80`). Open [http://127.0.0.1:43147](http://127.0.0.1:43147).

Equivalent without Compose:

```bash
docker build -t gpu-fabric-topology:local .
docker run --rm -p 43147:80 gpu-fabric-topology:local
```

`GET /healthz` returns `ok` for container health checks.

## Explore the map

- Drag the canvas to pan; scroll or use **Zoom + / Zoom − / Fit View**.
- **Highlight Scalable Unit** or the SU pills to trace one SU’s downlinks and leaf-spine crossbar.
- **Filter Rail** isolates one of the eight rails across all 16 SUs.
- **View Layer** shows all links or only host↔leaf, leaf↔spine, or spine↔core.
- Hover switches and SU cards for port and fanout details.
- **Copy Draw.io XML** or **Download .drawio** for a diagrams.net starter file.
