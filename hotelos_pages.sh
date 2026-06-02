#!/bin/bash
# HotelOS — Run All Page Redesigns
# Run: bash hotelos_pages.sh
cd ~/Downloads/hotel-management-project

echo ""
echo "════════════════════════════════════════"
echo " HotelOS — Pages Redesign"
echo "════════════════════════════════════════"

for script in hotelos_rooms.sh hotelos_guests.sh hotelos_bookings.sh; do
  if [ -f "$script" ]; then
    echo "▶ $script..."
    bash "$script"
    echo ""
  else
    echo "⚠️  Missing: $script"
  fi
done

echo "════════════════════════════════════════"
echo " TypeScript check..."
echo "════════════════════════════════════════"
pnpm tsc --noEmit 2>&1 | grep "error TS" | sed 's/.*error TS/TS/' | sort | uniq -c | sort -rn | head -25
TOTAL=$(pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l | tr -d ' ')
echo "Total TS errors: $TOTAL"
[ "$TOTAL" = "0" ] && echo "✅ Clean!" || echo "⚠️  Paste errors here and I will fix them"

echo ""
echo "════════════════════════════════════════"
echo " Done! Run: pnpm run dev"
echo "════════════════════════════════════════"
