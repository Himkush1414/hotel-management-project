-- ============================================================
-- 004_seed_data.sql
-- Default seed data
-- ============================================================

CREATE OR REPLACE FUNCTION seed_hotel_defaults(p_hotel_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN

  INSERT INTO expense_categories (hotel_id, name, description) VALUES
    (p_hotel_id, 'Maintenance',      'Repairs, upkeep, and maintenance of hotel property'),
    (p_hotel_id, 'Salaries',         'Staff salaries, wages, and payroll'),
    (p_hotel_id, 'Utilities',        'Electricity, water, gas, and internet bills'),
    (p_hotel_id, 'Supplies',         'Housekeeping, toiletries, and consumable supplies'),
    (p_hotel_id, 'Food & Beverages', 'Kitchen stock, restaurant, and in-room dining'),
    (p_hotel_id, 'Marketing',        'Advertising, promotions, and online listings'),
    (p_hotel_id, 'Insurance',        'Property, liability, and staff insurance'),
    (p_hotel_id, 'Miscellaneous',    'Other uncategorized expenses')
  ON CONFLICT (hotel_id, name) DO NOTHING;

  INSERT INTO room_types (hotel_id, name, description, base_price, max_occupancy, amenities) VALUES
    (
      p_hotel_id, 'Single', 'Comfortable single room for solo travelers',
      1500.00, 1,
      ARRAY['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service']
    ),
    (
      p_hotel_id, 'Double', 'Spacious double room for couples or friends',
      2500.00, 2,
      ARRAY['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service', 'Mini Fridge']
    ),
    (
      p_hotel_id, 'Deluxe', 'Premium deluxe room with upgraded amenities',
      4000.00, 3,
      ARRAY['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service', 'Mini Fridge', 'Balcony', 'Bathtub']
    ),
    (
      p_hotel_id, 'Suite', 'Luxury suite with living area and premium services',
      8000.00, 4,
      ARRAY['WiFi', 'AC', 'TV', 'Hot Water', '24hr Room Service', 'Mini Bar', 'Balcony', 'Bathtub', 'Living Area', 'King Bed', 'Concierge']
    )
  ON CONFLICT (hotel_id, name) DO NOTHING;

  INSERT INTO feature_flags (hotel_id, flag_key, is_enabled) VALUES
    (p_hotel_id, 'ROOM_MANAGEMENT',        true),
    (p_hotel_id, 'GUEST_MANAGEMENT',       true),
    (p_hotel_id, 'BOOKING_MANAGEMENT',     true),
    (p_hotel_id, 'BILLING',                true),
    (p_hotel_id, 'STAFF_MANAGEMENT',       true),
    (p_hotel_id, 'ATTENDANCE_TRACKING',    true),
    (p_hotel_id, 'EXPENSE_TRACKING',       true),
    (p_hotel_id, 'NOTIFICATIONS',          true),
    (p_hotel_id, 'ANALYTICS_DASHBOARD',    false),
    (p_hotel_id, 'RAZORPAY_PAYMENTS',      false),
    (p_hotel_id, 'WHATSAPP_NOTIFICATIONS', false),
    (p_hotel_id, 'AUTO_CHECKOUT',          false),
    (p_hotel_id, 'STAFF_PORTAL',           false),
    (p_hotel_id, 'DOCUMENT_STORAGE',       false),
    (p_hotel_id, 'AUDIT_LOG_VIEWER',       false),
    (p_hotel_id, 'MULTI_PROPERTY',         false)
  ON CONFLICT (hotel_id, flag_key) DO NOTHING;

  INSERT INTO settings (hotel_id) VALUES (p_hotel_id)
  ON CONFLICT (hotel_id) DO NOTHING;

END;
$$;
