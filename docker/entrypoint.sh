#!/bin/sh
set -eu

CERT_DIR="${CERT_DIR:-/etc/nginx/certs}"
mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_DIR/tls.crt" ] || [ ! -f "$CERT_DIR/tls.key" ]; then
  echo "Generating self-signed TLS cert (SANs: 192.168.1.247, 127.0.0.1, localhost)"
  openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
    -keyout "$CERT_DIR/tls.key" \
    -out "$CERT_DIR/tls.crt" \
    -subj "/CN=192.168.1.247" \
    -addext "subjectAltName=IP:192.168.1.247,IP:127.0.0.1,DNS:localhost"
  chmod 644 "$CERT_DIR/tls.crt"
  chmod 600 "$CERT_DIR/tls.key"
fi

exec nginx -g "daemon off;"
