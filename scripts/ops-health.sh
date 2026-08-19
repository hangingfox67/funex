#!/usr/bin/env bash
# ops:health — one-command system status
# Usage: pnpm ops:health  (or bash scripts/ops-health.sh)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIFF_DIR="$REPO_ROOT/packages/enrich/diffs"

echo "=== System ==="
printf "  RAM:    %s\n" "$(free -h | awk '/^Mem:/{print $3 "/" $2 " used"}')"
printf "  Swap:   %s\n" "$(free -h | awk '/^Swap:/{print $3 "/" $2 " used"}')"
printf "  Disk:   %s\n" "$(df -h "$REPO_ROOT" | awk 'NR==2{print $3 "/" $2 " used (" $5 ")"}')"
echo ""

echo "=== Node ==="
if command -v node &>/dev/null; then
  printf "  Version: %s (%s)\n" "$(node --version)" "$(which node)"
else
  echo "  NOT FOUND"
fi
echo ""

echo "=== Docker ==="
if command -v docker &>/dev/null; then
  docker compose -f "$REPO_ROOT/docker-compose.yml" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "  docker compose not running"
else
  echo "  docker not found"
fi
echo ""

echo "=== Postgres ==="
if docker compose -f "$REPO_ROOT/docker-compose.yml" exec -T postgres pg_isready -U funex &>/dev/null; then
  echo "  Status: accepting connections"
  docker compose -f "$REPO_ROOT/docker-compose.yml" exec -T postgres psql -U funex -d funex -t -c "
    SELECT 'experiences: ' || count(*) FROM experience
    UNION ALL SELECT 'real viator: ' || count(*) FROM experience WHERE id NOT LIKE 'exp_phuket_%'
    UNION ALL SELECT 'fixtures: ' || count(*) FROM experience WHERE id LIKE 'exp_phuket_%'
    UNION ALL SELECT 'attributes: ' || count(*) FROM attribute;
  " 2>/dev/null | sed 's/^/  /'
else
  echo "  Status: NOT REACHABLE"
fi
echo ""

echo "=== Pending Batches ==="
found=0
if [ -d "$DIFF_DIR" ]; then
  for f in "$DIFF_DIR"/*.batch.json; do
    [ -f "$f" ] || continue
    found=1
    batch_id=$(basename "$f" .batch.json)
    api_id=$(grep -o '"apiBatchId": *"[^"]*"' "$f" | head -1 | cut -d'"' -f4)
    submitted=$(grep -o '"submittedAt": *"[^"]*"' "$f" | head -1 | cut -d'"' -f4)
    n_products=$(grep -o '"productIds"' "$f" | wc -l)

    # Check if a diff JSON exists with results (= already collected)
    diff_json="$DIFF_DIR/${batch_id}.json"
    if [ -f "$diff_json" ]; then
      n_results=$(python3 -c "import json; d=json.load(open('$diff_json')); print(len(d.get('results',[])))" 2>/dev/null || echo "?")
      if [ "$n_results" != "0" ] && [ "$n_results" != "?" ]; then
        echo "  $batch_id: COLLECTED ($n_results results) — submitted $submitted"
        continue
      fi
    fi

    echo "  $batch_id: api=$api_id submitted=$submitted"
  done
fi
if [ "$found" -eq 0 ]; then
  echo "  (none)"
fi
echo ""

echo "=== Calibration Cost ==="
cal_file="$DIFF_DIR/calibration-cost.json"
if [ -f "$cal_file" ]; then
  cost=$(grep -o '"costPerItem": *[0-9.]*' "$cal_file" | head -1 | awk '{print $2}')
  from=$(grep -o '"measuredFrom": *"[^"]*"' "$cal_file" | head -1 | cut -d'"' -f4)
  echo "  \$/item: $cost (from $from)"
else
  echo "  (not yet calibrated — run collect on first batch)"
fi
