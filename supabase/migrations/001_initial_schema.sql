-- ============================================================
-- 001_initial_schema.sql
-- Complete schema for Hotel Management System
-- ============================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMS
CREATE TYPE staff_role AS ENUM (
  'admin','manager','receptionist','housekeeping','security','kitchen'
);

CREATE TYPE room_status AS ENUM (
  'available','occupied','cleaning','maintenance','blocked'
);

CREATE TYPE booking_status AS ENUM (
  'pending','confirmed','checked_in','checked_out','cancelled','no_show'
);

CREATE TYPE payment_status AS ENUM (
  'pending','partial','paid','refunded','failed'
);

CREATE TYPE payment_mode AS ENUM (
  'cash','card','upi','bank_transfer','razorpay','complimentary'
);

CREATE TYPE id_proof_type AS ENUM (
  'aadhaar','passport','driving_license','voter_id','pan_card'
);

-- UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- AUDIT LOG TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    hotel_id, table_name, record_id, action, old_data, new_data, performed_by
  )
  VALUES (
    COALESCE((NEW).hotel_id, (OLD).hotel_id),
    TG_TABLE_NAME,
    COALESCE((NEW).id, (OLD).id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TABLE: hotels
CREATE TABLE hotels (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  address           TEXT,
  city              TEXT,
  state             TEXT,
  country           TEXT DEFAULT 'India',
  pincode           TEXT,
  phone             TEXT,
  email             TEXT,
  gstin             TEXT,
  logo_url          TEXT,
  currency          TEXT NOT NULL DEFAULT 'INR',
  timezone          TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  check_in_time     TIME NOT NULL DEFAULT '14:00',
  check_out_time    TIME NOT NULL DEFAULT '11:00',
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER hotels_updated_at
  BEFORE UPDATE ON hotels
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_hotels_slug ON hotels(slug);

-- TABLE: profiles
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  role        staff_role NOT NULL DEFAULT 'receptionist',
  full_name   TEXT NOT NULL,
  phone       TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_profiles_hotel_id ON profiles(hotel_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- TABLE: staff
CREATE TABLE staff (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id            UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  profile_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  employee_code       TEXT NOT NULL,
  full_name           TEXT NOT NULL,
  role                staff_role NOT NULL,
  department          TEXT,
  phone               TEXT NOT NULL,
  email               TEXT,
  address             TEXT,
  date_of_joining     DATE NOT NULL,
  date_of_birth       DATE,
  salary              NUMERIC(10, 2),
  bank_account        TEXT,
  bank_ifsc           TEXT,
  emergency_contact   TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hotel_id, employee_code)
);

CREATE TRIGGER staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_staff_hotel_id ON staff(hotel_id);
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_staff_is_active ON staff(is_active);

-- TABLE: staff_documents
CREATE TABLE staff_documents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id      UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  staff_id      UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url      TEXT NOT NULL,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_documents_staff_id ON staff_documents(staff_id);
CREATE INDEX idx_staff_documents_hotel_id ON staff_documents(hotel_id);

-- TABLE: attendance
CREATE TABLE attendance (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  staff_id        UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  check_in        TIMESTAMPTZ,
  check_out       TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'present'
                  CHECK (status IN ('present','absent','half_day','leave','holiday')),
  notes           TEXT,
  marked_by       UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hotel_id, staff_id, date)
);

CREATE TRIGGER attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_attendance_hotel_id ON attendance(hotel_id);
CREATE INDEX idx_attendance_staff_id ON attendance(staff_id);
CREATE INDEX idx_attendance_date ON attendance(date);

-- TABLE: room_types
CREATE TABLE room_types (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  base_price      NUMERIC(10, 2) NOT NULL,
  max_occupancy   INTEGER NOT NULL DEFAULT 2,
  amenities       TEXT[] NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hotel_id, name)
);

CREATE TRIGGER room_types_updated_at
  BEFORE UPDATE ON room_types
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_room_types_hotel_id ON room_types(hotel_id);

-- TABLE: rooms
CREATE TABLE rooms (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  room_type_id    UUID NOT NULL REFERENCES room_types(id),
  room_number     TEXT NOT NULL,
  floor           INTEGER,
  status          room_status NOT NULL DEFAULT 'available',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hotel_id, room_number)
);

CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_room_type_id ON rooms(room_type_id);

-- TABLE: guests
CREATE TABLE guests (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id            UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  full_name           TEXT NOT NULL,
  phone               TEXT NOT NULL,
  email               TEXT,
  nationality         TEXT DEFAULT 'Indian',
  id_proof_type       id_proof_type,
  id_proof_number     TEXT,
  id_proof_url        TEXT,
  address             TEXT,
  city                TEXT,
  state               TEXT,
  date_of_birth       DATE,
  notes               TEXT,
  total_stays         INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_guests_hotel_id ON guests(hotel_id);
CREATE INDEX idx_guests_phone ON guests(phone);
CREATE INDEX idx_guests_email ON guests(email);

-- TABLE: bookings
CREATE TABLE bookings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id            UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  booking_number      TEXT NOT NULL,
  guest_id            UUID NOT NULL REFERENCES guests(id),
  room_id             UUID NOT NULL REFERENCES rooms(id),
  check_in_date       DATE NOT NULL,
  check_out_date      DATE NOT NULL,
  actual_check_in     TIMESTAMPTZ,
  actual_check_out    TIMESTAMPTZ,
  num_adults          INTEGER NOT NULL DEFAULT 1,
  num_children        INTEGER NOT NULL DEFAULT 0,
  status              booking_status NOT NULL DEFAULT 'pending',
  source              TEXT DEFAULT 'direct',
  room_rate           NUMERIC(10, 2) NOT NULL,
  total_nights        INTEGER NOT NULL,
  special_requests    TEXT,
  notes               TEXT,
  created_by          UUID REFERENCES profiles(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hotel_id, booking_number),
  CONSTRAINT chk_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT chk_adults CHECK (num_adults >= 1)
);

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_check_in_date ON bookings(check_in_date);
CREATE INDEX idx_bookings_check_out_date ON bookings(check_out_date);

-- TABLE: booking_extras
CREATE TABLE booking_extras (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  unit_price  NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  added_by    UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_booking_extras_booking_id ON booking_extras(booking_id);
CREATE INDEX idx_booking_extras_hotel_id ON booking_extras(hotel_id);

-- TABLE: invoices
CREATE TABLE invoices (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id            UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  booking_id          UUID NOT NULL REFERENCES bookings(id),
  invoice_number      TEXT NOT NULL,
  guest_id            UUID NOT NULL REFERENCES guests(id),
  subtotal            NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax_amount          NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_amount     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount        NUMERIC(10, 2) NOT NULL,
  paid_amount         NUMERIC(10, 2) NOT NULL DEFAULT 0,
  balance_amount      NUMERIC(10, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  payment_status      payment_status NOT NULL DEFAULT 'pending',
  notes               TEXT,
  issued_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date            DATE,
  created_by          UUID REFERENCES profiles(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hotel_id, invoice_number)
);

CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_invoices_hotel_id ON invoices(hotel_id);
CREATE INDEX idx_invoices_booking_id ON invoices(booking_id);
CREATE INDEX idx_invoices_guest_id ON invoices(guest_id);
CREATE INDEX idx_invoices_payment_status ON invoices(payment_status);

-- TABLE: payments
CREATE TABLE payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id              UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  invoice_id            UUID NOT NULL REFERENCES invoices(id),
  amount                NUMERIC(10, 2) NOT NULL,
  payment_mode          payment_mode NOT NULL,
  transaction_id        TEXT,
  razorpay_order_id     TEXT,
  razorpay_payment_id   TEXT,
  razorpay_signature    TEXT,
  notes                 TEXT,
  received_by           UUID REFERENCES profiles(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_hotel_id ON payments(hotel_id);
CREATE INDEX idx_payments_razorpay_order_id ON payments(razorpay_order_id);

-- TABLE: expense_categories
CREATE TABLE expense_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hotel_id, name)
);

CREATE INDEX idx_expense_categories_hotel_id ON expense_categories(hotel_id);

-- TABLE: expenses
CREATE TABLE expenses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  category_id     UUID NOT NULL REFERENCES expense_categories(id),
  description     TEXT NOT NULL,
  amount          NUMERIC(10, 2) NOT NULL,
  expense_date    DATE NOT NULL,
  receipt_url     TEXT,
  vendor_name     TEXT,
  payment_mode    payment_mode NOT NULL DEFAULT 'cash',
  approved_by     UUID REFERENCES profiles(id),
  recorded_by     UUID REFERENCES profiles(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_expenses_hotel_id ON expenses(hotel_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);

-- TABLE: notifications
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  profile_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'info'
              CHECK (type IN ('info','warning','error','success')),
  is_read     BOOLEAN NOT NULL DEFAULT false,
  link        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_hotel_id ON notifications(hotel_id);
CREATE INDEX idx_notifications_profile_id ON notifications(profile_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- TABLE: feature_flags
CREATE TABLE feature_flags (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  flag_key    TEXT NOT NULL,
  is_enabled  BOOLEAN NOT NULL DEFAULT false,
  updated_by  UUID REFERENCES profiles(id),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hotel_id, flag_key)
);

CREATE INDEX idx_feature_flags_hotel_id ON feature_flags(hotel_id);

-- TABLE: settings
CREATE TABLE settings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id              UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE UNIQUE,
  gst_rate              NUMERIC(5, 2) NOT NULL DEFAULT 12.00,
  invoice_prefix        TEXT NOT NULL DEFAULT 'INV',
  booking_prefix        TEXT NOT NULL DEFAULT 'BKG',
  whatsapp_enabled      BOOLEAN NOT NULL DEFAULT false,
  whatsapp_api_key      TEXT,
  razorpay_enabled      BOOLEAN NOT NULL DEFAULT false,
  auto_checkout_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_checkout_time    TIME DEFAULT '12:00',
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- TABLE: audit_logs
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id      UUID REFERENCES hotels(id) ON DELETE SET NULL,
  table_name    TEXT NOT NULL,
  record_id     UUID,
  action        TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_data      JSONB,
  new_data      JSONB,
  performed_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_hotel_id ON audit_logs(hotel_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- AUDIT TRIGGERS
CREATE TRIGGER audit_bookings
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_invoices
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_payments
  AFTER INSERT OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_expenses
  AFTER INSERT OR UPDATE OR DELETE ON expenses
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_staff
  AFTER INSERT OR UPDATE OR DELETE ON staff
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
