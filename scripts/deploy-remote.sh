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
TOPOLOGY_PORT="${TOPOLOGY_PORT:-43147}"
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
  TOPOLOGY_PORT="${TOPOLOGY_PORT:-43147}"
  TOPOLOGY_BIND="${TOPOLOGY_BIND:-$REMOTE_HOST}"
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is not installed on this machine." >&2
  echo "Install Docker on ${REMOTE_HOST}, then run this script there with --local" >&2
  echo "or from a client: REMOTE_USER=you ./scripts/deploy-remote.sh" >&2
  exit 1
fi

export TOPOLOGY_BIND TOPOLOGY_PORT
export TOPOLOGY_IMAGE="${TOPOLOGY_IMAGE:-gpu-fabric-topology:local}"

if [[ "$MODE" == "local" ]]; then
  echo "Building and starting on this host, published at http://${TOPOLOGY_BIND}:${TOPOLOGY_PORT}"
  docker compose --env-file .env.remote up -d --build
else
  if ! docker context inspect "$CONTEXT_NAME" >/dev/null 2>&1; then
    echo "Creating Docker context ${CONTEXT_NAME} → ssh://${REMOTE_USER}@${REMOTE_HOST}"
    docker context create "$CONTEXT_NAME" --docker "host=ssh://${REMOTE_USER}@${REMOTE_HOST}"
  fi
  echo "Building and starting via Docker context ${CONTEXT_NAME} (ssh://${REMOTE_USER}@${REMOTE_HOST})"
  docker --context "$CONTEXT_NAME" compose --env-file .env.remote up -d --build
fi

echo
echo "Topology map should be at http://${REMOTE_HOST}:${TOPOLOGY_PORT}"
echo "Health: curl -sS http://${REMOTE_HOST}:${TOPOLOGY_PORT}/healthz"
