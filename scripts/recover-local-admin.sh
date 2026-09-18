#!/usr/bin/env bash
set -euo pipefail

TARGET_EMAIL="linar@gmail.com"
CONFIRMATION="RECOVER-LOCAL-ADMIN"

if ! docker compose ps --status running --services | grep -qx "api"; then
  echo "callflow-api is not running. Start it before recovery." >&2
  exit 1
fi

run_recovery_process() {
  local mode="$1"
  local confirmation="${2:-}"
  docker compose exec -T api java -jar /app/app.jar \
    --spring.main.web-application-type=none \
    --local.recovery.mode="$mode" \
    --local.recovery.email="$TARGET_EMAIL" \
    --local.recovery.confirm="$confirmation" 2>&1 |
    awk '/^RECOVERY_USER:|^RECOVERY_SUCCESS:|^RECOVERY_ERROR:/ { print }'
}

echo "Checking the explicitly approved recovery target..."
inspect_output="$(run_recovery_process inspect)"
printf '%s\n' "$inspect_output"

if ! grep -q '^RECOVERY_USER:' <<<"$inspect_output"; then
  echo "Recovery target preflight failed." >&2
  exit 1
fi

read -r -p "Type ${CONFIRMATION} to continue: " typed_confirmation
if [[ "$typed_confirmation" != "$CONFIRMATION" ]]; then
  echo "Recovery cancelled."
  exit 1
fi

read -r -s -p "Enter new password (minimum 8 characters): " new_password
printf '\n'
read -r -s -p "Confirm new password: " password_confirmation
printf '\n'

if [[ -z "$new_password" || "$new_password" != "$password_confirmation" ]]; then
  unset new_password password_confirmation typed_confirmation
  echo "Recovery cancelled: passwords do not match or are empty." >&2
  exit 1
fi

result="$(
  printf '%s\n%s\n' "$new_password" "$password_confirmation" |
    run_recovery_process apply "$CONFIRMATION" |
    awk '/^RECOVERY_SUCCESS:|^RECOVERY_ERROR:/ { print }'
)"

unset new_password password_confirmation typed_confirmation
printf '%s\n' "$result"

if ! grep -q '^RECOVERY_SUCCESS:' <<<"$result"; then
  exit 1
fi

echo "Local recovery completed. The one-shot recovery process has exited."
