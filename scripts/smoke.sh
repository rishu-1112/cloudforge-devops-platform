#!/usr/bin/env bash
set -euo pipefail

base_url=${CLOUDFORGE_URL:-http://127.0.0.1:${CLOUDFORGE_PORT:-8090}}
request() {
    curl -fsS --max-time 5 "$@"
}

wait_for_status() {
    local expected=$1
    for _ in {1..15}; do
        if request "$base_url/api/applications/$id" |
            jq -e --arg expected "$expected" '.data.healthStatus == $expected' >/dev/null; then
            return
        fi
        sleep 2
    done
    printf 'Timed out waiting for %s\n' "$expected" >&2
    return 1
}

request "$base_url/" | grep -q 'CloudForge Application Registry'
id=$(request "$base_url/api/applications" -H 'Content-Type: application/json' \
    --data '{"name":"Demo service","version":"1.0.0","environment":"development","monitor":"demo"}' | jq -er '.data._id')

wait_for_status healthy
trap 'docker compose start demo' EXIT
docker compose stop demo
wait_for_status unhealthy
docker compose start demo
wait_for_status healthy
trap - EXIT
request "$base_url/api/applications/$id" | jq -e '
    .data.deploymentStatus == "deployed" and
    (.data.healthHistory | map(.status) | index("unhealthy") != null) and
    (.data.healthHistory[-1].version == "1.0.0")
' >/dev/null
printf 'Registration, outage, recovery and deployed version verified.\n'
