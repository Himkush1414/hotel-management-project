export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Maintenance',      description: 'Repairs, upkeep, and maintenance of hotel property' },
  { name: 'Salaries',         description: 'Staff salaries, wages, and payroll' },
  { name: 'Utilities',        description: 'Electricity, water, gas, and internet bills' },
  { name: 'Supplies',         description: 'Housekeeping, toiletries, and consumable supplies' },
  { name: 'Food & Beverages', description: 'Kitchen stock, restaurant, and in-room dining' },
  { name: 'Marketing',        description: 'Advertising, promotions, and online listings' },
  { name: 'Insurance',        description: 'Property, liability, and staff insurance' },
  { name: 'Miscellaneous',    description: 'Other uncategorized expenses' },
] as const

export type ExpenseCategoryName = (typeof DEFAULT_EXPENSE_CATEGORIES)[number]['name']
