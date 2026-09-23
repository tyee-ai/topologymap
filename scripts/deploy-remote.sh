#!/usr/bin/env bash
# Build and run the topology map on the remote Docker host (default 192.168.1.247).
#
# On the remote host itself:
#   ./scripts/deploy-remote.sh --local
#
# From a machine that can SSH to the host (Docker talks to the remote daemon):
#   REMOTE_USER=drew ./scripts/deploy-remote.sh
#
# Requires: Docker Engine + Compose plugin on the target, SSH access for the
# remote path, and this repo checked out (or copied) where the command runs.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REMOTE_HOST="${REMOTE_HOST:-192.168.1.247}"
REMOTE_USER="${REMOTE_USER:-${USER:-ubuntu}}"
TOPOLOGY_HTTPS_PORT="${TOPOLOGY_HTTPS_PORT:-443}"
TOPOLOGY_HTTP_PORT="${TOPOLOGY_HTTP_PORT:-80}"
TOPOLOGY_BIND="${TOPOLOGY_BIND:-$REMOTE_HOST}"
CONTEXT_NAME="${DOCKER_CONTEXT_NAME:-topology-remote}"
MODE="ssh"

if [[ "${1:-}" == "--local" ]]; then
  MODE="local"
fi

if [[ -f "$ROOT/.env.remote" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.remote"
  set +a
  REMOTE_HOST="${REMOTE_HOST:-192.168.1.247}"
  TOPOLOGY_HTTPS_PORT="${TOPOLOGY_HTTPS_PORT:-443}"
  TOPOLOGY_HTTP_PORT="${TOPOLOGY_HTTP_PORT:-80}"
  TOPOLOGY_BIND="${TOPOLOGY_BIND:-$REMOTE_HOST}"
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is not installed on this machine." >&2
  echo "Install Docker on ${REMOTE_HOST}, then run this script there with --local" >&2
  echo "or from a client: REMOTE_USER=you ./scripts/deploy-remote.sh" >&2
  exit 1
fi

export TOPOLOGY_BIND TOPOLOGY_HTTPS_PORT TOPOLOGY_HTTP_PORT
export TOPOLOGY_IMAGE="${TOPOLOGY_IMAGE:-gpu-fabric-topology:local}"

if [[ "$MODE" == "local" ]]; then
  echo "Building and starting on this host, published at https://${TOPOLOGY_BIND}:${TOPOLOGY_HTTPS_PORT}"
  docker compose --env-file .env.remote up -d --build
else
  if ! docker context inspect "$CONTEXT_NAME" >/dev/null 2>&1; then
    echo "Creating Docker context ${CONTEXT_NAME} → ssh://${REMOTE_USER}@${REMOTE_HOST}"
    docker context create "$CONTEXT_NAME" --docker "host=ssh://${REMOTE_USER}@${REMOTE_HOST}"
  fi
  echo "Building and starting via Docker context ${CONTEXT_NAME} (ssh://${REMOTE_USER}@${REMOTE_HOST})"
  docker --context "$CONTEXT_NAME" compose --env-file .env.remote up -d --build
fi

URL_HOST="$REMOTE_HOST"
if [[ "$TOPOLOGY_HTTPS_PORT" == "443" ]]; then
  PUBLIC_URL="https://${URL_HOST}"
else
  PUBLIC_URL="https://${URL_HOST}:${TOPOLOGY_HTTPS_PORT}"
fi

echo
echo "Topology map should be at ${PUBLIC_URL}"
echo "HTTP on port ${TOPOLOGY_HTTP_PORT} redirects to HTTPS."
echo "Health: curl -skS ${PUBLIC_URL}/healthz"
echo "First visit will warn about the self-signed certificate unless you mount your own at /etc/nginx/certs/tls.crt and tls.key."
