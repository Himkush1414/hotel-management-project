#!/bin/bash
# ONE SURGICAL FIX — RoomsClient.tsx line 258
cd ~/Downloads/hotel-management-project

python3 << 'PYEOF'
import os

target = None
for p in ['src/app/(admin)/rooms/RoomsClient.tsx', 'src/app/rooms/RoomsClient.tsx']:
    if os.path.exists(p):
        target = p
        break

if not target:
    print("❌ Not found"); exit(1)

content = open(target, encoding='utf-8').read()

# The broken line — double quotes inside a JSX string expression causes parse failure
# Previous fix scripts turned the border backtick into a string but also
# mangled the empty-state text string, leaving unescaped quotes inside JSX

BROKEN  = '<div>{rooms.length===0?"No rooms added yet — click "+ Add Room" to start":"No rooms match this filter"}</div>'
CORRECT = '<div>{rooms.length===0 ? "No rooms added yet — click + Add Room to start" : "No rooms match this filter"}</div>'

if BROKEN in content:
    content = content.replace(BROKEN, CORRECT)
    print("✅ Fixed empty state string")
else:
    print("⚠️  Exact string not found, trying line-by-line scan...")
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'Add Room' in line and 'rooms.length===0' in line and '"+ Add Room"' in line:
            lines[i] = '              <div>{rooms.length===0 ? "No rooms added yet — click + Add Room to start" : "No rooms match this filter"}</div>'
            print(f"✅ Fixed line {i+1}: {lines[i].strip()}")
            break
    else:
        # Show what's actually on the problematic lines so we know exactly what to fix
        for i, line in enumerate(lines):
            if 'Add Room' in line or ('rooms.length' in line and 'No rooms' in line):
                print(f"Line {i+1}: {repr(line)}")
    content = '\n'.join(lines)

with open(target, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"✅ Saved: {target}")
PYEOF

echo ""
echo "Verifying line 256-261:"
sed -n '255,262p' src/app/(admin)/rooms/RoomsClient.tsx

echo ""
echo "TypeScript check..."
pnpm tsc --noEmit 2>&1 | grep "error TS" | sed 's/.*error TS/TS/' | sort | uniq -c | sort -rn | head -20
TOTAL=$(pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l | tr -d ' ')
echo "Total TS errors: $TOTAL"
[ "$TOTAL" = "0" ] && echo "✅ ZERO ERRORS — run: pnpm run dev" || echo "⚠️  Still errors — check lines above"
