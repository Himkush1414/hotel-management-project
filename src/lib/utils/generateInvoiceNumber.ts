export function generateInvoiceNumber(hotelId: string, sequence: number): string {
  const year = new Date().getFullYear();
  const hotelPrefix = hotelId.slice(0, 3).toUpperCase();
  const paddedSequence = String(sequence).padStart(4, "0");
  return `${hotelPrefix}-${year}-${paddedSequence}`;
}

export function generateBookingReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
