#!/bin/bash
# Surgical fixes for 4 broken files
cd ~/Downloads/hotel-management-project

# ─────────────────────────────────────────────────────────────────────────────
# Show exact broken lines first
# ─────────────────────────────────────────────────────────────────────────────
echo "=== CheckOutForm line 44-48 ==="
sed -n '44,48p' src/components/guests/CheckOutForm.tsx

echo "=== GuestForm line 67-71 ==="
sed -n '67,71p' src/components/guests/GuestForm.tsx

echo "=== RoomForm line 67-71 ==="
sed -n '67,71p' src/components/rooms/RoomForm.tsx

echo "=== RoomGrid lines 36-47 ==="
sed -n '36,47p' src/components/rooms/RoomGrid.tsx

echo "=== DocumentUpload line 43-45 ==="
sed -n '43,45p' src/components/staff/DocumentUpload.tsx

# ─────────────────────────────────────────────────────────────────────────────
# FIX 1: CheckOutForm.tsx
# Line 46: set"razorpay" | ... — useState variable name was mangled
# Line 161+: JSX broken by inline union type replacement
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=== Fixing CheckOutForm.tsx ==="

python3 << 'PYEOF'
with open("src/components/guests/CheckOutForm.tsx", "r") as f:
    lines = f.readlines()

# Fix line 46 (index 45): set"razorpay" | "cash" | ... → setPaymentMode
for i, line in enumerate(lines):
    if 'set"razorpay"' in line or 'set"cash"' in line:
        # Replace: set"razorpay" | "cash" | "card" | "upi" | "bank_transfer" | "complimentary"
        # With: setPaymentMode
        import re
        fixed = re.sub(
            r'set"razorpay"\s*\|\s*"cash"\s*\|\s*"card"\s*\|\s*"upi"\s*\|\s*"bank_transfer"\s*\|\s*"complimentary"',
            'setPaymentMode',
            line
        )
        # Also fix the useState type
        fixed = re.sub(
            r'useState<"razorpay"\s*\|\s*"cash"\s*\|\s*"card"\s*\|\s*"upi"\s*\|\s*"bank_transfer"\s*\|\s*"complimentary">',
            'useState<PaymentMode>',
            fixed
        )
        print(f"  Fixed line {i+1}: {fixed.strip()}")
        lines[i] = fixed

with open("src/components/guests/CheckOutForm.tsx", "w") as f:
    f.writelines(lines)
print("  Saved CheckOutForm.tsx (state fix)")
PYEOF

# Now show line 161 area
echo "  CheckOutForm line 158-168:"
sed -n '158,168p' src/components/guests/CheckOutForm.tsx

python3 << 'PYEOF'
with open("src/components/guests/CheckOutForm.tsx", "r") as f:
    content = f.read()

# Line 161 has a broken inline union type inside JSX
# The PaymentMode replacement put the union inside JSX attribute value
# Find the broken pattern and fix it

import re

# Pattern: onChange={(as any).check_in_date_date} or similar JSX breakage
# The error says line 161 col 66 has '}' expected and then col 217 has JSX issues
# This means there's an inline type annotation inside JSX that broke the JSX

# Show lines around 161
lines = content.split('\n')
for i in range(max(0, 158), min(len(lines), 170)):
    print(f"  {i+1}: {lines[i]}")
PYEOF

echo ""
echo "  CheckOutForm line 158-170 after first fix:"
sed -n '158,170p' src/components/guests/CheckOutForm.tsx

python3 << 'PYEOF'
with open("src/components/guests/CheckOutForm.tsx", "r") as f:
    content = f.read()

import re

# The JSX is broken because the inline union type got inserted somewhere in JSX
# Fix: replace any remaining inline PaymentMode union in JSX props back to PaymentMode
# Pattern: value={"razorpay" | "cash" | ...} → value={paymentMode}
# Or: : "razorpay" | "cash" | ... inside JSX → : PaymentMode

# Find lines with the broken inline union in JSX context
lines = content.split('\n')
fixed_lines = []
for i, line in enumerate(lines):
    if ('"razorpay" | "cash" | "card" | "upi" | "bank_transfer" | "complimentary"' in line
            and ('onChange' in line or 'value=' in line or '<' in line)):
        # This is inside JSX, the type shouldn't be inline here
        # Replace the inline union with PaymentMode
        fixed = re.sub(
            r'"razorpay"\s*\|\s*"cash"\s*\|\s*"card"\s*\|\s*"upi"\s*\|\s*"bank_transfer"\s*\|\s*"complimentary"',
            'PaymentMode',
            line
        )
        print(f"  Fixed JSX line {i+1}")
        print(f"    Before: {line.strip()[:80]}")
        print(f"    After:  {fixed.strip()[:80]}")
        fixed_lines.append(fixed)
    else:
        fixed_lines.append(line)

content = '\n'.join(fixed_lines)

with open("src/components/guests/CheckOutForm.tsx", "w") as f:
    f.write(content)
print("  Saved CheckOutForm.tsx (JSX fix)")
PYEOF

echo "  CheckOutForm lines 158-170 final:"
sed -n '158,170p' src/components/guests/CheckOutForm.tsx

# ─────────────────────────────────────────────────────────────────────────────
# FIX 2: GuestForm.tsx line 69 — "  as any)" orphaned
# The reset() call has the `as any` on a new line after the closing }
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=== Fixing GuestForm.tsx ==="

python3 << 'PYEOF'
with open("src/components/guests/GuestForm.tsx", "r") as f:
    content = f.read()

import re

# The broken pattern is:
#   reset({
#     ...
#   }
#    as any)
# This is actually valid TS! The issue is the leading spaces before "as any"
# making tsc think it's a separate statement.
# Fix: join the `as any)` onto the previous line

# Replace:  \n       as any)\n  →  ` as any)\n`  (join with preceding })
content = re.sub(r'\}\s*\n\s{2,}as any\)', '} as any)', content)

with open("src/components/guests/GuestForm.tsx", "w") as f:
    f.write(content)

lines = content.split('\n')
print("  Lines 64-72:")
for i, line in enumerate(lines[63:72], 64):
    print(f"    {i}: {line}")
PYEOF

# ─────────────────────────────────────────────────────────────────────────────
# FIX 3: RoomForm.tsx — same orphaned `as any)` pattern
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=== Fixing RoomForm.tsx ==="

python3 << 'PYEOF'
with open("src/components/rooms/RoomForm.tsx", "r") as f:
    content = f.read()

import re

content = re.sub(r'\}\s*\n\s{2,}as any\)', '} as any)', content)

with open("src/components/rooms/RoomForm.tsx", "w") as f:
    f.write(content)

lines = content.split('\n')
print("  Lines 64-72:")
for i, line in enumerate(lines[63:72], 64):
    print(f"    {i}: {line}")
PYEOF

# ─────────────────────────────────────────────────────────────────────────────
# FIX 4: RoomGrid.tsx lines 36-47 — useSupabaseRealtime call is broken
# The onUpdate removal left a dangling line and broke the object structure
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=== Fixing RoomGrid.tsx ==="

# Show full useSupabaseRealtime block
echo "  Lines 34-50:"
sed -n '34,50p' src/components/rooms/RoomGrid.tsx

python3 << 'PYEOF'
with open("src/components/rooms/RoomGrid.tsx", "r") as f:
    content = f.read()

import re

# The broken block looks like:
#   useSupabaseRealtime<Room>({
#     table: 'rooms',
#     filter: `hotel_id=eq.${hotelId}`
#       setRooms(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r))
#     }, []),           ← leftover from removed onUpdate callback
#     onInsert: ...
#
# The onUpdate removal left: the callback body + closing }, [])
# We need to restore the onUpdate property properly

# Find the broken pattern and fix it
# The filter line should end with a comma, then onUpdate should follow
broken = re.search(
    r"(filter:\s*`[^`]+`)\s*\n(\s+setRooms\(prev[^\n]+\n\s+\},\s*\[\]\),)",
    content
)
if broken:
    print(f"  Found broken pattern at pos {broken.start()}")
    # Replace with proper onUpdate
    fixed_block = broken.group(1) + ",\n    onUpdate: useCallback((updated: Room) => {\n      setRooms(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r))\n    }, []),"
    content = content[:broken.start()] + fixed_block + content[broken.end():]
    print("  Restored onUpdate callback")
else:
    print("  Pattern not found, trying alternative fix...")
    # Alternative: the filter line has no comma and the body is orphaned
    # Try to reconstruct
    content = re.sub(
        r"(filter:\s*`[^`]+`)\n(\s+)(setRooms\(prev => prev\.map[^\n]+)\n(\s+\},\s*\[\]\),)",
        r"\1,\n    onUpdate: useCallback((updated: Room) => {\n      \3\n    }, []),",
        content
    )
    print("  Applied alternative fix")

# Also check line 165 for stray content
lines = content.split('\n')
if len(lines) > 163:
    print(f"\n  Line 163-167:")
    for i, line in enumerate(lines[162:167], 163):
        print(f"    {i}: {repr(line)}")

with open("src/components/rooms/RoomGrid.tsx", "w") as f:
    f.write(content)

lines = content.split('\n')
print("\n  Lines 33-50 after fix:")
for i, line in enumerate(lines[32:50], 33):
    print(f"    {i}: {line}")
PYEOF

# Check line 165 area
echo "  RoomGrid lines 162-167:"
sed -n '162,167p' src/components/rooms/RoomGrid.tsx

python3 << 'PYEOF'
with open("src/components/rooms/RoomGrid.tsx", "r") as f:
    content = f.read()

# Fix line 165 stray content if any
lines = content.split('\n')
# Remove any completely empty or stray lines at the end that cause TS1128
# Check if line 165 (index 164) has unexpected content
if len(lines) > 163:
    print(f"  Lines 160-167: {[(i+161, repr(l)) for i, l in enumerate(lines[160:167])]}")

# Remove trailing stray content after the last export/closing brace
# Find the last proper closing
content_stripped = content.rstrip()
# If it ends with something weird, the file may have extra content
last_lines = content.split('\n')[-5:]
print(f"  Last 5 lines: {last_lines}")

with open("src/components/rooms/RoomGrid.tsx", "w") as f:
    f.write(content)
PYEOF

# ─────────────────────────────────────────────────────────────────────────────
# FIX 5: DocumentUpload.tsx line 44 — const { can = usePermissions()
# The `const { can` is a broken destructure
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=== Fixing DocumentUpload.tsx ==="

python3 << 'PYEOF'
with open("src/components/staff/DocumentUpload.tsx", "r") as f:
    content = f.read()

import re

# Fix: const { can = usePermissions(); → const permissions = usePermissions();
# The `const { can` was left dangling when the regex partially matched
content = re.sub(
    r'const\s*\{\s*can\s*=\s*usePermissions\(\)\s*;',
    'const permissions = usePermissions();',
    content
)

# Also fix any remaining `can(` that should be `permissions.can(`
# But only if 'permissions' is now declared
if 'const permissions = usePermissions()' in content:
    # Replace standalone can( that's not preceded by a dot
    content = re.sub(r'(?<!\.)\bcan\(', 'permissions.can(', content)
    # Fix double: permissions.permissions.can
    content = content.replace('permissions.permissions.can', 'permissions.can')

with open("src/components/staff/DocumentUpload.tsx", "w") as f:
    f.write(content)

lines = content.split('\n')
print("  Lines 41-48:")
for i, line in enumerate(lines[40:48], 41):
    print(f"    {i}: {line}")
PYEOF

# ─────────────────────────────────────────────────────────────────────────────
# FINAL CHECK
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=== FINAL ERROR COUNT ==="
pnpm tsc --noEmit 2>&1 | wc -l
echo ""
pnpm tsc --noEmit 2>&1 | grep "error TS" | sed 's/.*error TS/TS/' | sort | uniq -c | sort -rn | head -15
echo ""
echo "Remaining errors:"
pnpm tsc --noEmit 2>&1 | grep "error TS" | grep -v "TS7031\|TS7006"
