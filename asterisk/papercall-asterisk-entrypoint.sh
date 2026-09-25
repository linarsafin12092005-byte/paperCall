#!/bin/sh
set -eu

: "${ASTERISK_AMI_PASSWORD:?ASTERISK_AMI_PASSWORD must be provided at runtime}"
: "${SIP_PASSWORD_1001:?SIP_PASSWORD_1001 must be provided at runtime}"
: "${SIP_PASSWORD_1002:?SIP_PASSWORD_1002 must be provided at runtime}"

awk -v secret="$ASTERISK_AMI_PASSWORD" '
  /^secret[[:space:]]*=/ { print "secret = " secret; next }
  { print }
' /etc/asterisk/manager.conf.template > /etc/asterisk/manager.conf

awk -v sip1001="$SIP_PASSWORD_1001" -v sip1002="$SIP_PASSWORD_1002" '
  { gsub(/__SIP_PASSWORD_1001_RUNTIME__/, sip1001); gsub(/__SIP_PASSWORD_1002_RUNTIME__/, sip1002); print }
' /etc/asterisk/pjsip.conf.template > /etc/asterisk/pjsip.conf

exec /usr/local/bin/entrypoint.sh "$@"
