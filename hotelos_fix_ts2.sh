#!/bin/bash
# HotelOS — Fix remaining 2 TS errors
# Run: bash hotelos_fix_ts2.sh
cd ~/Downloads/hotel-management-project

echo "Finding exact error locations..."
pnpm tsc --noEmit 2>&1 | grep "error TS"

echo ""
echo "Patching files..."

python3 << 'PYEOF'
import os, re

files_to_check = []
for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            files_to_check.append(os.path.join(root, f))

fixed_count = 0

for path in files_to_check:
    try:
        content = open(path, encoding='utf-8').read()
        original = content

        # Fix 1: border:`1px solid ${x}` → border:"1px solid "+x
        # This pattern inside style={{}} objects causes TS1381 in some configs
        def fix_border_template(m):
            inner = m.group(1)
            # Replace `1px solid ${expr}` with "1px solid "+expr
            # Handle `1px solid ${expr}22` → "1px solid "+expr+"22"
            inner2 = re.sub(
                r'`1px solid \$\{([^}]+)\}([^`]*)`',
                lambda mm: '"1px solid "+' + mm.group(1) + (('+"'+mm.group(2)+'"') if mm.group(2) else ''),
                inner
            )
            if inner2 != inner:
                return 'border:' + inner2
            return m.group(0)

        content = re.sub(r'border:(`[^`]+`)', fix_border_template, content)

        # Fix 2: className={`pill ${expr}`} → className={"pill "+expr}
        content = re.sub(
            r'className=\{`pill \$\{([^}]+)\}`\}',
            lambda m: 'className={"pill "+' + m.group(1) + '}',
            content
        )

        # Fix 3: className={`${expr1} ${expr2}`} → className={expr1+" "+expr2}
        content = re.sub(
            r'className=\{`\$\{([^}]+)\} \$\{([^}]+)\}`\}',
            lambda m: 'className={' + m.group(1) + '+" "+' + m.group(2) + '}',
            content
        )

        # Fix 4: Any remaining title={`text ${expr}`} → title={"text "+expr}
        content = re.sub(
            r'title=\{`([^$`]*)\$\{([^}]+)\}([^`]*)`\}',
            lambda m: 'title={"' + m.group(1) + '"+' + m.group(2) + (('+"'+m.group(3)+'"') if m.group(3) else '') + '}',
            content
        )

        if content != original:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += 1
            print(f"  ✅ Fixed: {path}")

    except Exception as e:
        print(f"  ⚠️  Skipped {path}: {e}")

print(f"\nFixed {fixed_count} file(s)")
PYEOF

echo ""
echo "Running TypeScript check..."
pnpm tsc --noEmit 2>&1 | grep "error TS" | sed 's/.*error TS/TS/' | sort | uniq -c | sort -rn | head -20
TOTAL=$(pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l | tr -d ' ')
echo ""
echo "Total TS errors: $TOTAL"
[ "$TOTAL" = "0" ] && echo "✅ All clear — zero errors!" || echo "⚠️  Still failing — paste full output above"
