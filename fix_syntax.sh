#!/bin/bash
# Fix syntax errors introduced by regex replacements
# Run from: ~/Downloads/hotel-management-project
cd ~/Downloads/hotel-management-project

echo "=== Fixing syntax errors in broken files ==="

# ─────────────────────────────────────────────────────────────────────────────
# Show the broken lines so we can see exactly what went wrong
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "--- CheckOutForm.tsx line 18-22 ---"
sed -n '18,22p' src/components/guests/CheckOutForm.tsx
echo ""
echo "--- CheckOutForm.tsx line 44-48 ---"
sed -n '44,48p' src/components/guests/CheckOutForm.tsx
echo ""
echo "--- GuestForm.tsx line 67-72 ---"
sed -n '67,72p' src/components/guests/GuestForm.tsx
echo ""
echo "--- RoomForm.tsx line 67-72 ---"
sed -n '67,72p' src/components/rooms/RoomForm.tsx
echo ""
echo "--- RoomGrid.tsx line 30-50 ---"
sed -n '30,50p' src/components/rooms/RoomGrid.tsx
echo ""
echo "--- DocumentUpload.tsx line 42-46 ---"
sed -n '42,46p' src/components/staff/DocumentUpload.tsx
echo ""
echo "--- error.tsx line 34-42 ---"
sed -n '34,42p' src/app/error.tsx
echo ""
echo "--- not-found.tsx line 16-28 ---"
sed -n '16,28p' src/app/not-found.tsx

# ─────────────────────────────────────────────────────────────────────────────
# FIX CheckOutForm.tsx — PaymentMode replace broke type alias declaration
# The regex replaced "PaymentMode" type alias name itself
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=== Fixing CheckOutForm.tsx ==="

python3 << 'PYEOF'
with open("src/components/guests/CheckOutForm.tsx", "r") as f:
    c = f.read()

# The broken line looks like:
# type "razorpay" | "cash" | "card" | "upi" | "bank_transfer" | "complimentary" = ...
# Restore the type alias name
import re

c = re.sub(
    r'type\s+"razorpay"\s*\|\s*"cash"\s*\|\s*"card"\s*\|\s*"upi"\s*\|\s*"bank_transfer"\s*\|\s*"complimentary"',
    'type PaymentMode',
    c
)

# Also fix any variable declarations where PaymentMode was replaced in type position
# e.g.,  : "razorpay" | "cash" | "card" | "upi" | "bank_transfer" | "complimentary"
# where it was actually fine — leave those alone
# But if the type annotation is in a const declaration like:
# const x: "razorpay" | ... = ... that's valid TS, leave it

# Fix the inline type in check_out form where PaymentMode was used as value
# Never should replace 'PaymentMode' in type annotation position with inline union
# The issue is only the `type PaymentMode = ...` alias declaration line

with open("src/components/guests/CheckOutForm.tsx", "w") as f:
    f.write(c)

print("Fixed CheckOutForm.tsx type alias")
print("Lines 18-25:")
lines = c.split('\n')
for i, line in enumerate(lines[17:25], 18):
    print(f"  {i}: {line}")
PYEOF

# ─────────────────────────────────────────────────────────────────────────────
# FIX GuestForm.tsx — reset() with `as any` broke object literal syntax
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=== Fixing GuestForm.tsx ==="
sed -n '65,75p' src/components/guests/GuestForm.tsx

python3 << 'PYEOF'
with open("src/components/guests/GuestForm.tsx", "r") as f:
    c = f.read()

import re

# The regex: reset(\1 as any) was applied but \1 captured a multi-line object
# The result: reset({
#   field1: val1,
#   field2: val2, as any   ← broken
# })
# Fix: find reset(... as any) patterns and fix the placement

# Remove 'as any' from inside object literals (wrong position)
# Pattern: ,\n    someField: value, as any  → just remove the misplaced 'as any'
c = re.sub(r',\s*as any\s*\n', ',\n', c)
c = re.sub(r':\s*([^,\n{]+),\s*as any\b', r': \1,', c)

# Also fix: reset({ ... } as any) that got double-wrapped
# reset(({ ... }) as any as any) → reset(({ ... }) as any)
c = re.sub(r'as any\s+as any', 'as any', c)

# Fix handleSubmit(fn as any) if it broke
# If it introduced syntax like: handleSubmit(onSubmit as any as any)
c = re.sub(r'\((\w+)\s+as any\s+as any\)', r'(\1 as any)', c)

with open("src/components/guests/GuestForm.tsx", "w") as f:
    f.write(c)

print("Fixed GuestForm.tsx")
print("Lines 65-75:")
lines = c.split('\n')
for i, line in enumerate(lines[64:75], 65):
    print(f"  {i}: {line}")
PYEOF

# ─────────────────────────────────────────────────────────────────────────────
# FIX RoomForm.tsx — same reset() issue
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=== Fixing RoomForm.tsx ==="
sed -n '65,75p' src/components/rooms/RoomForm.tsx

python3 << 'PYEOF'
with open("src/components/rooms/RoomForm.tsx", "r") as f:
    c = f.read()

import re

c = re.sub(r',\s*as any\s*\n', ',\n', c)
c = re.sub(r':\s*([^,\n{]+),\s*as any\b', r': \1,', c)
c = re.sub(r'as any\s+as any', 'as any', c)

with open("src/components/rooms/RoomForm.tsx", "w") as f:
    f.write(c)

print("Fixed RoomForm.tsx")
print("Lines 65-75:")
lines = c.split('\n')
for i, line in enumerate(lines[64:75], 65):
    print(f"  {i}: {line}")
PYEOF

# ─────────────────────────────────────────────────────────────────────────────
# FIX RoomGrid.tsx — permissions fix broke the destructure on line 33
# The regex replaced .canManageRooms and .isAdmin but may have
# broken const { isAdmin, canManageRooms } = usePermissions()
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=== Fixing RoomGrid.tsx ==="
sed -n '28,50p' src/components/rooms/RoomGrid.tsx

python3 << 'PYEOF'
with open("src/components/rooms/RoomGrid.tsx", "r") as f:
    c = f.read()

import re

# Show current state around line 33
lines = c.split('\n')
print("Current lines 28-50:")
for i, line in enumerate(lines[27:50], 28):
    print(f"  {i}: {line}")

# The permission destructure was broken - fix it
# Remove broken destructures and replace with clean permissions usage
# Pattern that's broken: const { can("admin"), can("manage_rooms") } = usePermissions()
# or: const { isAdmin.can("admin"), canManageRooms.can("manage_rooms") }

# Fix: replace any broken destructure with: const permissions = usePermissions()
c = re.sub(
    r'const\s*\{[^}]*can\([^}]*\)[^}]*\}\s*=\s*usePermissions\(\)',
    'const permissions = usePermissions()',
    c
)

# Also fix: const { can = usePermissions() variations
c = re.sub(
    r'const\s*\{\s*can\s*\}\s*=\s*usePermissions\(\)',
    'const permissions = usePermissions()',
    c
)

# Fix bare isAdmin references that weren't in a dot context
c = re.sub(r'\bisAdmin\b(?!\s*\()', 'permissions.can("admin")', c)
c = re.sub(r'\bcanManageRooms\b', 'permissions.can("manage_rooms")', c)

# Make sure usePermissions is imported
if 'usePermissions' in c and 'import' in c:
    if "import { usePermissions }" not in c and "usePermissions" in c:
        # Add import after first import line
        c = re.sub(
            r'(^import[^\n]+\n)',
            r"\1import { usePermissions } from '@/hooks/usePermissions'\n",
            c,
            count=1
        )

with open("src/components/rooms/RoomGrid.tsx", "w") as f:
    f.write(c)

lines = c.split('\n')
print("\nFixed lines 28-52:")
for i, line in enumerate(lines[27:52], 28):
    print(f"  {i}: {line}")
PYEOF

# ─────────────────────────────────────────────────────────────────────────────
# FIX DocumentUpload.tsx line 44 — permissions broke
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=== Fixing DocumentUpload.tsx ==="
sed -n '40,48p' src/components/staff/DocumentUpload.tsx

python3 << 'PYEOF'
with open("src/components/staff/DocumentUpload.tsx", "r") as f:
    c = f.read()

import re

# Same issue: const { isAdmin.can("admin") } = usePermissions() broken
c = re.sub(
    r'const\s*\{[^}]*can\([^}]*\)[^}]*\}\s*=\s*usePermissions\(\)',
    'const permissions = usePermissions()',
    c
)
c = re.sub(
    r'const\s*\{\s*can\s*[,}]',
    'const permissions = usePermissions(); const { can',
    c
)

# Fix bare isAdmin usage
c = re.sub(r'\bisAdmin\b(?!\s*\()', 'permissions.can("admin")', c)

with open("src/components/staff/DocumentUpload.tsx", "w") as f:
    f.write(c)

lines = c.split('\n')
print("Fixed lines 40-50:")
for i, line in enumerate(lines[39:50], 40):
    print(f"  {i}: {line}")
PYEOF

# ─────────────────────────────────────────────────────────────────────────────
# FIX error.tsx and not-found.tsx — Button JSX not closed properly
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=== Fixing error.tsx ==="
cat src/app/error.tsx

python3 << 'PYEOF'
with open("src/app/error.tsx", "r") as f:
    c = f.read()

print("Current content:")
print(c)
PYEOF

echo ""
echo "=== Rewriting error.tsx cleanly ==="
cat > src/app/error.tsx << 'TSXEOF'
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-4xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className={buttonVariants({ variant: "default" })}
        >
          Try again
        </button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Go home
        </Link>
      </div>
    </div>
  );
}
TSXEOF
echo "  Rewrote error.tsx"

echo ""
echo "=== Rewriting not-found.tsx cleanly ==="
cat > src/app/not-found.tsx << 'TSXEOF'
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-8xl font-bold text-muted-foreground">404</h1>
      <h2 className="text-2xl font-semibold">Page not found</h2>
      <p className="text-muted-foreground max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/" className={buttonVariants({ variant: "default" })}>
          Go home
        </Link>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          Dashboard
        </Link>
      </div>
    </div>
  );
}
TSXEOF
echo "  Rewrote not-found.tsx"

# ─────────────────────────────────────────────────────────────────────────────
# FIX whatsapp route — still has duplicate import (dedup didn't work)
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=== Fixing whatsapp/route.ts ==="

python3 << 'PYEOF'
with open("src/app/api/whatsapp/route.ts", "r") as f:
    c = f.read()

# Remove the @supabase/supabase-js createClient import
# Keep only the @/lib/supabase/server one
import re

# Remove: import { createClient } from "@supabase/supabase-js";
c = re.sub(r'import\s*\{\s*createClient\s*\}\s*from\s*"@supabase/supabase-js";\n?', '', c)
c = re.sub(r"import\s*\{\s*createClient\s*\}\s*from\s*'@supabase/supabase-js';\n?", '', c)

# The supabaseAdmin creation uses createClient<Database>(...) with 3 args
# This is actually the @supabase/supabase-js direct client, not the SSR one
# Fix: rename to avoid conflict - use createBrowserSupabaseClient
c = c.replace(
    'const supabaseAdmin = createClient<Database>(',
    'const supabaseAdmin = require("@supabase/supabase-js").createClient('
)

with open("src/app/api/whatsapp/route.ts", "w") as f:
    f.write(c)

print("Fixed whatsapp route - removed duplicate import")
print("First 5 imports:")
for line in c.split('\n')[:8]:
    print(f"  {line}")
PYEOF

# ─────────────────────────────────────────────────────────────────────────────
# VERIFY all fixed files compile
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=== FINAL ERROR COUNT ==="
pnpm tsc --noEmit 2>&1 | wc -l
echo ""
echo "Error breakdown:"
pnpm tsc --noEmit 2>&1 | grep "error TS" | sed 's/.*error TS/TS/' | sort | uniq -c | sort -rn | head -20
echo ""
echo "All remaining errors:"
pnpm tsc --noEmit 2>&1 | grep "error TS" | grep -v "TS7031\|TS7006"
