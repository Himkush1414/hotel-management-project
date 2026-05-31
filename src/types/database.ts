export type StaffRole =
  | "admin"
  | "manager"
  | "receptionist"
  | "housekeeping"
  | "maintenance"
  | "accountant";

export type RoomStatus =
  | "available"
  | "occupied"
  | "cleaning"
  | "maintenance"
  | "blocked";

export type BookingStatus =
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "no_show";

export type PaymentStatus = "pending" | "partial" | "paid" | "refunded";

export type PaymentMode =
  | "cash"
  | "upi"
  | "bank_transfer"
  | "card"
  | "cheque"
  | "razorpay";

export type IdProofType =
  | "aadhaar"
  | "passport"
  | "driving_license"
  | "voter_id"
  | "pan_card";

export interface Database {
  public: {
    Tables: {
      hotels: {
        Row: {
          id: string;
          name: string;
          address: string;
          phone: string;
          email: string;
          website: string | null;
          tax_percentage: number;
          currency: string;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          phone: string;
          email: string;
          website?: string | null;
          tax_percentage?: number;
          currency?: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          phone?: string;
          email?: string;
          website?: string | null;
          tax_percentage?: number;
          currency?: string;
          logo_url?: string | null;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          hotel_id: string;
          full_name: string;
          role: StaffRole;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          hotel_id: string;
          full_name: string;
          role: StaffRole;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          hotel_id?: string;
          full_name?: string;
          role?: StaffRole;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      staff: {
        Row: {
          id: string;
          hotel_id: string;
          profile_id: string | null;
          full_name: string;
          phone: string;
          email: string | null;
          role: StaffRole;
          date_of_joining: string;
          basic_salary: number;
          address: string;
          emergency_contact_name: string;
          emergency_contact_phone: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          profile_id?: string | null;
          full_name: string;
          phone: string;
          email?: string | null;
          role: StaffRole;
          date_of_joining: string;
          basic_salary: number;
          address: string;
          emergency_contact_name: string;
          emergency_contact_phone: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          profile_id?: string | null;
          full_name?: string;
          phone?: string;
          email?: string | null;
          role?: StaffRole;
          date_of_joining?: string;
          basic_salary?: number;
          address?: string;
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      staff_documents: {
        Row: {
          id: string;
          staff_id: string;
          hotel_id: string;
          document_type: string;
          document_url: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          hotel_id: string;
          document_type: string;
          document_url: string;
          uploaded_at?: string;
        };
        Update: {
          document_type?: string;
          document_url?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          staff_id: string;
          hotel_id: string;
          date: string;
          check_in: string | null;
          check_out: string | null;
          status: "present" | "absent" | "half_day" | "leave";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          hotel_id: string;
          date: string;
          check_in?: string | null;
          check_out?: string | null;
          status: "present" | "absent" | "half_day" | "leave";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          check_in?: string | null;
          check_out?: string | null;
          status?: "present" | "absent" | "half_day" | "leave";
          notes?: string | null;
        };
      };
      room_types: {
        Row: {
          id: string;
          hotel_id: string;
          name: string;
          description: string | null;
          base_price: number;
          max_adults: number;
          max_children: number;
          amenities: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          name: string;
          description?: string | null;
          base_price: number;
          max_adults?: number;
          max_children?: number;
          amenities?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          base_price?: number;
          max_adults?: number;
          max_children?: number;
          amenities?: string[];
          updated_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          hotel_id: string;
          room_number: string;
          floor: number;
          room_type_id: string;
          status: RoomStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          room_number: string;
          floor: number;
          room_type_id: string;
          status?: RoomStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          room_number?: string;
          floor?: number;
          room_type_id?: string;
          status?: RoomStatus;
          notes?: string | null;
          updated_at?: string;
        };
      };
      guests: {
        Row: {
          id: string;
          hotel_id: string;
          full_name: string;
          phone: string;
          email: string | null;
          id_proof_type: IdProofType;
          id_proof_number: string;
          address: string;
          city: string;
          state: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          full_name: string;
          phone: string;
          email?: string | null;
          id_proof_type: IdProofType;
          id_proof_number: string;
          address: string;
          city: string;
          state: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          phone?: string;
          email?: string | null;
          id_proof_type?: IdProofType;
          id_proof_number?: string;
          address?: string;
          city?: string;
          state?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          hotel_id: string;
          guest_id: string;
          room_id: string;
          booking_reference: string;
          check_in_date: string;
          check_out_date: string;
          actual_check_in: string | null;
          actual_check_out: string | null;
          room_rate: number;
          adults: number;
          children: number;
          status: BookingStatus;
          special_requests: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          guest_id: string;
          room_id: string;
          booking_reference: string;
          check_in_date: string;
          check_out_date: string;
          actual_check_in?: string | null;
          actual_check_out?: string | null;
          room_rate: number;
          adults?: number;
          children?: number;
          status?: BookingStatus;
          special_requests?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          check_in_date?: string;
          check_out_date?: string;
          actual_check_in?: string | null;
          actual_check_out?: string | null;
          room_rate?: number;
          adults?: number;
          children?: number;
          status?: BookingStatus;
          special_requests?: string | null;
          updated_at?: string;
        };
      };
      booking_extras: {
        Row: {
          id: string;
          booking_id: string;
          hotel_id: string;
          description: string;
          amount: number;
          category: string;
          added_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          hotel_id: string;
          description: string;
          amount: number;
          category: string;
          added_by: string;
          created_at?: string;
        };
        Update: {
          description?: string;
          amount?: number;
          category?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          hotel_id: string;
          booking_id: string;
          invoice_number: string;
          subtotal: number;
          tax_amount: number;
          discount_type: "percentage" | "flat" | null;
          discount_value: number;
          discount_reason: string | null;
          total_amount: number;
          payment_status: PaymentStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          booking_id: string;
          invoice_number: string;
          subtotal: number;
          tax_amount?: number;
          discount_type?: "percentage" | "flat" | null;
          discount_value?: number;
          discount_reason?: string | null;
          total_amount: number;
          payment_status?: PaymentStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          subtotal?: number;
          tax_amount?: number;
          discount_type?: "percentage" | "flat" | null;
          discount_value?: number;
          discount_reason?: string | null;
          total_amount?: number;
          payment_status?: PaymentStatus;
          notes?: string | null;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          hotel_id: string;
          invoice_id: string;
          amount: number;
          payment_mode: PaymentMode;
          transaction_id: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          notes: string | null;
          paid_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          invoice_id: string;
          amount: number;
          payment_mode: PaymentMode;
          transaction_id?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          notes?: string | null;
          paid_at?: string;
          created_at?: string;
        };
        Update: {
          amount?: number;
          payment_mode?: PaymentMode;
          transaction_id?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          notes?: string | null;
        };
      };
      expense_categories: {
        Row: {
          id: string;
          hotel_id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };
      expenses: {
        Row: {
          id: string;
          hotel_id: string;
          category_id: string;
          amount: number;
          description: string;
          expense_date: string;
          payment_mode: PaymentMode;
          receipt_url: string | null;
          added_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          category_id: string;
          amount: number;
          description: string;
          expense_date: string;
          payment_mode: PaymentMode;
          receipt_url?: string | null;
          added_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          amount?: number;
          description?: string;
          expense_date?: string;
          payment_mode?: PaymentMode;
          receipt_url?: string | null;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          hotel_id: string;
          user_id: string;
          title: string;
          message: string;
          type: "info" | "success" | "warning" | "error";
          is_read: boolean;
          link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          user_id: string;
          title: string;
          message: string;
          type?: "info" | "success" | "warning" | "error";
          is_read?: boolean;
          link?: string | null;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
      feature_flags: {
        Row: {
          id: string;
          hotel_id: string;
          feature_key: string;
          is_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          feature_key: string;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          is_enabled?: boolean;
          updated_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          hotel_id: string;
          key: string;
          value: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          key: string;
          value: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          value?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          hotel_id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          old_data: Record<string, unknown> | null;
          new_data: Record<string, unknown> | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          old_data?: Record<string, unknown> | null;
          new_data?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: never;
      };
    };
  };
}
