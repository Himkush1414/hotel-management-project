#!/bin/bash
# HotelOS — Fix final 2 TS errors in RoomsClient.tsx
# Run: bash hotelos_fix_ts3.sh
cd ~/Downloads/hotel-management-project

python3 << 'PYEOF'
import os

for p in ['src/app/(admin)/rooms/RoomsClient.tsx', 'src/app/rooms/RoomsClient.tsx']:
    if os.path.exists(p):
        target = p
        break
else:
    print("❌ RoomsClient.tsx not found"); exit(1)

content = open(target, encoding='utf-8').read()
original = content

# ── Fix 1: border with ternary inside template literal ───────────────────
# border:`1px solid ${filter===s?cfg.border:"rgba(255,255,255,0.07)"}`
OLD1 = 'border:`1px solid ${filter===s?cfg.border:"rgba(255,255,255,0.07)"}`'
NEW1 = 'border:"1px solid "+(filter===s?cfg.border:"rgba(255,255,255,0.07)")'
content = content.replace(OLD1, NEW1)
print("Fix1:", "✅ applied" if OLD1 not in content else "⚠️  not found")

# ── Fix 2: border with cfg.border plain template ─────────────────────────
# border:`1px solid ${cfg.border}`  (room card)
OLD2 = 'border:`1px solid ${cfg.border}`'
NEW2 = 'border:"1px solid "+cfg.border'
content = content.replace(OLD2, NEW2)
print("Fix2:", "✅ applied" if OLD2 not in content else "⚠️  not found")

# ── Fix 3: any other backtick border patterns we might have missed ────────
import re

# Generic: border:`1px solid ${ANYTHING}` where ANYTHING has no nested backticks
def replace_border(m):
    inner = m.group(1)  # content inside backticks after "1px solid "
    # inner looks like: ${expr} or ${expr}suffix
    inner = inner.strip('`')
    # Replace ${expr} → "+expr+"  and plain text → as string
    result = re.sub(r'\$\{([^}]+)\}', lambda mm: '"+' + mm.group(1) + '+"', inner)
    result = '"1px solid ' + result
    # Clean up empty string concatenation
    result = result.replace('+""+', '+').replace('+"";', '";')
    if result.endswith('+"'):
        result = result[:-2]
    result += '"'
    return 'border:' + result

# Only match simple cases without nested quotes to avoid breaking things
content = re.sub(r"border:`(1px solid [^`'\"]*\$\{[^`'\"{}]+\}[^`'\"]*)`", replace_border, content)

# ── Catch-all: any remaining backtick style values ───────────────────────
# border:`${x}` → border:x  (direct variable)
content = re.sub(r"border:`\$\{([^}]+)\}`", r'border:\1', content)

with open(target, 'w', encoding='utf-8') as f:
    f.write(content)

changed = content != original
print(f"{'✅ File updated' if changed else 'ℹ️  No changes (may already be fixed)'}: {target}")

# Verify no backticks remain in border: props
remaining = re.findall(r'border:`[^`]+`', content)
if remaining:
    print(f"⚠️  Still has backtick borders: {remaining}")
else:
    print("✅ No backtick borders remaining")
PYEOF

echo ""
echo "TypeScript check..."
pnpm tsc --noEmit 2>&1 | grep "error TS" | sed 's/.*error TS/TS/' | sort | uniq -c | sort -rn | head -20
TOTAL=$(pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l | tr -d ' ')
echo "Total TS errors: $TOTAL"
[ "$TOTAL" = "0" ] && echo "✅ Zero errors!" || echo "⚠️  Run: pnpm tsc --noEmit 2>&1 | grep 'error TS'"
