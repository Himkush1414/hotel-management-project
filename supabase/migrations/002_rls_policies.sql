-- ============================================================
-- 002_rls_policies.sql
-- Row Level Security policies for all tables
-- ============================================================

-- ENABLE RLS ON ALL TABLES
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION get_my_hotel_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT hotel_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS staff_role
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION is_admin_or_manager()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
  );
$$;

-- hotels
CREATE POLICY "hotel_select_own" ON hotels
  FOR SELECT USING (id = get_my_hotel_id());

CREATE POLICY "hotel_update_admin" ON hotels
  FOR UPDATE USING (id = get_my_hotel_id() AND is_admin());

-- profiles
CREATE POLICY "profiles_select_same_hotel" ON profiles
  FOR SELECT USING (hotel_id = get_my_hotel_id());

CREATE POLICY "profiles_insert_admin" ON profiles
  FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id() AND is_admin());

CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (
    hotel_id = get_my_hotel_id() AND (is_admin() OR id = auth.uid())
  );

CREATE POLICY "profiles_delete_admin" ON profiles
  FOR DELETE USING (hotel_id = get_my_hotel_id() AND is_admin());

-- staff
CREATE POLICY "staff_select" ON staff
  FOR SELECT USING (hotel_id = get_my_hotel_id());

CREATE POLICY "staff_insert" ON staff
  FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id() AND is_admin_or_manager());

CREATE POLICY "staff_update" ON staff
  FOR UPDATE USING (hotel_id = get_my_hotel_id() AND is_admin_or_manager());

CREATE POLICY "staff_delete" ON staff
  FOR DELETE USING (hotel_id = get_my_hotel_id() AND is_admin());

-- staff_documents
CREATE POLICY "staff_docs_select" ON staff_documents
  FOR SELECT USING (hotel_id = get_my_hotel_id());

CREATE POLICY "staff_docs_insert" ON staff_documents
  FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id() AND is_admin_or_manager());

CREATE POLICY "staff_docs_delete" ON staff_documents
  FOR DELETE USING (hotel_id = get_my_hotel_id() AND is_admin());

-- attendance
CREATE POLICY "attendance_select" ON attendance
  FOR SELECT USING (
    hotel_id = get_my_hotel_id()
    AND (
      is_admin_or_manager()
      OR get_my_role() = 'receptionist'
      OR staff_id = (SELECT id FROM staff WHERE profile_id = auth.uid() LIMIT 1)
    )
  );

CREATE POLICY "attendance_insert" ON attendance
  FOR INSERT WITH CHECK (
    hotel_id = get_my_hotel_id()
    AND (is_admin_or_manager() OR get_my_role() = 'receptionist')
  );

CREATE POLICY "attendance_update" ON attendance
  FOR UPDATE USING (
    hotel_id = get_my_hotel_id()
    AND (is_admin_or_manager() OR get_my_role() = 'receptionist')
  );

CREATE POLICY "attendance_delete" ON attendance
  FOR DELETE USING (hotel_id = get_my_hotel_id() AND is_admin());

-- room_types
CREATE POLICY "room_types_select" ON room_types
  FOR SELECT USING (hotel_id = get_my_hotel_id());

CREATE POLICY "room_types_insert" ON room_types
  FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id() AND is_admin_or_manager());

CREATE POLICY "room_types_update" ON room_types
  FOR UPDATE USING (hotel_id = get_my_hotel_id() AND is_admin_or_manager());

CREATE POLICY "room_types_delete" ON room_types
  FOR DELETE USING (hotel_id = get_my_hotel_id() AND is_admin());

-- rooms
CREATE POLICY "rooms_select" ON rooms
  FOR SELECT USING (hotel_id = get_my_hotel_id());

CREATE POLICY "rooms_insert" ON rooms
  FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id() AND is_admin_or_manager());

CREATE POLICY "rooms_update_admin_manager_receptionist" ON rooms
  FOR UPDATE USING (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager', 'receptionist')
  );

CREATE POLICY "rooms_update_housekeeping" ON rooms
  FOR UPDATE USING (
    hotel_id = get_my_hotel_id()
    AND get_my_role() = 'housekeeping'
    AND status = 'cleaning'
  )
  WITH CHECK (status = 'available');

CREATE POLICY "rooms_delete" ON rooms
  FOR DELETE USING (hotel_id = get_my_hotel_id() AND is_admin());

-- guests
CREATE POLICY "guests_select" ON guests
  FOR SELECT USING (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager', 'receptionist')
  );

CREATE POLICY "guests_insert" ON guests
  FOR INSERT WITH CHECK (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager', 'receptionist')
  );

CREATE POLICY "guests_update" ON guests
  FOR UPDATE USING (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager', 'receptionist')
  );

CREATE POLICY "guests_delete" ON guests
  FOR DELETE USING (hotel_id = get_my_hotel_id() AND is_admin());

-- bookings
CREATE POLICY "bookings_select" ON bookings
  FOR SELECT USING (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager', 'receptionist')
  );

CREATE POLICY "bookings_insert" ON bookings
  FOR INSERT WITH CHECK (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager', 'receptionist')
  );

CREATE POLICY "bookings_update" ON bookings
  FOR UPDATE USING (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager', 'receptionist')
  );

CREATE POLICY "bookings_delete" ON bookings
  FOR DELETE USING (hotel_id = get_my_hotel_id() AND is_admin());

-- booking_extras
CREATE POLICY "booking_extras_select" ON booking_extras
  FOR SELECT USING (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager', 'receptionist')
  );

CREATE POLICY "booking_extras_insert" ON booking_extras
  FOR INSERT WITH CHECK (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager', 'receptionist')
  );

CREATE POLICY "booking_extras_update" ON booking_extras
  FOR UPDATE USING (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager', 'receptionist')
  );

CREATE POLICY "booking_extras_delete" ON booking_extras
  FOR DELETE USING (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager')
  );

-- invoices
CREATE POLICY "invoices_select" ON invoices
  FOR SELECT USING (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager', 'receptionist')
  );

CREATE POLICY "invoices_insert" ON invoices
  FOR INSERT WITH CHECK (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager', 'receptionist')
  );

CREATE POLICY "invoices_update" ON invoices
  FOR UPDATE USING (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager', 'receptionist')
  );

CREATE POLICY "invoices_delete" ON invoices
  FOR DELETE USING (hotel_id = get_my_hotel_id() AND is_admin());

-- payments
CREATE POLICY "payments_select" ON payments
  FOR SELECT USING (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager', 'receptionist')
  );

CREATE POLICY "payments_insert" ON payments
  FOR INSERT WITH CHECK (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager', 'receptionist')
  );

-- expense_categories
CREATE POLICY "expense_categories_select" ON expense_categories
  FOR SELECT USING (hotel_id = get_my_hotel_id());

CREATE POLICY "expense_categories_insert" ON expense_categories
  FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id() AND is_admin_or_manager());

CREATE POLICY "expense_categories_update" ON expense_categories
  FOR UPDATE USING (hotel_id = get_my_hotel_id() AND is_admin_or_manager());

CREATE POLICY "expense_categories_delete" ON expense_categories
  FOR DELETE USING (hotel_id = get_my_hotel_id() AND is_admin());

-- expenses
CREATE POLICY "expenses_select" ON expenses
  FOR SELECT USING (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager')
  );

CREATE POLICY "expenses_insert" ON expenses
  FOR INSERT WITH CHECK (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager')
  );

CREATE POLICY "expenses_update" ON expenses
  FOR UPDATE USING (
    hotel_id = get_my_hotel_id()
    AND get_my_role() IN ('admin', 'manager')
  );

CREATE POLICY "expenses_delete" ON expenses
  FOR DELETE USING (hotel_id = get_my_hotel_id() AND is_admin());

-- notifications
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (
    hotel_id = get_my_hotel_id()
    AND (profile_id = auth.uid() OR profile_id IS NULL)
  );

CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (
    hotel_id = get_my_hotel_id()
    AND (profile_id = auth.uid() OR is_admin_or_manager())
  );

CREATE POLICY "notifications_delete" ON notifications
  FOR DELETE USING (hotel_id = get_my_hotel_id() AND is_admin_or_manager());

-- feature_flags
CREATE POLICY "feature_flags_select" ON feature_flags
  FOR SELECT USING (hotel_id = get_my_hotel_id());

CREATE POLICY "feature_flags_insert" ON feature_flags
  FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id() AND is_admin());

CREATE POLICY "feature_flags_update" ON feature_flags
  FOR UPDATE USING (hotel_id = get_my_hotel_id() AND is_admin());

CREATE POLICY "feature_flags_delete" ON feature_flags
  FOR DELETE USING (hotel_id = get_my_hotel_id() AND is_admin());

-- settings
CREATE POLICY "settings_select" ON settings
  FOR SELECT USING (hotel_id = get_my_hotel_id());

CREATE POLICY "settings_insert" ON settings
  FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id() AND is_admin());

CREATE POLICY "settings_update" ON settings
  FOR UPDATE USING (hotel_id = get_my_hotel_id() AND is_admin());

-- audit_logs
CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT USING (
    hotel_id = get_my_hotel_id()
    AND is_admin_or_manager()
  );
