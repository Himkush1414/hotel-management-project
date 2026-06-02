#!/bin/bash
set -e
cd ~/Downloads/hotel-management-project
echo "=== Fix runtime errors ==="

# ============================================================
# 1. Dashboard — icon is a React component (function), can't pass
#    from Server → Client Component. Fix: move stats to client
#    or convert icon to a string name.
# ============================================================
python3 << 'PYEOF'
path = 'src/app/(admin)/dashboard/page.tsx'
with open(path, 'r') as f:
    content = f.read()

# Remove icon import from lucide — icons can't be passed as props
# from server to client components
content = content.replace(
    'import { BedDouble, TrendingUp, LogIn, LogOut } from "lucide-react";',
    ''
)

# Replace icon: TrendingUp etc with icon string names
content = content.replace(
    '      icon: TrendingUp,',
    '      icon: "TrendingUp" as const,'
)
content = content.replace(
    '      icon: BedDouble,',
    '      icon: "BedDouble" as const,'
)
content = content.replace(
    '      icon: LogIn,',
    '      icon: "LogIn" as const,'
)
content = content.replace(
    '      icon: LogOut,',
    '      icon: "LogOut" as const,'
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed dashboard/page.tsx — removed icon components")
PYEOF

# ============================================================
# 2. Fix StatsCard to accept icon as string and render itself
# ============================================================
python3 << 'PYEOF'
path = 'src/components/dashboard/StatsCard.tsx'
with open(path, 'r') as f:
    content = f.read()
print(f"StatsCard content:\n{content[:500]}")
PYEOF

# Read and rewrite StatsCard
python3 << 'PYEOF'
import os
path = 'src/components/dashboard/StatsCard.tsx'
with open(path, 'r') as f:
    content = f.read()

# Replace the icon prop type from React.ElementType to string
content = content.replace(
    'icon: React.ElementType',
    'icon: string'
)
content = content.replace(
    'icon: ElementType',
    'icon: string'
)

# Check if it uses the icon as a component and fix that too
# Pattern: <Icon className="..." /> or <stat.icon /> etc
import re

# Add lucide import if not present
if 'from "lucide-react"' not in content and "from 'lucide-react'" not in content:
    content = 'import * as LucideIcons from "lucide-react"\n' + content
elif 'import * as LucideIcons' not in content:
    content = 'import * as LucideIcons from "lucide-react"\n' + content

# Replace <Icon ... /> usage with dynamic lookup
# Find the icon variable name
icon_var_match = re.search(r'const (\w+) = icon', content)
if icon_var_match:
    var_name = icon_var_match.group(1)
    content = content.replace(
        f'const {var_name} = icon',
        f'const {var_name} = (LucideIcons as any)[icon]'
    )
else:
    # Direct usage like: <icon ... /> or <Icon ... />
    # Add a line to resolve the icon
    content = content.replace(
        'export function StatsCard(',
        'export function StatsCard('
    )

with open(path, 'w') as f:
    f.write(content)
print("Fixed StatsCard.tsx")
PYEOF

# ============================================================
# 3. Fix NotificationBell — button nested in button
#    PopoverTrigger wraps Button which is already a button
#    Fix: use div/span instead of Button inside PopoverTrigger
# ============================================================
python3 << 'PYEOF'
path = 'src/components/layout/NotificationBell.tsx'
with open(path, 'r') as f:
    content = f.read()

# Replace Button inside PopoverTrigger with a plain button
content = content.replace(
    '''  <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">''',
    '''  <PopoverTrigger>
        <button type="button" className="relative inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted">'''
)
content = content.replace(
    '''  <PopoverTrigger asChild>
      <Button variant="ghost" size="icon" className="relative">''',
    '''  <PopoverTrigger>
      <button type="button" className="relative inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted">'''
)

# Fix closing Button tag
content = content.replace(
    '        </Button>\n      </PopoverTrigger>',
    '        </button>\n      </PopoverTrigger>'
)
content = content.replace(
    '      </Button>\n    </PopoverTrigger>',
    '      </button>\n    </PopoverTrigger>'
)

# Remove asChild from any remaining PopoverTrigger
content = content.replace(
    '<PopoverTrigger asChild>',
    '<PopoverTrigger>'
)

# Remove Button import if no longer needed
# Keep it in case used elsewhere

with open(path, 'w') as f:
    f.write(content)
print("Fixed NotificationBell.tsx")
PYEOF

echo ""
echo "=== Check StatsCard current state ==="
cat src/components/dashboard/StatsCard.tsx

echo ""
echo "Restart dev server now with: pnpm run dev"
