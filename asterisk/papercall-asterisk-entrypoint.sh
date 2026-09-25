#!/bin/sh
set -eu

: "${ASTERISK_AMI_PASSWORD:?ASTERISK_AMI_PASSWORD must be provided at runtime}"

awk -v secret="$ASTERISK_AMI_PASSWORD" '
  /^secret[[:space:]]*=/ { print "secret = " secret; next }
  { print }
' /etc/asterisk/manager.conf.template > /etc/asterisk/manager.conf

exec /usr/local/bin/entrypoint.sh "$@"
