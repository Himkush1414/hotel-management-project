export const DEFAULT_ROOM_TYPES = [
  {
    name:          'Single',
    base_price:    1500,
    max_occupancy: 1,
    amenities:     ['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service'],
  },
  {
    name:          'Double',
    base_price:    2500,
    max_occupancy: 2,
    amenities:     ['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service', 'Mini Fridge'],
  },
  {
    name:          'Deluxe',
    base_price:    4000,
    max_occupancy: 3,
    amenities:     ['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service', 'Mini Fridge', 'Balcony', 'Bathtub'],
  },
  {
    name:          'Suite',
    base_price:    8000,
    max_occupancy: 4,
    amenities:     ['WiFi', 'AC', 'TV', 'Hot Water', '24hr Room Service', 'Mini Bar', 'Balcony', 'Bathtub', 'Living Area', 'King Bed', 'Concierge'],
  },
] as const
