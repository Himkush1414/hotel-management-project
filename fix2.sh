#!/bin/bash
set -e
cd ~/Downloads/hotel-management-project
echo "=== Fix batch 2 ==="

# ============================================================
# 1. usePermissions — Permission type doesn't exist, use Action
# ============================================================
python3 << 'PYEOF'
path = 'src/hooks/usePermissions.ts'
new_content = '''import { useAuth } from '@/contexts/AuthContext'
import {
  hasPermission,
  hasAnyPermission,
  type Action,
} from '@/config/permissions'
import type { Role } from '@/constants/roles'

export function usePermissions() {
  const { profile } = useAuth()
  const role = (profile?.role ?? 'receptionist') as Role

  return {
    can:    (permission: Action) => hasPermission(role, permission),
    canAny: (permissions: Action[]) => hasAnyPermission(role, permissions),
    role,
  }
}
'''
with open(path, 'w') as f:
    f.write(new_content)
print("Fixed usePermissions.ts")
PYEOF

# ============================================================
# 2. StaffForm — DB has emergency_contact (single field), not _name/_phone
#    Schema has emergency_contact_name/phone but DB doesn't
#    Fix: update schema to use single emergency_contact field
# ============================================================
python3 << 'PYEOF'
# Fix staff validation schema to match DB column
path = 'src/lib/validations/staff.ts'
new_content = '''import { z } from "zod";

const indianPhoneRegex = /^[6-9]\\d{9}$/;

export const staffSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  phone: z
    .string()
    .regex(indianPhoneRegex, "Enter a valid 10-digit Indian phone number"),
  role: z.enum(
    ["admin", "manager", "receptionist", "housekeeping", "maintenance", "accountant"],
    { message: "Role is required" }
  ),
  date_of_joining: z
    .string()
    .min(1, "Date of joining is required"),
  salary: z
    .number({ message: "Salary must be a number" })
    .positive("Salary must be greater than 0"),
  email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(300, "Address must be at most 300 characters"),
  emergency_contact: z
    .string()
    .min(2, "Emergency contact must be at least 2 characters")
    .max(100, "Emergency contact must be at most 100 characters")
    .optional()
    .or(z.literal("")),
});

export type StaffFormValues = z.infer<typeof staffSchema>;
export type StaffFormData = z.infer<typeof staffSchema>;
'''
with open(path, 'w') as f:
    f.write(new_content)
print("Fixed staff validation schema")
PYEOF

# ============================================================
# 3. StaffForm.tsx — fix emergency_contact_name/phone → emergency_contact
# ============================================================
python3 << 'PYEOF'
path = 'src/components/staff/StaffForm.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix defaultValues
content = content.replace(
    '      emergency_contact_name: "",\n      emergency_contact_phone: "",',
    '      emergency_contact: "",'
)

# Fix reset for existing staff
content = content.replace(
    '        emergency_contact_name: staff.emergency_contact_name ?? "",\n        emergency_contact_phone: staff.emergency_contact_phone ?? "",',
    '        emergency_contact: staff.emergency_contact ?? "",'
)

# Fix reset for new staff
content = content.replace(
    '        emergency_contact_name: "",\n        emergency_contact_phone: "",',
    '        emergency_contact: "",'
)

# Fix FormField name emergency_contact_name → emergency_contact
content = content.replace(
    'name="emergency_contact_name"',
    'name="emergency_contact"'
)
# Fix FormField name emergency_contact_phone → remove duplicate, keep one
content = content.replace(
    'name="emergency_contact_phone"',
    'name="emergency_contact"'
)

# Remove the second duplicate FormField block entirely
# Find and collapse the two emergency_contact FormFields into one
import re

# Find the two consecutive emergency_contact FormField blocks and keep only one
double_pattern = r'(<FormField\s[^<]*name="emergency_contact"[^<]*(?:<[^<]*>|[^<])*?</FormField>\s*)\s*<FormField\s[^<]*name="emergency_contact"[^<]*(?:<[^<]*>|[^<])*?</FormField>'
# Use a simpler approach - find the second occurrence and remove it
parts = content.split('<FormField\n                control={form.control}\n                name="emergency_contact"')
if len(parts) == 3:
    # Keep first and last, reconstruct with only one FormField
    # Find the end of the second FormField block
    second_block = parts[1]
    # The second FormField ends at </FormField>
    end_idx = second_block.find('</FormField>') + len('</FormField>')
    remainder = second_block[end_idx:]
    content = parts[0] + '<FormField\n                control={form.control}\n                name="emergency_contact"' + parts[1][:end_idx] + parts[2]
    print("  Removed duplicate emergency_contact FormField")

with open(path, 'w') as f:
    f.write(content)
print("Fixed StaffForm.tsx")
PYEOF

# ============================================================
# 4. FeatureFlagsPanel — toast({ title: ... }) → toast.success(...)
# ============================================================
python3 << 'PYEOF'
path = 'src/components/settings/FeatureFlagsPanel.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    '''      toast({
        title: `${meta?.label ?? flag.flag_name} ${newValue ? "enabled" : "disabled"}`,
      });''',
    '      toast.success(`${meta?.label ?? flag.flag_name} ${newValue ? "enabled" : "disabled"}`);'
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed FeatureFlagsPanel.tsx")
PYEOF

# ============================================================
# 5. HotelSettingsForm — supabase update cast + logo_url field
# ============================================================
python3 << 'PYEOF'
path = 'src/components/settings/HotelSettingsForm.tsx'
with open(path, 'r') as f:
    content = f.read()

# Cast the update payload
content = content.replace(
    '      .update(data)\n      .eq("id", process.env.NEXT_PUBLIC_HOTEL_ID!);',
    '      .update(data as any)\n      .eq("id", process.env.NEXT_PUBLIC_HOTEL_ID!);'
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed HotelSettingsForm.tsx")
PYEOF

# ============================================================
# 6. DateRangePicker — InvoiceTable passes wrong props (from/to/onChange)
#    DateRangePicker expects { value: DateRange, onChange: (range) => void }
# ============================================================
python3 << 'PYEOF'
path = 'src/components/billing/InvoiceTable.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    '''        <DateRangePicker
          from={fromDate}
          to={toDate}
          onChange={(range: any) => navigate({ from: range?.from ?? '', to: range?.to ?? '' })}
        />''',
    '''        <DateRangePicker
          value={{ from: fromDate, to: toDate }}
          onChange={(range) => navigate({ from: range.from, to: range.to })}
        />'''
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed InvoiceTable.tsx DateRangePicker")
PYEOF

# ============================================================
# 7. RevenueChart — DataPoint type needs expenses field
#    dashboard passes { date, revenue } but DataPoint needs { date, revenue, expenses }
# ============================================================
python3 << 'PYEOF'
path = 'src/app/(admin)/dashboard/page.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    '''      revenueChartData: last7Days.map((day) => ({
      date: day,
      revenue: revenueByDay[day] ?? 0,
    })) as any[],''',
    '''      revenueChartData: last7Days.map((day) => ({
      date: day,
      revenue: revenueByDay[day] ?? 0,
      expenses: 0,
    })),'''
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed dashboard/page.tsx DataPoint")
PYEOF

# ============================================================
# 8. RoomCard — DropdownMenuTrigger asChild issue
#    Base UI DropdownMenuTrigger doesn't support asChild the same way
# ============================================================
python3 << 'PYEOF'
path = 'src/components/rooms/RoomCard.tsx'
with open(path, 'r') as f:
    content = f.read()

# Remove asChild from DropdownMenuTrigger, use render prop pattern instead
content = content.replace(
    '<DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>',
    '<DropdownMenuTrigger onClick={e => e.stopPropagation()}>'
)
content = content.replace(
    '''                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>''',
    '''                <button className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-muted">
                  <MoreVertical className="h-3 w-3" />
                </button>'''
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed RoomCard.tsx DropdownMenuTrigger")
PYEOF

# ============================================================
# 9. billing/[invoiceId]/page.tsx — invoice_id filter issue
#    items and payments use invoice_id which is correct — the error is
#    about .eq('invoice_id', ...) but the table pk is 'id'
#    Actually invoice_items.invoice_id IS valid — cast the query
# ============================================================
python3 << 'PYEOF'
path = 'src/app/(admin)/billing/[invoiceId]/page.tsx'
with open(path, 'r') as f:
    content = f.read()

# The issue: supabase types don't know invoice_id column — cast
content = content.replace(
    '''    supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at'),
    supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at'),''',
    '''    (supabase as any)
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at'),
    (supabase as any)
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at'),'''
)

# Fix booking_number reference — the query selects booking_reference but we need booking_number
content = content.replace(
    "`.booking?.booking_number ?? ''",
    "`.booking?.booking_number ?? ''"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed billing/[invoiceId]/page.tsx")
PYEOF

# ============================================================
# 10. ExpenseForm — cast to unknown first for non-overlapping type
# ============================================================
python3 << 'PYEOF'
path = 'src/components/expenses/ExpenseForm.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    'onSaved(saved as Expense);',
    'onSaved(saved as unknown as Expense);'
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed ExpenseForm.tsx")
PYEOF

# ============================================================
# 11. Select onValueChange — 4 remaining (v: string) issues
#     The base-ui Select onValueChange signature is (value: string | null) => void
#     Fix all remaining ones
# ============================================================
python3 << 'PYEOF'
import os

files_to_fix = [
    'src/components/attendance/AttendanceFilters.tsx',
    'src/components/expenses/ExpenseFilters.tsx',
    'src/components/staff/StaffTable.tsx',
    'src/components/staff/DocumentUpload.tsx',
]

for path in files_to_fix:
    if not os.path.exists(path):
        print(f"SKIP: {path}")
        continue
    with open(path, 'r') as f:
        content = f.read()
    # Fix (v: string) => void to (v: string | null) => void pattern
    import re
    # Pattern: onValueChange={(v: string) => someFunc(v)}
    content = re.sub(
        r'onValueChange=\{\(v: string\) => ([^}]+)\}',
        r'onValueChange={(v: string | null) => { if (v !== null) \1 }}',
        content
    )
    # Pattern: onValueChange={(v) => { if (v !== null) setX(v) }}  - already fixed
    with open(path, 'w') as f:
        f.write(content)
    print(f"Fixed onValueChange in {path}")
PYEOF

# ============================================================
# 12. toast.success with object as second arg — sonner uses string
#     toast.success('msg', { description: '...' }) is correct for sonner
#     but 4 errors say description is not assignable to string
#     These are places where toast.success(msg, { description }) was
#     called but toast is being called as toast(msg, options) — check
# ============================================================
python3 << 'PYEOF'
import os, re, glob

# Find all files using toast.success/error with object second param
# Sonner's toast.success signature: toast.success(message, options?)
# where options is ExternalToast which accepts description
# The TS2345 error "description not assignable to string" means somewhere
# toast.success is being called as toast(msg, descriptionString) incorrectly
# Let's find them

files = glob.glob('src/**/*.tsx', recursive=True) + glob.glob('src/**/*.ts', recursive=True)
for path in files:
    with open(path, 'r') as f:
        content = f.read()
    
    # Find toast.success('X', 'Y') — second arg is string, not object
    # This shouldn't be an issue with sonner. The real issue might be
    # toast being called as a function: toast('msg', { description: 'x' })
    # where toast is the sonner toast object (not toast.success)
    
    # Fix: toast('msg', { description: 'x' }) — sonner supports this
    # But if somewhere we have toast.success('msg', 'description') fix it
    changed = False
    new = re.sub(
        r"toast\.success\('([^']+)',\s*'([^']+)'\)",
        r"toast.success('\1', { description: '\2' })",
        content
    )
    if new != content:
        content = new
        changed = True
    
    new = re.sub(
        r'toast\.success\("([^"]+)",\s*"([^"]+)"\)',
        r'toast.success("\1", { description: "\2" })',
        content
    )
    if new != content:
        content = new
        changed = True

    if changed:
        with open(path, 'w') as f:
            f.write(content)
        print(f"Fixed toast.success string args in {path}")

print("Toast arg scan done")
PYEOF

# ============================================================
# 13. Find the remaining TS2322 'string' not assignable to 'never'
#     These are likely supabase insert/update fields with wrong types
#     Run tsc to find exact files
# ============================================================
python3 << 'PYEOF'
import subprocess
result = subprocess.run(
    ['pnpm', 'tsc', '--noEmit', '2>&1'],
    capture_output=True, text=True, shell=False
)
output = result.stdout + result.stderr

# Parse for 'never' errors with file locations
lines = output.split('\n')
never_files = set()
for i, line in enumerate(lines):
    if 'never' in line and 'error TS' in line:
        # Get the file from the error line
        parts = line.split('(')
        if parts:
            never_files.add(parts[0].strip())

for f in sorted(never_files):
    print(f"  never error in: {f}")
PYEOF

# Now get full tsc output for targeted fixes
echo ""
echo "=== Running tsc to find remaining specific errors ==="
pnpm tsc --noEmit 2>&1 | grep "error TS" | grep -v "node_modules" | head -50

echo ""
echo "=== Error count by type ==="
pnpm tsc --noEmit 2>&1 | grep "error TS" | sed 's/.*error TS/TS/' | sort | uniq -c | sort -rn | head -20

echo ""
echo "Total:"
pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l
