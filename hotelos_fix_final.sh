#!/bin/bash
# HotelOS — FINAL fix for last 2 TS errors
# Run: bash hotelos_fix_final.sh
cd ~/Downloads/hotel-management-project

python3 << 'PYEOF'
import os, re

target = None
for p in ['src/app/(admin)/rooms/RoomsClient.tsx', 'src/app/rooms/RoomsClient.tsx']:
    if os.path.exists(p):
        target = p; break

if not target:
    print("❌ RoomsClient.tsx not found"); exit(1)

content = open(target, encoding='utf-8').read()
original = content

# The previous fix_ts2 script broke the ternary by removing the parens.
# It turned:  border:`1px solid ${filter===s?cfg.border:"rgba(...)"}`
# Into:       border:"1px solid "+filter===s?cfg.border:"rgba(...)"   ← BROKEN (TS1005 bare colon)
# We need:    border:"1px solid "+(filter===s?cfg.border:"rgba(...)")  ← CORRECT

BROKEN  = 'border:"1px solid "+filter===s?cfg.border:"rgba(255,255,255,0.07)"'
CORRECT = 'border:"1px solid "+(filter===s?cfg.border:"rgba(255,255,255,0.07)")'
content = content.replace(BROKEN, CORRECT)
print("Fix ternary border:", "✅" if BROKEN not in content else "⚠️  not found - checking variants")

# Also catch any other unparenthesised ternaries after "1px solid "+
# Pattern: "1px solid "+EXPR?A:B  →  "1px solid "+(EXPR?A:B)
def wrap_ternary(m):
    expr = m.group(1)
    # Only wrap if not already wrapped
    if expr.startswith('('):
        return m.group(0)
    return '"1px solid "+(' + expr + ')'

content = re.sub(r'"1px solid "\+([^,}\n]+\?[^,}\n]+:[^,}\n]+)', wrap_ternary, content)

# Nuclear option: find ALL remaining bare ternary colons after style values
# Any: someKey:EXPR?A:B  where it's a JS object value (not JSX prop)
# This is hard to do generically, so just scan for the specific known bad patterns

if content != original:
    with open(target, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Fixed and saved: {target}")
else:
    print("ℹ️  No change — trying broader scan...")
    # Read line by line and fix line 258 area directly
    lines = content.split('\n')
    fixed = False
    for i, line in enumerate(lines):
        if '"1px solid "+' in line and '?' in line and ':' in line and '(' not in line.split('"1px solid "+"')[0] if '"1px solid "+"' in line else True:
            # Wrap the part after "1px solid "+ in parens if ternary
            new_line = re.sub(
                r'"1px solid "\+([^,}\s][^,}]*\?[^,}]*:[^,}]*?)([,}])',
                lambda m: '"1px solid "+(' + m.group(1).strip() + ')' + m.group(2),
                line
            )
            if new_line != line:
                lines[i] = new_line
                fixed = True
                print(f"  Fixed line {i+1}: {new_line.strip()[:80]}")
    if fixed:
        with open(target, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        print(f"✅ Line-by-line fix applied: {target}")
    else:
        print("⚠️  Could not auto-fix. Run this to see line 258:")
        print("  sed -n '255,262p' src/app/(admin)/rooms/RoomsClient.tsx")

PYEOF

echo ""
echo "TypeScript check..."
pnpm tsc --noEmit 2>&1 | grep "error TS" | sed 's/.*error TS/TS/' | sort | uniq -c | sort -rn | head -20
TOTAL=$(pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l | tr -d ' ')
echo "Total TS errors: $TOTAL"
[ "$TOTAL" = "0" ] && echo "✅ ZERO ERRORS — all good!" || {
    echo "⚠️  Check line 258 manually:"
    echo "  sed -n '255,262p' src/app/(admin)/rooms/RoomsClient.tsx"
}
