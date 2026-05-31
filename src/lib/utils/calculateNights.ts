export function calculateNights(
  checkIn: string | Date,
  checkOut: string | Date
): number {
  const start = typeof checkIn === "string" ? new Date(checkIn) : checkIn;
  const end = typeof checkOut === "string" ? new Date(checkOut) : checkOut;
  const diffMs = end.getTime() - start.getTime();
  const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, nights);
}

export function calculateRoomTotal(
  rate: number,
  nights: number,
  discount: number = 0
): number {
  const subtotal = rate * nights;
  return Math.max(0, subtotal - discount);
}

export function calculateTaxAmount(
  subtotal: number,
  taxPercent: number
): number {
  return parseFloat(((subtotal * taxPercent) / 100).toFixed(2));
}

export function calculateInvoiceTotal(
  subtotal: number,
  tax: number,
  discount: number = 0,
  extras: number = 0
): number {
  return parseFloat(Math.max(0, subtotal + tax - discount + extras).toFixed(2));
}
